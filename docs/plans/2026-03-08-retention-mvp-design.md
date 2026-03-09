# Retention MVP — Design Document

**Goal:** Transform Archetype from a quiz-and-done experience into a social personality platform users return to daily.

**Core insight:** The Day 2 hook is personality-filtered conversations — dimension rooms for daily browsing, debate arenas for engagement spikes.

---

## Auth System

- Apple Sign In (primary) + Google Sign In + Phone OTP (fallback)
- Guest mode preserved: can take quiz + see results, cannot post/join rooms
- Account creation prompted at emotional high point (after cinematic result)
- Guest `local_` users migrate to real accounts preserving scores

## Dimension Rooms (7 total)

- 5 dimension rooms: High O ("The Observatory"), High C ("The Workshop"), High E ("The Arena"), High A ("The Garden"), High N ("The Depths")
- 2 special rooms: "The Commons" (open to all), "The Shadow Side" (your lowest dimension)
- Auto-join: Home room (top dim) + Shadow room (lowest dim)
- Other rooms: read-only until one-tap join
- Room-scoped posting and feeds

## Debate Arenas

- Weekly system-generated debates pairing opposing dimensions
- Auto-assigned sides based on Big Five scores (can defect with "traitor" badge)
- Lifecycle: UPCOMING → ACTIVE (5 days) → VOTING (2 days) → CLOSED
- Split-thread UI: Side A | divider | Side B
- Winning side gets temporary badge flair

## Share Cards (3 types)

1. Archetype Card: name + radar + scores + QR code (1080x1920 for Stories)
2. Dimension Card: single dimension deep-dive, shareable per-dimension
3. Debate Result Card: topic + side + result + invite link
- `react-native-view-shot` for image capture, `expo-sharing` for native share sheet
- Every card links to quiz — viral loop

## Post-Result Depth

- Profile: brutalist identity card, share button, "Your Rooms" section, activity stats
- Feed: room activity cards interspersed, active arena banner at top
- Hub: complete redesign as community center with room browser + arena section

## Navigation Architecture (Approach C — Two-layer)

- Bottom tabs stay (Feed, Hub, Create, Profile)
- Hub opens into room browser with sub-navigation
- Each room is its own mini-feed
- Arenas have dedicated section within Hub
- Feed becomes personalized home pulling from room activity
