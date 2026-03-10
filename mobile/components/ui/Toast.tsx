/**
 * Toast — Non-blocking feedback messages.
 *
 * Design decisions:
 * - Bottom-anchored (primary thumb zone) not top (iOS-style)
 * - 4 types: success, error, info, warning
 * - Auto-dismiss after duration (default 3s)
 * - Slide-up entry, fade-out exit
 * - Single instance via context (new toast replaces old)
 * - Leading icon + color reinforce meaning (not color-only)
 * - Tappable to dismiss early
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast({ type: 'success', message: 'Post created' });
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Platform } from 'react-native';
import { Colors, T, R, S, Shadows, Fonts } from '@/constants/theme';
import { Spring, Duration } from '@/constants/motion';
import { Z } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

const typeConfig: Record<ToastType, { icon: string; bg: string; text: string }> = {
  success: { icon: '✓', bg: Colors.successText, text: Colors.white },
  error:   { icon: '✕', bg: Colors.errorText,   text: Colors.white },
  info:    { icon: 'i', bg: Colors.infoText,    text: Colors.white },
  warning: { icon: '!', bg: Colors.warningText, text: Colors.white },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const safeBottom = Platform.select({ ios: 34, android: 0, default: 0 }) ?? 0;

  const dismiss = useCallback(() => {
    opacity.value = withTiming(0, { duration: Duration.toastExit });
    translateY.value = withTiming(100, { duration: Duration.toastExit }, () => {
      runOnJS(setToast)(null);
    });
  }, []);

  const showToast = useCallback((config: ToastConfig) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setToast(config);
    translateY.value = 100;
    opacity.value = 0;
    translateY.value = withSpring(0, Spring.gentle);
    opacity.value = withTiming(1, { duration: Duration.toastEnter });
    dismissTimer.current = setTimeout(dismiss, config.duration ?? 3000);
  }, [dismiss]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            { bottom: safeBottom + S[8] },
            animStyle,
          ]}
        >
          <Pressable onPress={dismiss} style={styles.inner}>
            <View style={[styles.icon, { backgroundColor: typeConfig[toast.type].bg }]}>
              <Text style={styles.iconText}>{typeConfig[toast.type].icon}</Text>
            </View>
            <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: S[8],
    right: S[8],
    zIndex: Z.toast,
    ...Shadows.lg,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderRadius: R.md,
    paddingRight: S[8],
    overflow: 'hidden',
    gap: S[6],
  },
  icon: {
    width: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: Colors.white,
    fontSize: T.sm,
    fontWeight: T.bold,
    fontFamily: Fonts?.mono,
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: T.base,
    fontWeight: T.medium,
    paddingVertical: S[6],
    lineHeight: T.base * 1.4,
  },
});
