import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors, S, T, R, Shadows, Fonts } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import { getArchetypeByName } from '../../lib/archetypes';
import RadarChart from '../../components/RadarChart';

const { width: W, height: H } = Dimensions.get('window');

export default function ResultScreen() {
  const router = useRouter();
  const { user } = useUser();

  const scores = user?.scores || { O: 72, C: 55, E: 80, A: 60, N: 30 };
  const archetypeName = user?.primaryArchetype || 'Explorer Creator';
  const archetype = getArchetypeByName(archetypeName);

  // Aurora Blob Animations
  const blob1Pos = useSharedValue(0);
  const blob2Pos = useSharedValue(0);

  useEffect(() => {
    blob1Pos.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000 }),
        withTiming(0, { duration: 5000 })
      ),
      -1
    );
    blob2Pos.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 7000 }),
        withTiming(0, { duration: 7000 })
      ),
      -1
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: blob1Pos.value * 20 },
      { translateY: blob1Pos.value * -30 },
      { scale: 1 + blob1Pos.value * 0.1 },
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: blob2Pos.value * -15 },
      { translateY: blob2Pos.value * 25 },
      { scale: 1.1 - blob2Pos.value * 0.1 },
    ],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Aurora Background */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
        <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
      </View>

      <header style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <View style={{ width: 40 }} />
      </header>

      <main style={styles.main}>
        <View style={styles.auroraCard}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
            <Text style={styles.archetypeId}>ARCHETYPE {user?.id?.slice(-2) || '01'}</Text>
            <Text style={styles.nameZh}>{archetype?.nameZh || '探索者'}</Text>
            <Text style={styles.nameEn}>The {archetype?.nameEn.split(' ')[0] || 'Explorer'}</Text>

            <View style={styles.chartContainer}>
              <RadarChart
                scores={scores}
                size={W * 0.7}
                color={Colors.accent}
                radiusRatio={0.6}
                labelOffset={15}
                showLabels={false}
                showGradient={true}
              />
              <View style={[styles.dimTag, { top: -10 }]}>
                <Text style={styles.dimTagText}>LOGIC</Text>
              </View>
              <View style={[styles.dimTag, { bottom: 20, right: -10 }]}>
                <Text style={styles.dimTagText}>SYSTEMS</Text>
              </View>
              <View style={[styles.dimTag, { bottom: 20, left: -10 }]}>
                <Text style={styles.dimTagText}>EMPATHY</Text>
              </View>
            </View>

            <View style={styles.descriptionBox}>
              <Text style={styles.description}>
                Your cognitive map reveals a structural preference for stability. 
                You build frameworks where others see chaos, blending rigorous logic with latent creativity.
              </Text>
            </View>
          </Animated.View>
        </View>
      </main>

      <footer style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.actionBtnText}>EXPLORE ANALYSIS</Text>
          <Text style={styles.actionBtnIcon}>→</Text>
        </TouchableOpacity>
      </footer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.4 },
  blob1: { top: -50, right: -50, backgroundColor: '#FFE4E6' }, // rose-200
  blob2: { bottom: 50, left: -50, backgroundColor: '#E0F2FE' }, // blue-100
  
  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[6],
    zIndex: 10,
  },
  backBtn: { opacity: 0.6 },
  backIcon: { fontSize: 24 },
  progressTrack: { width: 60, height: 4, backgroundColor: Colors.line, borderRadius: 2 },
  progressFill: { width: '100%', height: '100%', backgroundColor: Colors.black, borderRadius: 2 },

  main: { flex: 1, padding: S[4] },
  auroraCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 40,
    padding: S[8],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...Shadows.sm,
  },
  content: { flex: 1, alignItems: 'flex-start' },
  archetypeId: { fontSize: 10, fontWeight: '600', color: Colors.t3, letterSpacing: 2, marginBottom: S[2] },
  nameZh: { fontSize: 48, fontWeight: '700', color: Colors.black, letterSpacing: -1, marginBottom: 4 },
  nameEn: { fontSize: 24, fontStyle: 'italic', color: Colors.t2, marginBottom: S[8] },

  chartContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: S[4],
  },
  dimTag: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  dimTagText: { fontSize: 9, fontWeight: 'bold', color: Colors.t3, letterSpacing: 1 },

  descriptionBox: { marginTop: 'auto' },
  description: { fontSize: 15, color: Colors.t2, lineHeight: 24, fontWeight: '300' },

  footer: { padding: S[6], paddingBottom: S[8] },
  actionBtn: {
    height: 64,
    backgroundColor: Colors.black,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S[4],
    ...Shadows.md,
  },
  actionBtnText: { color: Colors.white, fontWeight: 'bold', letterSpacing: 1 },
  actionBtnIcon: { color: Colors.white, fontSize: 20 },
});
