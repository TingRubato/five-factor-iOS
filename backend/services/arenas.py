"""
Arena service — debate management, auto-side assignment, voting.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func, case
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend import models
from backend.services.sanitize import sanitize_text


# ── Queries ───────────────────────────────────────────────────

def get_arenas(db: Session, status: Optional[str] = None) -> list[models.Arena]:
    q = db.query(models.Arena)
    if status:
        q = q.filter(models.Arena.status == status)
    return q.order_by(models.Arena.created_at.desc()).all()


def get_arena(db: Session, arena_id: str) -> Optional[models.Arena]:
    return db.query(models.Arena).filter(models.Arena.id == arena_id).first()


def get_arena_posts(
    db: Session, arena_id: str, side: Optional[int] = None,
    limit: int = 50, offset: int = 0,
) -> list[models.ArenaPost]:
    q = db.query(models.ArenaPost).filter(models.ArenaPost.arena_id == arena_id)
    if side is not None:
        q = q.filter(models.ArenaPost.side == side)
    return q.order_by(models.ArenaPost.created_at.asc()).offset(offset).limit(limit).all()


# ── Side Assignment ───────────────────────────────────────────

def assign_user_side(user_scores: dict, dim1: str, dim2: str) -> int:
    """Compare user's score on dim1 vs dim2, assign to higher side."""
    score1 = user_scores.get(dim1, 50)
    score2 = user_scores.get(dim2, 50)
    return 1 if score1 >= score2 else 2


# ── Posting ───────────────────────────────────────────────────

def create_arena_post(
    db: Session,
    arena_id: str,
    user_id: str,
    body: str,
    force_side: Optional[int] = None,
) -> models.ArenaPost:
    """Create a post in an arena. Auto-assigns side based on scores unless force_side."""
    arena = db.query(models.Arena).filter(models.Arena.id == arena_id).first()
    if not arena:
        raise ValueError("Arena not found")
    if arena.status != "active":
        raise ValueError("Arena is not active")

    # Determine side
    profile = (
        db.query(models.PersonalityProfile)
        .filter(models.PersonalityProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise ValueError("User must complete quiz first")

    user_scores = {k: v or 50 for k, v in profile.to_ocean_dict().items()}

    natural_side = assign_user_side(user_scores, arena.dim1, arena.dim2)
    is_defector = False

    if force_side is not None and force_side != natural_side:
        side = force_side
        is_defector = True
    else:
        side = natural_side

    post = models.ArenaPost(
        id=str(uuid.uuid4()),
        arena_id=arena_id,
        user_id=user_id,
        side=side,
        body=sanitize_text(body, max_length=5000),
        is_defector=is_defector,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


# ── Voting ────────────────────────────────────────────────────

def vote(db: Session, arena_id: str, voter_id: str, voted_side: int) -> models.ArenaVote:
    """Cast a vote. Only allowed during voting phase. Uses DB unique constraint to prevent duplicates."""
    arena = db.query(models.Arena).filter(models.Arena.id == arena_id).first()
    if not arena:
        raise ValueError("Arena not found")
    if arena.status != "voting":
        raise ValueError("Voting is not open")

    v = models.ArenaVote(
        id=str(uuid.uuid4()),
        arena_id=arena_id,
        voter_id=voter_id,
        voted_side=voted_side,
    )
    db.add(v)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Already voted")
    db.refresh(v)
    return v


def get_arena_results(db: Session, arena_id: str) -> dict:
    """Get vote counts and winner for an arena using SQL aggregation."""
    row = db.query(
        func.coalesce(func.sum(case((models.ArenaVote.voted_side == 1, 1), else_=0)), 0).label("side1"),
        func.coalesce(func.sum(case((models.ArenaVote.voted_side == 2, 1), else_=0)), 0).label("side2"),
    ).filter(models.ArenaVote.arena_id == arena_id).one()
    side1, side2 = int(row.side1), int(row.side2)
    winner = 1 if side1 > side2 else 2 if side2 > side1 else 0
    return {"side1_votes": side1, "side2_votes": side2, "winner": winner}


# ── Seed ──────────────────────────────────────────────────────

def seed_initial_arena(db: Session) -> None:
    """Seed the first debate arena if none exist."""
    existing = db.query(models.Arena).first()
    if existing:
        return

    now = datetime.now(timezone.utc)
    arena = models.Arena(
        id="arena_1",
        topic="Structure kills creativity",
        topic_zh="结构扼杀创造力",
        dim1="C",
        dim2="O",
        side1_label="HIGH CONSCIENTIOUSNESS",
        side2_label="HIGH OPENNESS",
        status="active",
        starts_at=now,
        voting_at=now + timedelta(days=5),
        ends_at=now + timedelta(days=7),
    )
    db.add(arena)
    db.commit()
