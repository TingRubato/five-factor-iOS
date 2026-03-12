"""
Pydantic request/response schemas for the Archetype API.
"""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator


# ── Request Models ────────────────────────────────────────────────────────────

class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)


class SubmitTestRequest(BaseModel):
    answers: Dict[str, int] = Field(
        ...,
        description="Map of question ID (as string) to Likert answer (1-5)",
    )
    version: str = Field("ipip-15-v1", description="Quiz version identifier")

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, v: Dict[str, int]) -> Dict[str, int]:
        for qid, score in v.items():
            if not (1 <= score <= 5):
                raise ValueError(f"Answer for question {qid} must be between 1 and 5")
            if not qid.isdigit():
                raise ValueError(f"Question ID {qid} must be a numeric string")
        return v


class UpdateProfileRequest(BaseModel):
    is_public: Optional[bool] = None


class AppleAuthRequest(BaseModel):
    identity_token: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class PhoneOtpRequest(BaseModel):
    phone: str = Field(..., min_length=8, max_length=20)


class VerifyOtpRequest(BaseModel):
    phone: str = Field(..., min_length=8, max_length=20)
    code: str = Field(..., min_length=6, max_length=6)


class MigrateGuestRequest(BaseModel):
    guest_user_id: str
    auth_provider: str  # "apple" | "google" | "phone"
    auth_token: Optional[str] = None  # identity/id token for social
    phone: Optional[str] = None
    code: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: "UserResponse"
    is_new: bool = False


class CreatePostRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=5000)
    topic_id: Optional[str] = None


class ArenaPostRequest(BaseModel):
    body: str = Field(..., min_length=1, max_length=5000)
    force_side: Optional[int] = Field(None, ge=1, le=2)  # 1 or 2, null = auto-assign


class ArenaVoteRequest(BaseModel):
    side: int = Field(..., ge=1, le=2)  # 1 or 2


# ── Response Models ───────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: Optional[str] = None
    is_guest: bool = True
    auth_provider: Optional[str] = None
    created_at: datetime


class OceanScores(BaseModel):
    O: float
    C: float
    E: float
    A: float
    N: float


class ProfileResponse(BaseModel):
    """
    Standard profile response. 
    Fields like 'scores' and 'z_scores' are optional to allow for privacy masking.
    """
    user_id: str
    username: Optional[str] = None
    quiz_version: Optional[str] = None
    primary_archetype: Optional[str] = None
    secondary_archetype: Optional[str] = None
    is_public: bool
    
    # Sensitive psychometric data
    scores: Optional[OceanScores] = None
    z_scores: Optional[OceanScores] = None
    
    # Meta
    scoring_version: Optional[str] = None
    archetype_version: Optional[str] = None
    compatibility: Optional[int] = None  # only present when viewer_id is supplied


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    author_id: str
    topic_id: Optional[str] = None
    title: str
    body: str
    snapshot_archetype: Optional[str] = None
    snapshot_o: Optional[float] = None
    snapshot_c: Optional[float] = None
    snapshot_e: Optional[float] = None
    snapshot_a: Optional[float] = None
    snapshot_n: Optional[float] = None
    upvotes: int
    created_at: datetime


class FeedItemResponse(BaseModel):
    """A ranked feed item — includes full post data plus rank_score."""

    id: str
    author_id: str
    topic_id: Optional[str] = None
    title: str
    body: str
    snapshot_archetype: Optional[str] = None
    snapshot_o: Optional[float] = None
    snapshot_c: Optional[float] = None
    snapshot_e: Optional[float] = None
    snapshot_a: Optional[float] = None
    snapshot_n: Optional[float] = None
    upvotes: int
    created_at: datetime
    rank_score: float


class PaginationMeta(BaseModel):
    limit: int
    offset: int
    returned: int


class FeedPageResponse(BaseModel):
    """Paginated feed response envelope."""

    items: List[FeedItemResponse]
    pagination: PaginationMeta


class RoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    dimension: Optional[str] = None
    name: str
    name_zh: Optional[str] = None
    description: Optional[str] = None
    room_type: str
    color: str
    member_count: int = 0


class ArenaPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    arena_id: str
    user_id: str
    side: int
    body: str
    is_defector: bool = False
    created_at: Optional[datetime] = None


class ArenaResponse(BaseModel):
    id: str
    topic: str
    topic_zh: Optional[str] = None
    dim1: Optional[str] = None
    dim2: Optional[str] = None
    side1_label: Optional[str] = None
    side2_label: Optional[str] = None
    status: str
    starts_at: Optional[datetime] = None
    voting_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    side1_count: int = 0
    side2_count: int = 0
