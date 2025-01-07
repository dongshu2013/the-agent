from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai_companion.core.openrouter import OpenRouterClient

router = APIRouter()
openrouter_client = OpenRouterClient()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = await openrouter_client.chat_completion(request.messages)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
