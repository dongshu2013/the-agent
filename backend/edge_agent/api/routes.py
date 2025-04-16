from fastapi import APIRouter, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional, Union
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

class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = False
    conversation_id: str

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

@router.post("/v1/conversations", response_model=ConversationResponse)
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

@router.post("/v1/chat/completions")
async def chat_completion(
    payload: ChatCompletionRequest,
    user: User = Depends(verify_api_key)
):
    try:
        conversation = get_conversation(payload.conversation_id)
        for msg in payload.messages:
            if msg.role == "user":
                user_message = Message(
                    conversation_id=conversation.id,
                    role="user",
                    content=[{"type": "text", "text": msg.content}]
                )
                db.session.add(user_message)
        db.session.commit()

        if payload.stream:
            return StreamingResponse(
                stream_chat_response(payload, conversation.id),
                media_type="text/event-stream"
            )
        else:
            response = await llm.chat.completions.create(
                messages=payload.messages,
                model=settings.DEFAULT_MODEL
            )

            assistant_content = response.choices[0].message.content if response.choices else ""
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=[{"type": "text", "text": assistant_content}]
            )
            db.session.add(assistant_message)
            db.session.commit()

            return response

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def stream_chat_response(payload: ChatCompletionRequest, conversation_id: str):
    """
    Generator function that streams the chat response in SSE format.
    Handles client disconnections gracefully and ensures responses are saved to the database.
    """
    # Initialize variables outside the try block so they're available in finally
    full_response = ""
    stream = None
    
    try:
        # Create the streaming request to the LLM
        stream = await llm.chat.completions.create(
            messages=payload.messages,
            model=settings.DEFAULT_MODEL,
            stream=True
        )

        # Process each chunk as it arrives
        async for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                # Add to the full response
                full_response += chunk.choices[0].delta.content
                
                # Format the response for streaming
                response = {
                    "id": chunk.id,
                    "object": "chat.completion.chunk",
                    "created": chunk.created,
                    "model": chunk.model,
                    "choices": [{
                        "index": 0,
                        "delta": {
                            "content": chunk.choices[0].delta.content
                        },
                        "finish_reason": chunk.choices[0].finish_reason
                    }]
                }
                
                # This yield will raise an exception if the client disconnects
                yield f"data: {json.dumps(response)}\n\n"

        # Send the [DONE] event if we complete successfully
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        # This will catch both LLM API errors and client disconnection errors
        logger.error(f"Error in streaming response: {str(e)}")
        
        # Only yield an error response if it's not a client disconnection
        # (which would be detected as a ConnectionError, BrokenPipeError, etc.)
        if not isinstance(e, (ConnectionError, BrokenPipeError, asyncio.CancelledError)):
            error_response = {
                "error": {
                    "message": f"Error during streaming: {str(e)}",
                    "type": "server_error"
                }
            }
            try:
                yield f"data: {json.dumps(error_response)}\n\n"
                yield "data: [DONE]\n\n"
            except:
                # If we can't yield (client disconnected), just log it
                logger.info("Could not send error to client - connection likely closed")
    
    finally:
        # Clean up the stream if it exists
        if stream:
            await stream.aclose()
        
        # Always save the response to the database, even if it's partial
        if full_response:
            try:
                # Save whatever response we collected
                assistant_message = Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=[{"type": "text", "text": full_response}]
                )
                db.session.add(assistant_message)
                db.session.commit()
                logger.info(f"Saved response to database for conversation {conversation_id}")
            except Exception as db_error:
                # If we can't save to the database, log the error but don't crash
                logger.error(f"Failed to save response to database: {str(db_error)}")
                # Try to rollback the session if possible
                try:
                    db.session.rollback()
                except:
                    pass
