from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union

class Message(BaseModel):
    role: str  # system/user/assistant/tool
    content: Optional[str] = None
    name: Optional[str] = None
    function_call: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    model: Optional[str] = "gpt-4"
    stream: Optional[bool] = False
    max_tokens: Optional[int] = None
    
class ChatResponse(BaseModel):
    role: str
    content: str
    
class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None 