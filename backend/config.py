import os
from typing import Dict, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenAI配置
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    openai_base_url: Optional[str] = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
    
    # DeepSeek配置
    deepseek_api_key: Optional[str] = os.getenv("DEEPSEEK_API_KEY")
    deepseek_base_url: Optional[str] = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")
    
    # 默认模型配置
    default_model: str = os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo")
    
    # 模型映射 (可选, 如果llm_client不直接使用)
    model_mapping: Optional[Dict[str, Dict[str, str]]] = None
        # example: 
        # {
        #     "gpt-4": {"provider": "openai", "model_id": "gpt-4"},
        #     "gpt-3.5-turbo": {"provider": "openai", "model_id": "gpt-3.5-turbo"},
        #     "deepseek-chat": {"provider": "deepseek", "model_id": "deepseek-chat"}
        # }
    
    # CORS 配置
    cors_origins: list = ["*"]
    
    # 应用配置
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings() 