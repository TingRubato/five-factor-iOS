/**
 * QuizBackground — whisper-thin dimension-tinted aurora wash.
 *
 * Mounts behind the quiz content and shifts color whenever the
 * current Big Five dimension changes. Opacity ~3% so it never
 * competes with the question text.
 */
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { DIM_COLORS } from '../../constants/theme';

interface QuizBackgroundProps {
  dimension: string;
}

export default function QuizBackground({ dimension }: QuizBackgroundProps) {
  const blob1X = useSharedValue(-80);
  const blob1Y = useSharedValue(-60);
  const blob2X = useSharedValue(60);
  const blob2Y = useSharedValue(200);
  const opacity = useSharedValue(0);

  const color = DIM_COLORS[dimension] ?? '#FF3B30';

  // Fade out, shift blobs, fade back in on dimension change
  useEffect(() => {
    opacity.value = withTiming(0, { duration: 200 }, () => {
      blob1X.value = withTiming(-80 + Math.random() * 40 - 20, { duration: 600 });
      blob1Y.value = withTiming(-60 + Math.random() * 40 - 20, { duration: 600 });
      blob2X.value = withTiming(60 + Math.random() * 40 - 20, { duration: 600 });
      blob2Y.value = withTiming(200 + Math.random() * 40 - 20, { duration: 600 });
      opacity.value = withTiming(1, { duration: 400 });
    });
  }, [dimension]);

  const blob1Style = useAnimatedStyle(() => ({
    backgroundColor: color,
    transform: [
      { translateX: blob1X.value },
      { translateY: blob1Y.value },
    ],
    opacity: opacity.value,
  }));

  const blob2Style = useAnimatedStyle(() => ({
    backgroundColor: color,
    transform: [
      { translateX: blob2X.value },
      { translateY: blob2Y.value },
    ],
    opacity: opacity.value * 0.6,
  }));

  return (
    <>
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
      <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
    </>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.03,
  },
  blob1: { top: 0, right: -40 },
  blob2: { bottom: 40, left: -60 },
});
