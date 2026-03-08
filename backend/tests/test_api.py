import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app, _QUESTION_BANK
from backend.database import get_db
from backend.models import Base, User, PersonalityProfile, Post
import uuid

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_e2e.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
    Base.metadata.drop_all(bind=engine)

def test_full_user_journey_e2e():
    """
    Comprehensive E2E smoke test covering the core business flow:
    1. Registration
    2. Login
    3. Quiz Retrieval
    4. Test Submission
    5. Profile Verification
    6. Community Engagement (Post & Feed)
    """
    
    # 1. Registration
    username = "journey_user"
    email = "journey@example.com"
    password = "securepassword123"
    
    reg_res = client.post("/users/", json={
        "username": username,
        "email": email,
        "password": password
    })
    assert reg_res.status_code == 201
    user_id = reg_res.json()["id"]
    
    # 2. Login
    login_res = client.post("/token", data={
        "username": username,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Quiz Retrieval
    quiz_version = "ipip-15-v1"
    quiz_res = client.get(f"/quiz/version/{quiz_version}")
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()
    assert quiz_data["version"] == quiz_version
    assert len(quiz_data["questions"]) == 15
    
    # 4. Test Submission
    # Create mock answers (all 3 = neutral)
    answers = {str(q["id"]): 3 for q in quiz_data["questions"]}
    submit_res = client.post(
        f"/test/submit/{user_id}",
        json={"answers": answers, "version": quiz_version},
        headers=auth_headers
    )
    assert submit_res.status_code == 200
    profile_data = submit_res.json()
    assert profile_data["primary_archetype"] == "Balanced Breaker"
    assert profile_data["quiz_version"] == quiz_version
    assert profile_data["scoring_version"] == "v1"
    
    # 5. Profile Verification
    get_profile_res = client.get(f"/profile/{user_id}", headers=auth_headers)
    assert get_profile_res.status_code == 200
    assert get_profile_res.json()["user_id"] == user_id
    
    # 6. Community Engagement (Post)
    post_res = client.post("/posts/", json={
        "user_id": user_id,
        "title": "My first psychometric post",
        "body": "This post carries my personality snapshot.",
        "topic_id": None
    }, headers=auth_headers)
    assert post_res.status_code == 201
    assert post_res.json()["snapshot_archetype"] == "Balanced Breaker"
    
    # 7. Community Engagement (Feed)
    feed_res = client.get(f"/feed/?user_id={user_id}&mode=default", headers=auth_headers)
    assert feed_res.status_code == 200
    feed_data = feed_res.json()
    assert "items" in feed_data
    assert len(feed_data["items"]) >= 1
    assert feed_data["items"][0]["author_id"] == user_id

def test_auth_failure_modes():
    # Attempt login with wrong password
    client.post("/users/", json={
        "username": "fail_user",
        "email": "fail@example.com",
        "password": "correct_secure_password"
    })
    
    bad_login = client.post("/token", data={
        "username": "fail_user",
        "password": "wrong_password"
    })
    assert bad_login.status_code == 401
    
    # Attempt access without token
    no_auth = client.get("/profile/any_id")
    assert no_auth.status_code == 401

def test_idor_prevention():
    # User A
    res_a = client.post("/users/", json={"username": "user_a", "email": "a@x.com", "password": "securepassword"})
    assert res_a.status_code == 201
    login_a = client.post("/token", data={"username": "user_a", "password": "securepassword"}).json()
    
    # User B
    res_b = client.post("/users/", json={"username": "user_b", "email": "b@x.com", "password": "securepassword"})
    assert res_b.status_code == 201
    user_b_id = res_b.json()["id"]
    
    # User A tries to view User B's feed
    headers_a = {"Authorization": f"Bearer {login_a['access_token']}"}
    forbidden_res = client.get(f"/feed/?user_id={user_b_id}", headers=headers_a)
    assert forbidden_res.status_code == 403
