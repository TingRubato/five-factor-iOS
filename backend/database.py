import logging
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

_FALLBACK_URL = "postgresql://postgres:postgres@localhost:5432/archetype"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.warning(
        "DATABASE_URL environment variable is not set. "
        "Falling back to hardcoded local development URL. "
        "Do NOT use this in production."
    )
    DATABASE_URL = _FALLBACK_URL

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
