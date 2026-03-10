# Archetype Mobile

React Native + Expo Router (file-based routing) mobile client for the Archetype psychometric social platform. Built with TypeScript. Design language: brutalist-minimal, #FF3B30 accent, thin/light font weights.

---

## Screen Inventory

```
app/
├── index.tsx              # Landing: animated ARCHETYPE brand + CTA
├── auth.tsx               # Auth screen
├── settings.tsx           # Privacy, GDPR clear/delete, phase retake
├── onboarding/
│   ├── phase1.tsx         # 15-question quiz (gradient circles, slide+fade)
│   ├── phase2.tsx         # 35-question deep unlock (interstitials between blocks)
│   └── result.tsx         # Archetype reveal (cinematic: radar, giant name, share)
├── (tabs)/
│   ├── feed.tsx           # Feed with Discover/My Tribe/Other Side modes
│   ├── profile.tsx        # Full identity: archetype + radar + dimension bars
│   ├── hub.tsx            # Community hub: rooms list + arena banner
│   └── create.tsx         # Write post: title/body, topic picker
├── user/[id].tsx          # User profile modal: compatibility %, radar, posts
├── threads/[id].tsx       # Thread/post detail view
├── room/[id].tsx          # Room detail with posts
└── arena/[id].tsx         # Arena: split-thread debate UI, voting
```

## Project Structure

```
mobile/
├── app/                   # Expo Router screens (file-based routing)
├── components/
│   ├── cinematic/         # Archetype reveal animation components
│   ├── share/             # Share card components (DimensionCard, etc.)
│   ├── ui/                # Reusable UI (LikertCircle, PressableScale, QuizBackground, ProgressBar)
│   ├── PostCard.tsx       # Feed post card with press animation
│   └── RadarChart.tsx     # Big Five radar visualization
├── constants/
│   └── theme.ts           # Design tokens: Colors, S, T, R, Shadows, DIM_COLORS, DIM_LABELS
├── stores/
│   └── userStore.ts       # React Context for user state
├── lib/
│   ├── api.ts             # API client (all backend calls)
│   ├── questions.ts       # Quiz question definitions
│   ├── archetypes.ts      # 12 archetype definitions with traits
│   ├── arenas.ts          # Arena type definitions
│   ├── cinematic-utils.ts # Cinematic reveal utilities
│   └── share.ts           # Share functionality
└── hooks/
    └── useQuizProgress.ts # Quiz progress persistence
```

## Design System

All tokens are defined in `constants/theme.ts`:

| Export       | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `Colors`     | Core palette -- accent `#FF3B30`, black `#111111`, grays             |
| `S`          | Spacing scale (8px base: `S[2]=4`, `S[4]=8`, `S[8]=16`, ...)        |
| `T`          | Typography -- sizes from `micro` to `hero`, weights `thin` to `bold` |
| `R`          | Border radius -- `sm=2`, `md=6`, `lg=12`, `xl=20`, `full=999`       |
| `Shadows`    | Shadow presets -- `sm`, `md`, `brutalist`, `red`                     |
| `DIM_COLORS` | Big Five dimension colors (O=purple, C=teal, E=red, A=sky, N=amber) |
| `DIM_LABELS` | Dimension full names                                                 |

## Progressive Quiz Flow

1. **Phase 1** -- 15 IPIP questions produce a quick archetype result.
2. **Cinematic reveal** -- multi-act animation sequence (dimension, convergence, reveal, tension, report).
3. **Phase 2** -- 35 additional questions refine the profile to a full 50-item assessment.

## State Management

- `stores/userStore.ts` -- React Context providing `{ user, profile, setUser, setProfile, clearUser }`.
- Auth token stored via SecureStore / AsyncStorage.
- Quiz progress persisted via the `useQuizProgress` hook.

## Running

```bash
cd mobile
npm install
npx expo start
```

## Configuration

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to point to your backend:

```
EXPO_PUBLIC_API_URL=http://localhost:8000
```
