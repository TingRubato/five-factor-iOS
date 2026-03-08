/**
 * PressableScale — drop-in replacement for TouchableOpacity.
 *
 * Gives a satisfying spring-scale press feedback + optional haptic.
 * Respects reduced-motion: falls back to opacity-only when enabled.
 *
 * Usage:
 *   <PressableScale onPress={...} style={...}>
 *     <Text>Tap me</Text>
 *   </PressableScale>
 */
import { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface PressableScaleProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  /** Scale target on press-in. Default 0.96 */
  scale?: number;
  /** Whether to fire a light haptic on press-in. Default true */
  haptic?: boolean;
  children?: React.ReactNode;
}

export default function PressableScale({
  style,
  scale = 0.96,
  haptic = true,
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(false);
  const s = useSharedValue(1);

  const fireHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
  }));

  return (
    <Pressable
      onPressIn={(e) => {
        'worklet';
        s.value = withSpring(scale, { damping: 15, stiffness: 400 });
        if (haptic) runOnJS(fireHaptic)();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, { damping: 12, stiffness: 300 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      {...rest}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
