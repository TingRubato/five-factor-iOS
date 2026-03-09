from contextlib import asynccontextmanager
import os

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, List, Optional
import uuid
import math

from backend import models, database
from backend.services import scoring, feed, psychometrics
from backend.services import rooms as rooms_service
from backend import schemas
from backend.auth import create_access_token, get_current_user, verify_password, get_password_hash
from backend.routes.auth import router as auth_router
from backend.routes.rooms import router as rooms_router
from backend.routes.arenas import router as arenas_router

from backend.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load question bank on startup
    try:
        load_question_bank()
        print(f"Question bank loaded successfully with {len(_QUESTION_BANK)} versions.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load question_bank.json: {e}")
        # Fail fast if quiz data is missing or corrupted
        raise SystemExit(1)
    yield


app = FastAPI(title=settings.APP_NAME, version="1.0.0", lifespan=lifespan)

app.include_router(auth_router, prefix="/api")
app.include_router(rooms_router, prefix="/api")
app.include_router(arenas_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Archetype API", "version": "1.0.0"}


@app.get("/health")
def health_check(db: Session = Depends(database.get_db)):
    try:
        # Simple query to check database connectivity
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database connection failed")


import json

# ... imports ...

# ── Quiz ──────────────────────────────────────────────────────

_QUESTION_BANK = {}

def load_question_bank():
    global _QUESTION_BANK
    path = os.path.join(os.path.dirname(__file__), "question_bank.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Question bank file not found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        # Minimal schema validation: ensure it's a dict
        if not isinstance(data, dict):
            raise ValueError("question_bank.json must be a JSON object (dictionary)")
        _QUESTION_BANK = data


@app.get("/quiz/version/{version}")
def get_quiz(version: str):
    if version not in _QUESTION_BANK:
        raise HTTPException(status_code=404, detail="Quiz version not found")
    return _QUESTION_BANK[version]


# ── Auth ──────────────────────────────────────────────────────

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


def verify_user_id(user_id: str, current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this user ID"
        )
    return current_user


# ── Users ─────────────────────────────────────────────────────

@app.post("/users/", response_model=schemas.UserResponse, status_code=201)
def create_user(payload: schemas.CreateUserRequest, db: Session = Depends(database.get_db)):
    # Check for existing user
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already registered")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    db_user = models.User(
        id=str(uuid.uuid4()),
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


_SCORING_VERSION = "v1"
_ARCHETYPE_VERSION = "v1"

# ── Test Submission ───────────────────────────────────────────

@app.post("/test/submit/{user_id}", response_model=schemas.ProfileResponse)
def submit_test(
    user_id: str,
    payload: schemas.SubmitTestRequest,
    db: Session = Depends(database.get_db),
    _auth = Depends(verify_user_id),
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

    profile.quiz_version = payload.version
    profile.scoring_version = _SCORING_VERSION
    profile.archetype_version = _ARCHETYPE_VERSION
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

    # Auto-assign rooms based on scores
    rooms_service.auto_assign_rooms(db, user_id, ocean_scores)

    return schemas.ProfileResponse(
        user_id=profile.user_id,
        quiz_version=profile.quiz_version,
        scoring_version=profile.scoring_version,
        archetype_version=profile.archetype_version,
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
    _auth = Depends(get_current_user),
):
    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    user_data = db.query(models.User).filter(models.User.id == user_id).first()
    
    # Ownership and Privacy Check
    is_owner = _auth.id == user_id
    should_mask = not is_owner and not profile.is_public

    # Construct the base response
    result = schemas.ProfileResponse(
        user_id=profile.user_id,
        username=user_data.username if user_data else None,
        is_public=profile.is_public,
    )

    # Populate sensitive data only if allowed
    if not should_mask:
        result.quiz_version = profile.quiz_version
        result.scoring_version = profile.scoring_version
        result.archetype_version = profile.archetype_version
        result.primary_archetype = profile.primary_archetype
        result.secondary_archetype = profile.secondary_archetype
        
        if profile.o_score is not None:
            result.scores = schemas.OceanScores(
                O=profile.o_score,
                C=profile.c_score,
                E=profile.e_score,
                A=profile.a_score,
                N=profile.n_score,
            )
        
        if profile.z_o is not None:
            result.z_scores = schemas.OceanScores(
                O=profile.z_o,
                C=profile.z_c,
                E=profile.z_e,
                A=profile.z_a,
                N=profile.z_n,
            )
    else:
        # If masked, maybe we still show archetype if public? 
        # But should_mask means (not owner AND not public).
        # So we return minimal info.
        pass

    # If a viewer is specified and it's public (or owner), calculate compatibility
    if viewer_id and viewer_id != user_id and not should_mask:
        if viewer_id != _auth.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as viewer")
        viewer_profile = db.query(models.PersonalityProfile).filter(
            models.PersonalityProfile.user_id == viewer_id
        ).first()
        if viewer_profile:
            p1_dict = {
                "O": profile.o_score, 
                "C": profile.c_score, 
                "E": profile.e_score, 
                "A": profile.a_score, 
                "N": profile.n_score
            }
            p2_dict = {
                "O": viewer_profile.o_score, 
                "C": viewer_profile.c_score, 
                "E": viewer_profile.e_score, 
                "A": viewer_profile.a_score, 
                "N": viewer_profile.n_score
            }
            result.compatibility = psychometrics.calculate_compatibility_score(p1_dict, p2_dict)

    return result


@app.patch("/profile/{user_id}", response_model=schemas.ProfileResponse)
def update_profile(
    user_id: str,
    payload: schemas.UpdateProfileRequest,
    db: Session = Depends(database.get_db),
    _auth = Depends(verify_user_id),
):
    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if payload.is_public is not None:
        profile.is_public = payload.is_public

    db.commit()
    db.refresh(profile)

    return schemas.ProfileResponse(
        user_id=profile.user_id,
        quiz_version=profile.quiz_version,
        scoring_version=profile.scoring_version,
        archetype_version=profile.archetype_version,
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


@app.delete("/profile/{user_id}/scores", status_code=204)
def clear_profile_scores(
    user_id: str,
    db: Session = Depends(database.get_db),
    _auth = Depends(verify_user_id),
):
    profile = db.query(models.PersonalityProfile).filter(
        models.PersonalityProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.o_score = None
    profile.c_score = None
    profile.e_score = None
    profile.a_score = None
    profile.n_score = None
    profile.z_o = None
    profile.z_c = None
    profile.z_e = None
    profile.z_a = None
    profile.z_n = None
    profile.primary_archetype = "none"
    profile.secondary_archetype = None
    profile.quiz_version = "none"

    db.commit()
    return


@app.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    db: Session = Depends(database.get_db),
    _auth = Depends(verify_user_id),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Manual cascade cleanup
    db.query(models.PersonalityProfile).filter(models.PersonalityProfile.user_id == user_id).delete()
    db.query(models.Post).filter(models.Post.author_id == user_id).delete()
    db.delete(user)
    db.commit()
    return


# ── Posts ──────────────────────────────────────────────────────

@app.post("/posts/", response_model=schemas.PostResponse, status_code=201)
def create_post(
    payload: schemas.CreatePostRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    verify_user_id(payload.user_id, current_user)

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
    _auth = Depends(verify_user_id),
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

def _score_answers(answers: Dict[str, int], version: str) -> Dict[str, float]:
    """Score raw answers into 0-100 OCEAN scores."""
    if version not in _QUESTION_BANK:
        raise ValueError(f"Unknown quiz version: {version}")

    quiz = _QUESTION_BANK[version]
    # Create a map for quick lookup
    q_map = {q["id"]: (q["dimension"], q["reversed"]) for q in quiz["questions"]}

    sums = {"O": 0, "C": 0, "E": 0, "A": 0, "N": 0}
    counts = {"O": 0, "C": 0, "E": 0, "A": 0, "N": 0}

    for qid_str, raw in answers.items():
        qid = int(qid_str)
        if qid not in q_map:
            continue
        dim, reversed_item = q_map[qid]
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
