import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, THEME_STORAGE_KEY, type UiThemeId } from './tokens';

export async function loadStoredTheme(): Promise<UiThemeId> {
  try {
    const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'lagoon' || value === 'ink') return value;
  } catch {
    // ignore — first launch / storage unavailable
  }
  return DEFAULT_THEME;
}

export async function saveStoredTheme(id: UiThemeId): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // ignore persistence failures
  }
}
