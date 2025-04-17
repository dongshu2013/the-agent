from pydantic_settings import BaseSettings
from typing import List, Literal
import os

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "Edge Agent"
    VERSION: str = "0.1.0"
    
    # LLM API Configuration
    LLM_API_KEY: str = ""
    LLM_API_URL: str = ""
    
    # Default Model
    DEFAULT_MODEL: str = "google/gemini-2.5-pro-exp-03-25:free"

    # Database Configuration
    DATABASE_URL: str = ""

    # Server Configuration
    PORT: int = 8000
    DEBUG: bool = False

    PROJECT_DESCRIPTION: str = ""

    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "https://the-agent-production.up.railway.app",
        "http://localhost:8000",
        "http://localhost:3000",
        "*"  # 允许所有源 - 仅用于开发环境
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings() 