import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@archetype_quiz_progress_';

export function useQuizProgress(phase: 'phase1' | 'phase2') {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY + phase);
        if (stored) {
          const { savedIdx, savedAnswers } = JSON.parse(stored);
          if (typeof savedIdx === 'number') setIdx(savedIdx);
          if (savedAnswers) setAnswers(savedAnswers);
        }
      } catch (err) {
        console.error('Failed to load quiz progress:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, [phase]);

  const saveProgress = useCallback(async (newIdx: number, newAnswers: Record<number, number>) => {
    setIdx(newIdx);
    setAnswers(newAnswers);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY + phase,
        JSON.stringify({ savedIdx: newIdx, savedAnswers: newAnswers })
      );
    } catch (err) {
      console.error('Failed to save quiz progress:', err);
    }
  }, [phase]);

  const clearProgress = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY + phase);
    } catch (err) {
      console.error('Failed to clear quiz progress:', err);
    }
  }, [phase]);

  return { idx, answers, saveProgress, clearProgress, isLoaded };
}
