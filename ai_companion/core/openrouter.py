import httpx

from .config import settings


class OpenRouterClient:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.api_url = settings.OPENROUTER_API_URL
        self.model = settings.MODEL_NAME

    async def chat_completion(self, messages):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://your-site.com",
            "X-Title": settings.PROJECT_NAME,
        }

        payload = {"model": self.model, "messages": messages}

        async with httpx.AsyncClient() as client:
            response = await client.post(self.api_url, json=payload, headers=headers)
            return response.json()
