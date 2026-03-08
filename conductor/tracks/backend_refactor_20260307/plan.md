# Implementation Plan: Backend Refactoring and Privacy Enforcement

## Phase 1: Router Decoupling
- [ ] Task: Create `backend/routers/` and split `main.py`.
    - [ ] Create `backend/routers/auth.py`.
    - [ ] Create `backend/routers/quiz.py`.
    - [ ] Create `backend/routers/profile.py`.
    - [ ] Create `backend/routers/feed.py`.
- [ ] Task: Update `main.py` to include newly created routers.
- [ ] Task: Conductor - User Manual Verification 'Router Decoupling'

## Phase 2: Reliability and Security
- [ ] Task: Implement Pydantic schema for question bank and move to startup lifespan.
- [ ] Task: Update error responses to use 409 Conflict for duplicates.
- [ ] Task: Enforce privacy for `GET /profile/{user_id}` based on `is_public`.
- [ ] Task: Conductor - User Manual Verification 'Reliability and Security'