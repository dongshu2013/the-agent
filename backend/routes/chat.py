from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
import logging
from typing import Dict, Any

from backend.schemas import ChatRequest, ChatResponse, ErrorResponse
from backend.services.llm_client import chat_with_llm

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

# 创建路由
router = APIRouter(tags=["chat"])

@router.post("/completion", response_model=ChatResponse)
async def chat_completion(payload: ChatRequest):
    """
    处理聊天完成请求，调用LLM并返回响应
    
    - **payload**: 包含消息、模型和其他配置的请求体
    
    返回LLM的响应消息
    """
    try:
        logger.info(f"Received chat request for model: {payload.model}")
        
        # 如果请求了流式响应，返回StreamingResponse
        if payload.stream:
            return HTTPException(status_code=501, detail="Streaming is not implemented yet")
        
        # 调用LLM服务获取响应
        response = await chat_with_llm(payload)
        logger.info(f"Got response from LLM: {response}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}") 