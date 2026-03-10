import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors, T, S, Fonts, DIM_LABELS, DIM_COLORS } from '../../constants/theme';
import LikertCircle from '../../components/ui/LikertCircle';
import QuizBackground from '../../components/ui/QuizBackground';
import ProgressBar from '../../components/ui/ProgressBar';
import PressableScale from '../../components/ui/PressableScale';
import { PHASE2_QUESTIONS, scoreAnswers, ALL_QUESTIONS } from '../../lib/questions';
import { useUser } from '../../stores/userStore';
import { submitTest } from '../../lib/api';
import { useQuizProgress } from '../../hooks/useQuizProgress';


const LIKERT_LABELS = [
  { value: 1, label: 'Strongly\nDisagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly\nAgree' },
];

// Interstitial story cards shown between question blocks
const INTERSTITIALS = [
  {
    after: 7,
    title: 'You are doing great.',
    body: 'Most people never go this deep.\nYou are already in the top 20%.',
  },
  {
    after: 14,
    title: 'Patterns forming...',
    body: 'Your answers are starting to reveal\na fascinating inner landscape.',
  },
  {
    after: 21,
    title: 'Almost there.',
    body: 'A few more honest answers and\nyour full archetype map unlocks.',
  },
  {
    after: 28,
    title: 'Final stretch.',
    body: 'Your complete personality fingerprint\nis about to crystallize.',
  },
];

// 4 visual layouts that cycle to break monotony
type Layout = 'default' | 'centered' | 'big-number' | 'minimal';
function layoutForIndex(idx: number): Layout {
  const cycle = idx % 7;
  if (cycle === 2) return 'centered';
  if (cycle === 4) return 'big-number';
  if (cycle === 6) return 'minimal';
  return 'default';
}

export default function Phase2Screen() {
  const router = useRouter();
  const { user, updateProfile } = useUser();
  const { idx: currentIndex, answers, saveProgress, clearProgress, isLoaded } = useQuizProgress('phase2');

  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialData, setInterstitialData] = useState(INTERSTITIALS[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const total = PHASE2_QUESTIONS.length;
  const question = PHASE2_QUESTIONS[currentIndex] || PHASE2_QUESTIONS[0];
  const layout = layoutForIndex(currentIndex);
  const dimColor = DIM_COLORS[question.dimension] ?? Colors.accent;

  if (!isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const handleAnswer = async (value: number) => {
    if (loading) return;
    setSelected(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newAnswers = { ...answers, [question.id]: value };

    // Check for interstitial
    const interstitial = INTERSTITIALS.find(
      (i) => i.after === currentIndex + 1
    );

    if (currentIndex < total - 1) {
      if (interstitial) {
        setTimeout(() => {
          setSelected(null);
          saveProgress(currentIndex, newAnswers);
          setInterstitialData(interstitial);
          setShowInterstitial(true);
        }, 160);
      } else {
        setTimeout(() => {
          setSelected(null);
          saveProgress(currentIndex + 1, newAnswers);
        }, 160);
      }
    } else {
      setLoading(true);
      try {
        // Phase 2 complete — combine with Phase 1 answers for full scoring
        const phase1Answers = user?.rawAnswers ?? {};
        const combinedAnswers = { ...phase1Answers, ...newAnswers };

        if (user?.id && !user.id.startsWith('local_')) {
          const res = await submitTest(user.id, combinedAnswers, 'ipip-50-v1');
          updateProfile({
            scores: res.scores,
            zScores: res.z_scores,
            primaryArchetype: res.primary_archetype,
            secondaryArchetype: res.secondary_archetype,
            rawAnswers: combinedAnswers,
            phase: 'phase2',
          });
        } else {
          const allScores = scoreAnswers(combinedAnswers, ALL_QUESTIONS);
          updateProfile({
            scores: allScores,
            rawAnswers: combinedAnswers,
            phase: 'phase2',
          });
        }
        await clearProgress();
        router.replace('/(tabs)/profile');
      } catch (err) {
        console.error('Submit Phase 2 failed:', err);
        const combinedAnswers = { ...(user?.rawAnswers ?? {}), ...newAnswers };
        const allScores = scoreAnswers(combinedAnswers, ALL_QUESTIONS);
        updateProfile({
          scores: allScores,
          rawAnswers: combinedAnswers,
          phase: 'phase2',
        });
        await clearProgress();
        router.replace('/(tabs)/profile');
      } finally {
        setLoading(false);
      }
    }
  };

  const dismissInterstitial = () => {
    setShowInterstitial(false);
    saveProgress(currentIndex + 1, answers);
  };

  if (showInterstitial) {
    return (
      <View style={styles.interstitialContainer}>
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.interstitialContent}
        >
          <Text style={styles.interstitialTitle}>{interstitialData.title}</Text>
          <Text style={styles.interstitialBody}>{interstitialData.body}</Text>
        </Animated.View>
        <PressableScale
          style={styles.continueBtn}
          onPress={dismissInterstitial}
        >
          <Text style={styles.continueBtnText}>CONTINUE</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dimension color aurora */}
      <QuizBackground dimension={question.dimension} />

      {/* Progress bar with pulsing dot */}
      <ProgressBar value={(currentIndex + 1) / total} height={3} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.phaseLabel, { color: dimColor }]}>
          {DIM_LABELS[question.dimension]}
        </Text>
        <Text style={styles.counter}>
          {String(currentIndex + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </Text>
      </View>

      {/* Question card — calm crossfade with layout variation */}
      <Animated.View
        key={question.id}
        entering={FadeIn.duration(280)}
        exiting={FadeOut.duration(180)}
        style={[
          styles.card,
          layout === 'centered' && styles.cardCentered,
        ]}
      >
        {/* Big-number layout: show large question index */}
        {layout === 'big-number' && (
          <Text style={[styles.bigNumber, { color: dimColor + '12' }]}>
            {String(currentIndex + 1).padStart(2, '0')}
          </Text>
        )}

        {/* Default layout: colored accent bar */}
        {layout === 'default' && (
          <View style={[styles.accentBar, { backgroundColor: dimColor }]} />
        )}

        {/* Minimal layout: just a thin line */}
        {layout === 'minimal' && (
          <View style={styles.minimalLine} />
        )}

        <Text
          style={[
            styles.questionText,
            layout === 'centered' && styles.questionTextCentered,
          ]}
        >
          {question.text}
        </Text>
        <Text
          style={[
            styles.questionTextZh,
            layout === 'centered' && styles.questionTextZhCentered,
          ]}
        >
          {question.textZh}
        </Text>
      </Animated.View>

      {/* Likert scale */}
      <View style={styles.likertContainer}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', height: 80, justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.accent} size="large" />
            <Text style={{ marginTop: S[4], color: Colors.t3, fontSize: T.xs }}>Finalizing your profile...</Text>
          </View>
        ) : (
          LIKERT_LABELS.map(({ value, label }) => (
            <LikertCircle
              key={value}
              value={value}
              label={label}
              size={12 + value * 6}
              isActive={selected === value}
              onPress={() => handleAnswer(value)}
            />
          ))
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
          ? 'Finalizing your archetype...'
          : 'Phase 2 · unlocking your full personality map'}
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
  header: {
    position: 'absolute',
    top: 56,
    left: S[12],
    right: S[12],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: T.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
  counter: {
    fontSize: T.xs,
    color: Colors.t3,
    fontFamily: Fonts?.mono,
    letterSpacing: 1,
    fontWeight: '600',
  },

  // Question card
  card: {
    marginBottom: S[20],
    position: 'relative',
  },
  cardCentered: {
    alignItems: 'center',
  },
  accentBar: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginBottom: S[6],
  },
  minimalLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.line,
    marginBottom: S[6],
  },
  bigNumber: {
    fontSize: 120,
    fontWeight: '100',
    position: 'absolute',
    top: -50,
    right: -10,
    lineHeight: 120,
  },
  questionText: {
    fontSize: T.xxl,
    fontWeight: '200',
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
    fontWeight: '300',
    color: Colors.t2,
    lineHeight: 22,
  },
  questionTextZhCentered: {
    textAlign: 'center',
  },

  // Likert
  likertContainer: {
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
    fontWeight: '600',
  },
  hint: {
    fontSize: T.xs,
    color: Colors.t3,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Interstitial styles
  interstitialContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: S[20],
  },
  interstitialContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interstitialTitle: {
    fontSize: T.xxl,
    fontWeight: '200',
    color: Colors.white,
    marginBottom: S[12],
    textAlign: 'center',
    letterSpacing: 2,
  },
  interstitialBody: {
    fontSize: T.md,
    color: Colors.t3,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
  },
  continueBtn: {
    width: '100%',
    padding: S[8],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 60,
  },
  continueBtnText: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 3,
    fontSize: T.sm,
  },
});
