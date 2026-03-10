"""
Room service — room management, membership, and auto-assignment.
"""
import uuid
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from sqlalchemy.exc import IntegrityError

from backend import models
from backend.services.sanitize import sanitize_text

# ── Seed Data ─────────────────────────────────────────────────

SEED_ROOMS = [
    {"id": "room_o", "dimension": "O", "name": "The Observatory", "name_zh": "观测站", "room_type": "dimension", "color": "#AF52DE"},
    {"id": "room_c", "dimension": "C", "name": "The Workshop", "name_zh": "工坊", "room_type": "dimension", "color": "#30B0C7"},
    {"id": "room_e", "dimension": "E", "name": "The Arena", "name_zh": "竞技场", "room_type": "dimension", "color": "#FF3B30"},
    {"id": "room_a", "dimension": "A", "name": "The Garden", "name_zh": "花园", "room_type": "dimension", "color": "#5AC8FA"},
    {"id": "room_n", "dimension": "N", "name": "The Depths", "name_zh": "深渊", "room_type": "dimension", "color": "#FF9500"},
    {"id": "room_commons", "dimension": None, "name": "The Commons", "name_zh": "广场", "room_type": "commons", "color": "#8E8D93"},
    {"id": "room_shadow", "dimension": None, "name": "The Shadow Side", "name_zh": "暗面", "room_type": "shadow", "color": "#111111"},
]

# Mapping from dimension letter to room_id for quick auto-assign
DIM_TO_ROOM = {r["dimension"]: r["id"] for r in SEED_ROOMS if r["dimension"]}


def seed_rooms(db: Session) -> None:
    """Insert seed rooms if they don't exist."""
    for room_data in SEED_ROOMS:
        existing = db.query(models.Room).filter(models.Room.id == room_data["id"]).first()
        if not existing:
            room = models.Room(**room_data)
            db.add(room)
    db.commit()


# ── Queries ───────────────────────────────────────────────────

def get_all_rooms(db: Session) -> list[models.Room]:
    return db.query(models.Room).all()


def get_room(db: Session, room_id: str) -> Optional[models.Room]:
    return db.query(models.Room).filter(models.Room.id == room_id).first()


def get_room_member_count(db: Session, room_id: str) -> int:
    return db.query(models.RoomMembership).filter(
        models.RoomMembership.room_id == room_id
    ).count()


def get_all_room_member_counts(db: Session) -> dict[str, int]:
    """Get member counts for all rooms in a single query."""
    rows = (
        db.query(
            models.RoomMembership.room_id,
            func.count(models.RoomMembership.id),
        )
        .group_by(models.RoomMembership.room_id)
        .all()
    )
    return {room_id: count for room_id, count in rows}


def get_room_posts(
    db: Session, room_id: str, limit: int = 20, offset: int = 0
) -> list[models.Post]:
    return (
        db.query(models.Post)
        .filter(models.Post.room_id == room_id)
        .order_by(models.Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_room_post(
    db: Session, room_id: str, user_id: str, title: str, body: str
) -> models.Post:
    """Create a post in a room. User must be a member."""
    membership = (
        db.query(models.RoomMembership)
        .filter(
            models.RoomMembership.room_id == room_id,
            models.RoomMembership.user_id == user_id,
        )
        .first()
    )
    if not membership:
        raise PermissionError("User must join the room before posting")

    profile = (
        db.query(models.PersonalityProfile)
        .filter(models.PersonalityProfile.user_id == user_id)
        .first()
    )

    post = models.Post(
        id=str(uuid.uuid4()),
        author_id=user_id,
        room_id=room_id,
        title=sanitize_text(title, max_length=200),
        body=sanitize_text(body, max_length=5000),
        snapshot_archetype=profile.primary_archetype if profile else None,
        snapshot_o=profile.o_score if profile else None,
        snapshot_c=profile.c_score if profile else None,
        snapshot_e=profile.e_score if profile else None,
        snapshot_a=profile.a_score if profile else None,
        snapshot_n=profile.n_score if profile else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


# ── Membership ────────────────────────────────────────────────

def join_room(
    db: Session, room_id: str, user_id: str, role: str = "joined"
) -> models.RoomMembership:
    """Join a room. No-op if already a member."""
    existing = (
        db.query(models.RoomMembership)
        .filter(
            models.RoomMembership.room_id == room_id,
            models.RoomMembership.user_id == user_id,
        )
        .first()
    )
    if existing:
        return existing

    membership = models.RoomMembership(
        id=str(uuid.uuid4()),
        user_id=user_id,
        room_id=room_id,
        role=role,
    )
    db.add(membership)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return db.query(models.RoomMembership).filter(
            models.RoomMembership.room_id == room_id,
            models.RoomMembership.user_id == user_id,
        ).first()
    db.refresh(membership)
    return membership


def get_user_rooms(db: Session, user_id: str) -> list[dict]:
    """Get all rooms a user has joined, with role info. Single query with join."""
    rows = (
        db.query(models.RoomMembership, models.Room)
        .join(models.Room, models.Room.id == models.RoomMembership.room_id)
        .filter(models.RoomMembership.user_id == user_id)
        .all()
    )
    return [
        {
            "room_id": room.id,
            "name": room.name,
            "name_zh": room.name_zh,
            "dimension": room.dimension,
            "room_type": room.room_type,
            "color": room.color,
            "role": m.role,
        }
        for m, room in rows
    ]


def auto_assign_rooms(db: Session, user_id: str, scores: dict) -> None:
    """
    Auto-assign user to rooms based on their OCEAN scores.
    - Highest dimension → dimension room as "home"
    - Lowest dimension → "The Shadow Side" as "shadow"
    - Always join "The Commons"
    """
    dims = ["O", "C", "E", "A", "N"]
    sorted_dims = sorted(dims, key=lambda d: scores.get(d, 50), reverse=True)
    top_dim = sorted_dims[0]
    low_dim = sorted_dims[-1]

    # Join home room (top dimension)
    if top_dim in DIM_TO_ROOM:
        join_room(db, DIM_TO_ROOM[top_dim], user_id, role="home")

    # Join shadow room
    join_room(db, "room_shadow", user_id, role="shadow")

    # Join commons
    join_room(db, "room_commons", user_id, role="joined")
