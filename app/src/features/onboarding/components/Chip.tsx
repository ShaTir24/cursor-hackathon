import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
  subtitle?: string;
};

export function Chip({ label, selected, onPress, testID, subtitle }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      className={`min-h-[44px] rounded-full px-4 py-3 m-1 border ${
        selected
          ? 'bg-brand border-brand'
          : 'bg-white border-slate-200'
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          selected ? 'text-white' : 'text-slate-800'
        }`}
      >
        {label}
      </Text>
      {subtitle ? (
        <Text
          className={`text-xs mt-0.5 ${
            selected ? 'text-teal-50' : 'text-slate-500'
          }`}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}
