from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class FunctionCall(BaseModel):
    """函数调用的结构"""
    name: str
    arguments: str

class Message(BaseModel):
    """聊天消息结构"""
    role: str  # system/user/assistant/function
    content: Optional[str] = None
    name: Optional[str] = None
    function_call: Optional[FunctionCall] = None

class Function(BaseModel):
    """函数定义"""
    name: str
    description: str
    parameters: Dict[str, Any]

class ChatRequest(BaseModel):
    """聊天请求模型"""
    messages: List[Message]
    model: Optional[str] = "gpt-3.5-turbo"
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False
    functions: Optional[List[Function]] = None
    function_call: Optional[Union[str, Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    """聊天响应模型"""
    message: Message
    model: str
    usage: Optional[Dict[str, int]] = None

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None 