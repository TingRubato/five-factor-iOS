"""Profile routes — get, update, clear scores."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user
from backend.services import psychometrics

router = APIRouter(tags=["profiles"])


def _verify_user_id(user_id: str, current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this user ID",
        )
    return current_user


@router.get("/profile/{user_id}", response_model=schemas.ProfileResponse)
def get_profile(
    user_id: str,
    viewer_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _auth: models.User = Depends(get_current_user),
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
            result.scores = schemas.OceanScores(**profile.to_ocean_dict())

        if profile.z_o is not None:
            result.z_scores = schemas.OceanScores(**profile.to_z_dict())

    # If a viewer is specified and it's public (or owner), calculate compatibility
    if viewer_id and viewer_id != user_id and not should_mask:
        if viewer_id != _auth.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as viewer")
        viewer_profile = db.query(models.PersonalityProfile).filter(
            models.PersonalityProfile.user_id == viewer_id
        ).first()
        if viewer_profile:
            result.compatibility = psychometrics.calculate_compatibility_score(
                profile.to_ocean_dict(), viewer_profile.to_ocean_dict()
            )

    return result


@router.patch("/profile/{user_id}", response_model=schemas.ProfileResponse)
def update_profile(
    user_id: str,
    payload: schemas.UpdateProfileRequest,
    db: Session = Depends(get_db),
    _auth: models.User = Depends(_verify_user_id),
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
        scores=schemas.OceanScores(**profile.to_ocean_dict()),
        z_scores=schemas.OceanScores(**profile.to_z_dict()),
        primary_archetype=profile.primary_archetype,
        secondary_archetype=profile.secondary_archetype,
        is_public=profile.is_public,
    )


@router.delete("/profile/{user_id}/scores", status_code=204)
def clear_profile_scores(
    user_id: str,
    db: Session = Depends(get_db),
    _auth: models.User = Depends(_verify_user_id),
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
