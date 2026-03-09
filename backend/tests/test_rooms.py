"""Tests for room service — auto-assignment, membership, posting."""
import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.models import Base, User, PersonalityProfile
from backend.services import rooms as rooms_service

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_rooms.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def _create_user_with_profile(db, scores: dict) -> str:
    """Helper to create a user with personality profile."""
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username=f"user_{user_id[:8]}", is_guest=False)
    db.add(user)

    profile = PersonalityProfile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        o_score=scores["O"],
        c_score=scores["C"],
        e_score=scores["E"],
        a_score=scores["A"],
        n_score=scores["N"],
        primary_archetype="Explorer Creator",
    )
    db.add(profile)
    db.commit()
    return user_id


def test_seed_rooms(db):
    """Seed rooms creates 7 rooms."""
    rooms_service.seed_rooms(db)
    rooms = rooms_service.get_all_rooms(db)
    assert len(rooms) == 7


def test_auto_assign_rooms_on_quiz_completion(db):
    """After scoring, user gets home + shadow + commons memberships."""
    scores = {"O": 85, "C": 60, "E": 45, "A": 30, "N": 50}
    user_id = _create_user_with_profile(db, scores)

    rooms_service.auto_assign_rooms(db, user_id, scores)
    user_rooms = rooms_service.get_user_rooms(db, user_id)

    room_ids = [r["room_id"] for r in user_rooms]
    roles = {r["room_id"]: r["role"] for r in user_rooms}

    assert len(user_rooms) == 3
    assert "room_o" in room_ids  # Top dim is O (85)
    assert "room_shadow" in room_ids
    assert "room_commons" in room_ids
    assert roles["room_o"] == "home"
    assert roles["room_shadow"] == "shadow"


def test_room_post_requires_membership(db):
    """Posting to a room without membership raises error."""
    scores = {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50}
    user_id = _create_user_with_profile(db, scores)
    rooms_service.seed_rooms(db)

    with pytest.raises(PermissionError):
        rooms_service.create_room_post(db, "room_o", user_id, "Test", "Body text")


def test_join_room_then_post(db):
    """Join a room → post succeeds."""
    scores = {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50}
    user_id = _create_user_with_profile(db, scores)
    rooms_service.seed_rooms(db)

    rooms_service.join_room(db, "room_o", user_id)
    post = rooms_service.create_room_post(
        db, "room_o", user_id, "My Title", "My deep thought here"
    )

    assert post.room_id == "room_o"
    assert post.author_id == user_id
    assert post.title == "My Title"


def test_room_feed_returns_posts(db):
    """Posts appear in the room feed."""
    scores = {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50}
    user_id = _create_user_with_profile(db, scores)
    rooms_service.seed_rooms(db)
    rooms_service.join_room(db, "room_o", user_id)

    rooms_service.create_room_post(db, "room_o", user_id, "Post 1", "Body 1")
    rooms_service.create_room_post(db, "room_o", user_id, "Post 2", "Body 2")

    posts = rooms_service.get_room_posts(db, "room_o")
    assert len(posts) == 2


def test_join_room_idempotent(db):
    """Joining the same room twice returns the same membership."""
    scores = {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50}
    user_id = _create_user_with_profile(db, scores)
    rooms_service.seed_rooms(db)

    m1 = rooms_service.join_room(db, "room_o", user_id)
    m2 = rooms_service.join_room(db, "room_o", user_id)
    assert m1.id == m2.id
