import { Pressable, Text } from 'react-native';
import { useAppTheme } from '../../../theme/ThemeProvider';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
  subtitle?: string;
};

export function Chip({ label, selected, onPress, testID, subtitle }: Props) {
  const { tokens } = useAppTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      className="min-h-[44px] rounded-full px-4 py-3 m-1 border"
      style={{
        backgroundColor: selected ? tokens.accent : tokens.surface,
        borderColor: selected ? tokens.accent : tokens.border,
      }}
    >
      <Text
        className="text-sm font-semibold"
        style={{ color: selected ? tokens.onAccent : tokens.text }}
      >
        {label}
      </Text>
      {subtitle ? (
        <Text
          className="text-xs mt-0.5"
          style={{ color: selected ? tokens.onAccent : tokens.muted }}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}
