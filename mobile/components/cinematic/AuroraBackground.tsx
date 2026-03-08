import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { height: H } = Dimensions.get('window');

interface AuroraBackgroundProps {
  lightColor: string;
  deepColor: string;
}

export default function AuroraBackground({ lightColor, deepColor }: AuroraBackgroundProps) {
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);

  useEffect(() => {
    drift1.value = withRepeat(
      withSequence(withTiming(1, { duration: 6000 }), withTiming(0, { duration: 6000 })),
      -1
    );
    drift2.value = withRepeat(
      withSequence(withTiming(1, { duration: 8000 }), withTiming(0, { duration: 8000 })),
      -1
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => ({
    backgroundColor: lightColor,
    transform: [
      { translateX: drift1.value * 30 - 15 },
      { translateY: drift1.value * -40 + 20 },
      { scale: 1 + drift1.value * 0.15 },
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    backgroundColor: deepColor,
    transform: [
      { translateX: drift2.value * -25 + 10 },
      { translateY: drift2.value * 35 - 15 },
      { scale: 1.1 - drift2.value * 0.1 },
    ],
  }));

  const blob3Style = useAnimatedStyle(() => ({
    backgroundColor: lightColor,
    opacity: 0.3,
    transform: [
      { translateX: drift1.value * -20 },
      { translateY: drift2.value * 20 },
      { scale: 0.8 + drift2.value * 0.2 },
    ],
  }));

  return (
    <>
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
      <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
      <Animated.View style={[styles.blob, styles.blob3, blob3Style]} />
    </>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
  },
  blob1: { top: -80, right: -60, width: 350, height: 350 },
  blob2: { bottom: 80, left: -80, width: 300, height: 300 },
  blob3: { top: H * 0.4, right: -40, width: 200, height: 200 },
});
