from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional, Union
import json
import httpx
import os
from pydantic import BaseModel
from edge_agent.models import ChatRequest, ChatResponse, ErrorResponse

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

# 创建路由
router = APIRouter(tags=["chat"])
llm = OpenRouterClient()

@router.post("/api/v1/chat/completions", response_model=ChatResponse)
async def chat_completion(payload: ChatRequest):
    try:
        if payload.stream:
            return HTTPException(status_code=501, detail="Streaming is not implemented yet")
        response = await llm.client.chat.completions.create(
            model=llm.model,
            messages=payload.messages,
            stream=payload.stream
        )
        return ChatResponse(**response.model_dump())

    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
