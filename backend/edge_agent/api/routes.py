from fastapi import APIRouter, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional, Union, Literal
import json
import httpx
import os
import asyncio
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from edge_agent.core.config import settings
from edge_agent.utils.database import db
from edge_agent.models.database import User, Conversation, Message

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionCreateParam(BaseModel):
    """
    Parameters for creating a chat completion, compatible with OpenAI API.
    """
    messages: List[ChatMessage]
    model: str = Field(default_factory=lambda: settings.DEFAULT_MODEL)
    frequency_penalty: Optional[float] = None
    logit_bias: Optional[Dict[str, float]] = None
    max_tokens: Optional[int] = None
    n: Optional[int] = None
    presence_penalty: Optional[float] = None
    response_format: Optional[Dict[str, str]] = None
    seed: Optional[int] = None
    stop: Optional[Union[str, List[str]]] = None
    stream: bool = False
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    tools: Optional[List[Dict[str, Any]]] = None
    tool_choice: Optional[Union[str, Dict[str, Any]]] = None
    user: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding None values."""
        return {k: v for k, v in self.dict().items() if v is not None}

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    created_at: str
    status: str

router = APIRouter(tags=["chat"])

llm = AsyncOpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_API_URL,
    default_headers={
        "HTTP-Referer": "https://mizu.technology",
        "X-Title": settings.PROJECT_NAME,
    },
)

def get_conversation(conversation_id: str):
    """
    Get a conversation by ID.
    """
    conversation = db.session.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


async def verify_api_key(x_api_key: str = Header(None)):
    """
    Verify the API key from the X-API-Key header and return the associated user.
    This function is used as a dependency for routes that require authentication.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required")
    
    user = db.session.query(User).filter(User.api_key == x_api_key, User.api_key_enabled == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or disabled API key")

    return user


@router.post("/v1/conversation/create", response_model=ConversationResponse)
async def create_conversation(
    user: User = Depends(verify_api_key)
):
    """
    Create a new conversation for the authenticated user.
    """
    try:
        # Create a new conversation
        conversation = Conversation(user_id=user.id)
        db.session.add(conversation)
        db.session.commit()
        db.session.refresh(conversation)

        return {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "created_at": conversation.created_at.isoformat(),
            "status": conversation.status
        }
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating conversation: {str(e)}")

@router.post("/v1/conversation/delete/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: User = Depends(verify_api_key)
):
    """
    Delete a conversation by ID.
    """
    try:
        # Delete the conversation
        conversation = db.session.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        db.session.update({"status": "deleted"})
        db.session.commit()

        return {
            "success": True
        }
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")


@router.post("/v1/message/save")
async def save_message(
    conversation_id: str,
    message: ChatMessage,
    user: User = Depends(verify_api_key)
):
    try:
        conversation = get_conversation(conversation_id)
        db.session.add(
            Message(
                conversation_id=conversation.id,
                role=message.role,
                content=message.content
            )
        )
        db.session.commit()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error saving message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving message: {str(e)}")

@router.post("/v1/chat/completions")
async def chat_completion(
    params: ChatCompletionCreateParam,
    user: User = Depends(verify_api_key)
):
    try:
        if params.stream:
            return StreamingResponse(
                stream_chat_response(params),
                media_type="text/event-stream"
            )
        else:
            response = await llm.chat.completions.create(**params.to_dict(exclude_none=True))
            return response

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def stream_chat_response(params: ChatCompletionCreateParam):
    stream = await llm.chat.completions.create(**params.to_dict(exclude_none=True))
    async for chunk in stream:
        yield chunk
