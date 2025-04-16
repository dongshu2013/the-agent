from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional, Union
import json
import httpx
import os
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionCreateParams
from edge_agent.core.config import settings

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

@router.post("/v1/chat/completions")
async def chat_completion(payload: ChatCompletionCreateParams):
    try:
        if payload.stream:
            # Handle streaming response
            return StreamingResponse(
                stream_chat_response(payload),
                media_type="text/event-stream"
            )
        else:
            # Handle regular response
            response = await llm.chat.completions.create(**payload.model_dump())
            return response

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def stream_chat_response(payload: ChatCompletionCreateParams):
    """
    Generator function that streams the chat response in SSE format.
    """
    try:
        # Create a streaming response from OpenAI
        stream = await llm.chat.completions.create(**payload.model_dump(exclude_none=True))
        
        # Yield each chunk in SSE format
        for chunk in stream:
            yield f"data: {chunk.model_dump_json()}\n\n"

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
