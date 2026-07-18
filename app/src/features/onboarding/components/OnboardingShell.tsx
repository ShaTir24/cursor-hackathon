import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle: string;
  testID: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: string | null;
  children: ReactNode;
  footer?: ReactNode;
};

export function OnboardingShell({
  title,
  subtitle,
  testID,
  loading,
  error,
  onRetry,
  empty,
  children,
  footer,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" testID={testID}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xs font-semibold tracking-widest text-brand uppercase">
          EduReels
        </Text>
        <Text className="text-2xl font-bold text-slate-900 mt-2">{title}</Text>
        <Text className="text-base text-slate-600 mt-1">{subtitle}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0F766E" size="large" />
          <Text className="text-slate-500 mt-3">Loading catalogue…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center mb-4">{error}</Text>
          {onRetry ? (
            <Pressable
              onPress={onRetry}
              className="bg-brand rounded-2xl px-6 py-3 min-h-[44px] justify-center"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </Pressable>
          ) : null}
        </View>
      ) : empty ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-slate-500 text-center">{empty}</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerClassName="pb-8"
        >
          {children}
        </ScrollView>
      )}

      {footer && !loading && !error ? (
        <View className="px-5 pb-6 pt-2 border-t border-slate-200 bg-white">
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
