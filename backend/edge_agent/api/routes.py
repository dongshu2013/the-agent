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

async def process_llm_response(response, conversation_id):
    """
    Process a non-streaming LLM response and save it to the database.
    Returns the role and content data.
    """
    # Determine the role based on the response
    role = "assistant"
    content_data = []

    # Check if the response contains tool calls
    if hasattr(response.choices[0].message, 'tool_calls') and response.choices[0].message.tool_calls:
        role = "tooling"
        # Process tool calls
        for tool_call in response.choices[0].message.tool_calls:
            content_data.append({
                "type": "tool_call",
                "tool_call": {
                    "id": tool_call.id,
                    "type": tool_call.type,
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments
                    }
                }
            })
    else:
        # Regular text response
        assistant_content = response.choices[0].message.content if response.choices else ""
        content_data = [{"type": "text", "text": assistant_content}]

    # Save the response to the database
    save_response_to_database(conversation_id, role, content_data)
    
    return role, content_data

def process_tool_call_chunk(tool_call_chunk, tool_calls):
    """
    Process a tool call chunk and update the tool_calls list.
    Returns the updated tool_calls list.
    """
    # If this is an update to an existing tool call
    if tool_call_chunk.index is not None:
        index = tool_call_chunk.index

        # Ensure we have enough tool calls in our list
        while len(tool_calls) <= index:
            tool_calls.append({
                "id": None,
                "type": None,
                "function": {"name": "", "arguments": ""}
            })

        # Update the tool call
        if tool_call_chunk.id:
            tool_calls[index]["id"] = tool_call_chunk.id
        
        if tool_call_chunk.type:
            tool_calls[index]["type"] = tool_call_chunk.type
        
        if tool_call_chunk.function:
            if tool_call_chunk.function.name:
                tool_calls[index]["function"]["name"] = tool_call_chunk.function.name
            
            if tool_call_chunk.function.arguments:
                tool_calls[index]["function"]["arguments"] += tool_call_chunk.function.arguments
    
    return tool_calls

def save_response_to_database(conversation_id, role, content_data):
    """
    Save a response to the database.
    """
    try:
        assistant_message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content_data
        )
        db.session.add(assistant_message)
        db.session.commit()
        logger.info(f"Saved {role} response to database for conversation {conversation_id}")
        return True
    except Exception as db_error:
        # If we can't save to the database, log the error but don't crash
        logger.error(f"Failed to save response to database: {str(db_error)}")
        # Try to rollback the session if possible
        try:
            db.session.rollback()
        except:
            pass
        return False

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

            # Process and save the response
            process_llm_response(response, conversation.id)
            
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
    tool_calls = []
    response_role = "assistant"

    try:
        # Create the streaming request to the LLM
        stream = await llm.chat.completions.create(
            messages=payload.messages,
            model=settings.DEFAULT_MODEL,
            stream=True
        )

        # Process each chunk as it arrives
        async for chunk in stream:
            # Handle content updates
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
            
            # Handle tool call updates
            if hasattr(chunk.choices[0].delta, 'tool_calls') and chunk.choices[0].delta.tool_calls:
                response_role = "tooling"

                # Process tool call chunks
                for tool_call_chunk in chunk.choices[0].delta.tool_calls:
                    tool_calls = process_tool_call_chunk(tool_call_chunk, tool_calls)

                # Format the response for streaming
                response = {
                    "id": chunk.id,
                    "object": "chat.completion.chunk",
                    "created": chunk.created,
                    "model": chunk.model,
                    "choices": [{
                        "index": 0,
                        "delta": {
                            "tool_calls": [t for t in tool_calls if t["id"] is not None]
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
        if full_response or tool_calls:
            try:
                # Prepare content data based on response type
                content_data = []
                
                if response_role == "tooling" and tool_calls:
                    # Format tool calls for database storage
                    for tool_call in tool_calls:
                        if tool_call["id"] is not None:  # Only include complete tool calls
                            content_data.append({
                                "type": "tool_call",
                                "tool_call": tool_call
                            })
                elif full_response:
                    # Regular text response
                    content_data = [{"type": "text", "text": full_response}]
                
                if content_data:
                    save_response_to_database(conversation_id, response_role, content_data)
            except Exception as db_error:
                logger.error(f"Failed to save response to database: {str(db_error)}")
