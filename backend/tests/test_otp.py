"""OTP security tests — expiry, replay, store isolation."""
import pytest
from datetime import datetime, timedelta, timezone

import backend.services.auth_service as _auth_svc


@pytest.fixture(autouse=True)
def reset_otp_store():
    _auth_svc._otp_store.clear()
    yield
    _auth_svc._otp_store.clear()


def test_generate_otp_returns_6_digits():
    code = _auth_svc.generate_otp("+15551234567")
    assert len(code) == 6
    assert code.isdigit()


def test_verify_otp_valid():
    phone = "+15551234567"
    code = _auth_svc.generate_otp(phone)
    assert _auth_svc.verify_otp(phone, code) is True


def test_expired_otp_is_rejected():
    phone = "+15557770001"
    _auth_svc.generate_otp(phone)
    code, _ = _auth_svc._otp_store[phone]
    # Backdate the expiry
    _auth_svc._otp_store[phone] = (code, datetime.now(timezone.utc) - timedelta(minutes=1))
    assert _auth_svc.verify_otp(phone, code) is False


def test_otp_cannot_be_replayed():
    phone = "+15557770002"
    code = _auth_svc.generate_otp(phone)
    assert _auth_svc.verify_otp(phone, code) is True
    # Second use should fail
    assert _auth_svc.verify_otp(phone, code) is False


def test_wrong_code_rejected():
    phone = "+15557770003"
    _auth_svc.generate_otp(phone)
    assert _auth_svc.verify_otp(phone, "000000") is False


def test_unknown_phone_rejected():
    assert _auth_svc.verify_otp("+10000000000", "123456") is False


def test_cleanup_removes_expired():
    phone1 = "+15551111111"
    phone2 = "+15552222222"
    _auth_svc.generate_otp(phone1)
    _auth_svc.generate_otp(phone2)
    # Expire phone1
    code1, _ = _auth_svc._otp_store[phone1]
    _auth_svc._otp_store[phone1] = (code1, datetime.now(timezone.utc) - timedelta(minutes=10))
    # Generate a new OTP — triggers cleanup
    _auth_svc.generate_otp("+15553333333")
    assert phone1 not in _auth_svc._otp_store
    assert phone2 in _auth_svc._otp_store
