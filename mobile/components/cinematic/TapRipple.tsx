/**
 * TapRipple — brief flash ring that confirms tap-to-advance in cinematic mode.
 * Mount once inside CinematicResult; call `trigger()` on each tap.
 */
import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

export interface TapRippleHandle {
  trigger: () => void;
}

const TapRipple = forwardRef<TapRippleHandle>((_, ref) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useImperativeHandle(ref, () => ({
    trigger() {
      opacity.value = withSequence(
        withTiming(0.12, { duration: 60, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
      );
      scale.value = withSequence(
        withTiming(0.97, { duration: 60 }),
        withTiming(1, { duration: 200 })
      );
    },
  }));

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.ring, style]} pointerEvents="none" />;
});

TapRipple.displayName = 'TapRipple';
export default TapRipple;

const styles = StyleSheet.create({
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 0,
  },
});
