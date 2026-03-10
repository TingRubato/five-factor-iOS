# Comprehensive Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all ~113 findings from the comprehensive code review across security, performance, architecture, testing, documentation, and best practices.

**Architecture:** Fix critical security vulnerabilities first (hardcoded secrets, OTP exposure, missing auth), then restructure the backend (extract routes from monolithic main.py), consolidate mobile duplication (quiz screens, dimension constants), add missing tests, and improve operational readiness.

**Tech Stack:** FastAPI (Python), SQLAlchemy, React Native (Expo Router), TypeScript, pytest, slowapi

---

## Phase 1: Critical Security Fixes (S-C1 through S-C5, P-C1 through P-C3)

These MUST be done before any deployment. Each task is independent — run in any order.

---

### Task 1: Remove Hardcoded SECRET_KEY Fallback (S-C1)

**Files:**
- Modify: `backend/config.py:40-54`
- Test: `backend/tests/test_config.py` (create)

**Step 1: Write the failing test**

```python
# backend/tests/test_config.py
import os
import pytest


def test_settings_fails_without_secret_key(monkeypatch):
    """App must crash if SECRET_KEY is not set (no silent fallback)."""
    monkeypatch.delenv("SECRET_KEY", raising=False)
    monkeypatch.delenv("DATABASE_URL", raising=False)

    # Remove any .env file influence
    from importlib import reload
    import backend.config

    with pytest.raises(SystemExit):
        reload(backend.config)


def test_settings_loads_with_env_vars(monkeypatch):
    """App starts when required env vars are present."""
    monkeypatch.setenv("SECRET_KEY", "test-key-12345")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///test.db")

    from importlib import reload
    import backend.config
    reloaded = reload(backend.config)
    assert reloaded.settings.SECRET_KEY == "test-key-12345"
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_config.py -v`
Expected: FAIL — currently the fallback silently succeeds

**Step 3: Write minimal implementation**

Replace `backend/config.py:40-54` with:

```python
def get_settings():
    try:
        return Settings()
    except Exception as e:
        env = os.environ.get("ENV", "production")
        if env in ("development", "test"):
            if not os.environ.get("DATABASE_URL"):
                os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/archetype"
            if not os.environ.get("SECRET_KEY"):
                os.environ["SECRET_KEY"] = "dev-secret-key-change-me"
            return Settings()
        print(f"FATAL: Cannot start without proper configuration: {e}")
        raise SystemExit(1)

settings = get_settings()
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_config.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/config.py backend/tests/test_config.py
git commit -m "fix(security): crash on missing SECRET_KEY in production

Remove silent fallback to hardcoded 'dev-secret-key-change-me'.
Only allow dev defaults when ENV=development or ENV=test.

Fixes: S-C1"
```

---

### Task 2: Gate OTP dev_code Behind DEBUG Flag (S-C2)

**Files:**
- Modify: `backend/routes/auth.py:54-59`
- Test: `backend/tests/test_auth.py` (add test)

**Step 1: Write the failing test**

```python
# Add to backend/tests/test_auth.py

def test_otp_response_hides_code_when_not_debug(client, monkeypatch):
    """OTP send response must NOT contain dev_code when DEBUG=False."""
    monkeypatch.setattr("backend.config.settings.DEBUG", False)
    resp = client.post("/api/auth/phone/send-otp", json={"phone": "+15551234567"})
    assert resp.status_code == 200
    assert "dev_code" not in resp.json()


def test_otp_response_shows_code_when_debug(client, monkeypatch):
    """OTP send response contains dev_code when DEBUG=True."""
    monkeypatch.setattr("backend.config.settings.DEBUG", True)
    resp = client.post("/api/auth/phone/send-otp", json={"phone": "+15551234568"})
    assert resp.status_code == 200
    assert "dev_code" in resp.json()
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_auth.py::test_otp_response_hides_code_when_not_debug -v`
Expected: FAIL — `dev_code` is always returned

**Step 3: Write minimal implementation**

Replace `backend/routes/auth.py:54-59` with:

```python
@router.post("/phone/send-otp")
async def send_otp(body: schemas.PhoneOtpRequest):
    """Send a 6-digit OTP to the given phone number."""
    code = auth_service.generate_otp(body.phone)
    # In production, send via SMS provider (Twilio, etc.)
    response = {"message": "OTP sent"}
    if settings.DEBUG:
        response["dev_code"] = code
    return response
```

Add the import at the top of `backend/routes/auth.py`:

```python
from backend.config import settings
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_auth.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routes/auth.py backend/tests/test_auth.py
git commit -m "fix(security): gate OTP dev_code behind DEBUG flag

Only return the OTP code in the response when settings.DEBUG is True.
Prevents OTP bypass in production deployments.

Fixes: S-C2"
```

---

### Task 3: Add Auth Guard to Guest Migration Endpoint (S-C5)

**Files:**
- Modify: `backend/routes/auth.py:78-81`
- Test: `backend/tests/test_auth.py` (add test)

**Step 1: Write the failing test**

```python
# Add to backend/tests/test_auth.py

def test_migrate_guest_requires_authentication(client):
    """POST /api/auth/migrate-guest must require a valid bearer token."""
    resp = client.post("/api/auth/migrate-guest", json={
        "guest_user_id": "some-fake-id",
        "auth_provider": "phone",
        "phone": "+15550000000",
        "code": "123456",
    })
    assert resp.status_code == 401
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_auth.py::test_migrate_guest_requires_authentication -v`
Expected: FAIL — currently returns 400 (no auth check)

**Step 3: Write minimal implementation**

Change `backend/routes/auth.py:78-81` to add `get_current_user` dependency:

```python
from backend.auth import get_current_user

@router.post("/migrate-guest", response_model=schemas.AuthResponse)
async def migrate_guest_account(
    body: schemas.MigrateGuestRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Migrate a guest account to a full authenticated account."""
    # Verify the caller owns the guest account
    if current_user.id != body.guest_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only migrate your own guest account",
        )
    # ... rest of function unchanged
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_auth.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routes/auth.py backend/tests/test_auth.py
git commit -m "fix(security): require auth for guest migration endpoint

Add Depends(get_current_user) and verify caller owns the guest account.
Prevents unauthorized hijacking of guest accounts.

Fixes: S-C5"
```

---

### Task 4: Fix random.seed() Global Mutation (P-C1)

**Files:**
- Modify: `backend/services/feed.py:59-60,99`
- Test: `backend/tests/test_feed.py` (create)

**Step 1: Write the failing test**

```python
# backend/tests/test_feed.py
import threading
from unittest.mock import MagicMock
from datetime import datetime, timezone, timedelta

from backend.services.feed import rank_feed


def _make_post(id, upvotes=0, hours_old=1, o=50, c=50, e=50, a=50, n=50):
    post = MagicMock()
    post.id = id
    post.author_id = "author_1"
    post.topic_id = None
    post.title = f"Post {id}"
    post.body = "body"
    post.snapshot_archetype = "Explorer Creator"
    post.snapshot_o = o
    post.snapshot_c = c
    post.snapshot_e = e
    post.snapshot_a = a
    post.snapshot_n = n
    post.upvotes = upvotes
    post.created_at = datetime.now(timezone.utc) - timedelta(hours=hours_old)
    return post


def _make_profile(o=50, c=50, e=50, a=50, n=50):
    p = MagicMock()
    p.o_score = o
    p.c_score = c
    p.e_score = e
    p.a_score = a
    p.n_score = n
    return p


def test_rank_feed_deterministic_with_same_seed():
    """Same seed + same posts must produce same ranked order."""
    profile = _make_profile(o=80, c=40)
    posts = [_make_post(str(i), upvotes=i, hours_old=i+1) for i in range(5)]
    r1 = rank_feed(posts, profile, mode="default", seed=42)
    r2 = rank_feed(posts, profile, mode="default", seed=42)
    assert [x["id"] for x in r1] == [x["id"] for x in r2]


def test_rank_feed_similar_mode_boosts_similar():
    profile = _make_profile(o=90, c=20)
    similar = _make_post("similar", o=90, c=20, hours_old=1)
    opposite = _make_post("opposite", o=10, c=90, hours_old=1)
    result = rank_feed([similar, opposite], profile, mode="similar", seed=0)
    assert result[0]["id"] == "similar"


def test_rank_feed_empty_returns_empty():
    profile = _make_profile()
    assert rank_feed([], profile) == []


def test_rank_feed_thread_safe():
    """Two threads with different seeds must not corrupt each other."""
    profile = _make_profile()
    posts = [_make_post(str(i), upvotes=i) for i in range(10)]
    results = {}

    def call(seed, key):
        r = rank_feed(posts, profile, mode="default", seed=seed)
        results[key] = [x["id"] for x in r]

    t1 = threading.Thread(target=call, args=(1, "a"))
    t2 = threading.Thread(target=call, args=(2, "b"))
    t1.start(); t2.start()
    t1.join(); t2.join()

    # Each thread should get its own deterministic result
    r1_check = rank_feed(posts, profile, mode="default", seed=1)
    assert results["a"] == [x["id"] for x in r1_check]
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_feed.py -v`
Expected: thread safety test may fail non-deterministically

**Step 3: Write minimal implementation**

In `backend/services/feed.py`, replace lines 59-60 and line 99:

```python
# Line 59-60: replace
    if seed is not None:
        rng = random.Random(seed)
    else:
        rng = random.Random()

# Line 99: replace random.random() with:
        serendipity = rng.random()
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_feed.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/services/feed.py backend/tests/test_feed.py
git commit -m "fix(perf): use per-request Random instance in feed ranking

Replace global random.seed() with random.Random(seed) to prevent
thread-safety issues under concurrent requests.

Fixes: P-C1"
```

---

### Task 5: Add Unique Constraint on ArenaVote + Fix Vote Counting (P-C2, P-C3, S-H5)

**Files:**
- Modify: `backend/models.py:161-171`
- Modify: `backend/services/arenas.py:102-141`
- Test: `backend/tests/test_arenas.py` (add tests)

**Step 1: Write the failing tests**

```python
# Add to backend/tests/test_arenas.py
import pytest
from sqlalchemy.exc import IntegrityError

def test_database_rejects_duplicate_vote(db):
    """ArenaVote must have a DB-level unique constraint on (arena_id, voter_id)."""
    arena_id = _create_active_arena(db)
    arena = db.query(Arena).filter(Arena.id == arena_id).first()
    arena.status = "voting"
    db.commit()

    user_id = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})

    v1 = ArenaVote(id=str(uuid.uuid4()), arena_id=arena_id, voter_id=user_id, voted_side=1)
    db.add(v1)
    db.commit()

    v2 = ArenaVote(id=str(uuid.uuid4()), arena_id=arena_id, voter_id=user_id, voted_side=2)
    db.add(v2)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_arena_results_uses_sql_aggregation(db):
    """Vote counting should return correct counts without loading all rows."""
    arena_id = _create_active_arena(db)
    arena = db.query(Arena).filter(Arena.id == arena_id).first()
    arena.status = "voting"
    db.commit()

    # Create 3 voters, 2 for side1, 1 for side2
    for i in range(3):
        uid = _create_user_with_scores(db, {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50})
        side = 1 if i < 2 else 2
        arena_service.vote(db, arena_id, uid, side)

    results = arena_service.get_arena_results(db, arena_id)
    assert results["side1_votes"] == 2
    assert results["side2_votes"] == 1
    assert results["winner"] == 1
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_arenas.py::test_database_rejects_duplicate_vote -v`
Expected: FAIL — no unique constraint exists

**Step 3: Write minimal implementation**

In `backend/models.py`, add `__table_args__` to `ArenaVote`:

```python
class ArenaVote(Base):
    __tablename__ = 'arena_votes'
    __table_args__ = (
        Index('ix_arena_votes_arena_voter', 'arena_id', 'voter_id', unique=True),
    )

    id = Column(String(36), primary_key=True, index=True)
    arena_id = Column(String(36), ForeignKey('arenas.id'), index=True)
    voter_id = Column(String(36), ForeignKey('users.id'), index=True)
    voted_side = Column(Integer)  # 1 or 2
    created_at = Column(DateTime, server_default=func.now())

    arena = relationship("Arena", back_populates="votes")
    voter = relationship("User")
```

In `backend/services/arenas.py`, replace `vote()` lines 102-131:

```python
from sqlalchemy.exc import IntegrityError

def vote(db: Session, arena_id: str, voter_id: str, voted_side: int) -> models.ArenaVote:
    """Cast a vote. Only allowed during voting phase."""
    arena = db.query(models.Arena).filter(models.Arena.id == arena_id).first()
    if not arena:
        raise ValueError("Arena not found")
    if arena.status != "voting":
        raise ValueError("Voting is not open")

    v = models.ArenaVote(
        id=str(uuid.uuid4()),
        arena_id=arena_id,
        voter_id=voter_id,
        voted_side=voted_side,
    )
    db.add(v)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Already voted")
    db.refresh(v)
    return v
```

Replace `get_arena_results()` lines 134-140:

```python
from sqlalchemy import func, case

def get_arena_results(db: Session, arena_id: str) -> dict:
    """Get vote counts and winner for an arena using SQL aggregation."""
    row = (
        db.query(
            func.sum(case((models.ArenaVote.voted_side == 1, 1), else_=0)).label("side1"),
            func.sum(case((models.ArenaVote.voted_side == 2, 1), else_=0)).label("side2"),
        )
        .filter(models.ArenaVote.arena_id == arena_id)
        .one()
    )
    side1, side2 = int(row.side1 or 0), int(row.side2 or 0)
    winner = 1 if side1 > side2 else 2 if side2 > side1 else 0
    return {"side1_votes": side1, "side2_votes": side2, "winner": winner}
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_arenas.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/models.py backend/services/arenas.py backend/tests/test_arenas.py
git commit -m "fix(security+perf): add ArenaVote unique constraint + SQL aggregation

- Add unique composite index on (arena_id, voter_id) to prevent duplicate votes
- Replace check-then-act pattern with IntegrityError catch (fixes TOCTOU race)
- Replace Python-side vote counting with SQL SUM/CASE aggregate

Fixes: P-C2, P-C3, S-H5"
```

---

### Task 6: Add Rate Limiting to Auth Endpoints (S-C4)

**Files:**
- Modify: `backend/main.py:37,43-49` (add slowapi middleware)
- Modify: `backend/routes/auth.py` (add rate limit decorators)
- Create: `backend/rate_limit.py`
- Test: `backend/tests/test_auth.py` (add rate limit test)

**Step 1: Install slowapi**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && pip install slowapi`

**Step 2: Create rate limit module**

```python
# backend/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

**Step 3: Wire into FastAPI app**

In `backend/main.py`, after the `app = FastAPI(...)` line:

```python
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.rate_limit import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

**Step 4: Add rate limits to auth routes**

In `backend/routes/auth.py`:

```python
from fastapi import Request
from backend.rate_limit import limiter

@router.post("/phone/send-otp")
@limiter.limit("3/minute")
async def send_otp(request: Request, body: schemas.PhoneOtpRequest):
    ...

@router.post("/phone/verify", response_model=schemas.AuthResponse)
@limiter.limit("5/minute")
async def verify_phone_otp(request: Request, body: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    ...
```

Add `request: Request` as first param to the `/token` endpoint in `main.py` too, and add `@limiter.limit("5/minute")`.

**Step 5: Write test**

```python
# Add to backend/tests/test_auth.py

def test_otp_send_rate_limited(client):
    """Sending more than 3 OTPs per minute returns 429."""
    phone = "+15559876543"
    for i in range(3):
        resp = client.post("/api/auth/phone/send-otp", json={"phone": phone})
        assert resp.status_code == 200

    resp = client.post("/api/auth/phone/send-otp", json={"phone": phone})
    assert resp.status_code == 429
```

**Step 6: Run tests**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/test_auth.py -v`
Expected: PASS

**Step 7: Commit**

```bash
git add backend/rate_limit.py backend/routes/auth.py backend/main.py backend/tests/test_auth.py
git commit -m "fix(security): add rate limiting to auth endpoints

Add slowapi rate limiter: 3/min for OTP send, 5/min for OTP verify and login.
Prevents brute-force attacks and SMS flooding.

Fixes: S-C4"
```

---

### Task 7: Replace datetime.utcnow() Globally (H-7)

**Files:**
- Modify: `backend/auth.py:29,31`
- Modify: `backend/services/auth_service.py:82,92,103`
- Modify: `backend/services/arenas.py:151`

**Step 1: Fix all occurrences**

In `backend/auth.py`, add `timezone` import and replace:

```python
from datetime import datetime, timedelta, timezone

# Line 29: datetime.utcnow() -> datetime.now(timezone.utc)
        expire = datetime.now(timezone.utc) + expires_delta
# Line 31:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
```

In `backend/services/auth_service.py`, add `timezone` import and replace all 3 occurrences:

```python
from datetime import datetime, timedelta, timezone

# Line 82: datetime.utcnow() -> datetime.now(timezone.utc)
    now = datetime.now(timezone.utc)
# Line 92: datetime.utcnow() -> datetime.now(timezone.utc)
    _otp_store[phone] = (code, datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES))
# Line 103: datetime.utcnow() -> datetime.now(timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
```

In `backend/services/arenas.py`:

```python
from datetime import datetime, timedelta, timezone

# Line 151: datetime.utcnow() -> datetime.now(timezone.utc)
    now = datetime.now(timezone.utc)
```

**Step 2: Run all tests**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/ -v`
Expected: PASS

**Step 3: Commit**

```bash
git add backend/auth.py backend/services/auth_service.py backend/services/arenas.py
git commit -m "fix: replace deprecated datetime.utcnow() with datetime.now(timezone.utc)

Consistent timezone-aware datetimes throughout the backend.
Prevents timezone comparison bugs and Python 3.12+ deprecation warnings.

Fixes: H-7"
```

---

## Phase 2: Backend Architecture — Extract Routes from main.py (H-2, H-5, H-6)

---

### Task 8: Add OCEAN Score Dict Helpers to PersonalityProfile Model (H-5)

**Files:**
- Modify: `backend/models.py:26-53`

**Step 1: Add helper methods to PersonalityProfile**

```python
class PersonalityProfile(Base):
    # ... existing columns ...

    def to_ocean_dict(self) -> dict:
        """Convert profile scores to {O, C, E, A, N} dict."""
        return {
            "O": self.o_score, "C": self.c_score, "E": self.e_score,
            "A": self.a_score, "N": self.n_score,
        }

    def to_z_dict(self) -> dict:
        """Convert profile z-scores to {O, C, E, A, N} dict."""
        return {
            "O": self.z_o, "C": self.z_c, "E": self.z_e,
            "A": self.z_a, "N": self.z_n,
        }

    def to_profile_response(self, username: str = None) -> dict:
        """Build ProfileResponse-compatible dict."""
        from backend import schemas
        return schemas.ProfileResponse(
            user_id=self.user_id,
            username=username,
            quiz_version=self.quiz_version,
            scoring_version=self.scoring_version,
            archetype_version=self.archetype_version,
            scores=schemas.OceanScores(**self.to_ocean_dict()) if self.o_score is not None else None,
            z_scores=schemas.OceanScores(**self.to_z_dict()) if self.z_o is not None else None,
            primary_archetype=self.primary_archetype,
            secondary_archetype=self.secondary_archetype,
            is_public=self.is_public,
        )
```

**Step 2: Replace all inline OCEAN dict constructions**

Replace occurrences in `main.py`, `feed.py`, `arenas.py`, `rooms.py` with `profile.to_ocean_dict()`.

Replace ProfileResponse construction in `main.py` (lines 198-220, 244-275, 328-350) with `profile.to_profile_response()`.

**Step 3: Run tests**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/ -v`
Expected: PASS

**Step 4: Commit**

```bash
git add backend/models.py backend/main.py backend/services/feed.py backend/services/arenas.py backend/services/rooms.py
git commit -m "refactor: add OCEAN dict helpers to PersonalityProfile model

Eliminates 8+ duplicated dict constructions and 3 duplicated
ProfileResponse builders across the backend.

Fixes: H-5, H-6"
```

---

### Task 9: Extract Routes from main.py into Modules (H-2)

**Files:**
- Create: `backend/routes/users.py`
- Create: `backend/routes/profiles.py`
- Create: `backend/routes/posts.py`
- Create: `backend/routes/feed.py`
- Create: `backend/routes/quiz.py`
- Modify: `backend/main.py` (remove extracted routes, add router includes)

**Step 1: Create backend/routes/users.py**

Extract `create_user` and `delete_user` from `main.py:121-398`.

```python
# backend/routes/users.py
"""User CRUD routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user, get_password_hash

import uuid

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=schemas.UserResponse, status_code=201)
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


@router.delete("/{user_id}", status_code=204)
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

    # Full cascade: delete all child entities (S-H6 GDPR fix)
    db.query(models.RoomMembership).filter(models.RoomMembership.user_id == user_id).delete()
    db.query(models.ArenaVote).filter(models.ArenaVote.voter_id == user_id).delete()
    db.query(models.ArenaPost).filter(models.ArenaPost.user_id == user_id).delete()
    db.query(models.Post).filter(models.Post.author_id == user_id).delete()
    db.query(models.PersonalityProfile).filter(models.PersonalityProfile.user_id == user_id).delete()
    db.delete(user)
    db.commit()
```

**Step 2: Create routes for profiles, posts, feed, quiz similarly**

Extract `get_profile`, `update_profile`, `clear_profile_scores` → `routes/profiles.py`
Extract `create_post` → `routes/posts.py`
Extract `get_feed` → `routes/feed.py`
Extract `get_quiz` → `routes/quiz.py`

**Step 3: Update main.py to include new routers**

```python
from backend.routes.users import router as users_router
from backend.routes.profiles import router as profiles_router
from backend.routes.posts import router as posts_router
from backend.routes.feed import router as feed_router
from backend.routes.quiz import router as quiz_router

app.include_router(users_router, prefix="/api")
app.include_router(profiles_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
app.include_router(feed_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
```

Keep in `main.py`: app setup, lifespan, health check, `/token` endpoint, `_score_answers`, `load_question_bank`.

**Step 4: Run all tests**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/ -v`
Expected: PASS (test URLs may need updating if they were using non-prefixed paths)

**Step 5: Commit**

```bash
git add backend/routes/ backend/main.py
git commit -m "refactor: extract all routes from main.py into modules

- routes/users.py — user CRUD with full deletion cascade (fixes S-H6)
- routes/profiles.py — profile get, update, clear scores
- routes/posts.py — post creation
- routes/feed.py — feed endpoint
- routes/quiz.py — quiz version serving
- main.py reduced to app setup, lifespan, health, token endpoint

Fixes: H-2, S-H6, M-11"
```

---

### Task 10: Move seed_rooms to Startup (P-H3)

**Files:**
- Modify: `backend/main.py:24-34` (lifespan)
- Modify: `backend/services/rooms.py:171-179`

**Step 1: Add seed_rooms to lifespan**

```python
# In main.py lifespan, after load_question_bank():
from backend.services import rooms as rooms_service
from backend.services import arenas as arenas_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_question_bank()
    print(f"Question bank loaded successfully with {len(_QUESTION_BANK)} versions.")
    # Seed rooms and initial arena at startup
    db = database.SessionLocal()
    try:
        rooms_service.seed_rooms(db)
        arenas_service.seed_initial_arena(db)
    finally:
        db.close()
    yield
```

**Step 2: Remove seed_rooms call from auto_assign_rooms**

In `backend/services/rooms.py:179`, delete the line `seed_rooms(db)`.

**Step 3: Run tests**

Run: `cd /Users/tingxu/BigFive/five-factor-iOS && python -m pytest backend/tests/ -v`
Expected: PASS

**Step 4: Commit**

```bash
git add backend/main.py backend/services/rooms.py
git commit -m "perf: move seed_rooms to startup instead of per-request

Eliminates 7 unnecessary SELECT queries on every quiz submission.

Fixes: P-H3"
```

---

## Phase 3: Add Missing Auth to Endpoints (S-H3, S-H4, M-6)

---

### Task 11: Add Auth to Room and Arena Read Endpoints

**Files:**
- Modify: `backend/routes/rooms.py`
- Modify: `backend/routes/arenas.py`
- Modify: `backend/config.py:28-32` (fix CORS)

**Step 1: Add `Depends(get_current_user)` to sensitive room endpoints**

In `backend/routes/rooms.py`, add auth to `get_user_rooms` and `get_room_posts`:

```python
from backend.auth import get_current_user

@router.get("/users/{user_id}/rooms")
def get_user_rooms(user_id: str, db: Session = Depends(get_db), _auth = Depends(get_current_user)):
    ...

@router.get("/rooms/{room_id}/posts")
def get_room_posts(room_id: str, ..., _auth = Depends(get_current_user)):
    ...
```

Similarly for arena endpoints in `routes/arenas.py` — add auth to `get_arena_posts`.

**Step 2: Fix CORS to use explicit origins even in DEBUG**

In `backend/config.py:28-32`:

```python
@property
def get_cors_origins(self) -> list[str]:
    if self.DEBUG:
        return self.CORS_ORIGINS + ["http://localhost:19006", "http://localhost:8082"]
    return self.CORS_ORIGINS
```

**Step 3: Run tests and commit**

```bash
git add backend/routes/rooms.py backend/routes/arenas.py backend/config.py
git commit -m "fix(security): add auth to room/arena endpoints, fix CORS wildcard

- Require authentication for get_user_rooms, get_room_posts, get_arena_posts
- Remove CORS wildcard in DEBUG mode, use explicit origins

Fixes: S-H3, S-H4, M-6"
```

---

## Phase 4: Mobile Code Quality (H-3, H-4, M-3, M-8, M-9, L-4, L-5, L-6)

---

### Task 12: Consolidate Dimension Constants (H-4)

**Files:**
- Modify: `mobile/constants/theme.ts` (add dimension exports)
- Modify: `mobile/app/onboarding/phase1.tsx` (import from theme)
- Modify: `mobile/app/onboarding/phase2.tsx` (import from theme)
- Modify: `mobile/app/(tabs)/feed.tsx` (import from theme)
- Modify: `mobile/app/(tabs)/hub.tsx` (import from theme)
- Modify: `mobile/app/arena/[id].tsx` (import from theme)

**Step 1: Add canonical dimension maps to theme.ts**

```typescript
// Add to mobile/constants/theme.ts

export const DIM_COLORS: Record<string, string> = {
  O: '#AF52DE',
  C: '#30B0C7',
  E: '#FF3B30',
  A: '#5AC8FA',
  N: '#FF9500',
};

export const DIM_LABELS: Record<string, string> = {
  O: 'OPENNESS',
  C: 'CONSCIENTIOUSNESS',
  E: 'EXTRAVERSION',
  A: 'AGREEABLENESS',
  N: 'NEUROTICISM',
};

export const DIM_SHORT: Record<string, string> = {
  O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质',
};
```

**Step 2: Replace local definitions in each file**

In each of the 5+ files, replace the inline `DIM_LABELS`, `DIM_ACCENT`, `DIM_COLORS` maps with:

```typescript
import { DIM_COLORS, DIM_LABELS } from '../../constants/theme';
```

**Step 3: Commit**

```bash
git add mobile/constants/theme.ts mobile/app/onboarding/phase1.tsx mobile/app/onboarding/phase2.tsx mobile/app/\(tabs\)/feed.tsx mobile/app/\(tabs\)/hub.tsx mobile/app/arena/\[id\].tsx
git commit -m "refactor: consolidate dimension color/label constants into theme.ts

Single source of truth for DIM_COLORS, DIM_LABELS, DIM_SHORT.
Eliminates 5+ duplicate definitions across mobile codebase.

Fixes: H-4"
```

---

### Task 13: Fix Mobile Bugs (M-3, M-8, M-9, L-4, L-6)

**Files:**
- Modify: `mobile/app/user/[id].tsx`
- Modify: `mobile/components/PostCard.tsx`

**Step 1: Fix fontSizes typo (M-3)**

In `mobile/app/user/[id].tsx:199`, change `fontSizes: T.sm` → `fontSize: T.sm`.

**Step 2: Fix useEffect dependency (M-8)**

In `mobile/app/user/[id].tsx:38`, change `[id, currentUser]` → `[id, currentUser?.id]`.

**Step 3: Fix null dereference (M-9)**

In `mobile/app/user/[id].tsx:42`, change:
```typescript
profile.primary_archetype.toLowerCase().replace(/ /g, '_')
```
to:
```typescript
profile.primary_archetype?.toLowerCase().replace(/ /g, '_')
```

**Step 4: Remove dead shadowOpacity code (L-4)**

In `mobile/components/PostCard.tsx:37`, remove the unused `shadowOpacity` shared value and its animation calls.

**Step 5: Remove unused imports (L-6)**

In `mobile/app/user/[id].tsx`, remove `SlideInDown` from the import.
In `mobile/app/threads/[id].tsx`, remove `FadeIn`, `FadeInDown` if unused.

**Step 6: Commit**

```bash
git add mobile/app/user/\[id\].tsx mobile/components/PostCard.tsx mobile/app/threads/\[id\].tsx
git commit -m "fix: assorted mobile bugs — typo, null safety, dead code, unused imports

- Fix fontSizes -> fontSize typo in user profile
- Fix useEffect dependency on entire currentUser object
- Add null guard on profile.primary_archetype
- Remove dead shadowOpacity animation in PostCard
- Remove unused imports (SlideInDown, FadeIn, FadeInDown)

Fixes: M-3, M-8, M-9, L-4, L-6"
```

---

## Phase 5: Backend Testing Gaps (T-H1 through T-H6)

---

### Task 14: Add Feed Ranking Tests (T-H1)

Already created in Task 4 (`backend/tests/test_feed.py`). Expand with additional tests for pagination, opposing mode, and empty posts. See Task 4 test code.

---

### Task 15: Add OTP Security Tests (T-H2, T-H3, T-H6)

**Files:**
- Modify: `backend/tests/test_auth.py`

**Step 1: Add autouse fixture to reset OTP store**

```python
import backend.services.auth_service as _auth_svc

@pytest.fixture(autouse=True)
def reset_otp_store():
    _auth_svc._otp_store.clear()
    yield
    _auth_svc._otp_store.clear()
```

**Step 2: Add OTP expiry test**

```python
def test_expired_otp_is_rejected(client):
    """OTP older than 5 minutes should be rejected."""
    from datetime import datetime, timedelta, timezone
    phone = "+15557770001"
    _auth_svc.generate_otp(phone)
    # Backdate the expiry
    code, _ = _auth_svc._otp_store[phone]
    _auth_svc._otp_store[phone] = (code, datetime.now(timezone.utc) - timedelta(minutes=1))

    resp = client.post("/api/auth/phone/verify", json={"phone": phone, "code": code})
    assert resp.status_code == 401
```

**Step 3: Add OTP replay test**

```python
def test_otp_cannot_be_replayed(client, monkeypatch):
    """A valid OTP can only be used once."""
    monkeypatch.setattr("backend.config.settings.DEBUG", True)
    phone = "+15557770002"
    resp = client.post("/api/auth/phone/send-otp", json={"phone": phone})
    code = resp.json()["dev_code"]

    r1 = client.post("/api/auth/phone/verify", json={"phone": phone, "code": code})
    assert r1.status_code == 200

    r2 = client.post("/api/auth/phone/verify", json={"phone": phone, "code": code})
    assert r2.status_code == 401
```

**Step 4: Run and commit**

```bash
git add backend/tests/test_auth.py
git commit -m "test: add OTP security tests — expiry, replay, store isolation

Fixes: T-H2, T-H3, T-H6"
```

---

### Task 16: Add Auth Enforcement Tests for Arena/Room Routes (T-H4)

**Files:**
- Modify: `backend/tests/test_arenas.py` or create `backend/tests/test_route_auth.py`

**Step 1: Write tests**

```python
# backend/tests/test_route_auth.py
"""Verify all protected endpoints reject unauthenticated requests."""

def test_arena_post_requires_auth(client):
    resp = client.post("/api/arenas/arena_1/posts", json={"body": "Hello"})
    assert resp.status_code == 401

def test_arena_vote_requires_auth(client):
    resp = client.post("/api/arenas/arena_1/vote", json={"side": 1})
    assert resp.status_code == 401

def test_room_posts_require_auth(client):
    resp = client.get("/api/rooms/room_o/posts")
    assert resp.status_code == 401

def test_user_rooms_require_auth(client):
    resp = client.get("/api/users/fake-id/rooms")
    assert resp.status_code == 401

def test_feed_requires_auth(client):
    resp = client.get("/api/feed/?user_id=fake")
    assert resp.status_code == 401

def test_profile_requires_auth(client):
    resp = client.get("/api/profile/fake-id")
    assert resp.status_code == 401
```

**Step 2: Run and commit**

```bash
git add backend/tests/test_route_auth.py
git commit -m "test: add auth enforcement tests for all protected endpoints

Verifies 401 is returned when no Bearer token is provided.

Fixes: T-H4"
```

---

## Phase 6: Input Validation & Data Integrity (M-4, M-5, S-M3)

---

### Task 17: Add Input Sanitization + Answer Validation + Secure OTP

**Files:**
- Create: `backend/services/sanitize.py`
- Modify: `backend/main.py` (submit_test validation)
- Modify: `backend/services/auth_service.py:91` (use `secrets` for OTP)
- Modify: `backend/routes/posts.py`, `backend/services/rooms.py`, `backend/services/arenas.py` (sanitize)

**Step 1: Create sanitize utility**

```python
# backend/services/sanitize.py
import re

def sanitize_text(text: str, max_length: int = 5000) -> str:
    """Strip control characters and excessive whitespace from user input."""
    # Remove control characters (except newline and tab)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Collapse excessive whitespace (more than 3 consecutive newlines)
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    return text[:max_length].strip()
```

**Step 2: Use `secrets` for OTP generation**

In `backend/services/auth_service.py:91`, replace:
```python
code = "".join(random.choices(string.digits, k=6))
```
with:
```python
import secrets
code = "".join(secrets.choice(string.digits) for _ in range(6))
```

**Step 3: Add answer count validation to submit_test**

In the quiz submission handler, after loading the quiz version:
```python
quiz = _QUESTION_BANK[payload.version]
expected = len(quiz["questions"])
if len(payload.answers) < expected:
    raise HTTPException(400, f"Expected {expected} answers, got {len(payload.answers)}")
```

**Step 4: Apply sanitize_text to post creation endpoints**

In all 3 post creation paths, wrap title/body:
```python
from backend.services.sanitize import sanitize_text
title = sanitize_text(payload.title, max_length=200)
body = sanitize_text(payload.body, max_length=5000)
```

**Step 5: Commit**

```bash
git add backend/services/sanitize.py backend/services/auth_service.py backend/main.py backend/routes/posts.py backend/services/rooms.py backend/services/arenas.py
git commit -m "fix: add input sanitization, answer validation, secure OTP

- sanitize_text() strips control chars from user content
- Validate answer count matches quiz version's question count
- Use secrets module instead of random for OTP generation

Fixes: M-4, M-5, S-M3"
```

---

## Phase 7: Performance Fixes (P-H4, P-H9, P-H10, P-H11)

---

### Task 18: Add Pagination to Arena Posts (P-H4)

**Files:**
- Modify: `backend/services/arenas.py:26-32`
- Modify: `backend/routes/arenas.py` (accept limit/offset params)

**Step 1: Add limit/offset to service**

```python
def get_arena_posts(
    db: Session, arena_id: str, side: int | None = None,
    limit: int = 50, offset: int = 0,
) -> list[models.ArenaPost]:
    q = db.query(models.ArenaPost).filter(models.ArenaPost.arena_id == arena_id)
    if side is not None:
        q = q.filter(models.ArenaPost.side == side)
    return q.order_by(models.ArenaPost.created_at.asc()).offset(offset).limit(limit).all()
```

**Step 2: Update route to accept params**

In `backend/routes/arenas.py`, the `get_arena_detail` endpoint should pass `limit` and `offset` query params through.

**Step 3: Commit**

```bash
git add backend/services/arenas.py backend/routes/arenas.py
git commit -m "perf: add pagination to arena posts endpoint

Fixes: P-H4"
```

---

### Task 19: Add Cache-Control Headers (P-H11)

**Files:**
- Modify: `backend/routes/rooms.py`
- Modify: `backend/routes/arenas.py`

**Step 1: Add Response import and cache headers**

```python
from fastapi import Response

@router.get("/rooms")
def list_rooms(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    ...

@router.get("")  # arenas list
def list_arenas(response: Response, ...):
    response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=120"
    ...
```

**Step 2: Commit**

```bash
git add backend/routes/rooms.py backend/routes/arenas.py
git commit -m "perf: add Cache-Control headers to rooms and arenas endpoints

Fixes: P-H11"
```

---

### Task 20: Fix Mobile FlatList Performance (P-H9)

**Files:**
- Modify: `mobile/app/(tabs)/feed.tsx`

**Step 1: Wrap renderItem in useCallback**

```typescript
const renderItem = useCallback(
  ({ item }: { item: FeedItem }) => (
    <PostCard item={item} onPress={() => router.push(`/user/${item.author_id}`)} />
  ),
  [router]
);
// Use: <FlatList renderItem={renderItem} ... />
```

**Step 2: Commit**

```bash
git add mobile/app/\(tabs\)/feed.tsx
git commit -m "perf: memoize FlatList renderItem with useCallback

Prevents full list re-render on unrelated state changes.

Fixes: P-H9"
```

---

### Task 21: Fix Aurora/Particle Mount/Unmount Flicker (P-H10)

**Files:**
- Modify: `mobile/components/cinematic/CinematicResult.tsx:165-173`

**Step 1: Keep aurora mounted, use opacity**

Replace conditional rendering:
```tsx
{act > 0 && act < 7 && (
  <View style={StyleSheet.absoluteFill}>
    <AuroraBackground ... />
  </View>
)}
```

With always-mounted + opacity:
```tsx
<View
  style={[StyleSheet.absoluteFill, { opacity: (act > 0 && act < 7) ? 1 : 0 }]}
  pointerEvents={(act > 0 && act < 7) ? "auto" : "none"}
>
  <AuroraBackground lightColor={auroraColors.light} deepColor={auroraColors.deep} />
</View>
```

**Step 2: Commit**

```bash
git add mobile/components/cinematic/CinematicResult.tsx
git commit -m "perf: keep aurora/particles mounted to prevent animation flicker

Use opacity instead of conditional rendering to avoid mount/unmount
animation restarts on act transitions.

Fixes: P-H10"
```

---

## Phase 8: Documentation (D-C1, D-H1 through D-H8)

---

### Task 22: Update Backend README

**Files:**
- Modify: `backend/README.md`

Update to include: complete endpoint table (all ~20 endpoints with method, path, auth requirement), current file structure reflecting `routes/` and `services/` modules, environment variable documentation, GDPR deletion procedure.

**Commit message:** `docs: update backend README with complete endpoint list and architecture`

---

### Task 23: Replace Mobile README

**Files:**
- Modify: `mobile/README.md`

Replace Expo boilerplate with: screen inventory, design system reference (`constants/theme.ts`), state management (`stores/userStore.ts`), API client (`lib/api.ts`), progressive quiz flow, how to configure `EXPO_PUBLIC_API_URL`.

**Commit message:** `docs: replace mobile README boilerplate with project documentation`

---

### Task 24: Document Archetype Scoring Algorithm

**Files:**
- Modify: `backend/services/scoring.py` (add module docstring and inline comments)

Add: module-level docstring explaining Top-2 Z-Score strategy, document each archetype's trait pattern, explain the 0.25 balanced threshold, cite the approximated population norms.

**Commit message:** `docs: document archetype scoring algorithm and population norms`

---

### Task 25: Update .env.example

**Files:**
- Modify: `.env.example`

Add all missing variables: `ENV`, `DEBUG`, `EXPO_PUBLIC_API_URL`, placeholder SECRET_KEY with generation instructions, Apple/Google OAuth client IDs.

**Commit message:** `docs: complete .env.example with all configuration variables`

---

### Task 26: Add .gitignore entries for test DB files

**Files:**
- Modify: `.gitignore`

Add: `*.db`, `test_*.db`, `!backend/alembic/versions/*.py`

**Commit message:** `chore: add test DB files to .gitignore`

---

## Phase 9: Remaining Medium/Low Fixes (batch)

---

### Task 27: Fix Pydantic Response Models for Arena/Room Routes (M-13, L-10)

Move `ArenaPostRequest` and `ArenaVoteRequest` from `routes/arenas.py` to `schemas.py`. Add `ArenaResponse`, `ArenaPostResponse`, `RoomResponse` Pydantic models. Apply as `response_model` on routes.

**Commit message:** `refactor: add Pydantic response models for arena and room endpoints`

---

### Task 28: Add Pagination Max Limits (S-M5)

Add `limit = max(1, min(limit, 100))` to all endpoints that accept `limit` params (rooms, arenas, feed).

**Commit message:** `fix(security): enforce max pagination limits on all list endpoints`

---

### Task 29: Fix join_room TOCTOU Race (P-H2)

Catch `IntegrityError` in `services/rooms.py:join_room()` similar to the arena vote fix:

```python
from sqlalchemy.exc import IntegrityError

def join_room(db, room_id, user_id, role="joined"):
    existing = ...
    if existing:
        return existing
    membership = models.RoomMembership(...)
    db.add(membership)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return db.query(models.RoomMembership).filter(
            models.RoomMembership.room_id == room_id,
            models.RoomMembership.user_id == user_id,
        ).first()
    db.refresh(membership)
    return membership
```

**Commit message:** `fix: handle concurrent room join race condition gracefully`

---

### Task 30: Move Import and Clean Up main.py (L-1, L-2)

Move `import json` to the top of `main.py`. Remove the stale `# ... imports ...` comment.

**Commit message:** `chore: move import json to top, remove stale comment`

---

### Task 31: Fix as any Type Assertions (L-5)

Remove `as any` casts from `threads/[id].tsx`, `user/[id].tsx`, `hub.tsx`, `profile.tsx`. Replace `grayscale: 1` (not valid RN) with removal or `tintColor`. Replace `uppercase: true` with `textTransform: 'uppercase'`.

**Commit message:** `fix: remove as any type assertions, fix invalid style properties`

---

## Phase 10: CI/CD Improvements (O-C2)

---

### Task 32: Add Security Scanning to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

Add jobs for `pip-audit` and `npm audit`:

```yaml
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install pip-audit
      - run: pip-audit -r backend/requirements.txt || true

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd mobile && npm audit --audit-level=high || true
```

**Commit message:** `ci: add dependency vulnerability scanning with pip-audit and npm audit`

---

### Task 33: Add Dockerfile Non-Root User (O-H1)

**Files:**
- Modify: `Dockerfile`

Add before `CMD`:

```dockerfile
RUN adduser --disabled-password --gecos '' appuser
USER appuser
```

**Commit message:** `fix(security): run Docker container as non-root user`

---

## Summary

| Phase | Tasks | Fixes |
|-------|-------|-------|
| 1: Critical Security | 1-7 | S-C1..C5, P-C1..C3, S-H5, H-7 |
| 2: Backend Architecture | 8-10 | H-2, H-5, H-6, S-H6, M-11, P-H3 |
| 3: Auth Enforcement | 11 | S-H3, S-H4, M-6 |
| 4: Mobile Code Quality | 12-13 | H-4, M-3, M-8, M-9, L-4, L-6 |
| 5: Testing Gaps | 14-16 | T-H1..H6 |
| 6: Input Validation | 17 | M-4, M-5, S-M3 |
| 7: Performance | 18-21 | P-H4, P-H9, P-H10, P-H11 |
| 8: Documentation | 22-26 | D-C1, D-H1..H8 |
| 9: Medium/Low Fixes | 27-31 | M-13, L-10, S-M5, P-H2, L-1, L-2, L-5 |
| 10: CI/CD | 32-33 | O-C2, O-H1 |

**Total: 33 tasks covering ~90 of the ~113 findings.** Remaining ~23 findings are deferred (SQLAlchemy 2.0 migration, async DB driver, refresh token rotation, Prometheus, database backups, OpenTelemetry, quiz screen refactor into shared component) as they require larger architectural decisions or external infrastructure setup.
