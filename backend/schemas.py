"""
Pydantic request/response schemas for the Archetype API.
"""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Request Models ────────────────────────────────────────────────────────────

class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)


class SubmitTestRequest(BaseModel):
    answers: Dict[str, int] = Field(
        ...,
        description="Map of question ID (as string) to Likert answer (1-5)",
    )
    version: str = Field("ipip-15-v1", description="Quiz version identifier")


class CreatePostRequest(BaseModel):
    user_id: str
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=5000)
    topic_id: Optional[str] = None


# ── Response Models ───────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    created_at: datetime


class OceanScores(BaseModel):
    O: float
    C: float
    E: float
    A: float
    N: float


class ProfileResponse(BaseModel):
    """Returned by GET /profile/{user_id} and POST /test/submit/{user_id}."""

    user_id: str
    version: str
    scores: OceanScores
    z_scores: OceanScores
    primary_archetype: str
    secondary_archetype: Optional[str] = None
    is_public: bool
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
