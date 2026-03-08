import { useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

  const animatedProps = useAnimatedProps(() => {
    const isConverge = behavior === 'converge';
    const targetX = isConverge ? W / 2 : p.x + p.dx;
    const targetY = isConverge ? H / 2 : p.y + p.dy;
    return {
      cx: p.x + (targetX - p.x) * pos.value,
      cy: p.y + (targetY - p.y) * pos.value,
      opacity: p.opacity * (behavior === 'burst' ? 1 - pos.value * 0.5 : 1),
    };
  });

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      r={p.r}
      fill={color}
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
    <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
      {particles.map((p) => (
        <AnimatedParticle key={p.id} p={p} color={color} behavior={behavior} />
      ))}
    </Svg>
  );
}
