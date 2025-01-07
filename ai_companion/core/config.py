from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Companion"
    VERSION: str = "0.1.0"
    OPENROUTER_API_KEY: str
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    MODEL_NAME: str = "nousresearch/hermes-3-llama-3.1-70b"
    fish_audio_api_key: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
