import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../../src/features/onboarding/store';

export default function ProfileScreen() {
  const persona = useOnboardingStore((s) => s.persona);
  const ageGroupId = useOnboardingStore((s) => s.ageGroupId);
  const teachingAgeGroupIds = useOnboardingStore((s) => s.teachingAgeGroupIds);
  const topicIds = useOnboardingStore((s) => s.topicIds);
  const themeIds = useOnboardingStore((s) => s.themeIds);
  const displayName = useOnboardingStore((s) => s.displayName);
  const reset = useOnboardingStore((s) => s.reset);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5" testID="profile-screen">
      <Text className="text-xs font-semibold tracking-widest text-brand uppercase mt-4">
        EduReels
      </Text>
      <Text className="text-2xl font-bold text-slate-900 mt-2">
        {displayName || 'Your profile'}
      </Text>
      <Text className="text-slate-600 mt-1">Onboarding complete — ready for reels.</Text>

      <View className="bg-white rounded-2xl border border-slate-200 p-4 mt-6">
        <Text className="text-sm text-slate-500">Persona</Text>
        <Text className="text-base font-semibold capitalize">{persona ?? '—'}</Text>
        <Text className="text-sm text-slate-500 mt-3">Age</Text>
        <Text className="text-base">
          {persona === 'tutor'
            ? teachingAgeGroupIds.join(', ')
            : ageGroupId ?? '—'}
        </Text>
        <Text className="text-sm text-slate-500 mt-3">Topics</Text>
        <Text className="text-base">{topicIds.join(', ') || '—'}</Text>
        <Text className="text-sm text-slate-500 mt-3">Themes</Text>
        <Text className="text-base">{themeIds.join(', ') || '—'}</Text>
      </View>

      <Pressable
        className="mt-6 min-h-[44px] justify-center"
        onPress={() => {
          reset();
          router.replace('/(onboarding)/persona');
        }}
      >
        <Text className="text-brand font-semibold">Redo onboarding</Text>
      </Pressable>
    </SafeAreaView>
  );
}
