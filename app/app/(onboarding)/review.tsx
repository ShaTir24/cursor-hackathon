import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { OnboardingShell } from '../../src/features/onboarding/components/OnboardingShell';
import { PrimaryButton } from '../../src/features/onboarding/components/PrimaryButton';
import { useCompleteProfile } from '../../src/features/onboarding/hooks';
import { useOnboardingStore } from '../../src/features/onboarding/store';

export default function ReviewScreen() {
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
            <Text testID="onboarding-error" className="text-red-600 mb-2 text-center">
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
      <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <Text className="text-sm text-slate-500">Persona</Text>
        <Text className="text-base font-semibold text-slate-900 capitalize">
          {persona ?? '—'}
        </Text>
        <Text className="text-sm text-slate-500 mt-3">Age</Text>
        <Text className="text-base text-slate-800">
          {persona === 'student'
            ? ageGroupId
            : teachingAgeGroupIds.join(', ') || '—'}
        </Text>
        <Text className="text-sm text-slate-500 mt-3">
          Topics ({topicIds.length})
        </Text>
        <Text className="text-base text-slate-800">{topicIds.join(', ')}</Text>
        <Text className="text-sm text-slate-500 mt-3">
          Themes ({themeIds.length})
        </Text>
        <Text className="text-base text-slate-800">{themeIds.join(', ')}</Text>
      </View>

      <Text className="text-sm font-semibold text-slate-700 mb-2 px-1">
        Display name (optional)
      </Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="e.g. Maya"
        className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-base text-slate-900 min-h-[44px]"
        maxLength={40}
      />
    </OnboardingShell>
  );
}
