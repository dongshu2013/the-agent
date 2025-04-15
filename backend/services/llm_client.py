"""
LLM客户端服务 - 负责与不同的语言模型通信
"""

import os
import json
import logging
import aiohttp
import asyncio
from typing import Dict, List, Any, Optional

from ..schemas import ChatRequest, ChatResponse, ChatMessage, ChatChoice, ToolCall, FunctionCall

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("llm_client")

# 环境变量和API端点
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MASTRA_API_URL = os.getenv("MASTRA_API_URL", "http://localhost:8008")
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

# 默认模型设置
DEFAULT_MODEL = "gpt-3.5-turbo"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 1000

# 支持的模型列表
SUPPORTED_MODELS = {
    # OpenAI模型
    "gpt-3.5-turbo": {
        "provider": "openai",
        "max_tokens": 4096,
        "supports_tools": True,
    },
    "gpt-4": {
        "provider": "openai", 
        "max_tokens": 8192,
        "supports_tools": True,
    },
    "gpt-4-turbo": {
        "provider": "openai",
        "max_tokens": 8192,
        "supports_tools": True,
    },
    # Anthropic模型
    "claude-3-opus": {
        "provider": "anthropic",
        "max_tokens": 4096,
        "supports_tools": True,
    },
    "claude-3-sonnet": {
        "provider": "anthropic",
        "max_tokens": 4096,
        "supports_tools": True,
    },
    "claude-3-haiku": {
        "provider": "anthropic",
        "max_tokens": 2048,
        "supports_tools": True,
    },
    # 本地/自托管模型
    "camel": {
        "provider": "mastra",
        "max_tokens": 2048,
        "supports_tools": False,
    },
    "mistral": {
        "provider": "mastra",
        "max_tokens": 2048,
        "supports_tools": False,
    }
}

async def chat_with_llm(request: ChatRequest) -> ChatResponse:
    """
    与语言模型通信并获取响应
    
    Args:
        request (ChatRequest): 聊天请求
        
    Returns:
        ChatResponse: 聊天响应
    """
    try:
        # 获取请求参数
        model = request.model or DEFAULT_MODEL
        temperature = request.temperature or DEFAULT_TEMPERATURE
        max_tokens = request.max_tokens or DEFAULT_MAX_TOKENS
        
        # 校验模型
        if model not in SUPPORTED_MODELS:
            logger.warning(f"不支持的模型: {model}，使用默认模型: {DEFAULT_MODEL}")
            model = DEFAULT_MODEL
        
        model_info = SUPPORTED_MODELS[model]
        provider = model_info["provider"]
        
        # 选择相应的提供商处理请求
        if provider == "openai":
            return await _chat_with_openai(request, model, temperature, max_tokens)
        elif provider == "anthropic":
            return await _chat_with_anthropic(request, model, temperature, max_tokens)
        elif provider == "mastra":
            return await _chat_with_mastra(request, model, temperature, max_tokens)
        else:
            raise ValueError(f"未知的提供商: {provider}")
    
    except Exception as e:
        logger.error(f"与LLM通信时出错: {str(e)}", exc_info=True)
        # 构造错误响应
        return ChatResponse(
            id="error",
            object="chat.completion",
            created=0,
            model=request.model or DEFAULT_MODEL,
            choices=[
                ChatChoice(
                    index=0,
                    message=ChatMessage(
                        role="assistant",
                        content=f"处理您的请求时出现错误: {str(e)}"
                    ),
                    finish_reason="error"
                )
            ]
        )

async def _chat_with_openai(
    request: ChatRequest, 
    model: str, 
    temperature: float, 
    max_tokens: int
) -> ChatResponse:
    """与OpenAI API通信"""
    
    if not OPENAI_API_KEY and not request.api_key:
        raise ValueError("未提供OpenAI API密钥")
    
    api_key = request.api_key or OPENAI_API_KEY
    
    # 构建请求数据
    request_data = {
        "model": model,
        "messages": [msg.dict(exclude_none=True) for msg in request.messages],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    
    # 添加工具
    if request.tools and SUPPORTED_MODELS[model]["supports_tools"]:
        request_data["tools"] = [tool.dict(exclude_none=True) for tool in request.tools]
    
    # 添加流式设置
    if request.stream:
        request_data["stream"] = True
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            OPENAI_API_URL, 
            headers=headers, 
            json=request_data
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"OpenAI API错误: {response.status} - {error_text}")
                raise ValueError(f"OpenAI API错误: {response.status} - {error_text}")
            
            result = await response.json()
            
            # 解析响应
            return ChatResponse(
                id=result.get("id", ""),
                object=result.get("object", ""),
                created=result.get("created", 0),
                model=result.get("model", model),
                choices=[
                    ChatChoice(
                        index=choice.get("index", 0),
                        message=ChatMessage(
                            role=choice.get("message", {}).get("role", "assistant"),
                            content=choice.get("message", {}).get("content", ""),
                            tool_calls=[
                                ToolCall(
                                    id=tool_call.get("id", ""),
                                    type=tool_call.get("type", "function"),
                                    function=FunctionCall(
                                        name=tool_call.get("function", {}).get("name", ""),
                                        arguments=tool_call.get("function", {}).get("arguments", "")
                                    )
                                )
                                for tool_call in choice.get("message", {}).get("tool_calls", [])
                            ] if choice.get("message", {}).get("tool_calls") else None
                        ),
                        finish_reason=choice.get("finish_reason", "")
                    )
                    for choice in result.get("choices", [])
                ]
            )

async def _chat_with_anthropic(
    request: ChatRequest, 
    model: str, 
    temperature: float, 
    max_tokens: int
) -> ChatResponse:
    """与Anthropic API通信"""
    
    if not ANTHROPIC_API_KEY and not request.api_key:
        raise ValueError("未提供Anthropic API密钥")
    
    api_key = request.api_key or ANTHROPIC_API_KEY
    
    # 转换消息格式
    messages = []
    system_message = None
    
    for msg in request.messages:
        if msg.role == "system":
            system_message = msg.content
        else:
            messages.append({"role": msg.role, "content": msg.content})
    
    # 构建请求数据
    request_data = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    
    # 添加系统消息
    if system_message:
        request_data["system"] = system_message
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            ANTHROPIC_API_URL, 
            headers=headers, 
            json=request_data
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Anthropic API错误: {response.status} - {error_text}")
                raise ValueError(f"Anthropic API错误: {response.status} - {error_text}")
            
            result = await response.json()
            
            # 解析响应
            return ChatResponse(
                id=result.get("id", ""),
                object="chat.completion",
                created=0,  # Anthropic不提供创建时间戳
                model=model,
                choices=[
                    ChatChoice(
                        index=0,
                        message=ChatMessage(
                            role="assistant",
                            content=result.get("content", [{}])[0].get("text", "")
                        ),
                        finish_reason=result.get("stop_reason", "")
                    )
                ]
            )

async def _chat_with_mastra(
    request: ChatRequest, 
    model: str, 
    temperature: float, 
    max_tokens: int
) -> ChatResponse:
    """与本地Mastra/Camel服务通信"""
    
    # 构建请求数据
    request_data = {
        "model": model,
        "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False
    }
    
    # 发送请求
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{MASTRA_API_URL}/v1/chat/completions", 
                headers={"Content-Type": "application/json"},
                json=request_data
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Mastra API错误: {response.status} - {error_text}")
                    raise ValueError(f"Mastra API错误: {response.status} - {error_text}")
                
                result = await response.json()
                
                # 解析响应
                return ChatResponse(
                    id=result.get("id", ""),
                    object=result.get("object", "chat.completion"),
                    created=result.get("created", 0),
                    model=result.get("model", model),
                    choices=[
                        ChatChoice(
                            index=choice.get("index", 0),
                            message=ChatMessage(
                                role=choice.get("message", {}).get("role", "assistant"),
                                content=choice.get("message", {}).get("content", "")
                            ),
                            finish_reason=choice.get("finish_reason", "")
                        )
                        for choice in result.get("choices", [])
                    ]
                )
    except Exception as e:
        logger.error(f"连接Mastra服务出错: {str(e)}", exc_info=True)
        raise ValueError(f"无法连接到Mastra服务: {str(e)}") 