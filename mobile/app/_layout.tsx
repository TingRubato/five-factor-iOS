import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react';
import {
  UserContext,
  UserProfile,
  saveUserToStorage,
  loadUserFromStorage,
} from '../stores/userStore';

export default function RootLayout() {
  const [user, setUserRaw] = useState<UserProfile | null>(null);

  // Hydrate from storage once on mount — silent, no splash needed
  useEffect(() => {
    loadUserFromStorage().then((stored) => {
      if (stored) setUserRaw(stored);
    });
  }, []);

  // Wrap setUser so every call also persists to AsyncStorage
  const setUser = useCallback((u: UserProfile | null) => {
    setUserRaw(u);
    saveUserToStorage(u);
  }, []);

  // updateProfile merges partial and persists the merged result
  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setUserRaw((prev) => {
      const updated = prev ? { ...prev, ...partial } : null;
      if (updated) saveUserToStorage(updated);
      return updated;
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateProfile }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="user/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="settings"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </UserContext.Provider>
  );
}
