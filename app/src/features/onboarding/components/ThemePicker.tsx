import { Pressable, Text, View } from 'react-native';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { THEMES, type UiThemeId } from '../../../theme/tokens';

const OPTIONS: UiThemeId[] = ['lagoon', 'ink'];

type Props = {
  onPersist?: (id: UiThemeId) => void;
};

export function ThemePicker({ onPersist }: Props) {
  const { themeId, tokens, setThemeId } = useAppTheme();

  return (
    <View testID="theme-picker" className="mb-4">
      <Text style={{ color: tokens.muted }} className="text-sm font-semibold mb-2 px-1">
        Color theme
      </Text>
      <View className="flex-row flex-wrap">
        {OPTIONS.map((id) => {
          const selected = themeId === id;
          const option = THEMES[id];
          return (
            <Pressable
              key={id}
              testID={`theme-${id}`}
              onPress={() => {
                setThemeId(id);
                onPersist?.(id);
              }}
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
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
