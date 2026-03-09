"""Tests for arena service — side assignment, defection, voting."""
import pytest
import uuid
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.models import Base, User, PersonalityProfile, Arena, ArenaPost, ArenaVote
from backend.services import arenas as arena_service

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_arenas.db"
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


def _create_user_with_scores(db, scores: dict) -> str:
    user_id = str(uuid.uuid4())
    user = User(id=user_id, username=f"u_{user_id[:8]}", is_guest=False)
    db.add(user)
    profile = PersonalityProfile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        o_score=scores["O"],
        c_score=scores["C"],
        e_score=scores["E"],
        a_score=scores["A"],
        n_score=scores["N"],
        primary_archetype="Test",
    )
    db.add(profile)
    db.commit()
    return user_id


def _create_active_arena(db) -> str:
    now = datetime.utcnow()
    arena = Arena(
        id="arena_test",
        topic="Structure kills creativity",
        topic_zh="结构扼杀创造力",
        dim1="C",
        dim2="O",
        side1_label="HIGH C",
        side2_label="HIGH O",
        status="active",
        starts_at=now,
        voting_at=now + timedelta(days=5),
        ends_at=now + timedelta(days=7),
    )
    db.add(arena)
    db.commit()
    return arena.id


def test_auto_assign_side_by_scores(db):
    """User with higher C gets side 1 (C vs O arena)."""
    scores = {"O": 40, "C": 80, "E": 50, "A": 50, "N": 50}
    side = arena_service.assign_user_side(scores, "C", "O")
    assert side == 1  # Higher C → side 1

    scores2 = {"O": 85, "C": 40, "E": 50, "A": 50, "N": 50}
    side2 = arena_service.assign_user_side(scores2, "C", "O")
    assert side2 == 2  # Higher O → side 2


def test_create_arena_post_auto_side(db):
    """Post auto-assigns side based on scores."""
    arena_id = _create_active_arena(db)
    user_id = _create_user_with_scores(db, {"O": 40, "C": 80, "E": 50, "A": 50, "N": 50})

    post = arena_service.create_arena_post(db, arena_id, user_id, "Structure is essential!")
    assert post.side == 1  # High C → side 1
    assert post.is_defector is False


def test_defector_badge(db):
    """User forced to opposite side gets defector badge."""
    arena_id = _create_active_arena(db)
    user_id = _create_user_with_scores(db, {"O": 40, "C": 80, "E": 50, "A": 50, "N": 50})

    # Natural side is 1 (high C), but force to side 2
    post = arena_service.create_arena_post(db, arena_id, user_id, "Actually, rules are prisons", force_side=2)
    assert post.side == 2
    assert post.is_defector is True


def test_vote_only_during_voting_phase(db):
    """Cannot vote during active phase."""
    arena_id = _create_active_arena(db)
    user_id = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})

    with pytest.raises(ValueError, match="not open"):
        arena_service.vote(db, arena_id, user_id, 1)


def test_vote_during_voting_phase(db):
    """Can vote during voting phase."""
    arena_id = _create_active_arena(db)
    # Switch to voting phase
    arena = db.query(Arena).filter(Arena.id == arena_id).first()
    arena.status = "voting"
    db.commit()

    user_id = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})
    v = arena_service.vote(db, arena_id, user_id, 1)
    assert v.voted_side == 1


def test_arena_results(db):
    """Results count votes correctly."""
    arena_id = _create_active_arena(db)
    arena = db.query(Arena).filter(Arena.id == arena_id).first()
    arena.status = "voting"
    db.commit()

    u1 = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})
    u2 = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})
    u3 = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})

    arena_service.vote(db, arena_id, u1, 1)
    arena_service.vote(db, arena_id, u2, 1)
    arena_service.vote(db, arena_id, u3, 2)

    results = arena_service.get_arena_results(db, arena_id)
    assert results["side1_votes"] == 2
    assert results["side2_votes"] == 1
    assert results["winner"] == 1


def test_cannot_vote_twice(db):
    """Same user cannot vote twice."""
    arena_id = _create_active_arena(db)
    arena = db.query(Arena).filter(Arena.id == arena_id).first()
    arena.status = "voting"
    db.commit()

    user_id = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})
    arena_service.vote(db, arena_id, user_id, 1)

    with pytest.raises(ValueError, match="Already voted"):
        arena_service.vote(db, arena_id, user_id, 2)
