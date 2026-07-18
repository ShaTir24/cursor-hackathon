export type UiThemeId = 'lagoon' | 'ink';

export type ThemeTokens = {
  id: UiThemeId;
  label: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
  success: string;
  error: string;
  onAccent: string;
  statusBar: 'dark' | 'light';
};

export const THEMES: Record<UiThemeId, ThemeTokens> = {
  lagoon: {
    id: 'lagoon',
    label: 'Lagoon',
    bg: '#F2F7F6',
    surface: '#FFFFFF',
    text: '#0B1F1C',
    muted: '#5B6E6A',
    accent: '#0D7377',
    accentSoft: '#D5F0F0',
    border: '#C9D9D5',
    success: '#1F7A4C',
    error: '#B42318',
    onAccent: '#FFFFFF',
    statusBar: 'dark',
  },
  ink: {
    id: 'ink',
    label: 'Ink',
    bg: '#12181A',
    surface: '#1C2528',
    text: '#E8F0EE',
    muted: '#8FA3A0',
    accent: '#3DDC97',
    accentSoft: '#1E3A32',
    border: '#2E3A3D',
    success: '#3DDC97',
    error: '#F07178',
    onAccent: '#0B1F1C',
    statusBar: 'light',
  },
};

export const DEFAULT_THEME: UiThemeId = 'lagoon';
export const THEME_STORAGE_KEY = 'edureels.uiTheme';
