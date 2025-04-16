from openai import AsyncOpenAI

from .config import settings


class OpenRouterClient:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.OPENROUTER_API_URL,
            default_headers={
                "HTTP-Referer": "https://mizu.technology",
                "X-Title": settings.PROJECT_NAME,
            },
        )
        self.model = settings.DEFAULT_MODEL
