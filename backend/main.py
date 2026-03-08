from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import uuid
import math

from backend import models, database
from backend.services import scoring, feed
from backend import schemas


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=database.engine)
    yield


app = FastAPI(title="Archetype API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Archetype API", "version": "1.0.0"}


# ── Users ─────────────────────────────────────────────────────

@app.post("/users/", response_model=schemas.UserResponse, status_code=201)
def create_user(payload: schemas.CreateUserRequest, db: Session = Depends(database.get_db)):
    db_user = models.User(id=str(uuid.uuid4()), username=payload.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ── Test Submission ───────────────────────────────────────────

@app.post("/test/submit/{user_id}", response_model=schemas.ProfileResponse)
def submit_test(
    user_id: str,
    payload: schemas.SubmitTestRequest,
    db: Session = Depends(database.get_db),
):
    """
    Submit quiz answers. `answers` is a dict of question_id -> likert_value (1-5).
    The backend recalculates Z-scores and archetype mapping from the provided answers.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Score the answers server-side
    ocean_scores = _score_answers(payload.answers, payload.version)

    # Calculate Z-Scores and archetype mapping
    z_scores, primary, secondary = scoring.calculate_archetype(ocean_scores)

    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == user_id
    ).first()
    if not profile:
        profile = models.PersonalityProfile(
            id=str(uuid.uuid4()), user_id=user_id
        )
        db.add(profile)

    profile.version = payload.version
    profile.o_score = ocean_scores["O"]
    profile.c_score = ocean_scores["C"]
    profile.e_score = ocean_scores["E"]
    profile.a_score = ocean_scores["A"]
    profile.n_score = ocean_scores["N"]
    profile.z_o = z_scores["O"]
    profile.z_c = z_scores["C"]
    profile.z_e = z_scores["E"]
    profile.z_a = z_scores["A"]
    profile.z_n = z_scores["N"]
    profile.primary_archetype = primary
    profile.secondary_archetype = secondary

    db.commit()
    db.refresh(profile)

    return schemas.ProfileResponse(
        user_id=profile.user_id,
        version=profile.version,
        scores=schemas.OceanScores(
            O=profile.o_score,
            C=profile.c_score,
            E=profile.e_score,
            A=profile.a_score,
            N=profile.n_score,
        ),
        z_scores=schemas.OceanScores(
            O=profile.z_o,
            C=profile.z_c,
            E=profile.z_e,
            A=profile.z_a,
            N=profile.z_n,
        ),
        primary_archetype=profile.primary_archetype,
        secondary_archetype=profile.secondary_archetype,
        is_public=profile.is_public,
    )


# ── Profile ───────────────────────────────────────────────────

@app.get("/profile/{user_id}", response_model=schemas.ProfileResponse)
def get_profile(
    user_id: str,
    viewer_id: Optional[str] = None,
    db: Session = Depends(database.get_db),
):
    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = schemas.ProfileResponse(
        user_id=profile.user_id,
        version=profile.version,
        scores=schemas.OceanScores(
            O=profile.o_score,
            C=profile.c_score,
            E=profile.e_score,
            A=profile.a_score,
            N=profile.n_score,
        ),
        z_scores=schemas.OceanScores(
            O=profile.z_o,
            C=profile.z_c,
            E=profile.z_e,
            A=profile.z_a,
            N=profile.z_n,
        ),
        primary_archetype=profile.primary_archetype,
        secondary_archetype=profile.secondary_archetype,
        is_public=profile.is_public,
    )

    # If a viewer is specified, calculate compatibility
    if viewer_id and viewer_id != user_id:
        viewer_profile = db.query(models.PersonalityProfile).filter(
            models.PersonalityProfile.user_id == viewer_id
        ).first()
        if viewer_profile:
            dist = math.sqrt(
                (profile.o_score - viewer_profile.o_score) ** 2
                + (profile.c_score - viewer_profile.c_score) ** 2
                + (profile.e_score - viewer_profile.e_score) ** 2
                + (profile.a_score - viewer_profile.a_score) ** 2
                + (profile.n_score - viewer_profile.n_score) ** 2
            )
            # Max possible distance for 0-100 scores across 5 dims ≈ 223.6
            result.compatibility = max(0, round(100 * (1 - dist / 223.6)))

    return result


# ── Posts ──────────────────────────────────────────────────────

@app.post("/posts/", response_model=schemas.PostResponse, status_code=201)
def create_post(
    payload: schemas.CreatePostRequest,
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

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
        title=payload.title,
        body=payload.body,
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


# ── Feed ──────────────────────────────────────────────────────

_FEED_MAX_CANDIDATES = 200
_FEED_MAX_LIMIT = 100


@app.get("/feed/", response_model=schemas.FeedPageResponse)
def get_feed(
    user_id: str,
    mode: str = "default",
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(database.get_db),
):
    """
    Return a ranked, paginated feed for the given user.

    Query params:
      - mode   : "default" | "similar" | "opposing"
      - limit  : posts to return (default 20, max 100)
      - offset : posts to skip in the ranked result (default 0)
    """
    limit = max(1, min(limit, _FEED_MAX_LIMIT))
    offset = max(0, offset)

    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=400, detail="User must complete personality test first"
        )

    # Load at most MAX_CANDIDATES posts from DB — sort by upvotes to
    # surface the highest-quality candidates before ranking.
    candidates = (
        db.query(models.Post)
        .order_by(models.Post.upvotes.desc())
        .limit(_FEED_MAX_CANDIDATES)
        .all()
    )

    # Derive a stable seed from viewer + page so the serendipity term
    # doesn't shift between repeated requests for the same page.
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


# ── Internal Helpers ──────────────────────────────────────────

# Question dimension mapping (mirrors mobile/lib/questions.ts)
_QUESTION_DIMS = {
    # Phase 1
    1: ("O", False), 2: ("O", True), 3: ("O", False),
    4: ("C", False), 5: ("C", True), 6: ("C", False),
    7: ("E", False), 8: ("E", True), 9: ("E", False),
    10: ("A", False), 11: ("A", True), 12: ("A", False),
    13: ("N", False), 14: ("N", True), 15: ("N", False),
    # Phase 2
    16: ("O", False), 17: ("O", True), 18: ("O", False),
    19: ("O", True), 20: ("O", False), 21: ("O", True), 22: ("O", False),
    23: ("C", False), 24: ("C", True), 25: ("C", False),
    26: ("C", True), 27: ("C", False), 28: ("C", True), 29: ("C", False),
    30: ("E", False), 31: ("E", True), 32: ("E", False),
    33: ("E", True), 34: ("E", False), 35: ("E", True), 36: ("E", False),
    37: ("A", False), 38: ("A", True), 39: ("A", False),
    40: ("A", True), 41: ("A", False), 42: ("A", True), 43: ("A", False),
    44: ("N", False), 45: ("N", True), 46: ("N", False),
    47: ("N", True), 48: ("N", False), 49: ("N", True), 50: ("N", False),
}


def _score_answers(answers: Dict[str, int], version: str) -> Dict[str, float]:
    """Score raw answers into 0-100 OCEAN scores."""
    sums = {"O": 0, "C": 0, "E": 0, "A": 0, "N": 0}
    counts = {"O": 0, "C": 0, "E": 0, "A": 0, "N": 0}

    for qid_str, raw in answers.items():
        qid = int(qid_str)
        if qid not in _QUESTION_DIMS:
            continue
        dim, reversed_item = _QUESTION_DIMS[qid]
        val = (6 - raw) if reversed_item else raw
        sums[dim] += val
        counts[dim] += 1

    scores = {}
    for dim in ["O", "C", "E", "A", "N"]:
        if counts[dim] > 0:
            mean = sums[dim] / counts[dim]
            scores[dim] = round(((mean - 1) / 4) * 100)
        else:
            scores[dim] = 50
    return scores
