"""
Arena routes — debate listing, posting, voting.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend import models
from backend.database import get_db
from backend.auth import get_current_user
from backend.services import arenas as arena_service

router = APIRouter(prefix="/arenas", tags=["arenas"])


class ArenaPostRequest(BaseModel):
    body: str
    force_side: Optional[int] = None  # 1 or 2, null = auto-assign


class ArenaVoteRequest(BaseModel):
    side: int  # 1 or 2


@router.get("")
def list_arenas(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    """List arenas, optionally filtered by status."""
    arenas = arena_service.get_arenas(db, status=status_filter)
    result = []
    for a in arenas:
        side1_count = (
            db.query(models.ArenaPost)
            .filter(models.ArenaPost.arena_id == a.id, models.ArenaPost.side == 1)
            .count()
        )
        side2_count = (
            db.query(models.ArenaPost)
            .filter(models.ArenaPost.arena_id == a.id, models.ArenaPost.side == 2)
            .count()
        )
        result.append({
            "id": a.id,
            "topic": a.topic,
            "topic_zh": a.topic_zh,
            "dim1": a.dim1,
            "dim2": a.dim2,
            "side1_label": a.side1_label,
            "side2_label": a.side2_label,
            "status": a.status,
            "starts_at": a.starts_at.isoformat() if a.starts_at else None,
            "voting_at": a.voting_at.isoformat() if a.voting_at else None,
            "ends_at": a.ends_at.isoformat() if a.ends_at else None,
            "side1_count": side1_count,
            "side2_count": side2_count,
        })
    return result


@router.get("/{arena_id}")
def get_arena(arena_id: str, db: Session = Depends(get_db)):
    """Get arena detail with vote counts."""
    arena = arena_service.get_arena(db, arena_id)
    if not arena:
        raise HTTPException(status_code=404, detail="Arena not found")

    results = arena_service.get_arena_results(db, arena_id)
    side1_count = (
        db.query(models.ArenaPost)
        .filter(models.ArenaPost.arena_id == arena_id, models.ArenaPost.side == 1)
        .count()
    )
    side2_count = (
        db.query(models.ArenaPost)
        .filter(models.ArenaPost.arena_id == arena_id, models.ArenaPost.side == 2)
        .count()
    )

    return {
        "id": arena.id,
        "topic": arena.topic,
        "topic_zh": arena.topic_zh,
        "dim1": arena.dim1,
        "dim2": arena.dim2,
        "side1_label": arena.side1_label,
        "side2_label": arena.side2_label,
        "status": arena.status,
        "starts_at": arena.starts_at.isoformat() if arena.starts_at else None,
        "voting_at": arena.voting_at.isoformat() if arena.voting_at else None,
        "ends_at": arena.ends_at.isoformat() if arena.ends_at else None,
        "side1_count": side1_count,
        "side2_count": side2_count,
        **results,
    }


@router.get("/{arena_id}/posts")
def get_arena_posts(
    arena_id: str, side: Optional[int] = None, db: Session = Depends(get_db)
):
    """Get posts for an arena, optionally filtered by side."""
    arena = arena_service.get_arena(db, arena_id)
    if not arena:
        raise HTTPException(status_code=404, detail="Arena not found")

    posts = arena_service.get_arena_posts(db, arena_id, side=side)
    return [
        {
            "id": p.id,
            "arena_id": p.arena_id,
            "user_id": p.user_id,
            "side": p.side,
            "body": p.body,
            "is_defector": p.is_defector,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in posts
    ]


@router.post("/{arena_id}/posts", status_code=201)
def create_arena_post(
    arena_id: str,
    payload: ArenaPostRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Post to an arena. Auto-assigns side based on personality scores."""
    try:
        post = arena_service.create_arena_post(
            db, arena_id, current_user.id, payload.body, payload.force_side
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "id": post.id,
        "arena_id": post.arena_id,
        "user_id": post.user_id,
        "side": post.side,
        "body": post.body,
        "is_defector": post.is_defector,
    }


@router.post("/{arena_id}/vote")
def vote_arena(
    arena_id: str,
    payload: ArenaVoteRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Cast a vote during the voting phase."""
    try:
        v = arena_service.vote(db, arena_id, current_user.id, payload.side)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"arena_id": v.arena_id, "voted_side": v.voted_side, "status": "voted"}
