"""Tests for JWT token lifecycle — creation, expiry, tampering."""
import os

os.environ.setdefault("ENV", "test")
os.environ.setdefault("SECRET_KEY", "test-key-that-is-at-least-32-chars-long")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_jwt.db")

from datetime import timedelta

import jwt as pyjwt
import pytest

from backend.auth import create_access_token
from backend.config import settings


def test_token_contains_sub_and_exp():
    token = create_access_token(data={"sub": "user123"})
    payload = pyjwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == "user123"
    assert "exp" in payload


def test_expired_token_raises():
    token = create_access_token(data={"sub": "user123"}, expires_delta=timedelta(seconds=-1))
    with pytest.raises(pyjwt.ExpiredSignatureError):
        pyjwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def test_tampered_token_raises():
    token = create_access_token(data={"sub": "user123"})
    tampered = token[:-5] + "XXXXX"
    with pytest.raises(pyjwt.exceptions.DecodeError):
        pyjwt.decode(tampered, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
