import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerTintColor: '#0F766E',
        headerStyle: { backgroundColor: '#F8FAFC' },
      }}
    />
  );
}
