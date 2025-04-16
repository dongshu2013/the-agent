from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional
import json
import uuid
import asyncio
import os
from datetime import datetime
from openai import AsyncOpenAI
from pydantic import BaseModel # Keep BaseModel for ChatMessage if needed elsewhere or for future
from edge_agent.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

# Define only the necessary models
class ChatMessage(BaseModel):
    role: str
    content: str
    # Removed tool/function related fields as they are not explicitly handled here
    # function_call: Optional[Dict[str, Any]] = None 
    # name: Optional[str] = None

# Removed FunctionParameter, FunctionDefinition, ToolDefinition, ToolResultRequest models

# API提供商选择
API_PROVIDER = os.environ.get("API_PROVIDER", "OPENROUTER")  # 可选值: OPENAI, OPENROUTER, MOCK
logger.info(f"Using API provider: {API_PROVIDER}")

# Mock response for development when real API is not available
def generate_mock_response(user_message: str) -> Dict[str, Any]:
    """生成一个模拟的LLM响应，用于开发测试"""
    logger.info("Using MOCK response mode!")
    return {
        "id": f"mock-{uuid.uuid4()}",
        "object": "chat.completion",
        "created": int(datetime.now().timestamp()),
        "model": "mock-model",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": f"这是一个模拟回复。您发送的消息是: '{user_message}'\n\n当前使用模拟模式。"
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": len(user_message),
            "completion_tokens": 150,
            "total_tokens": len(user_message) + 150
        }
    }

# 创建路由
router = APIRouter(tags=["chat"])

# 配置不同的API客户端
if API_PROVIDER == "OPENROUTER":
    # OpenRouter客户端
    openrouter_api_key = settings.OPENROUTER_API_KEY
    openrouter_api_url = settings.OPENROUTER_API_URL
    default_model = settings.DEFAULT_MODEL
    
    logger.info(f"OpenRouter config - URL: {openrouter_api_url}, Model: {default_model}")
    logger.info(f"OpenRouter API Key (first 4 chars): {openrouter_api_key[:4] if openrouter_api_key else 'None'}")
    
    # 根据官方示例修复客户端初始化
    llm = AsyncOpenAI(
        base_url=openrouter_api_url,
        api_key=openrouter_api_key,
    )
    # 验证API密钥是否被正确设置
    if not openrouter_api_key or len(openrouter_api_key) < 10:
        logger.error(f"OpenRouter API key appears to be invalid or missing. Using MOCK mode instead.")
        API_PROVIDER = "MOCK"
    else:
        logger.info("Initialized OpenRouter client with API key")
elif API_PROVIDER == "OPENAI":
    # 从环境变量获取OpenAI API密钥
    openai_api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not openai_api_key:
        logger.warning("OPENAI_API_KEY not found in environment variables! Using MOCK mode instead.")
        API_PROVIDER = "MOCK"
    else:
        llm = AsyncOpenAI(api_key=openai_api_key)
        logger.info("Initialized OpenAI client")
else:
    # 默认为模拟模式
    logger.info("Using MOCK mode (no API client initialized)")

# 明确处理OPTIONS请求
@router.options("/v1/chat/completions")
async def options_chat_completion():
    return JSONResponse(content={}, status_code=200)

@router.post("/v1/chat/completions")
async def chat_completion(payload: Dict[str, Any]):
    """
    Main chat completion endpoint.
    Accepts a dictionary directly matching openai parameters.
    """
    try:
        if "messages" not in payload or not isinstance(payload["messages"], list):
            raise HTTPException(status_code=400, detail="Invalid or missing 'messages' field")

        # 获取用户消息用于模拟回复或日志记录
        user_messages = [msg for msg in payload["messages"] if msg.get("role") == "user"]
        user_message = user_messages[-1]["content"] if user_messages else "没有找到用户消息"
        
        # 根据API提供商调整模型参数
        params = payload.copy()  # 创建副本以避免修改原始请求
        
        model_name = params.get("model", settings.DEFAULT_MODEL)
        logger.info(f"Original requested model: {model_name}")
        
        # 根据配置的API提供商处理请求
        if API_PROVIDER == "MOCK":
            # 模拟模式
            if params.get("stream", False):
                return StreamingResponse(mock_stream_response(user_message), media_type="text/event-stream")
            else:
                mock_response = generate_mock_response(user_message)
                logger.info(f"Returning MOCK response: {mock_response}")
                return JSONResponse(content=mock_response)
        else:
            # 实际API调用处理
            is_stream = params.get("stream", False)
            
            # OpenRouter模型名称处理
            if API_PROVIDER == "OPENROUTER":
                # 确保模型名称正确 - OpenRouter要求完整的模型ID路径
                if not "/" in model_name:
                    # 默认使用.env中的DEFAULT_MODEL
                    params["model"] = settings.DEFAULT_MODEL
                    logger.info(f"Using DEFAULT_MODEL from settings: {params['model']}")
                    
                # 打印完整请求参数供调试
                logger.info(f"Complete OpenRouter request params: {json.dumps(params, ensure_ascii=False)}")
            
            # OpenAI模型名称处理
            elif API_PROVIDER == "OPENAI" and "model" in params:
                # 默认使用OpenAI标准模型，除非显式指定
                if not params["model"].startswith("gpt-"):
                    params["model"] = "gpt-3.5-turbo"
                    logger.info(f"Switched to OpenAI model: {params['model']}")
            
            # 发送请求到API
            if is_stream:
                params["stream"] = True
                return StreamingResponse(stream_chat_response(params), media_type="text/event-stream")
            else:
                # 对于非流式请求，确保stream参数不存在
                params.pop("stream", None)
                
                logger.info(f"Forwarding request to {API_PROVIDER} API with model: {params.get('model')}")
                
                # 使用OpenRouter API
                if API_PROVIDER == "OPENROUTER":
                    openrouter_api_key = settings.OPENROUTER_API_KEY
                    openrouter_api_url = settings.OPENROUTER_API_URL
                    
                    # 检查API密钥
                    api_key_prefix = openrouter_api_key[:10] if openrouter_api_key and len(openrouter_api_key) > 10 else "MISSING"
                    logger.info(f"Using OpenRouter API key prefix: {api_key_prefix}...")
                    
                    # 验证密钥是否有效
                    if not openrouter_api_key or len(openrouter_api_key) < 20:
                        logger.error("Invalid OpenRouter API key detected. Falling back to MOCK response.")
                        mock_response = generate_mock_response(f"OpenRouter API key configuration error")
                        return JSONResponse(content=mock_response)
                    
                    try:
                        # 直接使用httpx发送请求，明确设置所有头部
                        import httpx
                        
                        headers = {
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {openrouter_api_key}",
                            "HTTP-Referer": "https://mizu.technology",
                            "X-Title": settings.PROJECT_NAME,
                        }
                        
                        logger.info(f"Sending direct httpx request to OpenRouter API")
                        async with httpx.AsyncClient() as client:
                            response = await client.post(
                                f"{openrouter_api_url}chat/completions",
                                headers=headers,
                                json=params,
                                timeout=30.0
                            )
                            
                            if response.status_code == 200:
                                logger.info("Received successful response from OpenRouter API")
                                return response.json()
                            else:
                                logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                                # 失败时返回模拟响应
                                mock_response = generate_mock_response(f"OpenRouter API error: {response.status_code}")
                                return JSONResponse(content=mock_response)
                                
                    except Exception as e:
                        logger.error(f"Error in direct OpenRouter API call: {str(e)}", exc_info=True)
                        mock_response = generate_mock_response(f"API调用失败: {str(e)}")
                        return JSONResponse(content=mock_response)
                
                # 对于其他API提供商，使用llm客户端
                response = await llm.chat.completions.create(
                    **params, 
                    extra_headers={
                        "HTTP-Referer": "https://mizu.technology",
                        "X-Title": settings.PROJECT_NAME,
                    } if API_PROVIDER == "OPENROUTER" else {}
                )
                logger.info(f"Received response from {API_PROVIDER} API")
                return response

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}", exc_info=True)
        
        # 在任何情况下出错时，都可以降级为模拟响应
        logger.info(f"Using MOCK response after API error: {str(e)}")
        mock_response = generate_mock_response(f"API调用失败: {str(e)}")
        return JSONResponse(content=mock_response)

async def mock_stream_response(user_message: str):
    """模拟流式响应"""
    mock_id = f"mock-{uuid.uuid4()}"
    mock_created = int(datetime.now().timestamp())
    
    # 模拟开始响应
    yield f'data: {{"id":"{mock_id}","object":"chat.completion.chunk","created":{mock_created},"model":"mock-model","choices":[{{"index":0,"delta":{{"role":"assistant"}},"finish_reason":null}}]}}\n\n'
    
    # 模拟内容响应 - 分词发送
    response_text = f"这是一个模拟流式回复。您发送的消息是: '{user_message}'\n\n当前使用模拟模式。"
    chunks = [response_text[i:i+10] for i in range(0, len(response_text), 10)]
    
    for chunk in chunks:
        await asyncio.sleep(0.1)  # 模拟延迟
        yield f'data: {{"id":"{mock_id}","object":"chat.completion.chunk","created":{mock_created},"model":"mock-model","choices":[{{"index":0,"delta":{{"content":"{chunk}"}},"finish_reason":null}}]}}\n\n'
    
    # 模拟结束响应
    yield f'data: {{"id":"{mock_id}","object":"chat.completion.chunk","created":{mock_created},"model":"mock-model","choices":[{{"index":0,"delta":{{}},"finish_reason":"stop"}}]}}\n\n'
    yield "data: [DONE]\n\n"

async def stream_chat_response(params: Dict[str, Any]):
    """
    Generator function that streams the chat response in SSE format.
    Accepts a dictionary directly.
    """
    try:
        params["stream"] = True
        logger.info(f"Streaming request to {API_PROVIDER} API with params: {params}")
        
        # 特别处理OpenRouter API
        if API_PROVIDER == "OPENROUTER":
            openrouter_api_key = settings.OPENROUTER_API_KEY
            openrouter_api_url = settings.OPENROUTER_API_URL
            
            # 确保API密钥被正确传递
            if not openrouter_api_key or len(openrouter_api_key) < 10:
                logger.error("OpenRouter API key is missing or invalid")
                error_response = {"error": {"message": "API key configuration error", "type": "server_error"}}
                yield f"data: {json.dumps(error_response)}\n\n"
                yield "data: [DONE]\n\n"
                return
            
            # 使用标准客户端但添加extra_headers
            try:
                stream = await llm.chat.completions.create(
                    **params,
                    extra_headers={
                        "HTTP-Referer": "https://mizu.technology",
                        "X-Title": settings.PROJECT_NAME,
                    }
                )
                async for chunk in stream:
                    try:
                        # Ensure chunk has data before processing
                        if chunk.choices and chunk.choices[0].delta:
                            chunk_dict = json.loads(chunk.json())
                            yield f"data: {json.dumps(chunk_dict)}\n\n"
                    except json.JSONDecodeError:
                        logger.error(f"Failed to decode stream chunk: {chunk}")
                    except Exception as chunk_err:
                        logger.error(f"Error processing stream chunk: {chunk_err}", exc_info=True)
                
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                logger.error(f"Error in OpenRouter streaming: {str(e)}", exc_info=True)
                error_response = {"error": {"message": f"Streaming Error: {str(e)}", "type": "server_error"}}
                yield f"data: {json.dumps(error_response)}\n\n"
                yield "data: [DONE]\n\n"
                return
                
        # 使用标准客户端处理其他API提供商
        stream = await llm.chat.completions.create(**params)
        async for chunk in stream:
            try:
                # Ensure chunk has data before processing
                if chunk.choices and chunk.choices[0].delta:
                    chunk_dict = json.loads(chunk.json())
                    yield f"data: {json.dumps(chunk_dict)}\n\n"
            except json.JSONDecodeError:
                logger.error(f"Failed to decode stream chunk: {chunk}")
            except Exception as chunk_err:
                logger.error(f"Error processing stream chunk: {chunk_err}", exc_info=True)

        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}", exc_info=True)
        error_response = {"error": {"message": f"Streaming Error: {str(e)}", "type": "server_error"}}
        try:
            yield f"data: {json.dumps(error_response)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as yield_err:
            logger.error(f"Error yielding final error message: {yield_err}")
