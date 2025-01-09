from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Companion"
    VERSION: str = "0.1.0"
    OPENROUTER_API_KEY: str
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/"
    MODEL_NAME: str = "deepseek/deepseek-chat"
    DATABASE_URL: str
    FISH_AUDIO_API_KEY: str
    MAX_MESSAGE_LENGTH: int = 2000
    MIN_MESSAGE_LENGTH: int = 1
    MINIMUM_MESSAGES_TO_PROCESS: int = 10

    # Chat context settings
    MAX_CONTEXT_MESSAGES: int = 50  # Number of previous messages to include as context

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
