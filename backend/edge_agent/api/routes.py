from fastapi import APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional, Union
import json
import httpx
import os
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from edge_agent.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None

router = APIRouter(tags=["chat"])

llm = AsyncOpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_API_URL,
    default_headers={
        "HTTP-Referer": "https://mizu.technology",
        "X-Title": settings.PROJECT_NAME,
    },
)

@router.post("/v1/chat/completions")
async def chat_completion(payload: ChatCompletionRequest):
    try:
        if payload.stream:
            return StreamingResponse(
                stream_chat_response(payload),
                media_type="text/event-stream"
            )
        else:
            response = await llm.chat.completions.create(messages=payload.messages, model=settings.DEFAULT_MODEL)
            return response

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def stream_chat_response(payload: ChatCompletionRequest):
    """
    Generator function that streams the chat response in SSE format.
    """
    try:
        params = payload.dict(exclude_none=True)
        params["stream"] = True
        params["model"] = settings.DEFAULT_MODEL  # 确保设置模型
        
        stream = await llm.chat.completions.create(**params)
        
        async for chunk in stream:
            if chunk.choices[0].delta.content is not None:
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
                yield f"data: {json.dumps(response)}\n\n"

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
