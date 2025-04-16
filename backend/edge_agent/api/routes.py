from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional, Union
import json
import httpx
import os
from pydantic import BaseModel
from edge_agent.models import ChatRequest, ChatResponse, ErrorResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

router = APIRouter(tags=["chat"])
llm = AsyncOpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url=settings.OPENROUTER_API_URL,
    default_headers={
        "HTTP-Referer": "https://mizu.technology",
        "X-Title": settings.PROJECT_NAME,
    },
)

@router.post("/api/v1/chat/completions")
async def chat_completion(payload: ChatRequest):
    try:
        if payload.stream:
            # Handle streaming response
            return StreamingResponse(
                stream_chat_response(payload),
                media_type="text/event-stream"
            )
        else:
            # Handle regular response
            response = await llm.chat.completions.create(
                model=settings.DEFAULT_MODEL,
                messages=payload.messages,
                stream=False
            )
            return ChatResponse(**response.model_dump())

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def stream_chat_response(payload: ChatRequest):
    """
    Generator function that streams the chat response in SSE format.
    """
    try:
        # Create a streaming response from OpenAI
        stream = await llm.chat.completions.create(
            model=settings.DEFAULT_MODEL,
            messages=payload.messages,
            stream=True
        )

        # Yield each chunk in SSE format
        for chunk in stream:
            if chunk.choices:
                delta = chunk.choices[0].delta
                
                # Create a response chunk in the format expected by clients
                response_chunk = {
                    "id": chunk.id,
                    "object": "chat.completion.chunk",
                    "created": chunk.created,
                    "model": chunk.model,
                    "choices": [
                        {
                            "index": chunk.choices[0].index,
                            "delta": {
                                "role": delta.role or "",
                                "content": delta.content or ""
                            },
                            "finish_reason": chunk.choices[0].finish_reason
                        }
                    ]
                }
                
                # Format as Server-Sent Event
                yield f"data: {json.dumps(response_chunk)}\n\n"
                
        # Send the final [DONE] message to signal the end of the stream
        yield "data: [DONE]\n\n"
            
    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}")
        error_response = {
            "error": {
                "message": f"Error during streaming: {str(e)}",
                "type": "server_error"
            }
        }
        yield f"data: {json.dumps(error_response)}\n\n"
        yield "data: [DONE]\n\n"
