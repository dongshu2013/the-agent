from openai import AsyncOpenAI

from .config import settings


class OpenRouterClient:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.OPENROUTER_API_URL,
            default_headers={
                "HTTP-Referer": "https://your-site.com",
                "X-Title": settings.PROJECT_NAME,
            },
        )
        self.model = settings.MODEL_NAME

    async def chat_completion(self, messages):
        response = await self.client.chat.completions.create(
            model=self.model, messages=messages
        )
        return response.model_dump()