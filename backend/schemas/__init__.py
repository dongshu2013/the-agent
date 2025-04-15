"""
聊天相关的schema模型
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union

# 基础消息模型
class ChatMessage(BaseModel):
    """聊天消息模型"""
    role: str
    content: Optional[str] = None
    tool_calls: Optional[List[Any]] = None
    name: Optional[str] = None

# 函数调用模型
class FunctionCall(BaseModel):
    """函数调用模型"""
    name: str
    arguments: str

# 工具调用模型
class ToolCall(BaseModel):
    """工具调用模型"""
    id: str
    type: str = "function"
    function: FunctionCall

# 工具模型
class Tool(BaseModel):
    """工具定义模型"""
    type: str = "function"
    function: Dict[str, Any]

# 聊天选择模型
class ChatChoice(BaseModel):
    """聊天选择模型"""
    index: int
    message: ChatMessage
    finish_reason: str

# 聊天请求模型
class ChatRequest(BaseModel):
    """聊天请求模型"""
    model: Optional[str] = None
    messages: List[ChatMessage]
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    stream: Optional[bool] = False
    tools: Optional[List[Tool]] = None
    api_key: Optional[str] = None
    
# 聊天响应模型
class ChatResponse(BaseModel):
    """聊天响应模型"""
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatChoice]
    usage: Optional[Dict[str, int]] = None

class ErrorResponse(BaseModel):
    """错误响应模型"""
    detail: str 