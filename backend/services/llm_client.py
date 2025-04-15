import openai
import httpx
import json
import logging
from typing import Dict, List, Optional, Any
import os

# 修改为绝对导入
from backend.config import settings
from backend.schemas import ChatRequest, ChatResponse, ErrorResponse

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 配置OpenAI客户端 - 使用最新的OpenAI客户端初始化方式
openai_client = openai.OpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url
)

async def chat_with_llm(payload: ChatRequest) -> Dict[str, Any]:
    """
    统一处理与LLM的通信
    根据请求中的model字段决定使用哪个提供商的API
    """
    try:
        model = payload.model or settings.default_model
        model_info = settings.model_mapping.get(model)
        
        if not model_info:
            # 未找到模型映射，默认使用OpenAI
            logger.warning(f"未找到模型 {model} 的映射配置，默认使用OpenAI")
            return await chat_with_openai(payload)
        
        provider = model_info["provider"]
        
        if provider == "openai":
            return await chat_with_openai(payload)
        elif provider == "deepseek":
            return await chat_with_deepseek(payload)
        else:
            logger.error(f"不支持的提供商: {provider}")
            return {"error": "不支持的LLM提供商", "details": f"提供商 {provider} 暂不支持"}
    
    except Exception as e:
        logger.exception("LLM请求处理异常")
        return {"error": "LLM请求失败", "details": str(e)}

async def chat_with_openai(payload: ChatRequest) -> Dict[str, Any]:
    """调用OpenAI的API"""
    try:
        # 检查API密钥
        if not settings.openai_api_key:
            return {"error": "缺少API密钥", "details": "未设置OPENAI_API_KEY环境变量"}
        
        # 准备请求参数
        model = payload.model or settings.default_model
        if model in settings.model_mapping:
            model = settings.model_mapping[model]["model_id"]
            
        # 兼容Pydantic v2，使用model_dump而不是dict
        messages = [
            {k: v for k, v in msg.model_dump().items() if v is not None}
            for msg in payload.messages
        ]
        
        # 调用OpenAI API - 使用新的客户端接口
        response = await httpx.AsyncClient().post(
            f"{settings.openai_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": payload.temperature,
                "max_tokens": payload.max_tokens,
                "stream": False
            },
            timeout=60.0
        )
        
        response.raise_for_status()
        data = response.json()
        
        # 提取回复内容
        reply = data["choices"][0]["message"]
        
        return {
            "role": reply["role"],
            "content": reply["content"]
        }
    
    except Exception as e:
        logger.exception("OpenAI请求失败")
        return {"error": "OpenAI请求失败", "details": str(e)}

async def chat_with_deepseek(payload: ChatRequest) -> Dict[str, Any]:
    """调用DeepSeek的API"""
    try:
        # 检查API密钥
        if not settings.deepseek_api_key:
            return {"error": "缺少API密钥", "details": "未设置DEEPSEEK_API_KEY环境变量"}
        
        # 准备请求参数
        model = payload.model
        if model in settings.model_mapping:
            model = settings.model_mapping[model]["model_id"]
            
        # 兼容Pydantic v2，使用model_dump而不是dict
        messages = [
            {k: v for k, v in msg.model_dump().items() if v is not None}
            for msg in payload.messages
        ]
        
        # 准备HTTP请求
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.deepseek_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.deepseek_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": payload.temperature,
                    "max_tokens": payload.max_tokens,
                    "stream": False
                }
            )
            
            # 检查响应状态
            response.raise_for_status()
            data = response.json()
            
            # 提取回复内容
            reply = data["choices"][0]["message"]
            
            return {
                "role": reply["role"],
                "content": reply["content"]
            }
    
    except Exception as e:
        logger.exception("DeepSeek请求失败")
        return {"error": "DeepSeek请求失败", "details": str(e)} 