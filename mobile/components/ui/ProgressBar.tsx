/**
 * ProgressBar — quiz progress with a pulsing accent dot at the leading edge.
 *
 * Props:
 *   value  0.0 – 1.0
 *   height  bar thickness (default 2)
 */
import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

const { width: W } = Dimensions.get('window');
const DOT_SIZE = 8;

interface ProgressBarProps {
  value: number;   // 0 – 1
  height?: number;
}

export default function ProgressBar({ value, height = 2 }: ProgressBarProps) {
  const fill = useSharedValue(value);
  const dotScale = useSharedValue(1);

  // Update fill
  useEffect(() => {
    fill.value = withTiming(value, { duration: 350 });
  }, [value]);

  // Continuous pulse on the dot
  useEffect(() => {
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1
    );
  }, []);

  const fillStyle = useAnimatedStyle(() => ({
    width: fill.value * W,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    // Dot trails the fill tip
    left: fill.value * W - DOT_SIZE / 2,
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, { height }, fillStyle]} />
      <Animated.View style={[styles.dot, dotStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.line,
    overflow: 'visible',
  },
  fill: {
    backgroundColor: Colors.accent,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dot: {
    position: 'absolute',
    top: -DOT_SIZE / 2 + 1,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
});
