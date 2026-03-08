# Archetype

A psychometric social media platform where personality is the primary filter for community interaction. Built with React Native (Expo) and FastAPI.

![Archetype Banner](./doc/big-five.png)

## 🌟 Overview

Archetype uses the **IPIP-NEO Big Five** personality model to map users onto a 5-dimensional personality space. Based on their results, users are assigned one of 12 distinct archetypes and enter a community feed where they can explore "Similar Minds" or "Serendipity" (opposing views).

## 🚀 Key Features

- **Progressive Personality Quiz**: A two-phase onboarding process (15 + 35 questions) that unlocks high-precision results.
- **Dynamic Radar Charts**: Real-time visualization of your personality fingerprint.
- **Personality-Ranked Feed**: Community content ranked by psychometric compatibility.
- **Secure IDOR Protection**: End-to-end JWT authentication ensures your data remains yours.
- **Modern UI**: Smooth, performance-optimized animations powered by `react-native-reanimated`.

## 🛠 Tech Stack

- **Mobile**: React Native, Expo Router, Reanimated 4, Axios.
- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL, Alembic.
- **Scoring**: Custom IPIP-NEO engine integrated with population norms.

## 📦 Getting Started

### Backend Setup
1. Navigate to `/backend`.
2. Install dependencies: `poetry install`.
3. Set up environment: `cp .env.example .env`.
4. Run migrations: `poetry run alembic upgrade head`.
5. Start server: `poetry run uvicorn backend.main:app --reload`.

### Mobile Setup
1. Navigate to `/mobile`.
2. Install dependencies: `npm install`.
3. Start Expo: `npx expo start`.

## 🧪 Testing

### Backend
Run the full test suite with:
```bash
PYTHONPATH=. poetry run pytest backend/tests
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. IPIP questions are in the public domain.
