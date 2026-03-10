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
    CORS_ORIGINS: List[str] = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "exp://127.0.0.1:8081",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @property
    def get_cors_origins(self) -> List[str]:
        if self.DEBUG:
            return self.CORS_ORIGINS + ["http://localhost:19006", "http://localhost:8082"]
        return self.CORS_ORIGINS

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

def get_settings():
    try:
        return Settings()
    except Exception as e:
        env = os.environ.get("ENV", "production")
        if env in ("development", "test"):
            # Only provide dev defaults in explicit dev/test environments
            if not os.environ.get("DATABASE_URL"):
                os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/archetype"
            if not os.environ.get("SECRET_KEY"):
                os.environ["SECRET_KEY"] = "dev-secret-key-change-me"
            return Settings()
        raise SystemExit(f"FATAL: Cannot start without proper configuration: {e}")

settings = get_settings()
