# Track Specification: Backend Refactoring and Privacy Enforcement

## Objective
To refactor the monolith `backend/main.py` into specialized routers, improve question bank loading with better error handling, and strictly enforce profile privacy.

## Core Refactor (Backend)
- **Router Decoupling**: Extract auth, quiz, profile, and feed into `backend/routers/`.
- **Startup Lifespan**: Move question bank initialization to FastAPI's `lifespan` event.
- **Schema Validation**: Use Pydantic to validate `question_bank.json` structure.
- **Privacy Enforcement**: Implement 403/404 for `is_public == false` profiles.
- **Error Codes**: Update duplicate user/email returns to 409 Conflict.