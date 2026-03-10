/**
 * DimensionBar — animated spectrum gauge showing where a score falls.
 * Fill animates from 0 → score, pulsing glowing dot marks the position.
 */
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, T, S } from '../../constants/theme';

const DOT_SIZE = 10;

interface DimensionBarProps {
  score: number;    // 0–100
  color: string;
  width: number;    // track width in px
  delay?: number;
}

export default function DimensionBar({ score, color, width, delay = 800 }: DimensionBarProps) {
  const fill = useSharedValue(0);
  const dotScale = useSharedValue(0);
  const dotPulse = useSharedValue(1);

  useEffect(() => {
    fill.value = withDelay(delay, withTiming(score / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    }));
    dotScale.value = withDelay(delay + 1000, withTiming(1, { duration: 300 }));
    dotPulse.value = withDelay(delay + 1300, withRepeat(
      withSequence(
        withTiming(1.5, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
    ));
  }, [score, delay]);

  const fillStyle = useAnimatedStyle(() => ({
    width: fill.value * width,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    left: fill.value * width - DOT_SIZE / 2,
    transform: [{ scale: dotScale.value * dotPulse.value }],
    opacity: dotScale.value,
  }));

  return (
    <View style={[styles.wrapper, { width }]}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
        <Animated.View
          style={[styles.dot, { backgroundColor: color, shadowColor: color }, dotStyle]}
        />
      </View>
      <View style={styles.tierLabels}>
        <Text style={styles.tierText}>LOW</Text>
        <Text style={styles.tierText}>MID</Text>
        <Text style={styles.tierText}>HIGH</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: S[6],
  },
  track: {
    height: 2,
    backgroundColor: Colors.line,
    borderRadius: 1,
    overflow: 'visible',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
    top: -(DOT_SIZE / 2) + 1,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 4,
  },
  tierLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: S[2],
  },
  tierText: {
    fontSize: 8,
    color: Colors.t3,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
});
