import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import RadarChart from '../RadarChart';
import { Colors, S } from '../../constants/theme';

const { width: W } = Dimensions.get('window');

interface ActConvergenceProps {
  scores: Record<string, number>;
  onComplete: () => void;
}

export default function ActConvergence({ scores, onComplete }: ActConvergenceProps) {
  const chartOpacity = useSharedValue(0);
  const chartScale = useSharedValue(0.6);

  useEffect(() => {
    chartOpacity.value = withDelay(500, withTiming(1, { duration: 1500 }));
    chartScale.value = withDelay(500, withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.cubic),
    }));

    const timer = setTimeout(onComplete, 3800);
    return () => clearTimeout(timer);
  }, []);

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ scale: chartScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)}>
        <Animated.Text style={styles.labelText}>CONVERGENCE</Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.chartWrap, chartStyle]}>
        <RadarChart
          scores={scores}
          size={W * 0.75}
          color={Colors.accent}
          radiusRatio={0.65}
          labelOffset={18}
          showLabels={true}
          showGradient={true}
        />
      </Animated.View>
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
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
