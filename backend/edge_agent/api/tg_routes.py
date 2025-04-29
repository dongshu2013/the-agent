from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime

from edge_agent.models.database import TelegramChat, TelegramMessage, User
from edge_agent.utils.database import get_db
from edge_agent.api.routes import verify_api_key
from edge_agent.utils.embeddings import generate_embedding

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tg_routes")

# Create router
router = APIRouter(tags=["telegram"])

# CORS headers
cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key"
}

@router.get("/v1/tg/get_dialogs", response_model=Dict[str, Any])
async def get_dialogs(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    chat_title: Optional[str] = None,
    is_public: Optional[bool] = None,
    is_free: Optional[bool] = None,
    status: Optional[str] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    request: Request = None,
    user: User = Depends(verify_api_key)
):
    """
    Get a list of user's Telegram dialogs
    """
    try:
        db = request.state.db
        query = db.query(TelegramChat).filter(TelegramChat.user_id == user.id)
        
        # Apply filters
        if chat_title:
            query = query.filter(TelegramChat.chat_title.ilike(f"%{chat_title}%"))
        if is_public is not None:
            query = query.filter(TelegramChat.is_public == is_public)
        if is_free is not None:
            query = query.filter(TelegramChat.is_free == is_free)
        if status:
            query = query.filter(TelegramChat.status == status)
        
        # Get total count
        total_count = query.count()
        
        # Apply sorting
        if sort_by in ["updated_at", "created_at", "chat_title", "last_synced_at"]:
            sort_column = getattr(TelegramChat, sort_by)
            if sort_order.lower() == "asc":
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        # Execute query
        chats = query.all()
        
        # Get message count for each chat
        chat_ids = [chat.id for chat in chats]
        message_counts = db.query(
            TelegramMessage.chat_id, 
            func.count(TelegramMessage.id).label("count")
        ).filter(
            TelegramMessage.chat_id.in_(chat_ids)
        ).group_by(
            TelegramMessage.chat_id
        ).all()
        
        message_count_dict = {chat_id: count for chat_id, count in message_counts}
        
        # Build response
        dialogs = []
        for chat in chats:
            dialog = {
                "id": chat.id,
                "chat_id": chat.chat_id,
                "chat_type": chat.chat_type,
                "chat_title": chat.chat_title,
                "is_public": chat.is_public,
                "is_free": chat.is_free,
                "subscription_fee": float(chat.subscription_fee),
                "last_synced_at": chat.last_synced_at.isoformat(),
                "status": chat.status,
                "created_at": chat.created_at.isoformat(),
                "updated_at": chat.updated_at.isoformat(),
                "message_count": message_count_dict.get(chat.id, 0)
            }
            dialogs.append(dialog)
        
        return JSONResponse(
            content={
                "success": True,
                "data": {
                    "dialogs": dialogs,
                    "total_count": total_count,
                    "limit": limit,
                    "offset": offset
                }
            },
            headers=cors_headers
        )
    except Exception as e:
        logger.error(f"Error getting dialogs: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An error occurred while retrieving dialogs"
                }
            },
            headers=cors_headers
        )

@router.get("/v1/tg/get_messages", response_model=Dict[str, Any])
async def get_messages(
    chat_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    message_text: Optional[str] = None,
    sender_id: Optional[str] = None,
    sender_username: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    start_timestamp: Optional[int] = None,
    end_timestamp: Optional[int] = None,
    sort_by: str = "message_timestamp",
    sort_order: str = "desc",
    request: Request = None,
    user: User = Depends(verify_api_key)
):
    """
    Get messages from a specified chat
    """
    try:
        db = request.state.db
        
        # First verify that the user has permission to access this chat
        chat = db.query(TelegramChat).filter(
            TelegramChat.id == chat_id,
            TelegramChat.user_id == user.id
        ).first()
        
        if not chat:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "error": {
                        "code": "CHAT_NOT_FOUND",
                        "message": "Chat not found or access denied"
                    }
                },
                headers=cors_headers
            )
        
        # Query messages
        query = db.query(TelegramMessage).filter(TelegramMessage.chat_id == chat_id)
        
        # Apply filters
        if message_text:
            query = query.filter(TelegramMessage.message_text.ilike(f"%{message_text}%"))
        if sender_id:
            query = query.filter(TelegramMessage.sender_id == sender_id)
        if sender_username:
            query = query.filter(TelegramMessage.sender_username.ilike(f"%{sender_username}%"))
        if is_pinned is not None:
            query = query.filter(TelegramMessage.is_pinned == is_pinned)
        if start_timestamp:
            query = query.filter(TelegramMessage.message_timestamp >= start_timestamp)
        if end_timestamp:
            query = query.filter(TelegramMessage.message_timestamp <= end_timestamp)
        
        # Get total count
        total_count = query.count()
        
        # Apply sorting
        if sort_by in ["message_timestamp", "created_at"]:
            sort_column = getattr(TelegramMessage, sort_by)
            if sort_order.lower() == "asc":
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        # Execute query
        messages = query.all()
        
        # Build response
        messages_list = []
        for message in messages:
            msg_dict = {
                "id": message.id,
                "message_id": message.message_id,
                "message_text": message.message_text,
                "message_timestamp": message.message_timestamp,
                "sender_id": message.sender_id,
                "sender_username": message.sender_username,
                "sender_firstname": message.sender_firstname,
                "sender_lastname": message.sender_lastname,
                "reply_to_msg_id": message.reply_to_msg_id,
                "is_pinned": message.is_pinned,
                "created_at": message.created_at.isoformat(),
                "updated_at": message.updated_at.isoformat()
            }
            messages_list.append(msg_dict)
        
        chat_info = {
            "id": chat.id,
            "chat_id": chat.chat_id,
            "chat_title": chat.chat_title,
            "chat_type": chat.chat_type,
            "is_public": chat.is_public,
            "is_free": chat.is_free
        }
        
        return JSONResponse(
            content={
                "success": True,
                "data": {
                    "chat": chat_info,
                    "messages": messages_list,
                    "total_count": total_count,
                    "limit": limit,
                    "offset": offset
                }
            },
            headers=cors_headers
        )
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An error occurred while retrieving messages"
                }
            },
            headers=cors_headers
        )

@router.get("/v1/tg/search_messages", response_model=Dict[str, Any])
async def search_messages(
    query: str,
    chat_id: Optional[str] = None,
    top_k: int = Query(10, ge=1, le=100),
    message_range: int = Query(2, ge=0, le=10),
    threshold: float = Query(0.7, ge=0, le=1),
    is_public: Optional[bool] = None,
    is_free: Optional[bool] = None,
    request: Request = None,
    user: User = Depends(verify_api_key)
):
    """
    Search messages based on vector similarity
    """
    try:
        # Generate embedding for the query
        embedding = await generate_embedding(query)
        
        if not embedding:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": {
                        "code": "EMBEDDING_GENERATION_FAILED",
                        "message": "Failed to generate embedding for query"
                    }
                },
                headers=cors_headers
            )
        
        # For pgvector, we need to keep the original format with square brackets
        # but pass it directly in the SQL query instead of using parameter binding
        embedding_str = str(embedding)  # Keep the original format with square brackets
        
        db = request.state.db
        
        # Build base query with direct string formatting for the vector
        # We need to use direct string formatting for the vector part because
        # SQLAlchemy parameter binding doesn't work well with PostgreSQL's ::vector cast
        sql_query = f"""
            SELECT 
                m.id, 
                m.message_id, 
                m.message_text,
                m.message_timestamp,
                m.sender_id,
                m.sender_username,
                m.sender_firstname,
                m.sender_lastname,
                c.id as chat_id,
                c.chat_title,
                c.chat_type,
                c.is_public,
                c.is_free,
                m.embedding <=> '{embedding_str}'::vector AS distance
            FROM 
                tg_messages m
            JOIN
                tg_chats c ON m.chat_id = c.id
            WHERE
                m.embedding IS NOT NULL
                AND c.user_id = :user_id
        """
        
        params = {
            "user_id": user.id
        }
        
        # Add optional filters
        if chat_id:
            sql_query += " AND c.id = :chat_id"
            params["chat_id"] = chat_id
        
        if is_public is not None:
            sql_query += " AND c.is_public = :is_public"
            params["is_public"] = is_public
        
        if is_free is not None:
            sql_query += " AND c.is_free = :is_free"
            params["is_free"] = is_free
        
        # Add sorting and limit
        sql_query += """
            ORDER BY 
                distance
            LIMIT :top_k
        """
        params["top_k"] = top_k
        
        # Execute query
        result = db.execute(text(sql_query), params).fetchall()
        
        # Filter results below threshold
        filtered_results = [r for r in result if r.distance <= threshold]
        
        # Get context for matching messages
        results_with_context = []
        for match in filtered_results:
            # Get chat info for the matching message
            chat = db.query(TelegramChat).filter(TelegramChat.id == match.chat_id).first()
            
            if not chat:
                continue
            
            # Get messages before and after the matching message
            context_messages = db.query(TelegramMessage).filter(
                TelegramMessage.chat_id == match.chat_id,
                TelegramMessage.message_timestamp >= match.message_timestamp - (message_range * 60),  # Assume ~1 minute between messages
                TelegramMessage.message_timestamp <= match.message_timestamp + (message_range * 60)
            ).order_by(TelegramMessage.message_timestamp.asc()).all()
            
            # Build message chunk
            message_chunk = []
            for msg in context_messages:
                msg_dict = {
                    "id": msg.id,
                    "message_id": msg.message_id,
                    "message_text": msg.message_text,
                    "message_timestamp": msg.message_timestamp,
                    "sender_id": msg.sender_id,
                    "sender_username": msg.sender_username,
                    "sender_firstname": msg.sender_firstname,
                    "sender_lastname": msg.sender_lastname,
                    "is_match": msg.id == match.id,
                    "similarity": 1 - match.distance if msg.id == match.id else None
                }
                message_chunk.append(msg_dict)
            
            # Build chat info
            chat_info = {
                "id": chat.id,
                "chat_id": chat.chat_id,
                "chat_title": chat.chat_title,
                "chat_type": chat.chat_type,
                "is_public": chat.is_public,
                "is_free": chat.is_free
            }
            
            results_with_context.append({
                "chat": chat_info,
                "message_chunk": message_chunk
            })
        
        return JSONResponse(
            content={
                "success": True,
                "data": {
                    "results": results_with_context,
                    "query_embedding_available": True
                }
            },
            headers=cors_headers
        )
    except Exception as e:
        logger.error(f"Error searching messages: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": f"An error occurred while searching messages: {str(e)}"
                }
            },
            headers=cors_headers
        )

# OPTIONS handlers for CORS preflight requests
@router.options("/v1/tg/get_dialogs")
@router.options("/v1/tg/get_messages")
@router.options("/v1/tg/search_messages")
async def options_handler():
    return JSONResponse(
        content={"success": True},
        headers=cors_headers
    )
