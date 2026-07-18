import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Chip } from '../../src/features/onboarding/components/Chip';
import { OnboardingShell } from '../../src/features/onboarding/components/OnboardingShell';
import { PrimaryButton } from '../../src/features/onboarding/components/PrimaryButton';
import { useCatalogue } from '../../src/features/onboarding/hooks';
import { useOnboardingStore } from '../../src/features/onboarding/store';
import { useAppTheme } from '../../src/theme/ThemeProvider';

export default function AgeScreen() {
  const { tokens } = useAppTheme();
  const { data, isLoading, error, refetch } = useCatalogue();
  const persona = useOnboardingStore((s) => s.persona);
  const ageGroupId = useOnboardingStore((s) => s.ageGroupId);
  const teachingAgeGroupIds = useOnboardingStore((s) => s.teachingAgeGroupIds);
  const setAgeGroupId = useOnboardingStore((s) => s.setAgeGroupId);
  const toggleTeachingAge = useOnboardingStore((s) => s.toggleTeachingAge);

  if (!persona) {
    return (
      <OnboardingShell
        testID="onboarding-age"
        title="Age group"
        subtitle="Pick a persona first."
        empty="Go back and choose student or tutor."
      >
        {null}
      </OnboardingShell>
    );
  }

  const isStudent = persona === 'student';
  const canContinue = isStudent
    ? Boolean(ageGroupId)
    : teachingAgeGroupIds.length > 0;

  return (
    <OnboardingShell
      testID="onboarding-age"
      title={isStudent ? 'Your age group' : 'Ages you teach'}
      subtitle={
        isStudent
          ? 'Themes will match this bucket — Pokémon for little explorers, GenZ energy for teens, and so on.'
          : 'Select one or more age bands. Theme options will combine across them.'
      }
      loading={isLoading}
      error={error ? error.message : null}
      onRetry={() => void refetch()}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/(onboarding)/topics')}
        />
      }
    >
      <Text className="text-sm mb-2 px-1" style={{ color: tokens.muted }}>
        Ages 5–45 in sensible buckets (not every year).
      </Text>
      <View className="flex-row flex-wrap">
        {(data?.ageGroups ?? []).map((g) => {
          const selected = isStudent
            ? ageGroupId === g.id
            : teachingAgeGroupIds.includes(g.id);
          return (
            <Chip
              key={g.id}
              testID={`age-chip-${g.id}`}
              label={g.label}
              selected={selected}
              onPress={() =>
                isStudent ? setAgeGroupId(g.id) : toggleTeachingAge(g.id)
              }
            />
          );
        })}
      </View>
    </OnboardingShell>
  );
}
