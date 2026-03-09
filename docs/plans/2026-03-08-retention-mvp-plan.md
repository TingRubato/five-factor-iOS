# Retention MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add auth, dimension rooms, debate arenas, share cards, and post-result depth to make users return daily.

**Architecture:** Two-layer navigation — bottom tabs stay, Hub becomes community center with room browser and arena section. Each room has its own feed. Auth gates social features while quiz stays open to guests.

**Tech Stack:** Expo Router, React Native Reanimated, expo-apple-authentication, expo-auth-session, react-native-view-shot, expo-sharing, FastAPI (backend), PostgreSQL + SQLAlchemy

---

## BATCH 1: Foundation (P0)

### Task 1: Wire create post API

**Files:**
- Modify: `mobile/app/(tabs)/create.tsx:48`

**Step 1: Replace the fake delay with real API call**

In `create.tsx`, find the TODO comment around line 48 and replace:

```typescript
// Replace fake delay:
// await new Promise(r => setTimeout(r, 800));

// With real API call:
import { createPost } from '../../lib/api';

await createPost(user.id, title, body, selectedTopic);
```

**Step 2: Verify the `createPost` function exists in api.ts**

Run: `grep -n "createPost" mobile/lib/api.ts`
Expected: Function definition exists. Check its signature matches (userId, title, body, topic).

**Step 3: Test by running the app**

Run: `npx expo start --ios`
Create a post → verify it appears in feed (or at least doesn't error).

**Step 4: Commit**

```bash
git add mobile/app/\(tabs\)/create.tsx
git commit -m "fix: wire create post API call"
```

---

### Task 2: Auth backend — models and endpoints

**Files:**
- Modify: `backend/models.py` (or equivalent ORM file)
- Create: `backend/services/auth.py`
- Create: `backend/routes/auth.py`
- Modify: `backend/main.py` (register router)

**Step 1: Check current backend structure**

Run: `ls backend/` and `ls backend/routes/ 2>/dev/null || ls backend/`
Understand the current file layout before adding new files.

**Step 2: Add auth provider fields to User model**

Add to the User model:
```python
auth_provider = Column(String, nullable=True)  # "apple" | "google" | "phone"
auth_provider_id = Column(String, nullable=True, unique=True)
phone_number = Column(String, nullable=True, unique=True)
is_guest = Column(Boolean, default=True)
```

**Step 3: Create auth service**

Create `backend/services/auth.py`:
```python
# Apple Sign In: verify identity token with Apple's public keys
# Google Sign In: verify ID token with Google's tokeninfo endpoint
# Phone OTP: generate + verify 6-digit codes (store in Redis or DB with TTL)
# Guest migration: update existing user record, set is_guest=False
```

Implement:
- `verify_apple_token(identity_token: str) -> dict` — calls Apple JWKS endpoint
- `verify_google_token(id_token: str) -> dict` — calls Google tokeninfo
- `send_otp(phone: str) -> None` — generates 6-digit code, stores with 5min TTL
- `verify_otp(phone: str, code: str) -> bool`
- `migrate_guest(guest_user_id: str, auth_data: dict) -> User`

**Step 4: Create auth routes**

Create `backend/routes/auth.py`:
```python
@router.post("/auth/apple")
async def apple_login(body: AppleAuthRequest):
    # Verify token → find or create user → return JWT

@router.post("/auth/google")
async def google_login(body: GoogleAuthRequest):
    # Verify token → find or create user → return JWT

@router.post("/auth/phone/send-otp")
async def send_otp(body: PhoneOtpRequest):
    # Send OTP → return success

@router.post("/auth/phone/verify")
async def verify_otp(body: VerifyOtpRequest):
    # Verify → find or create user → return JWT

@router.post("/auth/migrate-guest")
async def migrate_guest(body: MigrateGuestRequest):
    # Link guest account to auth provider → return updated JWT
```

**Step 5: Register auth router in main.py**

Add `app.include_router(auth_router, prefix="/api")` to main.py.

**Step 6: Write tests**

Create `backend/tests/test_auth.py`:
```python
def test_guest_migration_preserves_scores():
    # Create guest → submit test → migrate → verify scores intact

def test_phone_otp_flow():
    # Send OTP → verify correct code → get JWT

def test_duplicate_auth_returns_existing_user():
    # Login with Apple → login again → same user ID
```

**Step 7: Run tests**

Run: `cd backend && python -m pytest tests/test_auth.py -v`
Expected: All pass.

**Step 8: Commit**

```bash
git add backend/
git commit -m "feat: add auth endpoints (Apple, Google, Phone OTP)"
```

---

### Task 3: Auth screen UI

**Files:**
- Create: `mobile/app/auth.tsx`
- Modify: `mobile/app/index.tsx` (route to auth)
- Modify: `mobile/lib/api.ts` (add auth API functions)
- Modify: `mobile/stores/userStore.ts` (handle auth state)

**Step 1: Add auth API functions**

In `mobile/lib/api.ts`, add:
```typescript
export async function loginWithApple(identityToken: string) {
  const { data } = await client.post('/auth/apple', { identity_token: identityToken });
  return data; // { token, user }
}

export async function loginWithGoogle(idToken: string) {
  const { data } = await client.post('/auth/google', { id_token: idToken });
  return data;
}

export async function sendPhoneOtp(phone: string) {
  const { data } = await client.post('/auth/phone/send-otp', { phone });
  return data;
}

export async function verifyPhoneOtp(phone: string, code: string) {
  const { data } = await client.post('/auth/phone/verify', { phone, code });
  return data;
}

export async function migrateGuest(guestUserId: string, authProvider: string, authToken: string) {
  const { data } = await client.post('/auth/migrate-guest', {
    guest_user_id: guestUserId,
    auth_provider: authProvider,
    auth_token: authToken,
  });
  return data;
}
```

**Step 2: Update userStore with auth state**

Add to the user type and context:
```typescript
// Add to UserProfile type:
isGuest: boolean;
authProvider?: 'apple' | 'google' | 'phone';

// Add method:
login: (userData: any, token: string) => void;
```

**Step 3: Create auth screen**

Create `mobile/app/auth.tsx`:
- Brutalist design matching the app aesthetic
- "ARCHETYPE" header text
- Apple Sign In button (black, full-width, 56px height)
- Google Sign In button (white with border, full-width)
- Divider with "OR"
- Phone number input + "Send Code" button
- OTP 6-digit input (appears after sending)
- "Skip for now" ghost link at bottom → guest flow
- All buttons use PressableScale

**Step 4: Modify landing screen to route through auth**

In `mobile/app/index.tsx`:
- "BEGIN" button navigates to `/auth` instead of directly to quiz
- Or if user is already authenticated, navigate to quiz/tabs

**Step 5: Add guest-to-auth prompt after result**

In the ActReport component or result flow:
- After cinematic completes, if user is guest, show a modal/overlay:
  "Save your archetype — create an account to unlock rooms, sharing, and debates"
- Buttons: Apple / Google / Phone / "Maybe later"
- This is the highest-conversion moment

**Step 6: Install packages**

Run: `npx expo install expo-apple-authentication expo-auth-session expo-crypto`

**Step 7: Test the auth flow**

Run: `npx expo start --ios`
- Verify auth screen renders
- Verify "Skip for now" preserves guest flow
- Verify Apple Sign In button initiates the native flow

**Step 8: Commit**

```bash
git add mobile/app/auth.tsx mobile/lib/api.ts mobile/stores/userStore.ts mobile/app/index.tsx
git commit -m "feat: add auth screen with Apple/Google/Phone login"
```

---

### Task 4: Room backend — models and endpoints

**Files:**
- Modify: `backend/models.py`
- Create: `backend/services/rooms.py`
- Create: `backend/routes/rooms.py`
- Modify: `backend/main.py`

**Step 1: Add Room and RoomMembership models**

```python
class Room(Base):
    __tablename__ = "rooms"
    id = Column(String, primary_key=True)
    dimension = Column(String, nullable=True)  # O, C, E, A, N, or null for Commons/Shadow
    name = Column(String, nullable=False)
    name_zh = Column(String, nullable=False)
    description = Column(String)
    room_type = Column(String)  # "dimension" | "commons" | "shadow"
    color = Column(String)
    created_at = Column(DateTime, default=func.now())

class RoomMembership(Base):
    __tablename__ = "room_memberships"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    room_id = Column(String, ForeignKey("rooms.id"))
    role = Column(String)  # "home" | "shadow" | "joined"
    joined_at = Column(DateTime, default=func.now())
```

Add `room_id` column to the existing Post model (nullable for backward compat).

**Step 2: Create seed script for the 7 rooms**

```python
SEED_ROOMS = [
    {"id": "room_o", "dimension": "O", "name": "The Observatory", "name_zh": "观测站", "room_type": "dimension", "color": "#AF52DE"},
    {"id": "room_c", "dimension": "C", "name": "The Workshop", "name_zh": "工坊", "room_type": "dimension", "color": "#30B0C7"},
    {"id": "room_e", "dimension": "E", "name": "The Arena", "name_zh": "竞技场", "room_type": "dimension", "color": "#FF3B30"},
    {"id": "room_a", "dimension": "A", "name": "The Garden", "name_zh": "花园", "room_type": "dimension", "color": "#5AC8FA"},
    {"id": "room_n", "dimension": "N", "name": "The Depths", "name_zh": "深渊", "room_type": "dimension", "color": "#FF9500"},
    {"id": "room_commons", "dimension": None, "name": "The Commons", "name_zh": "广场", "room_type": "commons", "color": "#8E8D93"},
    {"id": "room_shadow", "dimension": None, "name": "The Shadow Side", "name_zh": "暗面", "room_type": "shadow", "color": "#111111"},
]
```

**Step 3: Create room service**

Create `backend/services/rooms.py`:
```python
def get_all_rooms(db) -> list[Room]
def get_room_posts(db, room_id, limit, offset) -> list[Post]
def create_room_post(db, room_id, user_id, title, body) -> Post
def join_room(db, room_id, user_id, role="joined") -> RoomMembership
def get_user_rooms(db, user_id) -> list[Room]
def auto_assign_rooms(db, user_id, scores) -> None
    # Find top dim → assign to dimension room as "home"
    # Find lowest dim → assign to shadow room as "shadow"
    # Assign to commons
```

**Step 4: Create room routes**

Create `backend/routes/rooms.py`:
```python
@router.get("/rooms")  # List all rooms with member counts
@router.get("/rooms/{room_id}")  # Room detail
@router.get("/rooms/{room_id}/posts")  # Room feed
@router.post("/rooms/{room_id}/posts")  # Post to room (auth required)
@router.post("/rooms/{room_id}/join")  # Join a room
@router.get("/users/{user_id}/rooms")  # User's rooms
```

**Step 5: Hook auto-assign into test submission**

In the `submit_test` endpoint, after scoring:
```python
# After calculating scores and archetype:
rooms_service.auto_assign_rooms(db, user_id, scores)
```

**Step 6: Write tests**

Create `backend/tests/test_rooms.py`:
```python
def test_auto_assign_rooms_on_quiz_completion():
    # Submit test → verify user has home + shadow + commons memberships

def test_room_post_requires_membership():
    # Try posting to unjoined room → 403

def test_join_room():
    # Join room → verify membership → post succeeds

def test_room_feed_returns_posts():
    # Create posts → fetch feed → verify order and content
```

**Step 7: Run tests**

Run: `cd backend && python -m pytest tests/test_rooms.py -v`

**Step 8: Commit**

```bash
git add backend/
git commit -m "feat: add room models, endpoints, and auto-assignment"
```

---

### Task 5: Room API client + types

**Files:**
- Modify: `mobile/lib/api.ts`
- Create: `mobile/lib/rooms.ts` (types)

**Step 1: Add room types**

Create `mobile/lib/rooms.ts`:
```typescript
export interface Room {
  id: string;
  dimension: string | null;
  name: string;
  nameZh: string;
  description: string;
  roomType: 'dimension' | 'commons' | 'shadow';
  color: string;
  memberCount: number;
  activeNow: number;
  latestPost?: { title: string; authorName: string; createdAt: string };
}

export interface RoomMembership {
  roomId: string;
  role: 'home' | 'shadow' | 'joined';
}
```

**Step 2: Add room API functions**

In `mobile/lib/api.ts`:
```typescript
export async function getRooms(): Promise<Room[]> {
  const { data } = await client.get('/rooms');
  return data;
}

export async function getRoomPosts(roomId: string, limit = 20, offset = 0) {
  const { data } = await client.get(`/rooms/${roomId}/posts`, { params: { limit, offset } });
  return data;
}

export async function createRoomPost(roomId: string, userId: string, title: string, body: string) {
  const { data } = await client.post(`/rooms/${roomId}/posts`, { user_id: userId, title, body });
  return data;
}

export async function joinRoom(roomId: string, userId: string) {
  const { data } = await client.post(`/rooms/${roomId}/join`, { user_id: userId });
  return data;
}

export async function getUserRooms(userId: string): Promise<RoomMembership[]> {
  const { data } = await client.get(`/users/${userId}/rooms`);
  return data;
}
```

**Step 3: Commit**

```bash
git add mobile/lib/api.ts mobile/lib/rooms.ts
git commit -m "feat: add room types and API client functions"
```

---

## BATCH 2: Room UI (P0)

### Task 6: Hub redesign — Community center

**Files:**
- Rewrite: `mobile/app/(tabs)/hub.tsx`
- Create: `mobile/components/RoomCard.tsx`

**Step 1: Create RoomCard component**

Create `mobile/components/RoomCard.tsx`:
- Brutalist bordered card (1px black border)
- Room name in heading style, nameZh below
- Dimension color accent bar on left edge
- Member count + "active now" dot (green pulse if > 0)
- Latest post preview (1 line, truncated)
- `onPress` prop for navigation
- Dimensions: half-width for grid layout

**Step 2: Rewrite hub.tsx**

Replace entire hub.tsx with new community center layout:

```
┌─────────────────────────────────┐
│ COMMUNITY          [archetype]  │ ← header
├─────────────────────────────────┤
│ YOUR ROOMS                      │ ← section label
│ ┌──────────┐ ┌──────────┐      │
│ │ HOME     │ │ SHADOW   │      │ ← horizontal scroll
│ │ The Obs. │ │ The Shad │      │
│ │ 3 new    │ │ 1 new    │      │
│ └──────────┘ └──────────┘      │
├─────────────────────────────────┤
│ ARENA                           │ ← section label
│ ┌───────────────────────────┐   │
│ │ "Structure kills creativ" │   │ ← active debate card
│ │ HIGH C vs HIGH O  ⏱ 3d   │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ ALL ROOMS                       │ ← section label
│ ┌──────┐ ┌──────┐              │
│ │ Obs. │ │ Work │              │ ← 2-column grid
│ └──────┘ └──────┘              │
│ ┌──────┐ ┌──────┐              │
│ │Arena │ │Garden│              │
│ └──────┘ └──────┘              │
│ ...                             │
└─────────────────────────────────┘
```

- Use ScrollView with sections
- Fetch rooms from `getRooms()` + `getUserRooms()` on mount
- Show loading skeleton while fetching
- Empty state if user hasn't taken quiz yet

**Step 3: Test by running the app**

Run: `npx expo start --ios`
Navigate to Hub tab → verify layout renders with room cards.

**Step 4: Commit**

```bash
git add mobile/app/\(tabs\)/hub.tsx mobile/components/RoomCard.tsx
git commit -m "feat: redesign Hub as community center with room browser"
```

---

### Task 7: Room screen

**Files:**
- Create: `mobile/app/room/[id].tsx`

**Step 1: Create room screen**

Create `mobile/app/room/[id].tsx`:
- Header: room name, dimension color bar, member count, back button
- FlatList of posts (reuse PostCard component)
- Pull-to-refresh
- Bottom composer bar: text input + send button (posts to room)
- Fetch posts from `getRoomPosts(roomId)`
- If user hasn't joined: show "Join this room to post" banner at bottom
- Join button calls `joinRoom()` then enables composer

**Step 2: Add navigation from Hub**

In hub.tsx, make RoomCard `onPress` navigate to `/room/${roomId}`.

**Step 3: Add navigation from room to user profiles**

PostCard tap navigates to `/user/${authorId}` (already works).

**Step 4: Test by running the app**

Run: `npx expo start --ios`
Tap a room card in Hub → verify room screen loads with posts.

**Step 5: Commit**

```bash
git add mobile/app/room/
git commit -m "feat: add room screen with feed and composer"
```

---

### Task 8: Room-scoped post creation + auto-join

**Files:**
- Modify: `mobile/app/(tabs)/create.tsx` (add room selector)

**Step 1: Add room selector to create screen**

Above the topic picker, add a room selector:
- Horizontal scroll of room chips (like topic picker)
- User's rooms shown first (Home, Shadow, Commons)
- Other joined rooms after
- "General" option for no room (backward compat)
- Selected room determines which room the post goes to

**Step 2: Update post submission**

When posting with a room selected, call `createRoomPost(roomId, ...)` instead of `createPost(...)`.

**Step 3: Test**

Create a post with a room selected → verify it appears in that room's feed.

**Step 4: Commit**

```bash
git add mobile/app/\(tabs\)/create.tsx
git commit -m "feat: add room selector to post creation"
```

---

## BATCH 3: Arena (P1)

### Task 9: Arena backend

**Files:**
- Modify: `backend/models.py`
- Create: `backend/services/arenas.py`
- Create: `backend/routes/arenas.py`
- Modify: `backend/main.py`

**Step 1: Add Arena models**

```python
class Arena(Base):
    __tablename__ = "arenas"
    id = Column(String, primary_key=True)
    topic = Column(String, nullable=False)
    topic_zh = Column(String, nullable=False)
    dim1 = Column(String)  # e.g. "C"
    dim2 = Column(String)  # e.g. "O"
    side1_label = Column(String)  # e.g. "HIGH CONSCIENTIOUSNESS"
    side2_label = Column(String)
    status = Column(String, default="upcoming")  # upcoming|active|voting|closed
    starts_at = Column(DateTime)
    voting_at = Column(DateTime)
    ends_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

class ArenaPost(Base):
    __tablename__ = "arena_posts"
    id = Column(String, primary_key=True)
    arena_id = Column(String, ForeignKey("arenas.id"))
    user_id = Column(String, ForeignKey("users.id"))
    side = Column(Integer)  # 1 or 2
    body = Column(Text)
    is_defector = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class ArenaVote(Base):
    __tablename__ = "arena_votes"
    id = Column(String, primary_key=True)
    arena_id = Column(String, ForeignKey("arenas.id"))
    voter_id = Column(String, ForeignKey("users.id"))
    voted_side = Column(Integer)
    created_at = Column(DateTime, default=func.now())
```

**Step 2: Create arena service**

```python
def get_arenas(db, status=None) -> list[Arena]
def get_arena(db, arena_id) -> Arena
def get_arena_posts(db, arena_id, side=None) -> list[ArenaPost]
def create_arena_post(db, arena_id, user_id, body, user_scores) -> ArenaPost
    # Auto-assign side based on user's score for dim1 vs dim2
    # Mark as defector if user manually chose opposite side
def vote(db, arena_id, voter_id, side) -> ArenaVote
def get_arena_results(db, arena_id) -> dict  # { side1_votes, side2_votes, winner }
def assign_user_side(user_scores, dim1, dim2) -> int
    # Compare user's score on dim1 vs dim2, assign to higher side
```

**Step 3: Create arena routes**

```python
@router.get("/arenas")  # List arenas (filter by status)
@router.get("/arenas/{arena_id}")  # Arena detail with vote counts
@router.get("/arenas/{arena_id}/posts")  # Posts for both sides (or filtered)
@router.post("/arenas/{arena_id}/posts")  # Post to arena
@router.post("/arenas/{arena_id}/vote")  # Cast vote (voting phase only)
```

**Step 4: Seed initial arena**

Create a seed script with the first debate:
```python
{
    "topic": "Structure kills creativity",
    "topic_zh": "结构扼杀创造力",
    "dim1": "C", "dim2": "O",
    "side1_label": "HIGH CONSCIENTIOUSNESS",
    "side2_label": "HIGH OPENNESS",
    "status": "active",
    "starts_at": now, "voting_at": now + 5 days, "ends_at": now + 7 days
}
```

**Step 5: Write tests**

```python
def test_auto_assign_side_by_scores():
def test_defector_badge():
def test_vote_only_during_voting_phase():
def test_arena_results():
```

**Step 6: Run tests and commit**

```bash
cd backend && python -m pytest tests/test_arenas.py -v
git add backend/
git commit -m "feat: add arena models, service, and endpoints"
```

---

### Task 10: Arena API client

**Files:**
- Modify: `mobile/lib/api.ts`
- Create: `mobile/lib/arenas.ts` (types)

**Step 1: Add arena types**

```typescript
export type ArenaStatus = 'upcoming' | 'active' | 'voting' | 'closed';

export interface Arena {
  id: string;
  topic: string;
  topicZh: string;
  dim1: string;
  dim2: string;
  side1Label: string;
  side2Label: string;
  status: ArenaStatus;
  startsAt: string;
  votingAt: string;
  endsAt: string;
  side1Count: number;
  side2Count: number;
}

export interface ArenaPost {
  id: string;
  arenaId: string;
  userId: string;
  username: string;
  archetypeName: string;
  side: 1 | 2;
  body: string;
  isDefector: boolean;
  createdAt: string;
}
```

**Step 2: Add API functions**

```typescript
export async function getArenas(status?: ArenaStatus)
export async function getArena(arenaId: string)
export async function getArenaPosts(arenaId: string, side?: 1 | 2)
export async function createArenaPost(arenaId: string, userId: string, body: string)
export async function voteArena(arenaId: string, userId: string, side: 1 | 2)
```

**Step 3: Commit**

```bash
git add mobile/lib/api.ts mobile/lib/arenas.ts
git commit -m "feat: add arena types and API client"
```

---

### Task 11: Arena screen UI

**Files:**
- Create: `mobile/app/arena/[id].tsx`
- Modify: `mobile/app/(tabs)/hub.tsx` (add arena card + navigation)

**Step 1: Create arena screen**

Create `mobile/app/arena/[id].tsx`:

Layout:
```
┌─────────────────────────────────┐
│ ← ARENA               ⏱ 3d 4h │
├─────────────────────────────────┤
│ "STRUCTURE KILLS                │
│  CREATIVITY"                    │ ← big brutalist topic text
├────────────────┬────────────────┤
│ HIGH C         │ HIGH O         │ ← side headers with dim colors
│ ──────────     │ ──────────     │
│ @user: I need  │ @user: Rules   │
│ structure to   │ are prisons    │ ← split thread, two FlatLists
│ actually ship  │ for the mind   │
│ anything...    │ ...            │
│                │                │
├────────────────┴────────────────┤
│ Your side: HIGH C  [Post]       │ ← composer bar
│ ☐ Defect to other side          │
└─────────────────────────────────┘
```

- Two side-by-side FlatLists (horizontal split)
- Each post shows: username, archetype badge, body, timestamp
- Defector posts have a "traitor" indicator
- Composer at bottom: auto-assigned side, toggle to defect, text input + send
- If status is "voting": show vote buttons instead of composer
- If status is "closed": show results (side1 votes vs side2 votes, winner badge)
- Timer component showing countdown to next phase

**Step 2: Add arena card to Hub**

In hub.tsx, between "YOUR ROOMS" and "ALL ROOMS" sections:
- Fetch active/upcoming arenas from `getArenas()`
- Show arena card: topic text, dim colors on each side, timer, post count
- Tap navigates to `/arena/${arenaId}`

**Step 3: Test**

Navigate to Hub → see arena card → tap → arena screen loads with split threads.

**Step 4: Commit**

```bash
git add mobile/app/arena/ mobile/app/\(tabs\)/hub.tsx
git commit -m "feat: add arena screen with split-thread debate UI"
```

---

## BATCH 4: Share Cards + Polish (P1)

### Task 12: Share card components

**Files:**
- Create: `mobile/components/share/ArchetypeCard.tsx`
- Create: `mobile/components/share/DimensionCard.tsx`

**Step 1: Install packages**

Run: `npx expo install react-native-view-shot expo-sharing`

**Step 2: Create ArchetypeCard**

Create `mobile/components/share/ArchetypeCard.tsx`:
- Fixed dimensions: 1080x1920 (Stories aspect ratio), rendered at 360x640 scale
- Layout:
  - Top: "ARCHETYPE" micro label
  - Archetype name (ZH) in 48px bold, archetype color
  - Archetype name (EN) in 20px italic
  - Mini radar chart (150px, no labels)
  - Top 3 dimensions with score bars
  - Bottom: QR code area (placeholder image or text URL)
  - Background: white with dimension-colored accent elements
- Brutalist aesthetic: 1px black borders, uppercase labels, grid cells
- Component is rendered off-screen (not in visible viewport)

**Step 3: Create DimensionCard**

Create `mobile/components/share/DimensionCard.tsx`:
- Single dimension focus
- Dimension name large, colored
- Score number (giant, 80px)
- Score bar (full width)
- Prose title (italic)
- 1-line prose excerpt
- Bottom: "Discover yours at archetype.app"

**Step 4: Commit**

```bash
git add mobile/components/share/
git commit -m "feat: add shareable card components (archetype + dimension)"
```

---

### Task 13: Share flow integration

**Files:**
- Create: `mobile/lib/share.ts`
- Modify: `mobile/app/(tabs)/profile.tsx` (add share button)
- Modify: `mobile/components/cinematic/ActReport.tsx` (add share button)

**Step 1: Create share utility**

Create `mobile/lib/share.ts`:
```typescript
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export async function shareCard(viewRef: React.RefObject<View>) {
  const uri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Share your archetype',
  });
}
```

**Step 2: Add share button to profile**

In profile.tsx header area:
- Add "SHARE" button (PressableScale, bordered style)
- On press: render ArchetypeCard off-screen → capture → share
- Use `useRef<View>` for the card ref + `captureRef`

**Step 3: Add share button to ActReport**

In the report header (meta row area), add a share icon/button.

**Step 4: Test sharing**

Run app → go to profile → tap Share → verify share sheet appears with card image.

**Step 5: Commit**

```bash
git add mobile/lib/share.ts mobile/app/\(tabs\)/profile.tsx mobile/components/cinematic/ActReport.tsx
git commit -m "feat: add share card generation and native sharing"
```

---

### Task 14: Profile upgrade

**Files:**
- Modify: `mobile/app/(tabs)/profile.tsx`

**Step 1: Redesign profile top section**

Replace current archetype card with brutalist identity card (matching ActReport grid style):
- Meta row: ARCHETYPE / [name] | PHASE / [1 or 2] | SINCE / [date]
- Archetype name (ZH) in big text with color
- Mini radar chart
- "SHARE YOUR ARCHETYPE" button (full-width, bordered)

**Step 2: Add "Your Rooms" section**

Below the identity card:
- Section label: "YOUR ROOMS" (micro text)
- Horizontal scroll of room cards (Home + Shadow)
- Each card: room name, color bar, "3 new posts" indicator
- Tap navigates to `/room/${roomId}`
- Fetch from `getUserRooms(userId)`

**Step 3: Add activity stats**

Below rooms:
- Brutalist grid row: POSTS / [count] | ROOMS / [count] | DEBATES / [count]
- 3 cells with 1px borders, micro labels, large numbers

**Step 4: Keep existing dimension bars and phase 2 CTA**

Existing radar chart + dimension bars stay below the new sections.

**Step 5: Test and commit**

```bash
git add mobile/app/\(tabs\)/profile.tsx
git commit -m "feat: upgrade profile with identity card, rooms, and stats"
```

---

### Task 15: Feed enrichment

**Files:**
- Modify: `mobile/app/(tabs)/feed.tsx`

**Step 1: Add arena banner**

At the top of the feed (above post list):
- If active arena exists, show a sticky card:
  - Split-color background (dim1 color | dim2 color)
  - Topic text in bold
  - Timer + post count
  - "JOIN THE DEBATE →" CTA
  - Tap navigates to `/arena/${arenaId}`
- Fetch active arena from `getArenas('active')`

**Step 2: Add room activity cards**

Intersperse room activity cards in the feed (every 5th position):
- "3 new posts in The Observatory" — room color accent
- Tap navigates to `/room/${roomId}`
- Fetch from room activity endpoint or compute from room data

**Step 3: Add room origin tag to PostCards**

In PostCard component:
- If post has a `roomId`, show a small colored tag: "from The Observatory"
- Tag uses room's dimension color

**Step 4: Test and commit**

```bash
git add mobile/app/\(tabs\)/feed.tsx mobile/components/PostCard.tsx
git commit -m "feat: enrich feed with arena banner and room activity cards"
```

---

## BATCH 5: Final Integration

### Task 16: End-to-end flow verification

**Step 1: Test complete user journey**

1. Open app → Landing screen
2. Tap BEGIN → Auth screen
3. Skip (guest mode) → Phase 1 quiz
4. Complete quiz → Cinematic result → Brutalist report
5. See "Save your archetype" prompt → Skip
6. Navigate to Profile → See identity card (limited, guest mode)
7. Navigate to Hub → See rooms (read-only)
8. Navigate to Feed → See posts + arena banner

**Step 2: Test authenticated journey**

1. Open app → Auth → Apple Sign In
2. Complete quiz → Result
3. Profile → Share button works
4. Hub → Rooms accessible, can post
5. Create → Room selector + post
6. Arena → Can argue + vote

**Step 3: Test guest migration**

1. Complete quiz as guest
2. Go to Profile → "Save your archetype"
3. Sign in with Apple → Verify scores preserved
4. Rooms auto-assigned → Hub shows Home + Shadow

**Step 4: Fix any issues found**

Address bugs discovered during e2e testing.

**Step 5: Commit all fixes**

```bash
git add -A
git commit -m "fix: end-to-end flow fixes from integration testing"
```

---

## Summary

| Batch | Tasks | Focus |
|-------|-------|-------|
| 1 | Tasks 1-5 | Foundation: auth backend + mobile, room backend + API |
| 2 | Tasks 6-8 | Room UI: hub redesign, room screen, room posting |
| 3 | Tasks 9-11 | Arena: backend, API client, split-thread UI |
| 4 | Tasks 12-15 | Share cards, profile upgrade, feed enrichment |
| 5 | Task 16 | End-to-end integration testing |

**Execution order matters:** Backend before mobile. Auth before rooms. Rooms before arenas. Share cards can parallelize with arena work.
