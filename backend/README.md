# Archetype Backend

FastAPI-powered psychometric engine and social API.

## 🏛 Architecture

The backend is structured into three main layers:
- **API (`main.py`)**: REST endpoints for users, profiles, posts, and the psychometric feed.
- **Services**:
    - `scoring.py`: Z-score calculation and 12-archetype mapping engine.
    - `feed.py`: Personality-based ranking algorithm for community content.
- **Data (`models.py`, `schemas.py`)**: SQLAlchemy models and Pydantic validation schemas.

## 🔐 Security

- **Authentication**: JWT-based Bearer tokens.
- **Authorization**: Strict IDOR protection on all user-specific resources.
- **Validation**: Full Pydantic validation on all incoming request bodies.

## 🚀 Development

### Prerequisites
- Python 3.10+
- Poetry
- PostgreSQL

### Installation
```bash
poetry install
```

### Environment Variables
Create a `.env` file based on `.env.example`:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `SECRET_KEY`: Random hex string for JWT signing.
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins.

### Migrations
We use Alembic for database version control.
```bash
# Apply migrations
poetry run alembic upgrade head

# Generate new migration
PYTHONPATH=. poetry run alembic revision --autogenerate -m "description"
```

## 🧪 Testing
We use `pytest` for unit and integration testing.
```bash
PYTHONPATH=. poetry run pytest backend/tests
```

## 🔌 API Endpoints

- `POST /token`: Login and receive JWT.
- `POST /users/`: Create a new user.
- `GET /profile/{user_id}`: Fetch personality profile and compatibility.
- `POST /test/submit/{user_id}`: Submit quiz answers and calculate archetype.
- `GET /feed/`: Fetch personality-ranked content.
- `POST /posts/`: Create a new community post.
