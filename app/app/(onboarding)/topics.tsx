import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Chip } from '../../src/features/onboarding/components/Chip';
import { OnboardingShell } from '../../src/features/onboarding/components/OnboardingShell';
import { PrimaryButton } from '../../src/features/onboarding/components/PrimaryButton';
import { useCatalogue } from '../../src/features/onboarding/hooks';
import { useOnboardingStore } from '../../src/features/onboarding/store';
import { useAppTheme } from '../../src/theme/ThemeProvider';

export default function TopicsScreen() {
  const { tokens } = useAppTheme();
  const { data, isLoading, error, refetch } = useCatalogue();
  const topicIds = useOnboardingStore((s) => s.topicIds);
  const toggleTopic = useOnboardingStore((s) => s.toggleTopic);

  const topics = data?.topics ?? [];
  const domains = [...new Set(topics.map((t) => t.domain))];

  return (
    <OnboardingShell
      testID="onboarding-topics"
      title="Learning topics"
      subtitle="Same topic catalogue for every age — presentation is tuned later by themes."
      loading={isLoading}
      error={error ? error.message : null}
      onRetry={() => void refetch()}
      empty={!isLoading && topics.length === 0 ? 'No topics available.' : null}
      footer={
        <PrimaryButton
          label={`Continue (${topicIds.length}/12)`}
          disabled={topicIds.length < 1}
          onPress={() => router.push('/(onboarding)/themes')}
        />
      }
    >
      {domains.map((domain) => (
        <View key={domain} className="mb-4">
          <Text
            className="text-sm font-bold px-1 mb-1"
            style={{ color: tokens.text }}
          >
            {domain}
          </Text>
          <View className="flex-row flex-wrap">
            {topics
              .filter((t) => t.domain === domain)
              .map((t) => (
                <Chip
                  key={t.id}
                  testID={`topic-chip-${t.id}`}
                  label={t.label}
                  selected={topicIds.includes(t.id)}
                  onPress={() => toggleTopic(t.id)}
                />
              ))}
          </View>
        </View>
      ))}
    </OnboardingShell>
  );
}
