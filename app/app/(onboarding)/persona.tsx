import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { Persona } from '../../src/api/types';
import { OnboardingShell } from '../../src/features/onboarding/components/OnboardingShell';
import { PrimaryButton } from '../../src/features/onboarding/components/PrimaryButton';
import { ThemePicker } from '../../src/features/onboarding/components/ThemePicker';
import { useOnboardingStore } from '../../src/features/onboarding/store';
import { useAppTheme } from '../../src/theme/ThemeProvider';

const OPTIONS: { id: Persona; title: string; body: string; testID: string }[] =
  [
    {
      id: 'student',
      title: 'I am a student',
      body: 'Pick your age vibe, topics, and themes so videos feel made for you.',
      testID: 'persona-student',
    },
    {
      id: 'tutor',
      title: 'I am a tutor',
      body: 'Choose who you teach and how you like lessons framed for them.',
      testID: 'persona-tutor',
    },
  ];

export default function PersonaScreen() {
  const persona = useOnboardingStore((s) => s.persona);
  const setPersona = useOnboardingStore((s) => s.setPersona);
  const { tokens } = useAppTheme();

  return (
    <OnboardingShell
      testID="onboarding-persona"
      title="Who’s learning with EduReels?"
      subtitle="Students personalize for themselves. Tutors personalize for the ages they teach."
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!persona}
          onPress={() => router.push('/(onboarding)/age')}
        />
      }
    >
      <ThemePicker />
      <View className="mt-2">
        {OPTIONS.map((opt) => {
          const selected = persona === opt.id;
          return (
            <Pressable
              key={opt.id}
              testID={opt.testID}
              onPress={() => setPersona(opt.id)}
              className="rounded-2xl p-5 mb-3 border min-h-[44px]"
              style={{
                backgroundColor: selected ? tokens.accentSoft : tokens.surface,
                borderColor: selected ? tokens.accent : tokens.border,
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: tokens.text }}
              >
                {opt.title}
              </Text>
              <Text className="mt-1" style={{ color: tokens.muted }}>
                {opt.body}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingShell>
  );
}
