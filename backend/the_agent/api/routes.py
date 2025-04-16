from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from typing import Dict, Any, List, Optional, Union
import json
import httpx
import os
from pydantic import BaseModel
from ..schemas import ChatRequest, ChatResponse, ErrorResponse
from ..services.llm_client import chat_with_llm

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat_route")

# 创建路由
router = APIRouter(tags=["chat"])

# 定义工具请求和响应模型
class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    conversation_id: str
    messages: List[Dict[str, Any]]
    api_key: Optional[str] = None
    model: Optional[str] = "google/gemini-2.5-pro-exp-03-25:free"

# 可用工具定义
AVAILABLE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "getWeather",
            "description": "Get the current weather for a specific time and location",
            "parameters": {
                "type": "object",
                "properties": {
                    "time": {
                        "type": "string",
                        "description": "The time to get weather for, e.g. 'now', 'today', 'tomorrow'",
                    }
                },
                "required": ["time"]
            }
        }
    }
]

# 模拟天气数据
WEATHER_DATA = {
    "now": {"temperature": 24, "condition": "Sunny", "humidity": 45, "wind": "5 km/h"},
    "today": {"temperature": 24, "condition": "Sunny", "humidity": 45, "wind": "5 km/h"},
    "tomorrow": {"temperature": 22, "condition": "Partly Cloudy", "humidity": 50, "wind": "10 km/h"},
}

@router.post("/completion", response_model=ChatResponse)
async def chat_completion(payload: ChatRequest):
    """
    handle chat completion request, call LLM and return response
    
    - **payload**: request body containing messages, model, and other configurations
    
    return LLM's response message
    """
    try:
        logger.info(f"Received chat request for model: {payload.model}")
        
        # if streaming response is requested, return StreamingResponse
        if payload.stream:
            return HTTPException(status_code=501, detail="Streaming is not implemented yet")
        
        # call LLM service to get response
        response = await chat_with_llm(payload)
        logger.info(f"Got response from LLM: {response}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/with-tools")
async def chat_with_tools(payload: ChatRequest):
    """
    handle chat request with tool calls
    
    - **payload**: request body containing messages and other configurations
    
    return LLM's response, if tool call is needed, return tool call request
    """
    try:
        logger.info(f"Received chat with tools request for model: {payload.model}")
        
        # build request with tools
        request_with_tools = payload.dict()
        request_with_tools["tools"] = AVAILABLE_TOOLS
        request_with_tools["tool_choice"] = "auto"
        
        # call LLM service
        response = await chat_with_llm(ChatRequest(**request_with_tools))
        
        # parse response
        if not response or not response.choices or not response.choices[0].message:
            raise HTTPException(status_code=500, detail="Invalid response from LLM")
        
        message = response.choices[0].message
        message_content = message.content if message.content else ""
        
        # check tool calls
        tool_calls = getattr(message, "tool_calls", None)
        if tool_calls and len(tool_calls) > 0:
            # return tool call request
            tool_call = tool_calls[0]
            
            return {
                "type": "tool_call",
                "tool_call": {
                    "name": tool_call.function.name,
                    "arguments": json.loads(tool_call.function.arguments)
                },
                "message_content": message_content,
                "conversation_context": [m.dict() for m in payload.messages],
                "model": payload.model
            }
        else:
            # return direct response
            return {
                "type": "response",
                "content": message_content
            }
        
    except Exception as e:
        logger.error(f"Error in chat with tools: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/tool-result")
async def process_tool_result(request: ToolCallRequest):
    """
    handle tool execution result and generate final response
    
    - **request**: request body containing tool name, parameters, and context
    
    return LLM's final response based on tool result
    """
    try:
        logger.info(f"Received tool result for: {request.tool_name}")
        
        # prepare message array, containing tool result
        messages = request.messages.copy()
        
        # add function result message
        messages.append({
            "role": "function",
            "name": request.tool_name,
            "content": json.dumps(request.arguments)
        })
        
        # call LLM to get final response
        response = await chat_with_llm(ChatRequest(
            messages=messages,
            model=request.model,
            temperature=0.7,
            max_tokens=1000
        ))
        
        if not response or not response.choices or not response.choices[0].message:
            raise HTTPException(status_code=500, detail="Invalid response from LLM")
        
        # get response content
        message_content = response.choices[0].message.content if response.choices[0].message.content else ""
        
        # return final response
        return {
            "type": "response",
            "content": message_content
        }
        
    except Exception as e:
        logger.error(f"Error processing tool result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing tool result: {str(e)}")

@router.post("/execute-tool")
async def execute_tool(request: ToolCallRequest):
    """
    execute tool call and return result
    
    - **request**: request body containing tool name and parameters
    
    return tool execution result
    """
    try:
        logger.info(f"Executing tool: {request.tool_name}")
        
        if request.tool_name == "getWeather":
            time_arg = request.arguments.get("time", "now")
            result = WEATHER_DATA.get(time_arg, WEATHER_DATA["now"])
            
            return {
                "success": True,
                "result": {
                    "time": time_arg,
                    **result
                }
            }
        else:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": f"Unknown tool: {request.tool_name}"}
            )
            
    except Exception as e:
        logger.error(f"Error executing tool: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Error executing tool: {str(e)}"}
        ) 