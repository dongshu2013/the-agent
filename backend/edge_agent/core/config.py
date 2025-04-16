from pydantic_settings import BaseSettings
from typing import List, Literal
import os

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "Edge Agent"
    VERSION: str = "0.1.0"
    
    # OpenRouter Configuration
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/"
    
    # OpenAI Configuration (Optional)
    OPENAI_API_KEY: str = ""
    
    # Default Model
    DEFAULT_MODEL: str = "google/gemini-2.5-pro-exp-03-25:free"

    # Database Configuration
    DATABASE_URL: str = ""
    
    # Server Configuration
    PORT: int = 8000
    DEBUG: bool = False

    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "https://the-agent-production.up.railway.app",
        "http://localhost:8000",
        "http://localhost:3000",
        "*"  # 允许所有源 - 仅用于开发环境
    ]
    
    # API Provider Selection
    API_PROVIDER: Literal["OPENAI", "OPENROUTER", "MOCK"] = "OPENROUTER"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert comma-separated CORS_ORIGINS string to list if necessary
        if isinstance(self.CORS_ORIGINS, str):
            # 尝试解析JSON格式字符串
            if self.CORS_ORIGINS.startswith("[") and self.CORS_ORIGINS.endswith("]"):
                try:
                    import json
                    self.CORS_ORIGINS = json.loads(self.CORS_ORIGINS)
                except json.JSONDecodeError:
                    # 如果JSON解析失败，回退到逗号分隔格式
                    self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
            else:
                # 处理逗号分隔的情况
                self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
                
        # 确保数据库URL是有效的，如果为空则设置为默认值
        if not self.DATABASE_URL:
            self.DATABASE_URL = "sqlite:///./test.db"
            
        # 验证API密钥
        if self.API_PROVIDER == "OPENROUTER" and (not self.OPENROUTER_API_KEY or len(self.OPENROUTER_API_KEY) < 10):
            import logging
            logging.warning("OpenRouter API key is invalid or missing! Some features may not work correctly.")

settings = Settings() 