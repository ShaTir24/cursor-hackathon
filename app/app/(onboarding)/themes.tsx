import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { Theme } from '../../src/api/types';
import { Chip } from '../../src/features/onboarding/components/Chip';
import { OnboardingShell } from '../../src/features/onboarding/components/OnboardingShell';
import { PrimaryButton } from '../../src/features/onboarding/components/PrimaryButton';
import {
  relevantAgeGroupIds,
  useCatalogue,
} from '../../src/features/onboarding/hooks';
import { useOnboardingStore } from '../../src/features/onboarding/store';
import { useAppTheme } from '../../src/theme/ThemeProvider';

export default function ThemesScreen() {
  const { tokens } = useAppTheme();
  const { data, isLoading, error, refetch } = useCatalogue();
  const persona = useOnboardingStore((s) => s.persona);
  const ageGroupId = useOnboardingStore((s) => s.ageGroupId);
  const teachingAgeGroupIds = useOnboardingStore((s) => s.teachingAgeGroupIds);
  const themeIds = useOnboardingStore((s) => s.themeIds);
  const toggleTheme = useOnboardingStore((s) => s.toggleTheme);

  const ageIds = relevantAgeGroupIds({
    persona,
    ageGroupId,
    teachingAgeGroupIds,
  });

  const themes: Theme[] = [];
  const seen = new Set<string>();
  for (const id of ageIds) {
    for (const theme of data?.themesByAgeGroup[id] ?? []) {
      if (!seen.has(theme.id)) {
        seen.add(theme.id);
        themes.push(theme);
      }
    }
  }

  const empty =
    !isLoading && ageIds.length === 0
      ? 'Pick an age group first.'
      : !isLoading && themes.length === 0
        ? 'No themes for this selection.'
        : null;

  return (
    <OnboardingShell
      testID="onboarding-themes"
      title="Video themes"
      subtitle="Age-tuned vibes — Pokémon for 5–10, FYP energy for teens, executive briefs for 35–45."
      loading={isLoading}
      error={error ? error.message : null}
      onRetry={() => void refetch()}
      empty={empty}
      footer={
        <PrimaryButton
          label={`Continue (${themeIds.length}/8)`}
          disabled={themeIds.length < 1 || ageIds.length === 0}
          onPress={() => router.push('/(onboarding)/review')}
        />
      }
    >
      <View className="flex-row flex-wrap">
        {themes.map((t) => (
          <Chip
            key={t.id}
            testID={`theme-chip-${t.id}`}
            label={t.label}
            subtitle={t.vibe}
            selected={themeIds.includes(t.id)}
            onPress={() => toggleTheme(t.id)}
          />
        ))}
      </View>
      {persona === 'tutor' && ageIds.length > 1 ? (
        <Text className="text-xs mt-3 px-1" style={{ color: tokens.muted }}>
          Showing themes across all selected teaching ages.
        </Text>
      ) : null}
    </OnboardingShell>
  );
}
