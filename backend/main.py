from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from backend import models, database
from backend import schemas
from backend.auth import create_access_token, verify_password
from backend.config import settings
from backend.rate_limit import limiter

from backend.routes.auth import router as auth_router
from backend.routes.rooms import router as rooms_router
from backend.routes.arenas import router as arenas_router
from backend.routes.users import router as users_router
from backend.routes.profiles import router as profiles_router
from backend.routes.posts import router as posts_router
from backend.routes.feed import router as feed_router
from backend.routes.quiz import router as quiz_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    from backend.routes.quiz import load_question_bank, _QUESTION_BANK
    try:
        load_question_bank()
        print(f"Question bank loaded successfully.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load question_bank.json: {e}")
        raise SystemExit(1)

    # Seed rooms and initial arena at startup
    db = database.SessionLocal()
    try:
        from backend.services import rooms as rooms_service
        from backend.services import arenas as arenas_service
        rooms_service.seed_rooms(db)
        arenas_service.seed_initial_arena(db)
    finally:
        db.close()

    yield


app = FastAPI(title=settings.APP_NAME, version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth_router, prefix="/api")
app.include_router(rooms_router, prefix="/api")
app.include_router(arenas_router, prefix="/api")
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(posts_router)
app.include_router(feed_router)
app.include_router(quiz_router)

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
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database connection failed")


# ── Token endpoint (kept in main for OAuth2 tokenUrl compatibility) ──

@app.post("/token")
@limiter.limit("5/minute")
def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}
