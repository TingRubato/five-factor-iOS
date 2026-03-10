import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors, S, T, Fonts, DIM_LABELS, DIM_COLORS } from '../../constants/theme';
import LikertCircle from '../../components/ui/LikertCircle';
import QuizBackground from '../../components/ui/QuizBackground';
import ProgressBar from '../../components/ui/ProgressBar';
import { PHASE1_QUESTIONS, scoreAnswers } from '../../lib/questions';
import { useUser } from '../../stores/userStore';
import { submitTest } from '../../lib/api';
import { useQuizProgress } from '../../hooks/useQuizProgress';

const { width: W } = Dimensions.get('window');


const OPTIONS = [
  { value: 1, shortLabel: 'SD', label: 'Strongly\nDisagree' },
  { value: 2, shortLabel: 'D',  label: 'Disagree' },
  { value: 3, shortLabel: 'N',  label: 'Neutral' },
  { value: 4, shortLabel: 'A',  label: 'Agree' },
  { value: 5, shortLabel: 'SA', label: 'Strongly\nAgree' },
];

// 3 visual layouts that cycle to break monotony
type Layout = 'default' | 'centered' | 'big-number';
function layoutForIndex(idx: number): Layout {
  const cycle = idx % 5;
  if (cycle === 2) return 'centered';
  if (cycle === 4) return 'big-number';
  return 'default';
}

export default function Phase1Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useUser();
  const { idx, answers, saveProgress, clearProgress, isLoaded } = useQuizProgress('phase1');

  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const total = PHASE1_QUESTIONS.length;
  const q = PHASE1_QUESTIONS[idx] || PHASE1_QUESTIONS[0];
  const layout = layoutForIndex(idx);
  const dimColor = DIM_COLORS[q.dimension] ?? Colors.accent;

  if (!isLoaded) {
    return (
      <View style={[styles.container, { alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const advance = async (value: number) => {
    if (loading) return;
    setSelected(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newAnswers = { ...answers, [q.id]: value };

    if (idx < total - 1) {
      setTimeout(() => {
        setSelected(null);
        saveProgress(idx + 1, newAnswers);
      }, 160);
    } else {
      setLoading(true);
      try {
        if (user?.id && !user.id.startsWith('local_')) {
          const res = await submitTest(user.id, newAnswers, 'ipip-15-v1');
          updateProfile({
            scores: res.scores,
            zScores: res.z_scores,
            primaryArchetype: res.primary_archetype,
            secondaryArchetype: res.secondary_archetype,
            rawAnswers: newAnswers,
            phase: 'phase1',
          });
        } else {
          const scores = scoreAnswers(newAnswers, PHASE1_QUESTIONS);
          updateProfile({ scores, rawAnswers: newAnswers, phase: 'phase1' });
        }
        await clearProgress();
        router.replace('/onboarding/result');
      } catch (err) {
        console.error('Submit test failed:', err);
        const scores = scoreAnswers(newAnswers, PHASE1_QUESTIONS);
        updateProfile({ scores, rawAnswers: newAnswers, phase: 'phase1' });
        await clearProgress();
        router.replace('/onboarding/result');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Dimension color aurora */}
      <QuizBackground dimension={q.dimension} />

      {/* Progress bar with pulsing dot */}
      <ProgressBar value={(idx + 1) / total} />

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + S[4] }]}>
        <Text style={[styles.dimLabel, { color: dimColor }]}>
          {DIM_LABELS[q.dimension]}
        </Text>
        <Text style={styles.counter}>
          {String(idx + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </Text>
      </View>

      {/* Question — calm crossfade with layout variation */}
      <Animated.View
        key={q.id}
        entering={FadeIn.duration(280)}
        exiting={FadeOut.duration(180)}
        style={[
          styles.questionArea,
          layout === 'centered' && styles.questionAreaCentered,
        ]}
      >
        {/* Big-number layout: show large question index */}
        {layout === 'big-number' && (
          <Text style={[styles.bigNumber, { color: dimColor + '12' }]}>
            {String(idx + 1).padStart(2, '0')}
          </Text>
        )}

        {/* Dimension accent bar (default layout only) */}
        {layout === 'default' && (
          <View style={[styles.accentBar, { backgroundColor: dimColor }]} />
        )}

        <Text
          style={[
            styles.questionText,
            layout === 'centered' && styles.questionTextCentered,
          ]}
        >
          {q.text}
        </Text>
        <Text
          style={[
            styles.questionTextZh,
            layout === 'centered' && styles.questionTextZhCentered,
          ]}
        >
          {q.textZh}
        </Text>
      </Animated.View>

      {/* Likert circles */}
      <View style={styles.likertRow}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : (
          OPTIONS.map(({ value, label }) => {
            const size = 20 + value * 8;
            const isActive = selected === value;
            return (
              <LikertCircle
                key={value}
                value={value}
                label={label}
                size={size}
                isActive={isActive}
                onPress={() => advance(value)}
              />
            );
          })
        )}
      </View>

      {/* Polarity labels */}
      {!loading && (
        <View style={styles.polarRow}>
          <Text style={styles.polarLabel}>DISAGREE</Text>
          <Text style={styles.polarLabel}>AGREE</Text>
        </View>
      )}

      {/* Bottom hint */}
      <Text style={styles.hint}>
        {loading
          ? 'Calculating your archetype...'
          : 'Tap a circle · honest answers give accurate results'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: S[12],
    justifyContent: 'center',
    paddingBottom: S[12],
  },
  topBar: {
    position: 'absolute',
    left: S[12],
    right: S[12],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 2,
  },
  counter: {
    fontSize: T.xs,
    color: Colors.t3,
    fontFamily: Fonts?.mono,
    letterSpacing: 1,
    fontWeight: T.semibold,
  },

  // Question — default (left-aligned)
  questionArea: {
    marginBottom: S[20],
    position: 'relative',
  },
  questionAreaCentered: {
    alignItems: 'center',
  },
  accentBar: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginBottom: S[6],
  },
  bigNumber: {
    fontSize: 120,
    fontWeight: T.thin,
    position: 'absolute',
    top: -50,
    right: -10,
    lineHeight: 120,
  },
  questionText: {
    fontSize: T.xxl,
    fontWeight: T.light,
    color: Colors.black,
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: S[4],
  },
  questionTextCentered: {
    textAlign: 'center',
  },
  questionTextZh: {
    fontSize: T.base,
    fontWeight: T.light,
    color: Colors.t2,
    lineHeight: 22,
  },
  questionTextZhCentered: {
    textAlign: 'center',
  },

  // Likert
  likertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: S[2],
    marginBottom: S[4],
  },

  polarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: S[2],
    marginTop: S[2],
    marginBottom: S[8],
  },
  polarLabel: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 1.5,
    fontWeight: T.semibold,
  },
  hint: {
    fontSize: T.xs,
    color: Colors.t3,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
