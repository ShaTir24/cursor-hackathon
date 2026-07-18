import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useAppTheme } from '../../../theme/ThemeProvider';

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
  const { tokens } = useAppTheme();
  const isDisabled = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      className="rounded-2xl min-h-[48px] items-center justify-center"
      style={{
        backgroundColor: isDisabled ? tokens.border : tokens.accent,
      }}
    >
      {loading ? (
        <ActivityIndicator color={tokens.onAccent} />
      ) : (
        <Text
          className="font-semibold text-base"
          style={{ color: isDisabled ? tokens.muted : tokens.onAccent }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
