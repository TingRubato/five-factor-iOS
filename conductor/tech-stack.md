# Tech Stack: Archetype

## Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI (for performance and modern API features)
- **Database ORM**: SQLAlchemy (for database abstraction)
- **Migrations**: Alembic (for database versioning)
- **Schemas**: Pydantic v2 (for data validation)
- **Dependency Management**: Poetry (for reliable builds and dependency resolution)
- **Authentication**: JWT (JSON Web Tokens) with `pyjwt`, `passlib`, and `bcrypt`

## Mobile
- **Framework**: React Native with Expo (for cross-platform development)
- **Navigation**: Expo Router (for file-based routing)
- **Language**: TypeScript (for type-safe UI development)
- **Animations**: React Native Reanimated (for high-performance UI motion)
- **HTTP Client**: Axios (for API communication)
- **State Management**: Zustand (as seen in `userStore.ts`)

## Infrastructure & Other
- **Database**: PostgreSQL (for robust relational data storage)
- **Psychometric Data**: IPIP-NEO questions and norms stored in JSON
- **CI/CD**: GitHub Actions (as seen in `.github/workflows`)
- **Linting & Formatting**: Black, isort, Ruff, ESLint (as seen in `pyproject.toml` and `mobile/package.json`)