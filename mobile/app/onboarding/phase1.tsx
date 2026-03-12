import { useState } from 'react';
import { useRouter } from 'expo-router';
import QuizScreen from '../../components/quiz/QuizScreen';
import { PHASE1_QUESTIONS, scoreAnswers } from '../../lib/questions';
import { useUser } from '../../stores/userStore';
import { submitTest } from '../../lib/api';

export default function Phase1Screen() {
  const router = useRouter();
  const { user, updateProfile } = useUser();

  const handleComplete = async (answers: Record<string, number>) => {
    try {
      if (user?.id && !user.id.startsWith('local_')) {
        const res = await submitTest(user.id, answers, 'ipip-15-v1');
        updateProfile({
          scores: res.scores,
          zScores: res.z_scores,
          primaryArchetype: res.primary_archetype,
          secondaryArchetype: res.secondary_archetype,
          rawAnswers: answers,
          phase: 'phase1',
        });
      } else {
        const scores = scoreAnswers(answers, PHASE1_QUESTIONS);
        updateProfile({ scores, rawAnswers: answers, phase: 'phase1' });
      }
      router.replace('/onboarding/result');
    } catch (err) {
      console.error('Submit test failed:', err);
      const scores = scoreAnswers(answers, PHASE1_QUESTIONS);
      updateProfile({ scores, rawAnswers: answers, phase: 'phase1' });
      router.replace('/onboarding/result');
    }
  };

  return (
    <QuizScreen
      questions={PHASE1_QUESTIONS}
      phase="phase1"
      onComplete={handleComplete}
      hintText="Tap a circle · honest answers give accurate results"
      loadingHintText="Calculating your archetype..."
    />
  );
}
