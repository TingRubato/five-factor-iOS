import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Colors, S, T, R, Fonts } from '../../constants/theme';
import { PHASE1_QUESTIONS, scoreAnswers } from '../../lib/questions';
import { useUser } from '../../stores/userStore';

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
  const { updateProfile } = useUser();

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  const total = PHASE1_QUESTIONS.length;
  const q = PHASE1_QUESTIONS[idx];

  useEffect(() => {
    // Enter animation each new question
    cardOpacity.setValue(0);
    cardSlide.setValue(20);
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [idx]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (idx + 1) / total,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [idx]);

  const advance = (value: number) => {
    setSelected(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newAnswers = { ...answers, [q.id]: value };

    setTimeout(() => {
      setSelected(null);
      if (idx < total - 1) {
        setAnswers(newAnswers);
        setIdx(idx + 1);
      } else {
        const scores = scoreAnswers(newAnswers, PHASE1_QUESTIONS);
        updateProfile({ scores, rawAnswers: newAnswers, phase: 'phase1' });
        router.replace('/onboarding/result');
      }
    }, 160);
  };

  return (
    <View style={styles.container}>
      {/* Progress line */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.dimLabel}>{DIM_LABELS[q.dimension]}</Text>
        <Text style={styles.counter}>
          {String(idx + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </Text>
      </View>

      {/* Question */}
      <Animated.View
        style={[
          styles.questionArea,
          { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
        ]}
      >
        <Text style={styles.questionText}>{q.text}</Text>
        <Text style={styles.questionTextZh}>{q.textZh}</Text>
      </Animated.View>

      {/* Likert circles — visual size gradient */}
      <View style={styles.likertRow}>
        {OPTIONS.map(({ value, label }) => {
          const size = 20 + value * 8; // 28 → 60px
          const isActive = selected === value;
          return (
            <TouchableOpacity
              key={value}
              style={styles.optionCol}
              onPress={() => advance(value)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.circle,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: isActive ? Colors.accent : Colors.line,
                    backgroundColor: isActive ? Colors.accentDim : 'transparent',
                  },
                ]}
              />
              <Text
                style={[
                  styles.circleLabel,
                  isActive && { color: Colors.accent },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Polarity labels */}
      <View style={styles.polarRow}>
        <Text style={styles.polarLabel}>DISAGREE</Text>
        <Text style={styles.polarLabel}>AGREE</Text>
      </View>

      {/* Bottom hint */}
      <Text style={styles.hint}>
        Tap a circle · honest answers give accurate results
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
  progressTrack: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    backgroundColor: Colors.line,
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.accent,
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
