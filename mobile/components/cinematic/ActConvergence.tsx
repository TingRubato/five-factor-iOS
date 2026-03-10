/**
 * ActConvergence — Score constellation assembly.
 *
 * Five dimension dots fly from center to their radar positions (staggered),
 * each in its dimension color. Then the full RadarChart cross-dissolves in.
 */
import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import RadarChart from '../RadarChart';
import { Colors, S } from '../../constants/theme';
import { Dim, DIM_COLORS } from '../../lib/cinematic-utils';

const { width: W } = Dimensions.get('window');
const CHART_SIZE = W * 0.75;
const CENTER = CHART_SIZE / 2;
const RADIUS = CENTER * 0.65;
const DIMS: Dim[] = ['O', 'C', 'E', 'A', 'N'];
const DOT_SIZE = 10;
const STAGGER = 350;    // ms between each dot
const FLY_DUR = 800;    // ms for each dot to reach target
const FIRST_DELAY = 400; // delay before first dot

// ── Per-dot sub-component (own hooks, avoids rules-of-hooks issue) ──

interface ConstellationDotProps {
  targetX: number;
  targetY: number;
  color: string;
  flyDelay: number;
  fadeOutAt: number;
}

function ConstellationDot({
  targetX,
  targetY,
  color,
  flyDelay,
  fadeOutAt,
}: ConstellationDotProps) {
  const x = useSharedValue(CENTER - DOT_SIZE / 2);
  const y = useSharedValue(CENTER - DOT_SIZE / 2);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Fly in
    opacity.value = withDelay(flyDelay, withTiming(1, { duration: 250 }));
    scale.value = withDelay(flyDelay, withSpring(1, { damping: 12 }));
    x.value = withDelay(
      flyDelay,
      withTiming(targetX, { duration: FLY_DUR, easing: Easing.out(Easing.cubic) }),
    );
    y.value = withDelay(
      flyDelay,
      withTiming(targetY, { duration: FLY_DUR, easing: Easing.out(Easing.cubic) }),
    );

    // Fade out when chart appears
    const fadeTimer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
    }, fadeOutAt);

    return () => clearTimeout(fadeTimer);
  }, []);

  const style = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color, shadowColor: color },
        style,
      ]}
    />
  );
}

// ── Main component ──────────────────────────────────────────────

interface ActConvergenceProps {
  scores: Record<string, number>;
  onComplete: () => void;
}

export default function ActConvergence({ scores, onComplete }: ActConvergenceProps) {
  const chartOpacity = useSharedValue(0);

  // Pre-compute dot targets (pentagon positions scaled by score)
  const dots = useMemo(
    () =>
      DIMS.map((dim, i) => {
        const angle = -Math.PI / 2 + i * ((2 * Math.PI) / 5);
        const score = scores[dim] ?? 50;
        const r = RADIUS * (score / 100);
        return {
          dim,
          targetX: CENTER + r * Math.cos(angle) - DOT_SIZE / 2,
          targetY: CENTER + r * Math.sin(angle) - DOT_SIZE / 2,
          color: DIM_COLORS[dim].deep,
          flyDelay: FIRST_DELAY + i * STAGGER,
        };
      }),
    [scores],
  );

  // When last dot lands → fade in chart
  const lastDotLands = FIRST_DELAY + 4 * STAGGER + FLY_DUR;
  const chartFadeIn = lastDotLands + 200;
  const dotFadeOut = chartFadeIn + 300;

  useEffect(() => {
    chartOpacity.value = withDelay(
      chartFadeIn,
      withTiming(1, { duration: 800 }),
    );

    const timer = setTimeout(onComplete, dotFadeOut + 1200);
    return () => clearTimeout(timer);
  }, []);

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)}>
        <Animated.Text style={styles.labelText}>CONVERGENCE</Animated.Text>
      </Animated.View>

      <View style={[styles.chartArea, { width: CHART_SIZE, height: CHART_SIZE }]}>
        {/* Constellation dots */}
        {dots.map((d) => (
          <ConstellationDot
            key={d.dim}
            targetX={d.targetX}
            targetY={d.targetY}
            color={d.color}
            flyDelay={d.flyDelay}
            fadeOutAt={dotFadeOut}
          />
        ))}

        {/* Radar chart cross-dissolves in */}
        <Animated.View style={[styles.chartWrap, chartStyle]}>
          <RadarChart
            scores={scores}
            size={CHART_SIZE}
            color={Colors.accent}
            radiusRatio={0.65}
            labelOffset={18}
            showLabels={true}
            showGradient={true}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 3,
    marginBottom: S[8],
    textAlign: 'center',
  },
  chartArea: {
    position: 'relative',
  },
  chartWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
