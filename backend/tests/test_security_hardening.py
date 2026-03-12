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


def test_arena_vote_side_rejects_invalid():
    """ArenaVoteRequest.side must be 1 or 2."""
    from pydantic import ValidationError
    from backend.schemas import ArenaVoteRequest
    with pytest.raises(ValidationError):
        ArenaVoteRequest(side=0)
    with pytest.raises(ValidationError):
        ArenaVoteRequest(side=3)
    with pytest.raises(ValidationError):
        ArenaVoteRequest(side=-1)
    ArenaVoteRequest(side=1)
    ArenaVoteRequest(side=2)


def test_arena_post_force_side_rejects_invalid():
    """ArenaPostRequest.force_side must be 1, 2, or None."""
    from pydantic import ValidationError
    from backend.schemas import ArenaPostRequest
    with pytest.raises(ValidationError):
        ArenaPostRequest(body="test", force_side=0)
    with pytest.raises(ValidationError):
        ArenaPostRequest(body="test", force_side=3)
    ArenaPostRequest(body="test", force_side=None)
    ArenaPostRequest(body="test", force_side=1)
    ArenaPostRequest(body="test", force_side=2)


def test_cors_no_wildcard_methods():
    """CORS config must not use wildcard methods."""
    import backend.main as main_mod
    source = inspect.getsource(main_mod)
    assert 'allow_methods=["*"]' not in source


def test_auth_errors_do_not_leak_exceptions():
    """Auth route source must not contain f-string exception detail."""
    from backend.routes import auth as auth_mod
    source = inspect.getsource(auth_mod)
    assert "Invalid Apple token: {str(e)}" not in source
    assert "Invalid Google token: {str(e)}" not in source
    assert "Invalid Apple token: {e}" not in source
    assert "Invalid Google token: {e}" not in source


def test_otp_response_no_dev_code():
    """OTP send endpoint must not return dev_code."""
    from backend.routes import auth as auth_mod
    source = inspect.getsource(auth_mod)
    assert 'dev_code' not in source
