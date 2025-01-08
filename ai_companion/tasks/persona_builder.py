import logging
from typing import List, Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session

from ai_companion.core.config import settings
from ai_companion.core.openrouter import OpenRouterClient
from ai_companion.models.messages import Message
from ai_companion.models.user import User
from ai_companion.models.user_persona import UserPersona

BATCH_SIZE = 100
# flake8: noqa
# fmt: off
PERSONA_PROMPT = """Based on these conversations, build or update the user's persona.
Focus on understanding following aspects of the user:

1. Knowledge & Expertise:
   - Professional background
   - Areas of expertise

2. Interests & Patterns:
   - Hobbies and interests
   - Regular activities and frequently discussed topics

3. Opinions & Traits:
   - Their opinions on things, such as crypto, AI, politics, religion e.t.c, especially their opinions on some hot topics
   - Their traits, such as MBTI, Big Five Personality Test e.t.c


Previous persona: {previous_persona}

Instructions:
1. You should only build a persona of the user based on the conversations. Analyze these new conversations and evolve the persona.
2. Maintain important patterns, you don't need to be too verbose and you don't need to conclude everything in detail.
3. Explain why you have the impression of the user's persona, and put more evidence if possible.

Remember:
1. You only need to output a short summary of the persona as evaluation report, don't be too verbose
2. Don't list all items as bullet points, just pick the most important ones and explain it in a few sentences
3. Don't list good impressions only, you should be fair and list both good and bad impressions per your observation
4. At the end of the persona, add some tags the user with some keywords of their skills, occupation, industry, interests e.t.c
"""
# fmt: on


class PersonaBuilder:
    def __init__(self, db: Session, openrouter_client: OpenRouterClient):
        self.db = db
        self.ai_client = openrouter_client

    async def get_unprocessed_messages(
        self, user_id: int, last_message_id: int
    ) -> List[Message]:
        """Get messages that haven't been processed for persona building."""
        return (
            self.db.query(Message)
            .filter(Message.user_id == user_id, Message.id > last_message_id)
            .order_by(Message.created_at.asc())
            .limit(BATCH_SIZE)
            .all()
        )

    async def get_latest_persona(self, user_id: int) -> Optional[UserPersona]:
        """Get the most recent persona for the user."""
        return (
            self.db.query(UserPersona)
            .filter(UserPersona.user_id == user_id)
            .order_by(desc(UserPersona.version))
            .first()
        )

    async def build_persona(self, user_id: int) -> None:
        """Build or update user persona based on new conversations."""
        latest_persona = await self.get_latest_persona(user_id)
        last_processed_id = (
            latest_persona.last_processed_message_id if latest_persona else 0
        )
        version = (latest_persona.version + 1) if latest_persona else 1

        messages = await self.get_unprocessed_messages(user_id, last_processed_id)
        if not messages or len(messages) < 5:
            logging.info(
                f"Not enough messages to process for user {user_id}, skipping..."
            )
            return

        # Prepare conversation history for AI
        conversation_text = self._prepare_conversations(messages)
        previous_persona = (
            latest_persona.persona
            if latest_persona
            else "No previous persona available."
        )

        # Generate new persona using AI
        response = await self.ai_client.chat_completion(
            [
                {"role": "system", "content": settings.SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": PERSONA_PROMPT.format(previous_persona=previous_persona),
                },
                {
                    "role": "user",
                    "content": f"Conversations to analyze:\n{conversation_text}",
                },
            ]
        )

        new_persona = response["choices"][0]["message"]["content"]

        # Store new persona
        persona = UserPersona(
            user_id=user_id,
            version=version,
            persona=new_persona,
            last_processed_message_id=messages[-1].id,
            messages_processed=len(messages),
        )
        self.db.add(persona)
        self.db.commit()

    def _prepare_conversations(self, messages: List[Message]) -> str:
        """Format conversations for AI analysis."""
        conversation_texts = []
        for msg in messages:
            conversation_texts.append(f"User: {msg.user_message}")
            conversation_texts.append(f"Assistant: {msg.assistant_message}")
        return "\n\n".join(conversation_texts)

    async def run_persona_update(self) -> None:
        """Background task to update personas for all users."""
        users = self.db.query(User).all()
        for user in users:
            logging.info(f"Running persona update for user {user.id}")
            await self.build_persona(user.id)
            logging.info(f"Persona update completed for user {user.id}")
