"""
Room routes — room listing, posts, membership.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend import schemas, models
from backend.database import get_db
from backend.auth import get_current_user
from backend.services import rooms as rooms_service

router = APIRouter(tags=["rooms"])


@router.get("/rooms")
def list_rooms(response: Response, db: Session = Depends(get_db)):
    """List all rooms with member counts (2 queries total, not N+1)."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    all_rooms = rooms_service.get_all_rooms(db)
    counts = rooms_service.get_all_room_member_counts(db)
    return [
        {
            "id": room.id,
            "dimension": room.dimension,
            "name": room.name,
            "name_zh": room.name_zh,
            "description": room.description,
            "room_type": room.room_type,
            "color": room.color,
            "member_count": counts.get(room.id, 0),
        }
        for room in all_rooms
    ]


@router.get("/rooms/{room_id}")
def get_room(room_id: str, db: Session = Depends(get_db)):
    """Get room details."""
    room = rooms_service.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    count = rooms_service.get_room_member_count(db, room.id)
    return {
        "id": room.id,
        "dimension": room.dimension,
        "name": room.name,
        "name_zh": room.name_zh,
        "description": room.description,
        "room_type": room.room_type,
        "color": room.color,
        "member_count": count,
    }


@router.get("/rooms/{room_id}/posts")
def get_room_posts(
    room_id: str, limit: int = 20, offset: int = 0, db: Session = Depends(get_db),
    _auth: models.User = Depends(get_current_user),
):
    """Get posts in a room."""
    room = rooms_service.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    posts = rooms_service.get_room_posts(db, room_id, limit=max(1, min(limit, 100)), offset=max(0, offset))
    return [schemas.PostResponse.model_validate(p) for p in posts]


@router.post("/rooms/{room_id}/posts", response_model=schemas.PostResponse, status_code=201)
def create_room_post(
    room_id: str,
    payload: schemas.CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a post in a room. User must be a member."""
    try:
        post = rooms_service.create_room_post(
            db, room_id, current_user.id, payload.title, payload.body
        )
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    return post


@router.post("/rooms/{room_id}/join")
def join_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Join a room."""
    room = rooms_service.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    membership = rooms_service.join_room(db, room_id, current_user.id)
    return {"room_id": room_id, "role": membership.role, "status": "joined"}


@router.get("/users/{user_id}/rooms")
def get_user_rooms(
    user_id: str,
    db: Session = Depends(get_db),
    _auth: models.User = Depends(get_current_user),
):
    """Get rooms a user has joined."""
    return rooms_service.get_user_rooms(db, user_id)
