import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

interface ParticleFieldProps {
  count?: number;
  color: string;
  behavior?: 'drift' | 'burst' | 'converge';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  r: number;
  opacity: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
}

function generateParticles(count: number, behavior: string): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const isBurst = behavior === 'burst';
    return {
      id: i,
      x: isBurst ? W / 2 : Math.random() * W,
      y: isBurst ? H / 2 : Math.random() * H,
      r: 2 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.4,
      dx: (Math.random() - 0.5) * (isBurst ? 200 : 40),
      dy: (Math.random() - 0.5) * (isBurst ? 200 : 40),
      duration: 3000 + Math.random() * 4000,
      delay: Math.random() * 2000,
    };
  });
}

function AnimatedParticle({ p, color, behavior }: { p: Particle; color: string; behavior: string }) {
  const pos = useSharedValue(0);

  useEffect(() => {
    pos.value = withDelay(
      p.delay,
      behavior === 'burst'
        ? withTiming(1, { duration: 2000 })
        : withRepeat(
            withSequence(
              withTiming(1, { duration: p.duration }),
              withTiming(0, { duration: p.duration })
            ),
            -1
          )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const isConverge = behavior === 'converge';
    const targetX = isConverge ? W / 2 : p.x + p.dx;
    const targetY = isConverge ? H / 2 : p.y + p.dy;
    return {
      transform: [
        { translateX: p.x + (targetX - p.x) * pos.value },
        { translateY: p.y + (targetY - p.y) * pos.value },
      ],
      opacity: p.opacity * (behavior === 'burst' ? 1 - pos.value * 0.5 : 1),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: p.r * 2,
          height: p.r * 2,
          borderRadius: p.r,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export default function ParticleField({
  count = 25,
  color,
  behavior = 'drift',
}: ParticleFieldProps) {
  const particles = useMemo(() => generateParticles(count, behavior), [count, behavior]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <AnimatedParticle key={p.id} p={p} color={color} behavior={behavior} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
