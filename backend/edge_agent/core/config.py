from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "AI Companion"
    VERSION: str = "0.1.0"
    
    # OpenRouter Configuration
    OPENROUTER_API_KEY: str
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/"
    
    # Default Model
    DEFAULT_MODEL: str = "google/gemini-2.5-pro-exp-03-25:free"

    # Database Configuration
    DATABASE_URL: str = ""
    
    # Server Configuration
    PORT: int = 8000
    DEBUG: bool = False

    # CORS Settings
    CORS_ORIGINS: List[str] = ["https://the-agent-production.up.railway.app"]

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert comma-separated CORS_ORIGINS string to list if necessary
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings() 