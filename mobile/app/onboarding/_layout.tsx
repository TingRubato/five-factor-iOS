import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="phase1" options={{ animation: 'fade' }} />
      <Stack.Screen name="result" options={{ animation: 'fade' }} />
      <Stack.Screen name="phase2" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
