"""
Auth service — social login verification and guest migration.
Supports Apple Sign In, Google Sign In, and Phone OTP.
"""
import hmac
import uuid
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
import jwt as pyjwt
from sqlalchemy.orm import Session

from backend import models
from backend.auth import create_access_token, get_password_hash

# ── Apple Sign In ─────────────────────────────────────────────

APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys"


async def verify_apple_token(identity_token: str) -> dict:
    """Verify Apple identity token and return claims (sub, email)."""
    # Decode header to get kid
    header = pyjwt.get_unverified_header(identity_token)
    kid = header.get("kid")

    # Fetch Apple's public keys
    async with httpx.AsyncClient() as client:
        resp = await client.get(APPLE_JWKS_URL)
        resp.raise_for_status()
        keys = resp.json()["keys"]

    # Find the matching key
    matching_key = next((k for k in keys if k["kid"] == kid), None)
    if not matching_key:
        raise ValueError("Apple public key not found for kid")

    from jwt.algorithms import RSAAlgorithm
    public_key = RSAAlgorithm.from_jwk(matching_key)

    claims = pyjwt.decode(
        identity_token,
        public_key,
        algorithms=["RS256"],
        audience="com.archetype.app",  # Your app's bundle ID
        options={"verify_exp": True},
    )
    return {"sub": claims["sub"], "email": claims.get("email")}


# ── Google Sign In ────────────────────────────────────────────

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


async def verify_google_token(id_token: str) -> dict:
    """Verify Google ID token and return claims (sub, email)."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GOOGLE_TOKENINFO_URL, params={"id_token": id_token}
        )
        resp.raise_for_status()
        data = resp.json()

    if "error_description" in data:
        raise ValueError(f"Invalid Google token: {data['error_description']}")

    return {"sub": data["sub"], "email": data.get("email")}


# ── Phone OTP ─────────────────────────────────────────────────

# In-memory OTP store (replace with Redis in production)
_otp_store: dict[str, tuple[str, datetime]] = {}
OTP_TTL_MINUTES = 5


def _cleanup_expired_otps() -> None:
    """Remove expired OTP entries to prevent memory growth."""
    now = datetime.now(timezone.utc)
    expired = [phone for phone, (_, exp) in _otp_store.items() if now > exp]
    for phone in expired:
        del _otp_store[phone]


def generate_otp(phone: str) -> str:
    """Generate and store a 6-digit OTP for the given phone number."""
    _cleanup_expired_otps()
    code = "".join(secrets.choice(string.digits) for _ in range(6))
    _otp_store[phone] = (code, datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES))
    # In production: send via SMS provider (Twilio, etc.)
    return code


def verify_otp(phone: str, code: str) -> bool:
    """Verify a phone OTP. Returns True if valid."""
    stored = _otp_store.get(phone)
    if not stored:
        return False
    stored_code, expires_at = stored
    if datetime.now(timezone.utc) > expires_at:
        del _otp_store[phone]
        return False
    if not hmac.compare_digest(stored_code, code):
        return False
    del _otp_store[phone]
    return True


# ── User Management ───────────────────────────────────────────

def find_or_create_social_user(
    db: Session,
    auth_provider: str,
    provider_id: str,
    email: Optional[str] = None,
) -> tuple[models.User, str]:
    """Find existing user by provider ID or create new one. Returns (user, token)."""
    user = (
        db.query(models.User)
        .filter(models.User.auth_provider_id == provider_id)
        .first()
    )

    if not user:
        username = f"{auth_provider}_{uuid.uuid4().hex[:8]}"
        user = models.User(
            id=str(uuid.uuid4()),
            username=username,
            email=email,
            is_guest=False,
            auth_provider=auth_provider,
            auth_provider_id=provider_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    return user, token


def find_or_create_phone_user(
    db: Session, phone: str
) -> tuple[models.User, str]:
    """Find existing user by phone or create new one. Returns (user, token)."""
    user = (
        db.query(models.User)
        .filter(models.User.phone_number == phone)
        .first()
    )

    if not user:
        username = f"phone_{uuid.uuid4().hex[:8]}"
        user = models.User(
            id=str(uuid.uuid4()),
            username=username,
            is_guest=False,
            auth_provider="phone",
            phone_number=phone,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    return user, token


def migrate_guest(
    db: Session,
    guest_user_id: str,
    auth_provider: str,
    provider_id: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
) -> tuple[models.User, str]:
    """
    Migrate a guest account to a full account.
    Preserves all existing data (scores, posts, etc.).
    """
    user = db.query(models.User).filter(models.User.id == guest_user_id).first()
    if not user:
        raise ValueError("Guest user not found")
    if not user.is_guest:
        raise ValueError("User is already authenticated")

    # Check for duplicate provider
    if provider_id:
        existing = (
            db.query(models.User)
            .filter(models.User.auth_provider_id == provider_id)
            .first()
        )
        if existing:
            raise ValueError("This account is already linked to another user")

    if phone:
        existing = (
            db.query(models.User)
            .filter(models.User.phone_number == phone)
            .first()
        )
        if existing:
            raise ValueError("This phone number is already linked to another user")

    user.is_guest = False
    user.auth_provider = auth_provider
    user.auth_provider_id = provider_id
    user.phone_number = phone
    if email:
        user.email = email

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    return user, token
