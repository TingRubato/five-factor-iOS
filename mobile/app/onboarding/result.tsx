// Archetype reveal screen — the Aha Moment after Phase 1
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  ZoomIn, 
} from 'react-native-reanimated';
import { Colors, S, T, R } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import { ARCHETYPES, getArchetypeByName } from '../../lib/archetypes';
import RadarChart from '../../components/RadarChart';

const { width: W } = Dimensions.get('window');
const CHART_SIZE = W * 0.72;

export default function ResultScreen() {
  const router = useRouter();
  const { user } = useUser();

  const scores = user?.scores || { O: 72, C: 55, E: 80, A: 60, N: 30 };
  const archetypeName = user?.primaryArchetype || 'Explorer Creator';
  const archetype = getArchetypeByName(archetypeName) ||
    Object.values(ARCHETYPES)[0];

  const handleShare = async () => {
    await Share.share({
      message: `My Archetype: ${archetype.nameEn} (${archetype.nameZh})\n\nDiscover yours → archetype.app`,
    });
  };

  return (
    <View style={styles.container}>
      {/* Subtle vertical decorative line */}
      <View style={styles.decorLine} />

      {/* Top label */}
      <Animated.View 
        entering={FadeIn.delay(200).duration(600)}
        style={styles.topBar}
      >
        <Text style={styles.resultLabel}>YOUR ARCHETYPE</Text>
        <Text style={styles.phaseTag}>PHASE 1 COMPLETE</Text>
      </Animated.View>

      {/* Radar chart */}
      <Animated.View
        entering={ZoomIn.delay(400).duration(800)}
        style={styles.chartWrap}
      >
        <RadarChart
          scores={scores}
          size={CHART_SIZE}
          color={archetype.color}
          radiusRatio={0.72}
          labelOffset={20}
          dashedRings={true}
          showGradient={true}
          showLabels={true}
          showDataPoints={true}
        />
      </Animated.View>

      {/* Archetype name */}
      <Animated.View
        entering={FadeInDown.delay(1000).duration(500)}
        style={styles.titleBlock}
      >
        <Text style={[styles.archetypeEn, { color: archetype.color }]}>
          {archetype.shortLabel}
        </Text>
        <Text style={styles.archetypeName}>{archetype.nameEn}</Text>
        <Text style={styles.archetypeZh}>{archetype.nameZh}</Text>
      </Animated.View>

      {/* Description */}
      <Animated.Text
        entering={FadeInDown.delay(1200).duration(400)}
        style={styles.desc}
      >
        {archetype.description}
      </Animated.Text>

      {/* CTAs */}
      <Animated.View 
        entering={FadeInDown.delay(1400).duration(400)}
        style={styles.btns}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(tabs)/feed')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>JOIN THE COMMUNITY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.push('/onboarding/phase2')}
          activeOpacity={0.75}
        >
          <Text style={styles.outlineBtnText}>
            Unlock full precision (Phase 2 →)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} activeOpacity={0.6}>
          <Text style={styles.shareText}>Share my archetype</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Vertical ID stamp */}
      <Text style={styles.vertStamp}>IPIP-BIG5-PHASE1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: S[12],
    paddingTop: 72,
    paddingBottom: S[12],
    justifyContent: 'space-between',
  },
  decorLine: {
    position: 'absolute',
    top: 0, bottom: 0,
    right: S[12] * 2,
    width: 1,
    backgroundColor: Colors.line,
    opacity: 0.4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.accent,
    letterSpacing: 2.5,
  },
  phaseTag: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 1.5,
    fontWeight: T.semibold,
  },

  // Chart
  chartWrap: {
    alignSelf: 'center',
    marginVertical: S[4],
  },

  // Title
  titleBlock: {
    alignItems: 'center',
    gap: 4,
  },
  archetypeEn: {
    fontSize: T.xl,
    fontWeight: T.light,
    letterSpacing: 4,
    marginBottom: 2,
  },
  archetypeName: {
    fontSize: T.hero,
    fontWeight: T.thin,
    color: Colors.black,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 52,
  },
  archetypeZh: {
    fontSize: T.md,
    fontWeight: T.light,
    color: Colors.t2,
    letterSpacing: 3,
  },

  // Description
  desc: {
    fontSize: T.base,
    fontWeight: T.light,
    color: Colors.t2,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: S[4],
  },

  // Buttons
  btns: {
    gap: S[4],
  },
  primaryBtn: {
    height: 54,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: T.bold,
    fontSize: T.base,
    letterSpacing: 3,
  },
  outlineBtn: {
    height: 54,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
  },
  outlineBtnText: {
    color: Colors.black,
    fontWeight: T.medium,
    fontSize: T.base,
  },
  shareText: {
    fontSize: T.sm,
    color: Colors.t3,
    textAlign: 'center',
    paddingVertical: S[4],
    letterSpacing: 0.5,
  },

  // Stamp
  vertStamp: {
    position: 'absolute',
    right: -32,
    top: '45%',
    fontSize: T.xs,
    color: Colors.line,
    letterSpacing: 3,
    fontWeight: T.semibold,
    transform: [{ rotate: '90deg' }],
  },
});
