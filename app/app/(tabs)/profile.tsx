import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemePicker } from '../../src/features/onboarding/components/ThemePicker';
import { useUpdateUiTheme } from '../../src/features/onboarding/hooks';
import { useOnboardingStore } from '../../src/features/onboarding/store';
import { useAppTheme } from '../../src/theme/ThemeProvider';

export default function ProfileScreen() {
  const persona = useOnboardingStore((s) => s.persona);
  const ageGroupId = useOnboardingStore((s) => s.ageGroupId);
  const teachingAgeGroupIds = useOnboardingStore((s) => s.teachingAgeGroupIds);
  const topicIds = useOnboardingStore((s) => s.topicIds);
  const themeIds = useOnboardingStore((s) => s.themeIds);
  const displayName = useOnboardingStore((s) => s.displayName);
  const reset = useOnboardingStore((s) => s.reset);
  const { tokens } = useAppTheme();
  const updateTheme = useUpdateUiTheme();

  return (
    <SafeAreaView
      className="flex-1 px-5"
      style={{ backgroundColor: tokens.bg }}
      testID="profile-screen"
    >
      <Text
        className="text-xs font-semibold tracking-widest uppercase mt-4"
        style={{ color: tokens.accent }}
      >
        EduReels
      </Text>
      <Text className="text-2xl font-bold mt-2" style={{ color: tokens.text }}>
        {displayName || 'Your profile'}
      </Text>
      <Text className="mt-1" style={{ color: tokens.muted }}>
        Onboarding complete — ready for reels.
      </Text>

      <View className="mt-6">
        <ThemePicker
          onPersist={(id) => {
            updateTheme.mutate(id);
          }}
        />
      </View>

      <View
        className="rounded-2xl border p-4 mt-2"
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
          {persona === 'tutor'
            ? teachingAgeGroupIds.join(', ')
            : ageGroupId ?? '—'}
        </Text>
        <Text className="text-sm mt-3" style={{ color: tokens.muted }}>
          Topics
        </Text>
        <Text className="text-base" style={{ color: tokens.text }}>
          {topicIds.join(', ') || '—'}
        </Text>
        <Text className="text-sm mt-3" style={{ color: tokens.muted }}>
          Video themes
        </Text>
        <Text className="text-base" style={{ color: tokens.text }}>
          {themeIds.join(', ') || '—'}
        </Text>
      </View>

      <Pressable
        className="mt-6 min-h-[44px] justify-center"
        onPress={() => {
          reset();
          router.replace('/(onboarding)/persona');
        }}
      >
        <Text className="font-semibold" style={{ color: tokens.accent }}>
          Redo onboarding
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
