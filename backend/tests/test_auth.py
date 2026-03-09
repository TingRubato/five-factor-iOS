"""Tests for auth service — OTP flow, guest migration, duplicate prevention."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import get_db
from backend.models import Base, User
from backend.services import auth_service

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


def test_phone_otp_flow(client):
    """Send OTP → verify correct code → get JWT."""
    phone = "+15551234567"

    # Send OTP
    resp = client.post("/api/auth/phone/send-otp", json={"phone": phone})
    assert resp.status_code == 200
    code = resp.json()["dev_code"]

    # Verify with correct code
    resp = client.post("/api/auth/phone/verify", json={"phone": phone, "code": code})
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["user"]["id"]


def test_phone_otp_wrong_code(client):
    """Wrong OTP code should fail."""
    phone = "+15559999999"

    # Send OTP
    resp = client.post("/api/auth/phone/send-otp", json={"phone": phone})
    assert resp.status_code == 200

    # Verify with wrong code
    resp = client.post("/api/auth/phone/verify", json={"phone": phone, "code": "000000"})
    assert resp.status_code == 401


def test_duplicate_phone_returns_existing_user(client):
    """Login with phone → login again → same user ID."""
    phone = "+15558887777"

    # First login
    resp = client.post("/api/auth/phone/send-otp", json={"phone": phone})
    code = resp.json()["dev_code"]
    resp = client.post("/api/auth/phone/verify", json={"phone": phone, "code": code})
    user_id_1 = resp.json()["user"]["id"]

    # Second login (need new OTP)
    resp = client.post("/api/auth/phone/send-otp", json={"phone": phone})
    code = resp.json()["dev_code"]
    resp = client.post("/api/auth/phone/verify", json={"phone": phone, "code": code})
    user_id_2 = resp.json()["user"]["id"]

    assert user_id_1 == user_id_2


def test_guest_migration_preserves_data(db_session):
    """Create guest → migrate → verify user data preserved."""
    import uuid

    # Create a guest user
    guest = User(
        id=str(uuid.uuid4()),
        username="guest_test123",
        is_guest=True,
    )
    db_session.add(guest)
    db_session.commit()

    # Migrate to phone user
    auth_service.generate_otp("+15551112222")
    user, token = auth_service.migrate_guest(
        db_session,
        guest_user_id=guest.id,
        auth_provider="phone",
        phone="+15551112222",
    )

    assert user.id == guest.id  # Same user
    assert user.is_guest is False
    assert user.auth_provider == "phone"
    assert user.phone_number == "+15551112222"
    assert token  # JWT generated


def test_guest_migration_fails_for_non_guest(db_session):
    """Cannot migrate a user that's already authenticated."""
    import uuid

    user = User(
        id=str(uuid.uuid4()),
        username="real_user",
        is_guest=False,
        auth_provider="phone",
        phone_number="+15553334444",
    )
    db_session.add(user)
    db_session.commit()

    with pytest.raises(ValueError, match="already authenticated"):
        auth_service.migrate_guest(
            db_session,
            guest_user_id=user.id,
            auth_provider="phone",
            phone="+15559998888",
        )
