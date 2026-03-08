import { getLocales } from 'expo-localization';

// ── Types ────────────────────────────────────────────────────────
export type Dim = 'O' | 'C' | 'E' | 'A' | 'N';
export type Tier = 'high' | 'mid' | 'low';
export type Locale = 'en' | 'zh';

export interface DimInfo {
  dim: Dim;
  score: number;
  tier: Tier;
}

// ── Dimension full names ─────────────────────────────────────────
export const DIM_NAMES: Record<Dim, { en: string; zh: string }> = {
  O: { en: 'OPENNESS', zh: '开放性' },
  C: { en: 'CONSCIENTIOUSNESS', zh: '尽责性' },
  E: { en: 'EXTRAVERSION', zh: '外向性' },
  A: { en: 'AGREEABLENESS', zh: '宜人性' },
  N: { en: 'NEUROTICISM', zh: '神经质' },
};

// ── Aurora color palettes per dimension ──────────────────────────
export const DIM_COLORS: Record<Dim, { light: string; deep: string; particle: string }> = {
  O: { light: '#E8DEF8', deep: '#AF52DE', particle: '#C39BEA' },
  C: { light: '#D1FAE5', deep: '#30B0C7', particle: '#6DD5C0' },
  E: { light: '#FFE4E6', deep: '#FF3B30', particle: '#FF8A80' },
  A: { light: '#E0F2FE', deep: '#5AC8FA', particle: '#87DCFD' },
  N: { light: '#FEF3C7', deep: '#FF9500', particle: '#FFD166' },
};

// ── Score → Tier ────────────────────────────────────────────────
export function scoreTier(score: number): Tier {
  if (score >= 70) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
}

// ── Sort dimensions by score (descending) ───────────────────────
const DIMS: Dim[] = ['O', 'C', 'E', 'A', 'N'];

export function sortDimensions(scores: Record<string, number>): DimInfo[] {
  return DIMS
    .map((dim) => ({
      dim,
      score: scores[dim] ?? 50,
      tier: scoreTier(scores[dim] ?? 50),
    }))
    .sort((a, b) => b.score - a.score);
}

// ── Detect locale ───────────────────────────────────────────────
export function detectLocale(): Locale {
  try {
    const lang = getLocales()[0]?.languageCode ?? 'en';
    return lang.startsWith('zh') ? 'zh' : 'en';
  } catch {
    return 'en';
  }
}

// ── Top-2 dimension pair key (alphabetically sorted) ────────────
export function pairKey(d1: Dim, d2: Dim): string {
  return [d1, d2].sort().join('_');
}

// ── Check if user is "Balanced Breaker" ─────────────────────────
export function isBalanced(scores: Record<string, number>): boolean {
  const vals = DIMS.map((d) => scores[d] ?? 50);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  return max - min <= 5;
}
