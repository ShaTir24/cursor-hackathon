import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../theme/ThemeProvider';

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
  const { tokens } = useAppTheme();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: tokens.bg }}
      testID={testID}
    >
      <View className="px-5 pt-4 pb-2">
        <Text
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: tokens.accent }}
        >
          EduReels
        </Text>
        <Text
          className="text-2xl font-bold mt-2"
          style={{ color: tokens.text }}
        >
          {title}
        </Text>
        <Text className="text-base mt-1" style={{ color: tokens.muted }}>
          {subtitle}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={tokens.accent} size="large" />
          <Text className="mt-3" style={{ color: tokens.muted }}>
            Loading catalogue…
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center mb-4" style={{ color: tokens.error }}>
            {error}
          </Text>
          {onRetry ? (
            <Pressable
              onPress={onRetry}
              className="rounded-2xl px-6 py-3 min-h-[44px] justify-center"
              style={{ backgroundColor: tokens.accent }}
            >
              <Text
                className="font-semibold"
                style={{ color: tokens.onAccent }}
              >
                Retry
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : empty ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center" style={{ color: tokens.muted }}>
            {empty}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8">
          {children}
        </ScrollView>
      )}

      {footer && !loading && !error ? (
        <View
          className="px-5 pb-6 pt-2 border-t"
          style={{
            backgroundColor: tokens.surface,
            borderTopColor: tokens.border,
          }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
