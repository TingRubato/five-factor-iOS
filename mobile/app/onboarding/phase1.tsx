import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Colors, S, T, R, Fonts } from '../../constants/theme';
import LikertCircle from '../../components/ui/LikertCircle';
import QuizBackground from '../../components/ui/QuizBackground';
import ProgressBar from '../../components/ui/ProgressBar';
import { PHASE1_QUESTIONS, scoreAnswers } from '../../lib/questions';
import { useUser } from '../../stores/userStore';
import { submitTest } from '../../lib/api';
import { useQuizProgress } from '../../hooks/useQuizProgress';

const { width: W } = Dimensions.get('window');

const DIM_LABELS: Record<string, string> = {
  O: 'OPENNESS',
  C: 'CONSCIENTIOUSNESS',
  E: 'EXTRAVERSION',
  A: 'AGREEABLENESS',
  N: 'NEUROTICISM',
};

const OPTIONS = [
  { value: 1, shortLabel: 'SD', label: 'Strongly\nDisagree' },
  { value: 2, shortLabel: 'D',  label: 'Disagree' },
  { value: 3, shortLabel: 'N',  label: 'Neutral' },
  { value: 4, shortLabel: 'A',  label: 'Agree' },
  { value: 5, shortLabel: 'SA', label: 'Strongly\nAgree' },
];

export default function Phase1Screen() {
  const router = useRouter();
  const { user, updateProfile } = useUser();
  const { idx, answers, saveProgress, clearProgress, isLoaded } = useQuizProgress('phase1');

  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const total = PHASE1_QUESTIONS.length;
  const q = PHASE1_QUESTIONS[idx] || PHASE1_QUESTIONS[0];

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
      <View style={styles.topBar}>
        <Text style={styles.dimLabel}>{DIM_LABELS[q.dimension]}</Text>
        <Text style={styles.counter}>
          {String(idx + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </Text>
      </View>

      {/* Question — directional slide transition */}
      <Animated.View
        key={q.id}
        entering={SlideInRight.duration(300).springify().damping(20)}
        exiting={SlideOutLeft.duration(250)}
        style={styles.questionArea}
      >
        <Text style={styles.questionText}>{q.text}</Text>
        <Text style={styles.questionTextZh}>{q.textZh}</Text>
      </Animated.View>

      {/* Likert circles — visual size gradient */}
      <View style={styles.likertRow}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : (
          OPTIONS.map(({ value, label }) => {
            const size = 20 + value * 8; // 28 → 60px
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
        {loading ? 'Calculating your archetype...' : 'Tap a circle · honest answers give accurate results'}
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
    top: 56,
    left: S[12], right: S[12],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.accent,
    letterSpacing: 2,
  },
  counter: {
    fontSize: T.xs,
    color: Colors.t3,
    fontFamily: Fonts?.mono,
    letterSpacing: 1,
    fontWeight: T.semibold,
  },

  // Question
  questionArea: {
    marginBottom: S[20],
  },
  questionText: {
    fontSize: T.xxl,
    fontWeight: T.light,
    color: Colors.black,
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: S[4],
  },
  questionTextZh: {
    fontSize: T.base,
    fontWeight: T.light,
    color: Colors.t2,
    lineHeight: 22,
  },

  // Likert
  likertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: S[2],
    marginBottom: S[4],
  },
  optionCol: {
    alignItems: 'center',
    gap: S[4],
    paddingVertical: S[4],
    paddingHorizontal: S[2],
  },
  circle: {
    borderWidth: 1.5,
  },
  circleLabel: {
    fontSize: T.micro,
    color: Colors.t3,
    textAlign: 'center',
    fontWeight: T.semibold,
    letterSpacing: 0.3,
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
