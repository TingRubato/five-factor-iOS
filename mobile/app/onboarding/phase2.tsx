import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Colors, T, S } from '../../constants/theme';
import { PHASE2_QUESTIONS, scoreAnswers, ALL_QUESTIONS } from '../../lib/questions';
import { useUser } from '../../stores/userStore';
import { submitTest } from '../../lib/api';
import { useQuizProgress } from '../../hooks/useQuizProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

export default function Phase2Screen() {
  const router = useRouter();
  const { user, updateProfile } = useUser();
  const { idx: currentIndex, answers, saveProgress, clearProgress, isLoaded } = useQuizProgress('phase2');
  
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialData, setInterstitialData] = useState(INTERSTITIALS[0]);
  const [loading, setLoading] = useState(false);

  // Reanimated shared values
  const progress = useSharedValue(0);

  const total = PHASE2_QUESTIONS.length;
  const question = PHASE2_QUESTIONS[currentIndex] || PHASE2_QUESTIONS[0];

  useEffect(() => {
    if (!isLoaded) return;
    progress.value = withTiming((currentIndex + 1) / total, { duration: 300 });
  }, [currentIndex, isLoaded]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const handleAnswer = async (value: number) => {
    if (loading) return;
    const newAnswers = { ...answers, [question.id]: value };
    
    // Check for interstitial
    const interstitial = INTERSTITIALS.find(
      (i) => i.after === currentIndex + 1
    );

    if (currentIndex < total - 1) {
      if (interstitial) {
        saveProgress(currentIndex, newAnswers); // Save before interstitial, but don't advance index yet
        setInterstitialData(interstitial);
        setShowInterstitial(true);
      } else {
        saveProgress(currentIndex + 1, newAnswers);
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
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={dismissInterstitial}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.phaseLabel}>PHASE 2 — DEEP UNLOCK</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {total}
        </Text>
      </View>

      {/* Question card */}
      <Animated.View
        key={question.id}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={styles.card}
      >
        <Text style={styles.dimensionTag}>{question.dimension}</Text>
        <Text style={styles.questionText}>{question.text}</Text>
        <Text style={styles.questionTextZh}>{question.textZh}</Text>
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
            <TouchableOpacity
              key={value}
              style={styles.likertBtn}
              onPress={() => handleAnswer(value)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.likertDot,
                  { width: 12 + value * 6, height: 12 + value * 6 },
                  answers[question.id] === value && styles.likertDotSelected,
                ]}
              />
              <Text
                style={[
                  styles.likertLabel,
                  answers[question.id] === value && styles.likertLabelSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingHorizontal: S[12],
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.line,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.accent,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: S[12],
    right: S[12],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseLabel: {
    fontSize: T.xs,
    color: Colors.accent,
    letterSpacing: 2,
    fontWeight: '700',
  },
  counter: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 2,
    fontWeight: '600',
  },
  card: {
    marginBottom: S[20],
  },
  dimensionTag: {
    fontSize: T.xs,
    color: Colors.accent,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: S[8],
  },
  questionText: {
    fontSize: T.xxl,
    fontWeight: '200',
    color: Colors.black,
    lineHeight: 36,
    marginBottom: S[4],
  },
  questionTextZh: {
    fontSize: T.md,
    color: Colors.t2,
    fontWeight: '300',
    lineHeight: 22,
  },
  likertContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: S[4],
    marginBottom: S[16],
  },
  likertBtn: {
    alignItems: 'center',
    gap: S[4],
    padding: S[4],
  },
  likertDot: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.line,
    backgroundColor: Colors.white,
  },
  likertDotSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  likertLabel: {
    fontSize: 9,
    color: Colors.t3,
    textAlign: 'center',
    fontWeight: '500',
  },
  likertLabelSelected: {
    color: Colors.accent,
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
