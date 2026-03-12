import { useRouter } from 'expo-router';
import QuizScreen from '../../components/quiz/QuizScreen';
import { PHASE2_QUESTIONS, scoreAnswers, ALL_QUESTIONS } from '../../lib/questions';
import { useUser } from '../../stores/userStore';
import { submitTest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

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
  const { showToast } = useToast();

  const handleComplete = async (answers: Record<string, number>) => {
    const phase1Answers = user?.rawAnswers ?? {};
    const combinedAnswers = { ...phase1Answers, ...answers };

    try {
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
        updateProfile({ scores: allScores, rawAnswers: combinedAnswers, phase: 'phase2' });
      }
      router.replace('/(tabs)/profile');
    } catch (err) {
      console.error('Submit Phase 2 failed:', err);
      showToast({ type: 'info', message: 'Scored locally — will sync when online.' });
      const allScores = scoreAnswers(combinedAnswers, ALL_QUESTIONS);
      updateProfile({ scores: allScores, rawAnswers: combinedAnswers, phase: 'phase2' });
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <QuizScreen
      questions={PHASE2_QUESTIONS}
      phase="phase2"
      onComplete={handleComplete}
      interstitials={INTERSTITIALS}
      circleBaseSize={12}
      circleSizeStep={6}
      layoutCycleLength={7}
      includeMinimalLayout
      progressBarHeight={3}
      hintText="Phase 2 · unlocking your full personality map"
      loadingHintText="Finalizing your archetype..."
    />
  );
}
