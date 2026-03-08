import { Platform } from 'react-native';

// ── Core Palette ──────────────────────────────────────────────
export const Colors = {
  accent: '#FF3B30',
  accentDim: 'rgba(255, 59, 48, 0.08)',
  accentMid: 'rgba(255, 59, 48, 0.15)',
  accentGlow: 'rgba(255, 59, 48, 0.30)',

  black: '#111111',
  white: '#FFFFFF',
  bg: '#FAFAFA',
  card: '#FFFFFF',

  // Text hierarchy
  t1: '#111111',   // primary
  t2: '#8E8E93',   // secondary
  t3: '#AEAEB2',   // tertiary/placeholder

  // Borders
  line: '#E5E5EA',
  lineStrong: '#D1D1D6',

  // Community / archetype colors
  serendipity: '#5856D6',
  serendipityDim: 'rgba(88,86,214,0.10)',
  success: '#34C759',
  successDim: 'rgba(52,199,89,0.10)',
  warning: '#FF9500',
  warningDim: 'rgba(255,149,0,0.10)',
};

// ── Spacing (8px base) ────────────────────────────────────────
export const S = {
  2: 4,
  4: 8,
  6: 12,
  8: 16,
  10: 20,
  12: 24,
  16: 32,
  20: 40,
  24: 48,
  32: 64,
};

// ── Typography ────────────────────────────────────────────────
export const T = {
  // Size
  micro: 9,
  xs: 10,
  sm: 11,
  base: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,

  // Weight helpers (as numbers for fontWeight)
  thin: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Fonts = Platform.select({
  ios: { sans: 'System', mono: 'Menlo' },
  default: { sans: 'System', mono: 'monospace' },
});

// ── Border Radius ─────────────────────────────────────────────
export const R = {
  sm: 2,
  md: 6,
  lg: 12,
  xl: 20,
  full: 999,
};

// ── Shadows ───────────────────────────────────────────────────
export const Shadows = {
  none: {},
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
  brutalist: {
    shadowColor: '#111111',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  red: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};
