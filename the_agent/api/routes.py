import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Path
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ai_companion.core.config import settings
from ai_companion.core.openrouter import OpenRouterClient
from ai_companion.database import get_db
from ai_companion.models.agents import Agent
from ai_companion.models.messages import Message
from ai_companion.models.user import User
from ai_companion.models.user_persona import UserPersona
from ai_companion.utils.validators import MessageValidator

logging.basicConfig(level=logging.INFO)

router = APIRouter()
openrouter_client = OpenRouterClient()


class ChatRequest(BaseModel):
    messages: List[str]


async def validate_user(
    tg_user_id: str,
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.tg_user_id == tg_user_id).first()
    if not user:
        user = User(tg_user_id=tg_user_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_active = int(datetime.now().timestamp())
        db.commit()
    return user


async def get_conversation_history(
    user_id: int, agent_id: int, db: Session
) -> List[dict]:
    history = (
        db.query(Message)
        .filter(Message.user_id == user_id)
        .filter(Message.agent_id == agent_id)
        .order_by(Message.created_at.desc())
        .limit(settings.MAX_CONTEXT_MESSAGES)
        .all()
    )

    messages = []

    # Convert to list of messages in reverse chronological order (oldest first)
    for conv in reversed(history):
        # Add combined user message
        messages.append({"role": "user", "content": conv.user_message})
        # Add assistant message
        messages.append({"role": "assistant", "content": conv.assistant_message})

    return messages


def get_latest_persona(db: Session, user_id: int, agent_id: int) -> str:
    """Get only the latest persona for a user."""
    latest_persona = (
        db.query(UserPersona)
        .filter(UserPersona.user_id == user_id)
        .filter(UserPersona.agent_id == agent_id)
        .order_by(UserPersona.version.desc())
        .first()
    )
    if latest_persona:
        return latest_persona.persona
    # flake8: noqa: E501
    # fmt: off
    return f"No summary found yet. Chat with me for at least {settings.MINIMUM_MESSAGES_TO_PROCESS} messages to generate your chat summary."
    # fmt: on


async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if not x_api_key or x_api_key != settings.API_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return x_api_key


@router.post("/chat/{agent_id}/{user_id}", dependencies=[Depends(verify_api_key)])
async def chat(
    request: ChatRequest,
    agent_id: int = Path(..., description="Agent ID"),
    user_id: int = Path(..., description="User ID"),
    db: Session = Depends(get_db),
):
    try:
        combined_message = "\n---\n".join(request.messages)
        validation_result = MessageValidator.validate_message(combined_message)
        if not validation_result["valid"]:
            logging.info(f"Message validation failed: {validation_result['error']}")
            error_response = {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": validation_result["error"],
                        }
                    }
                ]
            }
            return error_response

        user = await validate_user(
            user_id=user_id,
            db=db,
        )
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Get conversation history
        system_message = [{"role": "system", "content": agent.system_prompt}]
        conversation_history = await get_conversation_history(user.id, agent.id, db)

        # Get persona if enabled
        user_context = ""
        if agent.enable_persona:
            persona = get_latest_persona(db, user.id, agent_id)
            if persona:
                user_context = f"Context about me:\n{persona}\n\n"

        # Create full message array with context
        full_messages = (
            system_message
            + conversation_history
            + [
                {
                    "role": "user",
                    "content": f"{user_context}Current message:\n{combined_message}",
                }
            ]
        )

        # Get response from AI
        response = await openrouter_client.chat_completion(full_messages)

        # Extract assistant response
        assistant_message = response["choices"][0]["message"]["content"]

        # Store message
        message = Message(
            user_id=user.id,
            agent_id=agent.id,
            user_message=combined_message,
            assistant_message=assistant_message,
        )
        db.add(message)
        db.commit()

        return {"reply": assistant_message}
    except Exception as e:
        logging.error(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent/{agent_id}", dependencies=[Depends(verify_api_key)])
async def get_agents(
    agent_id: int = Path(..., description="Agent ID"),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"agent": agent}
