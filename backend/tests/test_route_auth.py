"""Verify all protected endpoints reject unauthenticated requests."""
import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


def test_feed_requires_auth(client):
    resp = client.get("/api/feed/?user_id=fake")
    assert resp.status_code == 401


def test_profile_requires_auth(client):
    resp = client.get("/api/profile/fake-id")
    assert resp.status_code == 401


def test_create_post_requires_auth(client):
    resp = client.post("/api/posts/", json={"title": "t", "body": "b"})
    assert resp.status_code == 401


def test_arena_post_requires_auth(client):
    resp = client.post("/api/arenas/arena_1/posts", json={"body": "Hello"})
    assert resp.status_code == 401


def test_arena_vote_requires_auth(client):
    resp = client.post("/api/arenas/arena_1/vote", json={"side": 1})
    assert resp.status_code == 401


def test_room_posts_require_auth(client):
    resp = client.get("/api/rooms/room_o/posts")
    assert resp.status_code == 401


def test_user_rooms_require_auth(client):
    resp = client.get("/api/users/fake-id/rooms")
    assert resp.status_code == 401


def test_create_user_does_not_require_auth(client):
    """Public endpoint — should not return 401."""
    resp = client.post("/api/users/", json={"username": "t", "email": "t@t.com", "password": "pw"})
    # May fail for other reasons (DB), but should NOT be 401
    assert resp.status_code != 401
