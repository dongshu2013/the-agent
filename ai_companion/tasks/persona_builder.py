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
Focus on understanding:

1. Communication Style:
   - Language preferences
   - Writing style
   - Typical response length
   - Formality level

2. Knowledge & Expertise:
   - Professional background
   - Areas of expertise
   - Topics they're learning about

3. Interests & Patterns:
   - Frequently discussed topics
   - Hobbies and interests
   - Regular activities mentioned

4. Behavioral Traits:
   - Problem-solving approach
   - Learning style
   - Interaction preferences

Previous persona: {previous_persona}

Analyze these new conversations and evolve the persona. Maintain important patterns and update with new insights."""
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
        if not messages or len(messages) < 50:
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
            conversation_texts.append(f"User: {msg.messages['content']}")
            conversation_texts.append(f"Assistant: {msg.assistant_message['content']}")
        return "\n\n".join(conversation_texts)

    async def run_persona_update(self) -> None:
        """Background task to update personas for all users."""
        users = self.db.query(User).all()
        for user in users:
            logging.info(f"Running persona update for user {user.id}")
            await self.build_persona(user.id)
            logging.info(f"Persona update completed for user {user.id}")
