/**
 * LikertCircle — animated quiz answer circle.
 *
 * On selection: spring scale 1 → 1.2 → 1.0, border and fill animate to accent.
 * On deselect: springs back to neutral state.
 */
import { useEffect } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, T } from '../../constants/theme';

interface LikertCircleProps {
  value: number;
  label: string;
  size: number;
  isActive: boolean;
  onPress: () => void;
}

export default function LikertCircle({ value, label, size, isActive, onPress }: LikertCircleProps) {
  const scale = useSharedValue(1);
  const fill = useSharedValue(isActive ? 1 : 0);
  const borderProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    borderProgress.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    if (isActive) {
      // Spring pop on selection
      scale.value = withSpring(1.2, { damping: 10, stiffness: 500 }, () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
      });
    }
  }, [isActive]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      fill.value,
      [0, 1],
      ['transparent', Colors.accentDim]
    ),
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [Colors.line, Colors.accent]
    ),
    borderWidth: 1.5,
    width: size,
    height: size,
    borderRadius: size / 2,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(borderProgress.value, [0, 1], [Colors.t3, Colors.accent]),
  }));

  return (
    <Pressable
      style={styles.col}
      onPressIn={() => {
        if (!isActive) {
          scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        if (!isActive) {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }
      }}
      onPress={onPress}
    >
      <Animated.View style={circleStyle} />
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  col: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: T.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
