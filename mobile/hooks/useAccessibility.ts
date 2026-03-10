/**
 * useAccessibility — Centralised accessibility feature detection.
 *
 * Consolidates all AccessibilityInfo API calls into one hook.
 * Components use these flags to adapt their behavior.
 *
 * Usage:
 *   const { reduceMotion, boldText, highContrast } = useAccessibility();
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

interface AccessibilityState {
  /** User has "Reduce Motion" enabled in system settings */
  reduceMotion: boolean;
  /** User has "Bold Text" enabled in system settings */
  boldText: boolean;
  /** User has "Increase Contrast" / "Differentiate Without Color" enabled */
  highContrast: boolean;
  /** A screen reader (VoiceOver/TalkBack) is currently active */
  screenReader: boolean;
  /** Accessibility features have been loaded (false during init) */
  ready: boolean;
}

export function useAccessibility(): AccessibilityState {
  const [state, setState] = useState<AccessibilityState>({
    reduceMotion: false,
    boldText: false,
    highContrast: false,
    screenReader: false,
    ready: false,
  });

  useEffect(() => {
    let mounted = true;

    Promise.all([
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isBoldTextEnabled(),
      AccessibilityInfo.isHighTextContrastEnabled?.() ?? Promise.resolve(false),
      AccessibilityInfo.isScreenReaderEnabled(),
    ]).then(([reduceMotion, boldText, highContrast, screenReader]) => {
      if (!mounted) return;
      setState({ reduceMotion, boldText, highContrast, screenReader, ready: true });
    });

    const subscriptions = [
      AccessibilityInfo.addEventListener('reduceMotionChanged', (v) =>
        setState((s) => ({ ...s, reduceMotion: v }))),
      AccessibilityInfo.addEventListener('boldTextChanged', (v) =>
        setState((s) => ({ ...s, boldText: v }))),
      AccessibilityInfo.addEventListener('screenReaderChanged', (v) =>
        setState((s) => ({ ...s, screenReader: v }))),
    ];

    return () => {
      mounted = false;
      subscriptions.forEach((sub) => sub.remove());
    };
  }, []);

  return state;
}
