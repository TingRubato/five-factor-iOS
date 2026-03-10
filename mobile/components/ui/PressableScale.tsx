/**
 * PressableScale — drop-in replacement for TouchableOpacity.
 *
 * Design decisions:
 * - Spring physics gives satisfying tactile feel vs flat opacity fade
 * - Haptic feedback fires on press-in for immediate confirmation
 * - Reduced-motion: falls back to opacity-only (no scale) when system enabled
 * - accessibilityRole defaults to "button" — override when needed
 * - Hit slop extends touch target when visual size < 44pt minimum
 *
 * Usage:
 *   <PressableScale onPress={fn} scale={0.96} haptic>
 *     <Text>Tap me</Text>
 *   </PressableScale>
 */
import { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spring, Duration, ScaleValues, Opacity } from '@/constants/motion';
import { Touch } from '@/constants/layout';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'none';

interface PressableScaleProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  /** Scale target on press-in. Default 0.96. Use 0.98 for large cards. */
  scale?: number;
  /** Haptic style on press. Default 'light'. Set to 'none' or false to disable. */
  haptic?: HapticStyle | false;
  /** Expand touch target to minimum 44pt on all sides. Default false. */
  expandHitSlop?: boolean;
  children?: React.ReactNode;
}

const hapticMap: Record<HapticStyle, (() => void) | null> = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  selection: () => Haptics.selectionAsync(),
  none: null,
};

export default function PressableScale({
  style,
  scale = ScaleValues.press,
  haptic = 'light',
  expandHitSlop = false,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: PressableScaleProps) {
  const s = useSharedValue(1);
  const opacity = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const fireHaptic = useCallback(() => {
    if (disabled || !haptic || haptic === 'none') return;
    hapticMap[haptic]?.();
  }, [haptic, disabled]);

  const animStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      // Accessibility: opacity-only feedback, no scale
      return { opacity: opacity.value };
    }
    return {
      transform: [{ scale: s.value }],
      opacity: disabled ? Opacity.disabledContent : 1,
    };
  });

  const hitSlop = expandHitSlop
    ? { top: Touch.targetPadding, bottom: Touch.targetPadding, left: Touch.targetPadding, right: Touch.targetPadding }
    : undefined;

  return (
    <Pressable
      onPressIn={(e) => {
        if (reduceMotion) {
          opacity.value = withTiming(0.6, { duration: Duration.tapFeedback });
        } else {
          s.value = withSpring(scale, Spring.snappy);
        }
        runOnJS(fireHaptic)();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (reduceMotion) {
          opacity.value = withTiming(1, { duration: Duration.tapFeedback });
        } else {
          s.value = withSpring(ScaleValues.identity, Spring.snappy);
        }
        onPressOut?.(e);
      }}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={hitSlop}
      {...rest}
    >
      <Animated.View style={[style, animStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
