from fastapi import APIRouter, HTTPException, Depends, Header, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
from edge_agent.utils.database import get_db
from edge_agent.models.database import User, Conversation, Message

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

# Create a Bearer token security scheme
bearer_scheme = HTTPBearer(auto_error=True)

async def verify_api_key(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
):
    """
    Verify the API key and return the associated user.
    Uses the database session from the request state.
    """
    db = request.state.db
    api_key = credentials.credentials
    user = db.query(User).filter(User.api_key == api_key, User.api_key_enabled == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or disabled API key")
    return user

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

class SaveMessageRequest(BaseModel):
    conversation_id: str
    message: ChatMessage

router = APIRouter(tags=["chat"])

llm = AsyncOpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_API_URL,
    default_headers={
        "HTTP-Referer": "https://mizu.technology",
        "X-Title": settings.PROJECT_NAME,
    },
)

def get_conversation(conversation_id: str, request: Request):
    """
    Get a conversation by ID.
    """
    db = request.state.db
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.post("/v1/conversation/create", response_model=ConversationResponse)
async def create_conversation(
    request: Request,
    user: User = Depends(verify_api_key)
):
    """
    Create a new conversation for the authenticated user.
    """
    db = request.state.db
    try:
        # Create a new conversation
        conversation = Conversation(user_id=user.id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

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
    request: Request,
    user: User = Depends(verify_api_key)
):
    """
    Delete a conversation by ID.
    """
    db = request.state.db
    try:
        # Delete the conversation
        conversation = get_conversation(conversation_id, request)
        
        # 检查会话是否属于当前用户
        if conversation.user_id != user.id:
            raise HTTPException(status_code=403, detail="You don't have permission to delete this conversation")
        
        # 更新会话状态为已删除
        conversation.status = "deleted"
        db.commit()

        return {
            "success": True
        }
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")

@router.post("/v1/message/save")
async def save_message(
    request_body: SaveMessageRequest,
    request: Request,
    user: User = Depends(verify_api_key)
):
    """
    Save a message in a conversation.
    """
    db = request.state.db
    try:
        conversation = get_conversation(request_body.conversation_id, request)
        message = Message(
            conversation_id=conversation.id,
            role=request_body.message.role,
            content=request_body.message.content
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        
        return {
            "success": True,
            "data": {
                "id": message.id,
                "conversation_id": message.conversation_id,
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at.isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Error saving message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving message: {str(e)}")

@router.post("/v1/chat/completions")
async def chat_completion(
    params: ChatCompletionCreateParam,
    user: User = Depends(verify_api_key)
):
    """
    Create a chat completion.
    """
    try:
        if params.stream:
            return StreamingResponse(
                stream_chat_response(params),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/event-stream",
                    "X-Accel-Buffering": "no"
                }
            )
        else:
            # For non-streaming responses, we directly pass through the OpenAI response
            response = await llm.chat.completions.create(**params.to_dict())
            return response.model_dump()

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        # Format error response in OpenAI-compatible format
        error_response = {
            "error": {
                "message": str(e),
                "type": "server_error",
                "param": None,
                "code": "server_error"
            }
        }
        return JSONResponse(
            status_code=500,
            content=error_response
        )

async def stream_chat_response(params: ChatCompletionCreateParam):
    """
    Stream chat completions directly from the LLM provider.
    """
    try:
        # Ensure stream is set to True
        params_dict = params.to_dict()
        params_dict["stream"] = True
        
        stream = await llm.chat.completions.create(**params_dict)
        
        # Format each chunk as SSE
        async for chunk in stream:
            # Convert the chunk to JSON string
            chunk_data = json.dumps(chunk.model_dump())
            # Format as SSE
            yield f"data: {chunk_data}\n\n"
        
        # Send [DONE] event
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}")
        # Format error as SSE in OpenAI format
        error_response = {
            "error": {
                "message": str(e),
                "type": "server_error",
                "param": None,
                "code": "server_error"
            }
        }
        yield f"data: {json.dumps(error_response)}\n\n"
        yield "data: [DONE]\n\n"

@router.get("/v1/conversation/list", response_model=List[dict])
async def get_user_conversations(
    request: Request,
    user: User = Depends(verify_api_key)
):
    db = request.state.db
    try:
        # 使用JOIN一次性获取所有会话及其消息
        query = db.query(
            Conversation, Message
        ).outerjoin(
            Message, Conversation.id == Message.conversation_id
        ).filter(
            Conversation.user_id == user.id,
            Conversation.status != "deleted"
        ).order_by(
            Conversation.created_at.desc(),
            Message.created_at.asc()
        ).all()
        
        # 使用字典整理数据，避免多次查询
        conversations_map = {}
        
        for conversation, message in query:
            # 如果会话不在字典中，添加它
            if conversation.id not in conversations_map:
                conversations_map[conversation.id] = {
                    "id": conversation.id,
                    "created_at": conversation.created_at.isoformat(),
                    "messages": []
                }
            
            # 如果有消息，添加到对应会话
            if message:
                conversations_map[conversation.id]["messages"].append({
                    "id": message.id,
                    "role": message.role,
                    "content": message.content,
                    "timestamp": message.created_at.isoformat()
                })
        
        # 转换为列表并返回
        result = list(conversations_map.values())
        return result
    except Exception as e:
        logger.error(f"Error fetching user conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")
