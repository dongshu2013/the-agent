import openai
import json
import logging
import httpx
from typing import Dict, List, Any, Optional
from ..schemas import ChatRequest, ChatResponse, Message
from ..config import OPENAI_API_KEY, OPENAI_API_BASE, DEEPSEEK_API_KEY, DEEPSEEK_API_BASE, DEFAULT_MODEL

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("llm_client")

# 配置OpenAI客户端
if OPENAI_API_BASE:
    openai.api_base = OPENAI_API_BASE
openai.api_key = OPENAI_API_KEY

async def chat_with_llm(payload: ChatRequest) -> ChatResponse:
    """与LLM进行对话，支持多种模型提供商"""
    model = payload.model or DEFAULT_MODEL
    
    # 根据模型决定使用哪个提供商
    if model.startswith("deepseek-"):
        return await chat_with_deepseek(payload)
    else:
        return await chat_with_openai(payload)

async def chat_with_openai(payload: ChatRequest) -> ChatResponse:
    """使用OpenAI进行聊天"""
    try:
        # 准备消息格式
        messages = [msg.dict(exclude_none=True) for msg in payload.messages]
        
        # 准备请求参数
        request_params = {
            "model": payload.model or DEFAULT_MODEL,
            "messages": messages,
            "temperature": payload.temperature,
        }
        
        # 如果有函数定义，添加到请求中
        if payload.functions:
            request_params["functions"] = [f.dict() for f in payload.functions]
            if payload.function_call:
                request_params["function_call"] = payload.function_call
                
        logger.info(f"Sending request to OpenAI: {json.dumps(request_params, indent=2)}")
        
        # 使用OpenAI API发送请求
        response = await openai.ChatCompletion.acreate(**request_params)
        
        # 处理响应
        assistant_message = response.choices[0].message
        message = Message(
            role=assistant_message.role,
            content=assistant_message.get("content", None),
            function_call=assistant_message.get("function_call", None)
        )
        
        # 返回标准化响应
        return ChatResponse(
            message=message,
            model=response.model,
            usage=response.usage.to_dict() if hasattr(response, "usage") else None
        )
        
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        raise

async def chat_with_deepseek(payload: ChatRequest) -> ChatResponse:
    """使用DeepSeek进行聊天"""
    if not DEEPSEEK_API_KEY:
        raise ValueError("DeepSeek API key not provided")
    
    try:
        # 准备消息格式
        messages = [msg.dict(exclude_none=True) for msg in payload.messages]
        
        # 准备请求参数
        request_data = {
            "model": payload.model,
            "messages": messages,
            "temperature": payload.temperature,
        }
        
        # 如果有函数定义，添加到请求中
        if payload.functions:
            request_data["functions"] = [f.dict() for f in payload.functions]
            if payload.function_call:
                request_data["function_call"] = payload.function_call
        
        logger.info(f"Sending request to DeepSeek: {json.dumps(request_data, indent=2)}")
        
        # 使用httpx发送HTTP请求
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        endpoint = f"{DEEPSEEK_API_BASE}/v1/chat/completions"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                endpoint,
                headers=headers,
                json=request_data
            )
            
            if response.status_code != 200:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                raise Exception(f"DeepSeek API error: {response.status_code} - {response.text}")
            
            response_data = response.json()
            
            # 处理响应
            assistant_message = response_data["choices"][0]["message"]
            message = Message(
                role=assistant_message["role"],
                content=assistant_message.get("content"),
                function_call=assistant_message.get("function_call")
            )
            
            # 返回标准化响应
            return ChatResponse(
                message=message,
                model=response_data["model"],
                usage=response_data.get("usage")
            )
            
    except Exception as e:
        logger.error(f"Error calling DeepSeek API: {str(e)}")
        raise 