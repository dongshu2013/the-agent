"""
chat related schema models
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union

# 基础消息模型
class ChatMessage(BaseModel):
    """chat message model"""
    role: str
    content: Optional[str] = None
    tool_calls: Optional[List[Any]] = None
    name: Optional[str] = None

# 函数调用模型
class FunctionCall(BaseModel):
    """function call model"""
    name: str
    arguments: str

# 工具调用模型
class ToolCall(BaseModel):
    """tool call model"""
    id: str
    type: str = "function"
    function: FunctionCall

# 工具模型
class Tool(BaseModel):
    """tool definition model"""
    type: str = "function"
    function: Dict[str, Any]

# 聊天选择模型
class ChatChoice(BaseModel):
    """chat choice model"""
    index: int
    message: ChatMessage
    finish_reason: str

# 聊天请求模型
class ChatRequest(BaseModel):
    """chat request model"""
    model: Optional[str] = None
    messages: List[ChatMessage]
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    stream: Optional[bool] = False
    tools: Optional[List[Tool]] = None
    api_key: Optional[str] = None
    
# 聊天响应模型
class ChatResponse(BaseModel):
    """chat response model"""
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatChoice]
    usage: Optional[Dict[str, int]] = None

class ErrorResponse(BaseModel):
    """error response model"""
    detail: str 