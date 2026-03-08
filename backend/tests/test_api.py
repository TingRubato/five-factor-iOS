import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import get_db
from backend.models import Base
from backend.auth import create_access_token
import uuid

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_create_user():
    response = client.post("/users/", json={"username": "testuser"})
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.json()["username"] == "testuser"

def test_login_and_access_protected_endpoint():
    # 1. Create user
    res = client.post("/users/", json={"username": "alice"})
    user_id = res.json()["id"]

    # 2. Login
    login_res = client.post("/token", data={"username": "alice", "password": "password"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test submitting profile with token
    answers = {str(i): 3 for i in range(1, 16)}
    submit_res = client.post(
        f"/test/submit/{user_id}",
        json={"answers": answers, "version": "ipip-15-v1"},
        headers=headers
    )
    assert submit_res.status_code == 200
    assert submit_res.json()["primary_archetype"] is not None

def test_idor_protection():
    # Create two users
    res1 = client.post("/users/", json={"username": "alice"})
    user_id_1 = res1.json()["id"]
    
    res2 = client.post("/users/", json={"username": "bob"})
    user_id_2 = res2.json()["id"]

    # Login as bob
    login_res = client.post("/token", data={"username": "bob", "password": "x"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Try to submit for alice
    answers = {str(i): 3 for i in range(1, 16)}
    submit_res = client.post(
        f"/test/submit/{user_id_1}",
        json={"answers": answers, "version": "ipip-15-v1"},
        headers=headers
    )
    assert submit_res.status_code == 403  # Should be forbidden
