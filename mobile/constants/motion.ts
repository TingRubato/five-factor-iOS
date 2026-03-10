/**
 * Motion Design System — Archetype
 * =================================
 * All animation constants, easing curves, and interaction timing.
 *
 * Design Philosophy:
 * - Fast feedback: UI responds within 100ms of touch
 * - Purposeful motion: every animation communicates something
 * - Respect user preferences: check `reduceMotion` and scale down
 * - Hardware-accelerated: use only opacity + transform, never layout props
 *
 * Usage:
 *   import { Duration, Easing, Spring, Motion } from '@/constants/motion';
 *   withTiming(1, { duration: Duration.fast, easing: Easing.decelerate })
 *   withSpring(1, Spring.bouncy)
 */

// ── Duration ──────────────────────────────────────────────────
// Named durations make intent explicit
export const Duration = {
  // Micro-interactions (button press, toggle, icon swap)
  instant: 100,
  // Element transitions (card expand, tab switch)
  fast: 200,
  // Screen transitions, modal entrance
  normal: 300,
  // Complex sequences, cinematic reveals
  slow: 500,
  // Deliberate reveals, onboarding animations
  slower: 700,
  // Full cinematic sequences
  epic: 1000,

  // Specific semantic uses
  tapFeedback: 100,        // visual response to touch (must be < 100ms)
  ripple: 150,             // touch ripple expansion
  menuOpen: 220,
  menuClose: 180,          // close slightly faster than open (feels snappier)
  sheetEnter: 340,
  sheetExit: 260,
  toastEnter: 300,
  toastExit: 200,
  pageEnter: 350,
  pageExit: 250,
  cardReveal: 400,
  archetype: 600,          // archetype reveal (epic moment)
  radar: 800,              // radar chart draw
  fadeIn: 250,
  fadeOut: 150,
} as const;

// ── Easing Curves ─────────────────────────────────────────────
// Use Reanimated's Easing from 'react-native-reanimated'
// These are bezier descriptors for documentation — pass to Easing.bezier()
export const EasingCurves = {
  // iOS standard curves
  standard: [0.4, 0.0, 0.2, 1.0],       // Material standard (in-out)
  decelerate: [0.0, 0.0, 0.2, 1.0],     // Enters fast, slows to rest (elements entering)
  accelerate: [0.4, 0.0, 1.0, 1.0],     // Starts slow, exits fast (elements leaving)
  linear: [0.0, 0.0, 1.0, 1.0],

  // Apple-style curves
  appleEaseIn: [0.42, 0, 1, 1],
  appleEaseOut: [0, 0, 0.58, 1],
  appleEaseInOut: [0.42, 0, 0.58, 1],
  springy: [0.34, 1.56, 0.64, 1],       // slight overshoot (for buttons, cards)
  emphasize: [0.2, 0, 0, 1.0],          // slow start, fast end with anticipation
} as const;

// ── Spring Configurations ─────────────────────────────────────
// Pass directly to withSpring() from 'react-native-reanimated'
export const Spring = {
  // Crisp, responsive — good for button press feedback
  snappy: {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
  },
  // Default — general purpose transitions
  default: {
    damping: 16,
    stiffness: 200,
    mass: 1,
  },
  // Gentle — modal sheets, large elements
  gentle: {
    damping: 22,
    stiffness: 120,
    mass: 1.2,
  },
  // Bouncy — celebratory moments (archetype reveal)
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.8,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // Stiff — immediate, almost no animation (toasts, badges)
  stiff: {
    damping: 50,
    stiffness: 1000,
    mass: 0.5,
  },
} as const;

// ── Scale Transforms ──────────────────────────────────────────
// Standard scale values for press interactions
export const ScaleValues = {
  press: 0.96,             // standard button press
  pressSubtle: 0.98,       // large cards, containers
  pressHard: 0.92,         // small elements (icons, chips)
  expand: 1.04,            // hover/highlight state
  expandSubtle: 1.02,
  identity: 1.0,
} as const;

// ── Stagger Delays ────────────────────────────────────────────
// For animating lists and grids item-by-item
export const Stagger = {
  xs: 30,                  // dense lists
  sm: 50,                  // card grids
  md: 80,                  // section reveals
  lg: 120,                 // onboarding steps
  max: 5,                  // maximum items to stagger (rest appear together)
} as const;

// ── Delay Helpers ─────────────────────────────────────────────
// Common delay patterns
export const Delay = {
  none: 0,
  micro: 50,
  short: 100,
  medium: 200,
  long: 400,
  afterMount: 16,          // one frame, prevents layout-on-mount jank
} as const;

// ── Reduced Motion ────────────────────────────────────────────
// Scale down all durations when user has reduceMotion enabled
// Usage: import { scaleDuration } from '@/constants/motion';
export function scaleDuration(ms: number, reduceMotion: boolean): number {
  if (reduceMotion) return Math.min(ms * 0.15, 50); // nearly instant
  return ms;
}

// ── Opacity Tokens ────────────────────────────────────────────
export const Opacity = {
  invisible: 0,
  ghost: 0.08,
  dim: 0.3,
  muted: 0.5,
  subtle: 0.7,
  soft: 0.85,
  visible: 1,

  // Pressed state overlay
  pressedOverlay: 0.06,
  disabledContent: 0.38,   // WCAG recommended for disabled elements
  skeletonBase: 0.12,
  skeletonHighlight: 0.24,
} as const;

// ── Skeleton Shimmer ──────────────────────────────────────────
export const Skeleton = {
  duration: 1200,
  delay: 400,
  baseOpacity: 0.08,
  highlightOpacity: 0.18,
} as const;

// ── Haptic Patterns ───────────────────────────────────────────
// Import from expo-haptics: Haptics.impactAsync(HapticStyle.X)
// Document intent alongside the haptic type
export const HapticPatterns = {
  // Selection change (tab switch, picker, toggle)
  selection: 'selection',
  // Confirmation (post created, vote cast)
  confirm: 'medium',
  // Destructive (delete, clear data)
  destructive: 'heavy',
  // Error (failed action)
  error: 'heavy',
  // Success (archetype reveal, quiz complete)
  celebration: 'medium',  // pair with celebratory animation
  // Subtle acknowledgment (like, small action)
  light: 'light',
} as const;

// ── Motion Recipes ────────────────────────────────────────────
// Pre-built animation sequences as documentation reference
// These describe WHAT to animate, not HOW (see component implementations)

export const Motion = {
  // Card enters from below (feed items, modals)
  slideUpEnter: {
    from: { translateY: 24, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: Duration.normal,
    easing: EasingCurves.decelerate,
  },
  // Element fades in
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: Duration.fadeIn,
    easing: EasingCurves.decelerate,
  },
  // Element fades out
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: Duration.fadeOut,
    easing: EasingCurves.accelerate,
  },
  // Button pressed
  buttonPress: {
    down: { scale: ScaleValues.press },
    up: { scale: ScaleValues.identity },
    spring: Spring.snappy,
  },
  // Large card pressed
  cardPress: {
    down: { scale: ScaleValues.pressSubtle },
    up: { scale: ScaleValues.identity },
    spring: Spring.snappy,
  },
  // Archetype name reveal (hero moment)
  archetypeReveal: {
    scale: { from: 0.6, to: 1.0 },
    opacity: { from: 0, to: 1 },
    duration: Duration.archetype,
    spring: Spring.bouncy,
  },
  // Radar chart draw animation
  radarDraw: {
    duration: Duration.radar,
    easing: EasingCurves.decelerate,
  },
  // Score bar fill
  barFill: {
    duration: Duration.slow,
    easing: EasingCurves.decelerate,
    stagger: Stagger.sm,
  },
  // Bottom sheet entrance
  sheetEnter: {
    from: { translateY: '100%' },
    to: { translateY: 0 },
    duration: Duration.sheetEnter,
    spring: Spring.gentle,
  },
} as const;
