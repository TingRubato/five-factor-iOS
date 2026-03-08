# Project Requirements: Archetype

## Core MVP Features
- **IPIP-NEO Engine**: Robust parsing and scoring of 120/300 question banks.
- **Onboarding Quiz**: Two-phase React Native implementation with progress tracking.
- **Profile System**: Archetype assignment, radar chart visualization, and privacy controls.
- **Personality Feed**: Discovery modes with psychometric ranking.

## Backend Refactoring (Priority)
- **Router Decoupling**: Split main.py into auth, quiz, profile, and feed routers.
- **Startup Lifespan**: Move question bank initialization to startup lifecycle with validation.
- **Schema Validation**: Add Pydantic validation for question banks.
- **Privacy Enforcement**: Implement 403/404 logic for restricted profiles.