import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { OnboardingShell } from '../../src/features/onboarding/components/OnboardingShell';
import { PrimaryButton } from '../../src/features/onboarding/components/PrimaryButton';
import { useCompleteProfile } from '../../src/features/onboarding/hooks';
import { useOnboardingStore } from '../../src/features/onboarding/store';
import { useAppTheme } from '../../src/theme/ThemeProvider';

export default function ReviewScreen() {
  const { tokens, themeId } = useAppTheme();
  const persona = useOnboardingStore((s) => s.persona);
  const ageGroupId = useOnboardingStore((s) => s.ageGroupId);
  const teachingAgeGroupIds = useOnboardingStore((s) => s.teachingAgeGroupIds);
  const topicIds = useOnboardingStore((s) => s.topicIds);
  const themeIds = useOnboardingStore((s) => s.themeIds);
  const displayName = useOnboardingStore((s) => s.displayName);
  const setDisplayName = useOnboardingStore((s) => s.setDisplayName);
  const mutation = useCompleteProfile();

  const canSubmit =
    persona &&
    topicIds.length >= 1 &&
    themeIds.length >= 1 &&
    (persona === 'student' ? Boolean(ageGroupId) : teachingAgeGroupIds.length > 0);

  const onSubmit = () => {
    if (!persona || !canSubmit) return;
    mutation.mutate(
      {
        persona,
        ageGroupId: persona === 'student' ? ageGroupId! : undefined,
        teachingAgeGroupIds:
          persona === 'tutor' ? teachingAgeGroupIds : undefined,
        topicIds,
        themeIds,
        displayName: displayName.trim() || undefined,
        uiTheme: themeId,
      },
      {
        onSuccess: () => router.replace('/(tabs)/profile'),
      },
    );
  };

  return (
    <OnboardingShell
      testID="onboarding-review"
      title="Review & finish"
      subtitle="We’ll save this to your profile so every reel can match your vibe."
      footer={
        <View>
          {mutation.isError ? (
            <Text
              testID="onboarding-error"
              className="mb-2 text-center"
              style={{ color: tokens.error }}
            >
              {mutation.error.message}
            </Text>
          ) : null}
          <PrimaryButton
            testID="onboarding-submit"
            label="Complete onboarding"
            disabled={!canSubmit}
            loading={mutation.isPending}
            onPress={onSubmit}
          />
        </View>
      }
    >
      <View
        className="rounded-2xl border p-4 mb-4"
        style={{
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        }}
      >
        <Text className="text-sm" style={{ color: tokens.muted }}>
          Persona
        </Text>
        <Text
          className="text-base font-semibold capitalize"
          style={{ color: tokens.text }}
        >
          {persona ?? '—'}
        </Text>
        <Text className="text-sm mt-3" style={{ color: tokens.muted }}>
          Age
        </Text>
        <Text className="text-base" style={{ color: tokens.text }}>
          {persona === 'student'
            ? ageGroupId
            : teachingAgeGroupIds.join(', ') || '—'}
        </Text>
        <Text className="text-sm mt-3" style={{ color: tokens.muted }}>
          Topics ({topicIds.length})
        </Text>
        <Text className="text-base" style={{ color: tokens.text }}>
          {topicIds.join(', ')}
        </Text>
        <Text className="text-sm mt-3" style={{ color: tokens.muted }}>
          Themes ({themeIds.length})
        </Text>
        <Text className="text-base" style={{ color: tokens.text }}>
          {themeIds.join(', ')}
        </Text>
        <Text className="text-sm mt-3" style={{ color: tokens.muted }}>
          UI theme
        </Text>
        <Text className="text-base capitalize" style={{ color: tokens.text }}>
          {themeId}
        </Text>
      </View>

      <Text
        className="text-sm font-semibold mb-2 px-1"
        style={{ color: tokens.text }}
      >
        Display name (optional)
      </Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="e.g. Maya"
        placeholderTextColor={tokens.muted}
        className="rounded-2xl px-4 py-3 text-base min-h-[44px] border"
        style={{
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
          color: tokens.text,
        }}
        maxLength={40}
      />
    </OnboardingShell>
  );
}
