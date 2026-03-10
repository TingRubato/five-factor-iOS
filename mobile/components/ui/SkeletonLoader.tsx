/**
 * SkeletonLoader — Animated loading placeholder.
 *
 * Design decisions:
 * - Shimmer animation signals "content is loading" without spinner (less anxious)
 * - Matches the shape of the real content for zero layout shift
 * - Uses opacity pulse (not translateX shimmer) for simplicity and performance
 * - Respects reduceMotion: static when enabled
 *
 * Usage:
 *   <Skeleton width="100%" height={20} borderRadius={4} />
 *   <Skeleton circle size={44} />
 */
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  useReducedMotion,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { R, Colors } from '@/constants/theme';
import { Skeleton } from '@/constants/motion';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  circle?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = R.sm,
  circle = false,
  size,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue<number>(Skeleton.baseOpacity);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(Skeleton.highlightOpacity, { duration: Skeleton.duration / 2 }),
        withTiming(Skeleton.baseOpacity, { duration: Skeleton.duration / 2 })
      ),
      -1,
      false
    );
  }, [reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const resolvedSize = circle ? (size ?? 44) : undefined;

  return (
    <Animated.View
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      style={[
        styles.base,
        {
          width: circle ? resolvedSize : width,
          height: circle ? resolvedSize : height,
          borderRadius: circle ? (resolvedSize! / 2) : borderRadius,
        },
        animStyle,
        style,
      ]}
    />
  );
}

// Preset layout skeletons for common patterns
export function CardSkeleton() {
  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.header}>
        <SkeletonLoader circle size={32} />
        <View style={cardStyles.headerText}>
          <SkeletonLoader width="40%" height={10} />
          <SkeletonLoader width="60%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <SkeletonLoader height={14} style={{ marginTop: 12 }} />
      <SkeletonLoader width="80%" height={14} style={{ marginTop: 6 }} />
      <SkeletonLoader width="60%" height={14} style={{ marginTop: 6 }} />
    </View>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <View style={profileStyles.container}>
      <SkeletonLoader circle size={80} />
      <View style={{ marginTop: 12, alignItems: 'center', gap: 6 }}>
        <SkeletonLoader width={140} height={20} />
        <SkeletonLoader width={100} height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.black,
  },
});

const cardStyles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { flex: 1, gap: 4 },
});

const profileStyles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
});
