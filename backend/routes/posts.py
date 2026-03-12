"""Post creation routes."""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user
from backend.rate_limit import limiter
from backend.services.sanitize import sanitize_text

router = APIRouter(tags=["posts"])


@router.post("/posts/", response_model=schemas.PostResponse, status_code=201)
@limiter.limit("5/minute")
def create_post(
    request: Request,
    payload: schemas.CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != payload.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this user ID",
        )

    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == payload.user_id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=400, detail="User must complete personality test first"
        )

    db_post = models.Post(
        id=str(uuid.uuid4()),
        author_id=payload.user_id,
        topic_id=payload.topic_id,
        title=sanitize_text(payload.title, max_length=200),
        body=sanitize_text(payload.body, max_length=5000),
        snapshot_archetype=profile.primary_archetype,
        snapshot_o=profile.o_score,
        snapshot_c=profile.c_score,
        snapshot_e=profile.e_score,
        snapshot_a=profile.a_score,
        snapshot_n=profile.n_score,
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post
