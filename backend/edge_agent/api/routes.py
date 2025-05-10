from fastapi import APIRouter, HTTPException, Depends, Header, Request, Security, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from typing import Dict, Any, List, Optional, Union, Literal
import json
import httpx
import os
import asyncio
from decimal import Decimal
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

from datetime import datetime
from edge_agent.core.config import settings
from edge_agent.utils.database import get_db
from edge_agent.models.database import User, Conversation, Message
from edge_agent.utils.embeddings import (
    update_message_embedding,
    find_similar_messages,
    extract_text_from_content
)
from edge_agent.models.database import Credit, Balance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

# Create a Bearer token security scheme
bearer_scheme = HTTPBearer(auto_error=True)


def get_user_current_credits(db: Session, user_id: str) -> float:
    """
    Get the current user credits from the balances table.
    
    Args:
        db: Database session
        user_id: User ID to get credits for
        
    Returns:
        float: Current credit balance for the user, or 0.0 if no balance record exists
    """
    user_balance = db.query(Balance).filter(Balance.user_id == user_id).first()
    return float(user_balance.user_credits) if user_balance else 0.0

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
    logger.info(f"api_key: {api_key}")
    user = db.query(User).filter(User.api_key == api_key, User.api_key_enabled == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or disabled API key")
    return user

class ToolCallFunction(BaseModel):
    name: str
    arguments: str

class ToolCall(BaseModel):
    function: ToolCallFunction
    id: str
    type: Optional[str] = None
    result: Optional[str] = None
class ChatMessage(BaseModel):
    role: str
    content: Optional[str] = None  # Required for save_message endpoint
    toolCalls: Optional[List[ToolCall]] = None
    toolCallId: Optional[str] = None
    tool_call_id: Optional[str] = None
    tool_calls: Optional[List[ToolCall]] = None
    name: Optional[str] = None

class ChatMessageWithId(ChatMessage):
    message_id: str
    created_at: str

class ChatCompletionCreateParam(BaseModel):
    """
    Parameters for creating a chat completion, compatible with OpenAI API.
    """
    messages: List[ChatMessage]
    model: str
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

class MessageSearchRequest(BaseModel):
    message: str
    conversation_id: str
    k: int = 3

class SimilaritySearchRequest(BaseModel):
    query: str
    limit: int = 5
    conversation_id: Optional[str] = None

class SaveMessageRequest(BaseModel):
    conversation_id: str
    message: ChatMessageWithId
    top_k_related: int = 0

class ModelRequest(BaseModel):
    id: Optional[str] = None
    type: str
    name: str
    api_key: str
    api_url: str

class DeleteModelRequest(BaseModel):
    id: str

router = APIRouter(tags=["chat"])

def get_conversation(conversation_id: str, request: Request):
    """
    Get a conversation by ID.
    """
    db = request.state.db
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.get("/v1/conversation/list", response_model=List[dict])
async def get_user_conversations(
    request: Request,
    user: User = Depends(verify_api_key)
):
    db = request.state.db
    try:
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

        conversations_map = {}
        for conversation, message in query:
            if conversation.id not in conversations_map:
                conversations_map[conversation.id] = {
                    "id": conversation.id,
                    "created_at": conversation.created_at.isoformat(),
                    "messages": []
                }

            if message:
                conversations_map[conversation.id]["messages"].append({
                    "id": message.id,
                    "role": message.role,
                    "content": message.content,
                    "timestamp": message.created_at.isoformat(),
                    "tool_calls": json.loads(message.tool_calls) if message.tool_calls else None,
                    "tool_call_id": message.tool_call_id
                })

        result = list(conversations_map.values())
        return result
    except Exception as e:
        logger.error(f"Error fetching user conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")

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
        raise HTTPException(status_code=e.status_code, detail=f"Error deleting conversation: {str(e)}")
    
    
@router.post("/v1/chat/completions")
async def chat_completion(
    params: ChatCompletionCreateParam,
    request: Request,
    user: User = Depends(verify_api_key)
):
    """
    Create a chat completion using the specified model.
    """
    db = request.state.db
    try:
        # Get the current user credits
        credits = get_user_current_credits(db, user.id)
        # Check if user has enough credits
        if credits <= Decimal('0'):
            error_response = {
                "error": {
                    "message": "Insufficient credits. Please add more credits to your account.",
                    "type": "insufficient_credits",
                    "param": None,
                    "code": "insufficient_credits"
                }
            }
            return JSONResponse(
                status_code=400,
                content=error_response
            )

        # Get model configuration
        model_config = parse_model_config(request.query_params)
        if not model_config or not model_config["api_key"] or not model_config["api_url"]:
            raise HTTPException(status_code=400, detail="Missing or invalid modelConfig in query params")

        logger.error(f"model_config: {str(model_config)}")
        
        # Create LLM client with model-specific configuration
        llm = AsyncOpenAI(
            api_key=model_config["api_key"],
            base_url=model_config["api_url"],
            default_headers={
                "HTTP-Referer": "https://mizu.technology",
                "X-Title": settings.PROJECT_NAME,
            },
        )

        params = {
            **params.dict(),
            "model": settings.DEFAULT_MODEL if model_config["model"] == "Mysta Model" else model_config["model"]
        }
        
        if params["stream"]:
            return StreamingResponse(
                stream_chat_response(params, llm),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/event-stream",
                    "X-Accel-Buffering": "no"
                }
            )
        else:
            # Update model name in params
            params_dict = params.to_dict()
            response = await llm.chat.completions.create(**params_dict)
            return response.model_dump()

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        error_response = {
            "error": {
                "message": str(e),
                "type": "server_error",
                "param": None,
                "code": "server_error"
            }
        }
        status_code = getattr(e, 'status_code', 500)
        return JSONResponse(
            status_code=status_code,
            content=error_response
        )

async def stream_chat_response(params, llm):
    """
    Stream chat completions directly from the LLM provider.
    """
    try:
        stream = await llm.chat.completions.create(**params)

        async for chunk in stream:
            chunk_data = json.dumps(chunk.model_dump())
            yield f"data: {chunk_data}\n\n"
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}")
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

@router.post("/v1/message/save", response_model=Dict[str, Any])
async def save_message(
    request: Request,
    message_data: SaveMessageRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(verify_api_key)
):
    """
    Save a message to a conversation and generate its embedding.
    """
    db = request.state.db
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == message_data.conversation_id,
            Conversation.user_id == user.id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found or not authorized")

        # Convert tool_calls to a serializable format
        tool_calls_raw = message_data.message.tool_calls or []
        tool_calls = []
        for tool_call in tool_calls_raw:
            # 如果是 Pydantic 对象，先转 dict
            if hasattr(tool_call, "dict"):
                tool_call_dict = tool_call.dict()
            elif isinstance(tool_call, dict):
                tool_call_dict = tool_call
            else:
                continue  # 跳过异常类型

            # function 字段也要转 dict
            function = tool_call_dict.get("function")
            if hasattr(function, "dict"):
                tool_call_dict["function"] = function.dict()

            tool_calls.append(tool_call_dict)

        # 保存消息
        message = Message(
            id=message_data.message.message_id,
            conversation_id=message_data.conversation_id,
            role=message_data.message.role,
            content=message_data.message.content,
            created_at=datetime.fromisoformat(message_data.message.created_at),
            tool_calls=json.dumps(tool_calls) if tool_calls else None,
            tool_call_id=message_data.message.tool_call_id
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        # 获取 top k 相关消息
        top_k_messages = []
        if message_data.top_k_related > 0:
            message_text = extract_text_from_content(message_data.message.content)
            similar_messages = await find_similar_messages(
                query_text=message_text,
                conversation_id=message_data.conversation_id,
                limit=message_data.top_k_related,
                db=db
            )
            top_k_messages = [msg.id for msg in similar_messages]

        # 在后台任务中生成嵌入
        background_tasks.add_task(update_message_embedding, message.id)

        return {
            "success": True,
            "top_k_messages": top_k_messages
        }
    except Exception as e:
        logger.error(f"Error saving message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving message: {str(e)}")

@router.get("/v1/auth/verify", response_model=Dict[str, Any])
async def verify_auth(
    request: Request,
    user: User = Depends(verify_api_key)
):
    """
    Verify the API key and return user information.
    """
    db = request.state.db
    # Get the current user credits
    credits = get_user_current_credits(db, user.id)
    
    return {
        "success": True,    
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "api_key_enabled": user.api_key_enabled,
            "api_key": user.api_key,
            "credits": credits
        }
    }

class DeductCreditsRequest(BaseModel):
    credits: float
    conversation_id: Optional[str] = None
    model: Optional[str] = None
    
@router.get("/v1/credits/balance", response_model=Dict[str, Any])
async def get_credit_balance(
    request: Request,
    user: User = Depends(verify_api_key)
):
    """
    Get the credit balance for the authenticated user.
    """
    db = request.state.db
    try:
        # Get the current user credits
        credits = get_user_current_credits(db, user.id)
            
        return JSONResponse(
            content={
                "success": True,
                "credits": credits,
                "user_id": user.id
            }
        )
    except Exception as e:
        logger.error(f"Error getting credit balance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get credit balance: {str(e)}")

@router.post("/v1/credits/deduct", response_model=dict)
async def deduct_credits(
    request: Request,
    credit_data: DeductCreditsRequest,
    user: User = Depends(verify_api_key)
):
    """
    Deduct credits from a user account using the authenticated user from the API key.
    """
    db = request.state.db
    try:
        # Use the authenticated user directly from the API key
        target_user = user
        
        # Get the current user credits from balances table
        current_credits = get_user_current_credits(db, target_user.id)
        
        if current_credits == 0.0:
            raise HTTPException(status_code=400, detail="No balance record found for user")
            
        current_credits = Decimal(str(current_credits))
        credit_amount = Decimal(str(credit_data.credits))
        
        # Check if user has enough credits
        if current_credits < credit_amount:
            raise HTTPException(status_code=400, detail="Insufficient credits")
            
        logger.info(f"Deducting {credit_amount} credits from user {user.id} with current balance {float(current_credits)}")
        
        # Calculate new balance
        new_balance = current_credits - credit_amount
        
        # Create a transaction record in credits table
        credit = Credit(
            user_id=target_user.id,
            trans_credits=-credit_amount,  # Negative for completion
            trans_type="completion",
            conversation_id=credit_data.conversation_id,
            model=credit_data.model
        )
        db.add(credit)
        
        # Update user balance in balances table
        user_balance = db.query(Balance).filter(Balance.user_id == target_user.id).first()
        if user_balance:
            user_balance.user_credits = new_balance
            user_balance.updated_at = datetime.now()
        else:
            # Create balance record if it doesn't exist
            user_balance = Balance(
                user_id=target_user.id,
                user_credits=new_balance
            )
            db.add(user_balance)
        
        # Commit changes to the database
        db.flush()
        db.commit()
        
        logger.info(f"Updated credits for user {target_user.id}: {float(current_credits)} -> {float(new_balance)}")
        logger.info(f"Created credit record: {credit.id}")
        
        return JSONResponse(
            content={
                "success": True,
                "remaining_credits": float(new_balance),
                "user_id": target_user.id
            }
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        logger.error(f"Error deducting credits: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to deduct credits: {str(e)}")

def parse_model_config(query_params):
    model_config = {}
    for k, v in query_params.items():
        if k.startswith("modelConfig[") and k.endswith("]"):
            key = k[len("modelConfig["):-1]
            model_config[key] = v
    # 统一 key 命名，兼容前端 camelCase
    return {
        "id": model_config.get("id"),
        "name": model_config.get("name"),
        "type": model_config.get("type"),
        "api_key": model_config.get("apiKey"),
        "api_url": model_config.get("apiUrl"),
        "model": model_config.get("name"),  # 用 name 作为 model
    }