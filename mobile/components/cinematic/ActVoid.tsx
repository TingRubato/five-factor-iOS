import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import ParticleField from './ParticleField';

interface ActVoidProps {
  onComplete: () => void;
}

export default function ActVoid({ onComplete }: ActVoidProps) {
  const coreScale = useSharedValue(0);
  const coreOpacity = useSharedValue(0);
  const [showBurst, setShowBurst] = useState(false);
  const bgOpacity = useSharedValue(1);

  useEffect(() => {
    // Phase 1: core appears and pulses (0-1.5s)
    coreOpacity.value = withTiming(1, { duration: 800 });
    coreScale.value = withSequence(
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(1.3, { duration: 400 }),
      withTiming(0.9, { duration: 300 }),
    );

    // Phase 2: burst (1.5s)
    const burstTimer = setTimeout(() => {
      coreScale.value = withSpring(3, { damping: 8 });
      coreOpacity.value = withTiming(0, { duration: 500 });
      setShowBurst(true);
    }, 1500);

    // Phase 3: transition out (2.8s)
    const outTimer = setTimeout(() => {
      bgOpacity.value = withTiming(0, { duration: 500 });
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(burstTimer);
      clearTimeout(outTimer);
    };
  }, []);

  const coreStyle = useAnimatedStyle(() => ({
    opacity: coreOpacity.value,
    transform: [{ scale: coreScale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      <Animated.View style={[styles.core, coreStyle]} />
      {showBurst && (
        <ParticleField count={30} color="rgba(255,255,255,0.6)" behavior="burst" />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  core: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
});
