import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  testID,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-2xl min-h-[48px] items-center justify-center ${
        isDisabled ? 'bg-slate-300' : 'bg-brand-dark'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white font-semibold text-base">{label}</Text>
      )}
    </Pressable>
  );
}
