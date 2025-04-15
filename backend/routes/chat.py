from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from backend.schemas import ChatRequest, ChatResponse, ErrorResponse
from backend.services.llm_client import chat_with_llm

router = APIRouter()

@router.post("/completion", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """
    处理聊天补全请求
    接收用户消息和系统设置，调用LLM服务获取响应
    """
    response = await chat_with_llm(request)
    
    # 检查是否有错误
    if "error" in response:
        raise HTTPException(
            status_code=500, 
            detail=ErrorResponse(
                error=response["error"],
                details=response.get("details")
            ).model_dump()
        )
    
    return ChatResponse(
        role=response["role"],
        content=response["content"]
    ) 