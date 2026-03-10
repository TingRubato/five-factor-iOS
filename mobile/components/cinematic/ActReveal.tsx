/**
 * ActReveal — Dramatic archetype reveal.
 *
 * Sequence: dark overlay → light core pulse → burst → color glow bloom
 * → archetype name SLAMS in from 2.5x → 1x with heavy spring
 * → description typewriters in.
 */
import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, S, T } from '../../constants/theme';
import { Locale } from '../../lib/cinematic-utils';
import { Archetype } from '../../lib/archetypes';
import TypewriterText from './TypewriterText';

const { width: W, height: H } = Dimensions.get('window');

interface ActRevealProps {
  archetype: Archetype;
  locale: Locale;
}

export default function ActReveal({ archetype, locale }: ActRevealProps) {
  // ── Intro burst values ──────────────────────────────────────
  const coreScale = useSharedValue(0);
  const coreOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // ── Content reveal values ───────────────────────────────────
  const labelOpacity = useSharedValue(0);
  const nameScale = useSharedValue(2.5);
  const nameOpacity = useSharedValue(0);
  const enNameOpacity = useSharedValue(0);
  const enNameTransY = useSharedValue(20);
  const descOpacity = useSharedValue(0);
  const hintOpacity = useSharedValue(0);

  useEffect(() => {
    // Phase 1: Core dot appears and pulses (0–600ms)
    coreOpacity.value = withTiming(1, { duration: 400 });
    coreScale.value = withSequence(
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(1.3, { duration: 200 }),
    );

    // Phase 2: Burst outward (800ms)
    const burstTimer = setTimeout(() => {
      coreScale.value = withSpring(5, { damping: 6 });
      coreOpacity.value = withTiming(0, { duration: 400 });
      glowScale.value = withSpring(1, { damping: 10, stiffness: 80 });
      glowOpacity.value = withSequence(
        withTiming(0.5, { duration: 300 }),
        withTiming(0.12, { duration: 2000 }),
      );
    }, 800);

    // Phase 3: Clear overlay, reveal content (1200ms)
    const revealTimer = setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 500 });

      // Label
      labelOpacity.value = withTiming(1, { duration: 400 });

      // SLAM the archetype name (scale 2.5 → 1)
      nameOpacity.value = withTiming(1, { duration: 150 });
      nameScale.value = withSpring(1, { damping: 8, stiffness: 150 });

      // English name slides up
      enNameOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
      enNameTransY.value = withDelay(
        600,
        withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
      );

      // Description
      descOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));

      // Hint
      hintOpacity.value = withDelay(2800, withTiming(1, { duration: 400 }));
    }, 1200);

    return () => {
      clearTimeout(burstTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  // ── Animated styles ─────────────────────────────────────────
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const coreStyle = useAnimatedStyle(() => ({
    opacity: coreOpacity.value,
    transform: [{ scale: coreScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ scale: nameScale.value }],
  }));
  const enNameStyle = useAnimatedStyle(() => ({
    opacity: enNameOpacity.value,
    transform: [{ translateY: enNameTransY.value }],
  }));
  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Dark intro overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
        <Animated.View style={[styles.core, coreStyle]} />
      </Animated.View>

      {/* Color glow bloom */}
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: archetype.color,
            top: H / 2 - 150,
            left: W / 2 - 150,
          },
          glowStyle,
        ]}
        pointerEvents="none"
      />

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={labelStyle}>
          <Text style={styles.actLabel}>
            {locale === 'zh' ? '你的原型' : 'YOUR ARCHETYPE'}
          </Text>
        </Animated.View>

        <Animated.View style={nameStyle}>
          <Text
            style={[
              styles.nameZh,
              {
                color: archetype.color,
                textShadowColor: archetype.color + '60',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 30,
              },
            ]}
          >
            {archetype.nameZh}
          </Text>
        </Animated.View>

        <Animated.View style={enNameStyle}>
          <Text style={styles.nameEn}>The {archetype.nameEn}</Text>
        </Animated.View>

        <Animated.View style={descStyle}>
          <TypewriterText
            text={archetype.description}
            speed={25}
            delay={0}
            style={styles.description}
          />
        </Animated.View>

        <Animated.View style={[styles.hint, hintStyle]}>
          <Text style={styles.hintText}>
            {locale === 'zh' ? '轻触继续' : 'Tap to continue'}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    zIndex: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: S[10],
  },
  actLabel: {
    fontSize: T.xs,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 3,
    marginBottom: S[8],
  },
  nameZh: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: S[2],
  },
  nameEn: {
    fontSize: T.xl,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t2,
    marginBottom: S[10],
  },
  description: {
    fontSize: T.md,
    fontWeight: '300',
    color: Colors.t2,
    lineHeight: 26,
  },
  hint: {
    position: 'absolute',
    bottom: S[16],
    alignSelf: 'center',
  },
  hintText: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 2,
  },
});
