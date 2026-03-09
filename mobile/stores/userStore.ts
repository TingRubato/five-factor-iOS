// Minimal user state — no external deps needed for MVP
// Uses React context pattern; swap to Zustand/Jotai later if needed

import { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  username: string;
  isGuest: boolean;
  authProvider?: 'apple' | 'google' | 'phone';
  rawAnswers?: Record<number, number>;
  scores?: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  zScores?: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  primaryArchetype?: string;
  secondaryArchetype?: string;
  phase: 'none' | 'phase1' | 'phase2';
  isPublic: boolean;
}

export interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  resetAssessment: () => void;
}

export const UserContext = createContext<UserState>({
  user: null,
  setUser: () => {},
  updateProfile: () => {},
  resetAssessment: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

// --- Persistence helpers ---

const USER_STORAGE_KEY = 'archetype_user_profile';

export async function saveUserToStorage(user: UserProfile | null): Promise<void> {
  if (user) {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }
}

export async function loadUserFromStorage(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
