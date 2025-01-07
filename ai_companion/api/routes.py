from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ai_companion.core.config import settings
from ai_companion.core.openrouter import OpenRouterClient
from ai_companion.database import get_db
from ai_companion.models.messages import Message
from ai_companion.models.user import User, UserPersona
from ai_companion.utils.validators import MessageValidator

router = APIRouter()
openrouter_client = OpenRouterClient()


class ChatRequest(BaseModel):
    messages: List[str]
    tg_user_id: str


async def validate_user(
    tg_user_id: str,
    username: str = None,
    first_name: str = None,
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.tg_user_id == tg_user_id).first()

    if not user:
        # Create new user if doesn't exist
        user = User(tg_user_id=tg_user_id, username=username, first_name=first_name)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_active = int(datetime.now().timestamp())
        db.commit()
    return user


async def get_conversation_history(user_id: int, db: Session) -> List[dict]:
    history = (
        db.query(Message)
        .filter(Message.user_id == user_id)
        .order_by(Message.created_at.desc())
        .limit(settings.MAX_CONTEXT_MESSAGES)
        .all()
    )

    messages = []
    if settings.SYSTEM_PROMPT:
        messages.append({"role": "system", "content": settings.SYSTEM_PROMPT})

    # Convert to list of messages in reverse chronological order (oldest first)
    for conv in reversed(history):
        # Add combined user message
        messages.append({"role": "user", "content": conv.user_message})
        # Add assistant message
        messages.append({"role": "assistant", "content": conv.assistant_message})

    return messages


def combine_messages(messages: List[dict]) -> str:
    """Combine multiple messages into a single string with clear separation."""
    combined = []
    for msg in messages:
        if msg["role"] == "user":
            combined.append(msg["content"])
    return "\n---\n".join(combined)


def create_user_context(db: Session, user_id: int) -> str:
    persona = get_latest_persona(db, user_id)
    if persona:
        return f"Context about me:\n{persona}"
    return "Context about me: No additional context available."


def get_latest_persona(db: Session, user_id: int) -> str:
    """Get only the latest persona for a user."""
    latest_persona = (
        db.query(UserPersona)
        .filter(UserPersona.user_id == user_id)
        .order_by(UserPersona.version.desc())
        .first()
    )
    if latest_persona:
        return latest_persona.persona
    return ""


@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Combine all user messages into one
        combined_message = combine_messages(request.messages)

        # Validate the combined message
        validation_result = MessageValidator.validate_message(combined_message)

        if not validation_result["valid"]:
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

        # Validate user and get or create user record
        user = await validate_user(
            tg_user_id=request.tg_user_id,
            username=request.username,
            first_name=request.first_name,
            db=db,
        )

        # Get conversation history
        conversation_history = await get_conversation_history(user.id, db)
        user_context = create_user_context(db, user.id)
        # Create full message array with context
        full_messages = conversation_history + [
            {
                "role": "user",
                "content": f"{user_context}\n\nCurrent message:\n{combined_message}",
            }
        ]

        # Get response from AI
        response = await openrouter_client.chat_completion(full_messages)

        # Extract assistant response
        assistant_message = response["choices"][0]["message"]["content"]

        # Store message
        message = Message(
            user_id=user.id,
            user_message=combined_message,
            assistant_message=assistant_message,
        )
        db.add(message)
        db.commit()

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{tg_user_id}/persona")
async def get_user_persona(
    tg_user_id: str = Path(..., description="Telegram user ID"),
    db: Session = Depends(get_db),
):
    """Get the latest persona information for a user."""
    user = db.query(User).filter(User.tg_user_id == tg_user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"persona": get_latest_persona(db, user.id)}
