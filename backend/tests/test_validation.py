import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, User, PersonalityProfile

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_validation_final.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_schema_validation_unit():
    from backend.schemas import SubmitTestRequest
    from pydantic import ValidationError

    # Valid
    SubmitTestRequest(answers={"1": 3, "2": 5}, version="v1")
    
    # Invalid score
    with pytest.raises(ValidationError):
        SubmitTestRequest(answers={"1": 6}, version="v1")
    
    # Invalid QID
    with pytest.raises(ValidationError):
        SubmitTestRequest(answers={"abc": 3}, version="v1")

def test_user_conflict_409(client):
    # First creation
    res1 = client.post("/api/users/", json={"username": "conflict_user", "email": "c@x.com", "password": "password123"})
    assert res1.status_code == 201
    
    # Duplicate username
    res2 = client.post("/api/users/", json={"username": "conflict_user", "email": "other@x.com", "password": "password123"})
    assert res2.status_code == 409
    assert "Username already registered" in res2.json()["detail"]

    # Duplicate email
    res3 = client.post("/api/users/", json={"username": "other", "email": "c@x.com", "password": "password123"})
    assert res3.status_code == 409
    assert "Email already registered" in res3.json()["detail"]

def test_profile_privacy_masking(client):
    # User A (Private)
    res_a = client.post("/api/users/", json={"username": "user_a", "email": "a@p.com", "password": "password123"})
    user_a_id = res_a.json()["id"]
    
    login_a = client.post("/token", data={"username": "user_a", "password": "password123"}).json()
    token_a = login_a["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User A completes test (mocked) to create a profile
    client.post(f"/api/test/submit/{user_a_id}", 
                json={"answers": {"1": 3, "2": 3}, "version": "ipip-15-v1"},
                headers=headers_a)
    
    # Set User A to private
    client.patch(f"/api/profile/{user_a_id}", json={"is_public": False}, headers=headers_a)

    # User B
    res_b = client.post("/api/users/", json={"username": "user_b", "email": "b@p.com", "password": "password123"})
    user_b_id = res_b.json()["id"]
    login_b = client.post("/token", data={"username": "user_b", "password": "password123"}).json()
    token_b = login_b["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B tries to view User A's profile
    res_view = client.get(f"/api/profile/{user_a_id}", headers=headers_b)
    assert res_view.status_code == 200
    data = res_view.json()
    assert data["is_public"] is False
    assert data["scores"] is None
    assert data["primary_archetype"] is None
    
    # User A views their own profile
    res_own = client.get(f"/api/profile/{user_a_id}", headers=headers_a)
    assert res_own.status_code == 200
    data_own = res_own.json()
    assert data_own["scores"] is not None
    assert data_own["primary_archetype"] is not None

def test_deletion_endpoints(client):
    # User C
    res_c = client.post("/api/users/", json={"username": "user_c", "email": "c@delete.com", "password": "password123"})
    user_c_id = res_c.json()["id"]
    token_c = client.post("/token", data={"username": "user_c", "password": "password123"}).json()["access_token"]
    headers_c = {"Authorization": f"Bearer {token_c}"}

    # Create profile
    client.post(f"/api/test/submit/{user_c_id}", 
                json={"answers": {"1": 3}, "version": "ipip-15-v1"},
                headers=headers_c)
    
    # Clear scores
    res_clear = client.delete(f"/api/profile/{user_c_id}/scores", headers=headers_c)
    assert res_clear.status_code == 204
    
    # Verify scores are cleared
    res_profile = client.get(f"/api/profile/{user_c_id}", headers=headers_c)
    assert res_profile.json()["scores"] is None
    
    # Delete account
    res_delete = client.delete(f"/users/{user_c_id}", headers=headers_c)
    assert res_delete.status_code == 204
    
    # Verify user is gone
    res_login = client.post("/token", data={"username": "user_c", "password": "password123"})
    assert res_login.status_code == 401
