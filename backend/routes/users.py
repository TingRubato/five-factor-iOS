"""User CRUD routes."""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user, get_password_hash

router = APIRouter(tags=["users"])


@router.post("/users/", response_model=schemas.UserResponse, status_code=201)
def create_user(payload: schemas.CreateUserRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already registered")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    db_user = models.User(
        id=str(uuid.uuid4()),
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Full cascade: delete all child entities
    db.query(models.RoomMembership).filter(models.RoomMembership.user_id == user_id).delete()
    db.query(models.ArenaVote).filter(models.ArenaVote.voter_id == user_id).delete()
    db.query(models.ArenaPost).filter(models.ArenaPost.user_id == user_id).delete()
    db.query(models.Post).filter(models.Post.author_id == user_id).delete()
    db.query(models.PersonalityProfile).filter(models.PersonalityProfile.user_id == user_id).delete()
    db.delete(user)
    db.commit()
