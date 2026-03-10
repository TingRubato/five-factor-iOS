/**
 * useThemeColor — Returns the appropriate color value for current color scheme.
 *
 * Prefers explicit prop override, then falls back to dark/light token maps.
 *
 * Usage:
 *   const bg = useThemeColor({ light: '#fff', dark: '#000' }, 'bg');
 */
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type DarkTokens = typeof Colors.dark;

export function useThemeColor(
  props: { light?: string; dark?: string },
  tokenName: keyof DarkTokens
) {
  const scheme = useColorScheme() ?? 'light';
  const fromProps = props[scheme];
  if (fromProps) return fromProps;

  if (scheme === 'dark') {
    return Colors.dark[tokenName];
  }
  // Fall back to light token from top-level Colors (use same key)
  return (Colors as Record<string, unknown>)[tokenName] as string ?? Colors.dark[tokenName];
}
