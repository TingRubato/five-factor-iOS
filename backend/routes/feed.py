"""Feed ranking routes."""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user
from backend.rate_limit import limiter
from backend.services import feed

router = APIRouter(tags=["feed"])

_FEED_MAX_CANDIDATES = 200
_FEED_MAX_LIMIT = 100


def _verify_user_id(user_id: str, current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user ID")
    return current_user


@router.get("/feed/", response_model=schemas.FeedPageResponse)
@limiter.limit("30/minute")
def get_feed(
    request: Request,
    user_id: str,
    mode: str = "default",
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    _auth: models.User = Depends(_verify_user_id),
):
    """Return a ranked, paginated feed for the given user."""
    limit = max(1, min(limit, _FEED_MAX_LIMIT))
    offset = max(0, offset)

    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=400, detail="User must complete personality test first"
        )

    candidates = (
        db.query(models.Post)
        .order_by(models.Post.upvotes.desc())
        .limit(_FEED_MAX_CANDIDATES)
        .all()
    )

    seed = hash(user_id + str(offset)) & 0x7FFFFFFF

    ranked_items = feed.rank_feed(
        candidates,
        profile,
        mode=mode,
        limit=limit,
        offset=offset,
        seed=seed,
    )

    return schemas.FeedPageResponse(
        items=ranked_items,
        pagination=schemas.PaginationMeta(
            limit=limit,
            offset=offset,
            returned=len(ranked_items),
        ),
    )
