import { Platform } from 'react-native';

// ── Core Palette ──────────────────────────────────────────────
export const Colors = {
  // Brand accent — iOS system red, #FF3B30
  accent: '#FF3B30',
  accentDark: '#D63025',       // pressed/active state
  accentLight: '#FF6B62',      // hover/highlight
  accentDim: 'rgba(255, 59, 48, 0.08)',
  accentMid: 'rgba(255, 59, 48, 0.15)',
  accentGlow: 'rgba(255, 59, 48, 0.30)',

  // Neutrals — editorial black/white
  black: '#111111',
  white: '#FFFFFF',
  bg: '#FAFAFA',
  card: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.15)',

  // Text hierarchy (WCAG AA+)
  t1: '#111111',   // 15.3:1 on white — headings, primary
  t2: '#555558',   // 7.5:1 on white — body text (bumped from 8E8E93 which was 3.7:1, fails AA)
  t3: '#8E8E93',   // 3.5:1 — captions, placeholders (decorative only, never critical info)

  // Borders
  line: '#E5E5EA',
  lineStrong: '#C7C7CC',

  // Semantic states
  success: '#34C759',
  successDim: 'rgba(52,199,89,0.10)',
  successText: '#1A8F36',      // darkened for text use (AA compliant)
  warning: '#FF9500',
  warningDim: 'rgba(255,149,0,0.10)',
  warningText: '#B86500',
  error: '#FF3B30',
  errorDim: 'rgba(255,59,48,0.08)',
  errorText: '#B52B22',
  info: '#007AFF',
  infoDim: 'rgba(0,122,255,0.10)',
  infoText: '#005FCC',

  // Community / archetype colors
  serendipity: '#5856D6',
  serendipityDim: 'rgba(88,86,214,0.10)',

  // Dark mode variants (use ColorScheme hook to select)
  dark: {
    bg: '#000000',
    card: '#1C1C1E',
    cardElevated: '#2C2C2E',
    t1: '#FFFFFF',
    t2: '#EBEBF5CC',           // 80% opacity white
    t3: '#EBEBF599',           // 60% opacity white
    line: '#38383A',
    lineStrong: '#545458',
    black: '#FFFFFF',          // inverted for dark mode borders
    white: '#000000',
    bg2: '#1C1C1E',
  },
};

// ── Dimension Personality Colors ──────────────────────────────
export const DIM_COLORS: Record<string, string> = {
  O: '#AF52DE',   // Openness — purple
  C: '#30B0C7',   // Conscientiousness — teal
  E: '#FF3B30',   // Extraversion — red
  A: '#5AC8FA',   // Agreeableness — sky
  N: '#FF9500',   // Neuroticism — amber
};

export const DIM_COLORS_DIM: Record<string, string> = {
  O: 'rgba(175,82,222,0.12)',
  C: 'rgba(48,176,199,0.12)',
  E: 'rgba(255,59,48,0.10)',
  A: 'rgba(90,200,250,0.15)',
  N: 'rgba(255,149,0,0.12)',
};

export const DIM_LABELS: Record<string, string> = {
  O: 'OPENNESS',
  C: 'CONSCIENTIOUSNESS',
  E: 'EXTRAVERSION',
  A: 'AGREEABLENESS',
  N: 'NEUROTICISM',
};

export const DIM_LABELS_SHORT: Record<string, string> = {
  O: 'Open',
  C: 'Conscientious',
  E: 'Extraverted',
  A: 'Agreeable',
  N: 'Neurotic',
};

// ── Spacing Scale (base 4px, T-shirt names + numeric) ─────────
// Use named sizes for semantics, numeric for precision
export const S = {
  // Named
  hairline: 1,
  px: 1,
  '0.5': 2,
  1: 4,
  2: 4,    // alias
  3: 6,    // alias
  4: 8,
  5: 10,   // alias
  6: 12,
  8: 16,
  10: 20,
  12: 24,
  14: 28,
  16: 32,
  20: 40,
  24: 48,
  28: 56,
  32: 64,
  40: 80,
  48: 96,

  // Semantic aliases
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,

  // Layout
  pagePadding: 20,          // horizontal page margin
  sectionGap: 32,           // space between major sections
  cardPadding: 16,          // inner card padding
  itemGap: 12,              // space between list items
  touchMin: 44,             // minimum touch target (iOS HIG)
  touchMinAndroid: 48,      // minimum touch target (Material)
  navBarHeight: 56,
  tabBarHeight: 83,         // includes home indicator space
  safeBottom: 34,           // iPhone home indicator
  safeTop: 47,              // iPhone notch/island
};

// ── Typography ────────────────────────────────────────────────
export const T = {
  // Size scale
  micro: 9,
  xs: 10,
  sm: 11,
  base: 14,      // NOTE: 14px is fine in RN; iOS pinch-zoom applies to Safari, not native
  md: 16,        // iOS body text standard
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,
  display: 64,

  // Weight — string literals for React Native fontWeight
  thin: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,

  // Line height ratios (multiply by font size)
  lineHeightBody: 1.5,
  lineHeightHeading: 1.15,
  lineHeightTight: 1.0,
  lineHeightRelaxed: 1.7,

  // Letter spacing (sp/pt)
  trackingTight: -0.5,
  trackingNormal: 0,
  trackingWide: 0.5,
  trackingWidest: 2,
  trackingUpper: 1,          // for all-caps labels
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',           // SF Pro (automatic via System)
    mono: 'Menlo',
    rounded: 'System',        // SF Pro Rounded not directly addressable without custom font
  },
  android: {
    sans: 'Roboto',
    mono: 'monospace',
    rounded: 'sans-serif-rounded',
  },
  default: {
    sans: 'System',
    mono: 'monospace',
    rounded: 'System',
  },
});

// ── Border Radius ─────────────────────────────────────────────
export const R = {
  none: 0,
  sm: 2,         // brutalist sharp corners
  md: 6,         // cards, inputs
  lg: 12,        // modal sheets
  xl: 20,        // pills, large containers
  '2xl': 28,     // bottom sheets
  full: 999,     // circular elements
};

// ── Shadows ───────────────────────────────────────────────────
// All elevation values include both iOS shadow props and Android elevation
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  // Design language shadows
  brutalist: {
    shadowColor: '#111111',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  brutalistSm: {
    shadowColor: '#111111',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  red: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  redSm: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ── Z-Index scale ─────────────────────────────────────────────
export const Z = {
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
};
