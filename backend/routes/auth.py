"""
Auth routes — Apple Sign In, Google Sign In, Phone OTP, Guest Migration.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend import schemas, models
from backend.config import settings
from backend.database import get_db
from backend.auth import get_current_user
from backend.rate_limit import limiter
from backend.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/apple", response_model=schemas.AuthResponse)
async def apple_login(body: schemas.AppleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate via Apple Sign In."""
    try:
        claims = await auth_service.verify_apple_token(body.identity_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Apple token: {str(e)}",
        )

    user, token = auth_service.find_or_create_social_user(
        db, auth_provider="apple", provider_id=claims["sub"], email=claims.get("email")
    )
    return schemas.AuthResponse(
        token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/google", response_model=schemas.AuthResponse)
async def google_login(body: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate via Google Sign In."""
    try:
        claims = await auth_service.verify_google_token(body.id_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )

    user, token = auth_service.find_or_create_social_user(
        db, auth_provider="google", provider_id=claims["sub"], email=claims.get("email")
    )
    return schemas.AuthResponse(
        token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/phone/send-otp")
@limiter.limit("3/minute")
async def send_otp(request: Request, body: schemas.PhoneOtpRequest):
    """Send a 6-digit OTP to the given phone number."""
    code = auth_service.generate_otp(body.phone)
    # In production, send via SMS provider (Twilio, etc.)
    response = {"message": "OTP sent"}
    if settings.DEBUG:
        response["dev_code"] = code
    return response


@router.post("/phone/verify", response_model=schemas.AuthResponse)
@limiter.limit("5/minute")
async def verify_phone_otp(request: Request, body: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    """Verify phone OTP and authenticate."""
    if not auth_service.verify_otp(body.phone, body.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP",
        )

    user, token = auth_service.find_or_create_phone_user(db, body.phone)
    return schemas.AuthResponse(
        token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/migrate-guest", response_model=schemas.AuthResponse)
async def migrate_guest_account(
    body: schemas.MigrateGuestRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Migrate a guest account to a full authenticated account."""
    # Verify the caller owns the guest account
    if current_user.id != body.guest_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only migrate your own guest account",
        )

    provider_id = None
    phone = None
    email = None

    if body.auth_provider == "apple" and body.auth_token:
        try:
            claims = await auth_service.verify_apple_token(body.auth_token)
            provider_id = claims["sub"]
            email = claims.get("email")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Apple token: {e}")

    elif body.auth_provider == "google" and body.auth_token:
        try:
            claims = await auth_service.verify_google_token(body.auth_token)
            provider_id = claims["sub"]
            email = claims.get("email")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    elif body.auth_provider == "phone":
        if not body.phone or not body.code:
            raise HTTPException(status_code=400, detail="Phone and code required")
        if not auth_service.verify_otp(body.phone, body.code):
            raise HTTPException(status_code=401, detail="Invalid or expired OTP")
        phone = body.phone

    else:
        raise HTTPException(status_code=400, detail="Unsupported auth provider")

    try:
        user, token = auth_service.migrate_guest(
            db,
            guest_user_id=body.guest_user_id,
            auth_provider=body.auth_provider,
            provider_id=provider_id,
            phone=phone,
            email=email,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return schemas.AuthResponse(
        token=token,
        user=schemas.UserResponse.model_validate(user),
    )
