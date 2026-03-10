import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import TapRipple, { TapRippleHandle } from './TapRipple';
import { View, StyleSheet, BackHandler } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  sortDimensions,
  detectLocale,
  isBalanced,
  DIM_COLORS,
  DimInfo,
  Locale,
} from '../../lib/cinematic-utils';
import { getArchetypeByName, Archetype } from '../../lib/archetypes';

import AuroraBackground from './AuroraBackground';
import ParticleField from './ParticleField';
import ActIndicator from './ActIndicator';
import ActVoid from './ActVoid';
import ActDimension from './ActDimension';
import ActTension from './ActTension';
import ActConvergence from './ActConvergence';
import ActReveal from './ActReveal';
import ActReport from './ActReport';

const TOTAL_ACTS = 8;

interface CinematicResultProps {
  scores: Record<string, number>;
  archetypeName: string;
}

export default function CinematicResult({ scores, archetypeName }: CinematicResultProps) {
  const router = useRouter();
  const [act, setAct] = useState(0);

  const locale: Locale = useMemo(() => detectLocale(), []);
  const sorted: DimInfo[] = useMemo(() => sortDimensions(scores), [scores]);
  const balanced = useMemo(() => isBalanced(scores), [scores]);
  const archetype: Archetype = useMemo(
    () => getArchetypeByName(archetypeName) ?? getArchetypeByName('Explorer Creator')!,
    [archetypeName]
  );

  const topDim = sorted[0];
  const secondDim = sorted[1];
  const lowestDim = sorted[sorted.length - 1];

  // Aurora colors per act
  const auroraColors = useMemo(() => {
    switch (act) {
      case 0: return { light: '#FFFFFF', deep: '#E5E5EA' };
      case 1: return { light: DIM_COLORS[topDim.dim].light, deep: DIM_COLORS[topDim.dim].deep };
      case 2: return { light: DIM_COLORS[secondDim.dim].light, deep: DIM_COLORS[secondDim.dim].deep };
      case 3: return { light: DIM_COLORS[lowestDim.dim].light, deep: DIM_COLORS[lowestDim.dim].deep };
      case 4: return { light: DIM_COLORS[topDim.dim].light, deep: DIM_COLORS[secondDim.dim].deep };
      case 5: return { light: '#FFE4E6', deep: '#FF3B30' };
      case 6: return { light: archetype.color + '30', deep: archetype.color };
      case 7: return { light: '#F0F0F0', deep: '#E5E5EA' };
      default: return { light: '#FFFFFF', deep: '#E5E5EA' };
    }
  }, [act, topDim, secondDim, lowestDim, archetype]);

  // Particle color per act
  const particleColor = useMemo(() => {
    if (act === 0) return 'rgba(255,255,255,0.3)';
    if (act >= 1 && act <= 3) {
      const dimIdx = act === 1 ? 0 : act === 2 ? 1 : sorted.length - 1;
      return DIM_COLORS[sorted[dimIdx].dim].particle;
    }
    if (act === 4) return DIM_COLORS[topDim.dim].particle;
    if (act === 5) return '#FF8A80';
    if (act === 6) return archetype.color + '80';
    return '#D1D1D6';
  }, [act, sorted, topDim, archetype]);

  const particleBehavior = useMemo(() => {
    if (act === 0) return 'burst' as const;
    if (act === 5) return 'converge' as const;
    return 'drift' as const;
  }, [act]);

  const rippleRef = useRef<TapRippleHandle>(null);

  // Debounce guard against rapid tapping
  const lastNav = useRef(0);
  const canNavigate = useCallback(() => {
    const now = Date.now();
    if (now - lastNav.current < 500) return false;
    lastNav.current = now;
    return true;
  }, []);

  // Auto-advance for Acts 0 and 5
  const autoAdvance = useCallback(() => {
    setAct((a) => Math.min(a + 1, TOTAL_ACTS - 1));
  }, []);

  // Manual advance (tap/swipe) — blocked during auto-play acts
  const advance = useCallback(() => {
    if (act === 0 || act === 5) return;
    if (!canNavigate()) return;
    rippleRef.current?.trigger();
    setAct((a) => Math.min(a + 1, TOTAL_ACTS - 1));
  }, [act, canNavigate]);

  const goBack = useCallback(() => {
    if (!canNavigate()) return;
    setAct((a) => Math.max(a - 1, 0));
  }, [canNavigate]);

  const skipToReveal = useCallback(() => {
    setAct(6);
  }, []);

  const enterWorld = useCallback(() => {
    router.replace('/(tabs)/profile');
  }, [router]);

  // Android hardware back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (act > 0) {
        goBack();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [act, goBack]);

  // Gestures: tap to advance, swipe to navigate
  // Callbacks run on UI thread — must use runOnJS for state updates
  // Disable tap gesture on report act so ScrollView works
  const tap = Gesture.Tap()
    .enabled(act < 7)
    .onEnd(() => {
      'worklet';
      runOnJS(advance)();
    });
  const swipe = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -50) runOnJS(advance)();
      else if (e.translationX > 50) runOnJS(goBack)();
    });
  const gesture = Gesture.Race(swipe, tap);

  // Act labels
  const actLabels = [
    '',
    locale === 'zh' ? '第一束光' : 'FIRST LIGHT',
    locale === 'zh' ? '暗流' : 'THE UNDERCURRENT',
    locale === 'zh' ? '暗影' : 'THE SHADOW',
  ];

  return (
    <GestureDetector gesture={gesture}>
      <SafeAreaView style={styles.container}>
        {/* Aurora layer — always mounted, opacity-toggled to prevent flicker */}
        <View
          style={[StyleSheet.absoluteFill, { opacity: (act > 0 && act < 7) ? 1 : 0 }]}
          pointerEvents={(act > 0 && act < 7) ? "auto" : "none"}
        >
          <AuroraBackground lightColor={auroraColors.light} deepColor={auroraColors.deep} />
        </View>

        {/* Particle layer — always mounted, opacity-toggled */}
        <View
          style={[StyleSheet.absoluteFill, { opacity: (act > 0 && act < 7) ? 1 : 0 }]}
          pointerEvents={(act > 0 && act < 7) ? "auto" : "none"}
        >
          <ParticleField count={25} color={particleColor} behavior={particleBehavior} />
        </View>

        {/* Act content */}
        <View style={styles.content}>
          {act === 0 && <ActVoid onComplete={autoAdvance} />}

          {act >= 1 && act <= 3 && (
            <Animated.View
              key={`dim-${act}`}
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
              style={styles.actWrap}
            >
              {balanced && act === 1 ? (
                <ActDimension
                  dimInfo={{ ...topDim, tier: 'mid' }}
                  locale={locale}
                  actLabel={locale === 'zh' ? '均衡' : 'THE EQUILIBRIUM'}
                  variant="hero"
                />
              ) : (
                <ActDimension
                  dimInfo={act === 1 ? topDim : act === 2 ? secondDim : lowestDim}
                  locale={locale}
                  actLabel={actLabels[act]}
                  variant={act === 1 ? 'hero' : act === 2 ? 'card' : 'shadow'}
                />
              )}
            </Animated.View>
          )}

          {act === 4 && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
              style={styles.actWrap}
            >
              <ActTension dim1={topDim.dim} dim2={secondDim.dim} locale={locale} />
            </Animated.View>
          )}

          {act === 5 && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
              style={styles.actWrap}
            >
              <ActConvergence scores={scores} onComplete={autoAdvance} />
            </Animated.View>
          )}

          {act === 6 && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
              style={styles.actWrap}
            >
              <ActReveal archetype={archetype} locale={locale} />
            </Animated.View>
          )}

          {act === 7 && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
              style={styles.actWrap}
            >
              <ActReport
                scores={scores}
                archetype={archetype}
                locale={locale}
                onEnter={enterWorld}
              />
            </Animated.View>
          )}
        </View>

        {/* Navigation indicator (hidden for report act) */}
        {act > 0 && act < 7 && (
          <View style={styles.indicator}>
            <ActIndicator
              total={TOTAL_ACTS}
              current={act}
              showSkip={act > 0 && act < 6}
              onSkip={skipToReveal}
            />
          </View>
        )}

        {/* Tap confirmation flash */}
        <TapRipple ref={rippleRef} />
      </SafeAreaView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  actWrap: {
    flex: 1,
  },
  indicator: {
    paddingBottom: 16,
  },
});
