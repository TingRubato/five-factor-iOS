"""Quiz and test submission routes."""
import json
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Dict

from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user, verify_owns_resource
from backend.rate_limit import limiter
from backend.services import scoring
from backend.services import rooms as rooms_service

router = APIRouter(tags=["quiz"])

_QUESTION_BANK: dict = {}
_SCORING_VERSION = "v1"
_ARCHETYPE_VERSION = "v1"


def load_question_bank():
    global _QUESTION_BANK
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "question_bank.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Question bank file not found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if not isinstance(data, dict):
            raise ValueError("question_bank.json must be a JSON object (dictionary)")
        _QUESTION_BANK = data


def _score_answers(answers: Dict[str, int], version: str) -> Dict[str, float]:
    """Score raw answers into 0-100 OCEAN scores."""
    if version not in _QUESTION_BANK:
        raise ValueError(f"Unknown quiz version: {version}")

    quiz = _QUESTION_BANK[version]
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




@router.get("/quiz/version/{version}")
def get_quiz(version: str):
    if version not in _QUESTION_BANK:
        raise HTTPException(status_code=404, detail="Quiz version not found")
    return _QUESTION_BANK[version]


@router.post("/test/submit/{user_id}", response_model=schemas.ProfileResponse)
@limiter.limit("10/minute")
def submit_test(
    request: Request,
    user_id: str,
    payload: schemas.SubmitTestRequest,
    db: Session = Depends(get_db),
    _auth: models.User = Depends(verify_owns_resource),
):
    """Submit quiz answers. Recalculates Z-scores and archetype mapping."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.version not in _QUESTION_BANK:
        raise HTTPException(status_code=400, detail=f"Unknown quiz version: {payload.version}")
    expected = len(_QUESTION_BANK[payload.version]["questions"])
    if len(payload.answers) < expected:
        raise HTTPException(status_code=400, detail=f"Expected {expected} answers, got {len(payload.answers)}")

    ocean_scores = _score_answers(payload.answers, payload.version)
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

    rooms_service.auto_assign_rooms(db, user_id, ocean_scores)

    return schemas.ProfileResponse(
        user_id=profile.user_id,
        quiz_version=profile.quiz_version,
        scoring_version=profile.scoring_version,
        archetype_version=profile.archetype_version,
        scores=schemas.OceanScores(**profile.to_ocean_dict()),
        z_scores=schemas.OceanScores(**profile.to_z_dict()),
        primary_archetype=profile.primary_archetype,
        secondary_archetype=profile.secondary_archetype,
        is_public=profile.is_public,
    )
