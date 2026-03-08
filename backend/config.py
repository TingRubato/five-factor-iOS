import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Archetype API"
    DEBUG: bool = False
    
    # Database
    # Use a real default for dev if needed, but in prod this MUST be set
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:8081", "exp://127.0.0.1:8081", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

def get_settings():
    # If DATABASE_URL is not provided, we might be in local dev without .env
    # We can provide a default for dev, but let's be strict if it's missing.
    try:
        return Settings()
    except Exception as e:
        print(f"Configuration Error: {e}")
        # Fallback for very basic local dev if not even a .env exists
        if not os.environ.get("DATABASE_URL"):
            os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/archetype"
        if not os.environ.get("SECRET_KEY"):
            os.environ["SECRET_KEY"] = "dev-secret-key-change-me"
        return Settings()

settings = get_settings()
