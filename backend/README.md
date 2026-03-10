# Archetype API

FastAPI backend for a psychometric social media platform. Users take a Big Five personality quiz, receive an archetype classification, and interact in personality-aware social features (feed, rooms, arenas).

**Stack:** FastAPI, PostgreSQL, SQLAlchemy ORM, JWT auth (HS256), OAuth2 (Apple/Google), Phone OTP

## File Structure

```
backend/
├── main.py              # App setup, lifespan, health, /token endpoint
├── config.py            # Pydantic settings (DATABASE_URL, SECRET_KEY, CORS)
├── database.py          # SQLAlchemy engine + SessionLocal
├── auth.py              # JWT creation, password hashing, get_current_user
├── rate_limit.py        # slowapi limiter instance
├── models.py            # SQLAlchemy models (User, PersonalityProfile, Post, Topic, Room, RoomMembership, Arena, ArenaPost, ArenaVote)
├── schemas.py           # Pydantic request/response schemas
├── question_bank.json   # Quiz questions by version
├── routes/
│   ├── auth.py          # Apple/Google/Phone auth + guest migration
│   ├── users.py         # User CRUD (create, delete with full cascade)
│   ├── profiles.py      # Profile get/update/clear with privacy masking
│   ├── posts.py         # Post creation with personality snapshot
│   ├── feed.py          # Ranked feed (default/similar/opposing modes)
│   ├── quiz.py          # Quiz version serving + test submission + scoring
│   ├── rooms.py         # Room listing, membership, room posts
│   └── arenas.py        # Arena listing, posting, voting, results
├── services/
│   ├── scoring.py       # Z-score archetype engine (Top-2 strategy)
│   ├── feed.py          # Feed ranking algorithm (quality + personality + serendipity)
│   ├── psychometrics.py # Euclidean distance, compatibility score
│   ├── rooms.py         # Room management, auto-assignment, seed
│   ├── arenas.py        # Arena debates, side assignment, voting
│   ├── auth_service.py  # Social login verification, OTP, guest migration
│   └── sanitize.py      # Input sanitization (control chars, whitespace)
└── tests/
    ├── test_scoring.py      # 12 archetype determination tests
    ├── test_feed.py         # 7 feed ranking tests
    ├── test_otp.py          # 7 OTP security tests
    └── test_route_auth.py   # 8 auth enforcement tests
```

## API Endpoints

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| GET | `/` | No | -- | Welcome message |
| GET | `/health` | No | -- | DB connectivity check |
| POST | `/token` | No | 5/min | OAuth2 password login |
| POST | `/users/` | No | -- | Create user account |
| DELETE | `/users/{user_id}` | Yes (owner) | -- | Delete user + full cascade |
| GET | `/profile/{user_id}` | Yes | -- | Get profile (privacy-masked for non-owners) |
| PATCH | `/profile/{user_id}` | Yes (owner) | -- | Update profile (is_public) |
| DELETE | `/profile/{user_id}/scores` | Yes (owner) | -- | GDPR: clear psychometric data |
| POST | `/test/submit/{user_id}` | Yes (owner) | -- | Submit quiz answers, get archetype |
| GET | `/quiz/version/{version}` | No | -- | Get quiz questions by version |
| POST | `/posts/` | Yes | -- | Create post with personality snapshot |
| GET | `/feed/` | Yes (owner) | -- | Ranked feed (mode, limit, offset) |
| POST | `/api/auth/apple` | No | -- | Apple Sign In |
| POST | `/api/auth/google` | No | -- | Google Sign In |
| POST | `/api/auth/phone/send-otp` | No | 3/min | Send phone OTP |
| POST | `/api/auth/phone/verify` | No | 5/min | Verify phone OTP |
| POST | `/api/auth/migrate-guest` | Yes (owner) | -- | Migrate guest to full account |
| GET | `/api/rooms` | No | -- | List all rooms (cached 60s) |
| GET | `/api/rooms/{room_id}` | No | -- | Get room detail |
| GET | `/api/rooms/{room_id}/posts` | Yes | -- | Get room posts (paginated) |
| POST | `/api/rooms/{room_id}/posts` | Yes | -- | Create room post |
| POST | `/api/rooms/{room_id}/join` | Yes | -- | Join a room |
| GET | `/api/users/{user_id}/rooms` | Yes | -- | Get user's rooms |
| GET | `/api/arenas` | No | -- | List arenas (cached 30s) |
| GET | `/api/arenas/{arena_id}` | No | -- | Get arena detail + results |
| GET | `/api/arenas/{arena_id}/posts` | Yes | -- | Get arena posts (paginated) |
| POST | `/api/arenas/{arena_id}/posts` | Yes | -- | Post to arena (auto-side) |
| POST | `/api/arenas/{arena_id}/vote` | Yes | -- | Cast vote during voting phase |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | -- | PostgreSQL connection string |
| `SECRET_KEY` | Yes | -- | JWT signing key (generate with `openssl rand -hex 32`) |
| `ENV` | No | `production` | `production`, `development`, or `test` |
| `DEBUG` | No | `false` | Enable dev features (OTP dev_code) |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `43200` | Token TTL (default = 30 days) |
| `CORS_ORIGINS` | No | -- | Comma-separated allowed origins |

## Running

```bash
# Install dependencies
pip install -r requirements.txt  # or: poetry install

# Run dev server
ENV=development uvicorn backend.main:app --reload

# Run tests
PYTHONPATH=. pytest backend/tests/ -v
```

## GDPR Deletion

**Full account deletion** -- `DELETE /users/{user_id}` performs a cascade in order: RoomMembership, ArenaVote, ArenaPost, Post, PersonalityProfile, User.

**Score-only deletion** -- `DELETE /profile/{user_id}/scores` clears psychometric data while preserving the account.
