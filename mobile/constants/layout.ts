/**
 * Layout System — Archetype
 * ==========================
 * Responsive layout utilities, breakpoints, thumb reach zones,
 * and safe area constants for the Archetype mobile app.
 *
 * Usage:
 *   import { Layout, ThumbZone, Grid } from '@/constants/layout';
 */
import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Screen Dimensions ─────────────────────────────────────────
export const Screen = {
  width: SCREEN_W,
  height: SCREEN_H,
  isSmall: SCREEN_W < 375,          // iPhone SE
  isMedium: SCREEN_W >= 375 && SCREEN_W < 428,  // iPhone 14/15
  isLarge: SCREEN_W >= 428,         // iPhone Pro Max / Plus
  isTablet: SCREEN_W >= 768,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

// ── Touch Targets ─────────────────────────────────────────────
// Apple HIG: 44x44pt minimum. Material: 48x48dp minimum.
export const Touch = {
  minSize: Platform.select({ ios: 44, android: 48, default: 44 }),
  iconSize: 24,            // icon visual size (inside touch target)
  iconSizeLg: 28,
  iconSizeSm: 20,
  targetPadding: 10,       // padding to expand visual element to minimum touch target
  gap: 8,                  // minimum space between adjacent touch targets
};

// ── Grid System ───────────────────────────────────────────────
export const Grid = {
  columns: 12,
  gutter: 16,              // space between columns
  margin: 20,              // page edge margin
  col: (n: number) =>      // width of n columns
    ((SCREEN_W - Grid.margin * 2 - Grid.gutter * 11) / 12) * n + Grid.gutter * (n - 1),
};

// ── Thumb Reach Zones ─────────────────────────────────────────
// Based on Steven Hoober's thumb zone research.
// PRIMARY: natural resting position, high comfort
// SECONDARY: slight stretch, still comfortable
// TERTIARY: requires repositioning, use sparingly
export const ThumbZone = {
  primary: {
    // Bottom-center of screen — easiest reach
    top: SCREEN_H * 0.55,
    bottom: SCREEN_H,
    description: 'Primary action zone — highest comfort, no repositioning',
  },
  secondary: {
    // Middle zone — moderate reach
    top: SCREEN_H * 0.30,
    bottom: SCREEN_H * 0.70,
    description: 'Secondary action zone — slight stretch, comfortable',
  },
  tertiary: {
    // Top of screen — hardest reach on large phones
    top: 0,
    bottom: SCREEN_H * 0.40,
    description: 'Tertiary zone — requires repositioning, use for read-only or navigation',
  },
  // Design recommendations
  recommendations: {
    tabBar: 'PRIMARY — always bottom',
    primaryCTA: 'PRIMARY — bottom of scroll or sticky footer',
    secondaryCTA: 'SECONDARY — natural position mid-screen',
    navTitle: 'TERTIARY — purely informational',
    backButton: 'TERTIARY — standard iOS expectation (top-left)',
    shareAction: 'SECONDARY or PRIMARY',
  },
};

// ── Component Sizing ──────────────────────────────────────────
export const ComponentSize = {
  // Buttons
  btnHeightSm: 36,
  btnHeightMd: 48,         // default
  btnHeightLg: 56,         // primary CTA
  btnHeightXl: 64,         // hero CTA (landing page)

  // Inputs
  inputHeight: 52,
  inputHeightLg: 60,
  textareaMinHeight: 120,

  // Navigation
  navBarHeight: 56,
  tabBarHeight: 83,
  headerLargeHeight: 96,   // large title nav bar
  statusBarHeight: Platform.select({ ios: 47, android: 24, default: 0 }),

  // Cards
  cardRadiusDefault: 12,
  cardRadiusFlat: 0,
  cardPadding: 16,

  // List items
  listItemHeight: 56,      // standard cell
  listItemHeightCompact: 44,
  listItemHeightLarge: 72,

  // Avatar
  avatarXs: 24,
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,
  avatarXl: 96,
  avatarHero: 120,

  // Badge
  badgeSize: 20,
  badgeDotSize: 8,

  // Chips/Tags
  chipHeight: 32,
  chipHeightLg: 40,
};

// ── Content Constraints ───────────────────────────────────────
export const Content = {
  maxTextWidth: Math.min(SCREEN_W - Grid.margin * 2, 600),
  optimalLineLength: 65,   // characters (45-75 range)
  cardMaxWidth: 420,
  modalMaxWidth: 520,
};

// ── Safe Areas ────────────────────────────────────────────────
// Use react-native-safe-area-context in components.
// These are fallback estimates only.
export const SafeArea = {
  top: Platform.select({ ios: 47, android: 0, default: 0 }),
  bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  homeIndicator: 34,       // iPhone home indicator clearance
};
