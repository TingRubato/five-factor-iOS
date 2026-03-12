/**
 * Shared QuizScreen — renders question cards, likert scale, progress bar,
 * dimension-colored aurora, and layout cycling. Used by phase1 and phase2.
 */
import { useState, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors, S, T, Fonts, DIM_LABELS, DIM_COLORS } from '../../constants/theme';
import LikertCircle from '../ui/LikertCircle';
import QuizBackground from '../ui/QuizBackground';
import ProgressBar from '../ui/ProgressBar';
import PressableScale from '../ui/PressableScale';
import { useQuizProgress } from '../../hooks/useQuizProgress';
import type { Question } from '../../lib/questions';

interface Interstitial {
  after: number;
  title: string;
  body: string;
}

export interface QuizScreenProps {
  questions: Question[];
  phase: 'phase1' | 'phase2';
  onComplete: (answers: Record<string, number>) => Promise<void>;
  interstitials?: Interstitial[];
  /** Circle size formula: baseSize + value * sizeStep */
  circleBaseSize?: number;
  circleSizeStep?: number;
  /** Layout cycle length (3 for phase1, 7 for phase2) */
  layoutCycleLength?: number;
  /** Include 'minimal' layout variant */
  includeMinimalLayout?: boolean;
  /** Progress bar height */
  progressBarHeight?: number;
  /** Hint text shown at bottom */
  hintText?: string;
  /** Loading hint text */
  loadingHintText?: string;
}

const LIKERT_LABELS = [
  { value: 1, label: 'Strongly\nDisagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly\nAgree' },
];

type Layout = 'default' | 'centered' | 'big-number' | 'minimal';

function getLayout(idx: number, cycleLength: number, includeMinimal: boolean): Layout {
  const cycle = idx % cycleLength;
  if (cycle === 2) return 'centered';
  if (cycle === 4) return 'big-number';
  if (includeMinimal && cycle === 6) return 'minimal';
  return 'default';
}

export default function QuizScreen({
  questions,
  phase,
  onComplete,
  interstitials = [],
  circleBaseSize = 20,
  circleSizeStep = 8,
  layoutCycleLength = 5,
  includeMinimalLayout = false,
  progressBarHeight,
  hintText = 'Tap a circle \u00b7 honest answers give accurate results',
  loadingHintText = 'Calculating your archetype...',
}: QuizScreenProps) {
  const insets = useSafeAreaInsets();
  const { idx, answers, saveProgress, clearProgress, isLoaded } = useQuizProgress(phase);

  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialData, setInterstitialData] = useState<Interstitial | null>(
    interstitials[0] ?? null,
  );

  const total = questions.length;
  const q = questions[idx] || questions[0];
  const layout = getLayout(idx, layoutCycleLength, includeMinimalLayout);
  const dimColor = DIM_COLORS[q.dimension] ?? Colors.accent;

  if (!isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
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
      // Check for interstitial
      const interstitial = interstitials.find((i) => i.after === idx + 1);

      if (interstitial) {
        setTimeout(() => {
          setSelected(null);
          saveProgress(idx, newAnswers);
          setInterstitialData(interstitial);
          setShowInterstitial(true);
        }, 160);
      } else {
        setTimeout(() => {
          setSelected(null);
          saveProgress(idx + 1, newAnswers);
        }, 160);
      }
    } else {
      setLoading(true);
      try {
        await onComplete(newAnswers);
        await clearProgress();
      } catch {
        // Caller handles errors — clearProgress still runs
        await clearProgress();
      } finally {
        setLoading(false);
      }
    }
  };

  const dismissInterstitial = () => {
    setShowInterstitial(false);
    saveProgress(idx + 1, answers);
  };

  // Interstitial screen
  if (showInterstitial && interstitialData) {
    return (
      <View style={styles.interstitialContainer}>
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.interstitialContent}
        >
          <Text style={styles.interstitialTitle}>{interstitialData.title}</Text>
          <Text style={styles.interstitialBody}>{interstitialData.body}</Text>
        </Animated.View>
        <PressableScale style={styles.continueBtn} onPress={dismissInterstitial}>
          <Text style={styles.continueBtnText}>CONTINUE</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QuizBackground dimension={q.dimension} />

      <ProgressBar value={(idx + 1) / total} {...(progressBarHeight ? { height: progressBarHeight } : {})} />

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

      {/* Question card */}
      <Animated.View
        key={q.id}
        entering={FadeIn.duration(280)}
        exiting={FadeOut.duration(180)}
        style={[
          styles.questionArea,
          layout === 'centered' && styles.questionAreaCentered,
        ]}
      >
        {layout === 'big-number' && (
          <Text style={[styles.bigNumber, { color: dimColor + '12' }]}>
            {String(idx + 1).padStart(2, '0')}
          </Text>
        )}
        {layout === 'default' && (
          <View style={[styles.accentBar, { backgroundColor: dimColor }]} />
        )}
        {layout === 'minimal' && <View style={styles.minimalLine} />}

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
          LIKERT_LABELS.map(({ value, label }) => (
            <LikertCircle
              key={value}
              value={value}
              label={label}
              size={circleBaseSize + value * circleSizeStep}
              isActive={selected === value}
              onPress={() => advance(value)}
            />
          ))
        )}
      </View>

      {!loading && (
        <View style={styles.polarRow}>
          <Text style={styles.polarLabel}>DISAGREE</Text>
          <Text style={styles.polarLabel}>AGREE</Text>
        </View>
      )}

      <Text style={styles.hint}>
        {loading ? loadingHintText : hintText}
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
  minimalLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.line,
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

  // Interstitial
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
    fontWeight: T.light,
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
    fontWeight: T.light,
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
    fontWeight: T.bold,
    letterSpacing: 3,
    fontSize: T.sm,
  },
});
