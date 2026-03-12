"""Tests for security hardening: constant-time OTP, SECRET_KEY validation."""
import hmac
import inspect
import os

os.environ.setdefault("ENV", "test")
os.environ.setdefault("SECRET_KEY", "test-key-that-is-at-least-32-chars-long")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_security.db")

import pytest


def test_otp_uses_constant_time_comparison():
    """verify_otp must use hmac.compare_digest, not == or !=."""
    from backend.services.auth_service import verify_otp
    source = inspect.getsource(verify_otp)
    assert "compare_digest" in source, "verify_otp must use hmac.compare_digest"
    assert "stored_code != code" not in source, "Must not use != for OTP comparison"


def test_secret_key_rejects_known_defaults():
    """SECRET_KEY must not be a known insecure default."""
    from backend.config import _validate_secret_key
    with pytest.raises(SystemExit):
        _validate_secret_key("dev-secret-key-change-me")
    with pytest.raises(SystemExit):
        _validate_secret_key("changeme")
    with pytest.raises(SystemExit):
        _validate_secret_key("secret")


def test_secret_key_rejects_short_keys():
    """SECRET_KEY must be at least 32 characters."""
    from backend.config import _validate_secret_key
    with pytest.raises(SystemExit):
        _validate_secret_key("tooshort")


def test_secret_key_accepts_valid_key():
    """A proper 32+ char key should pass validation."""
    from backend.config import _validate_secret_key
    _validate_secret_key("a" * 32)  # should not raise
