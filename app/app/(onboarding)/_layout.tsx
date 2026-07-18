import { Stack } from 'expo-router';
import { useAppTheme } from '../../src/theme/ThemeProvider';

export default function OnboardingLayout() {
  const { tokens } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerTintColor: tokens.accent,
        headerStyle: { backgroundColor: tokens.bg },
      }}
    />
  );
}
