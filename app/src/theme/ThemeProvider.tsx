import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { applyCssVars } from './applyCssVars';
import { loadStoredTheme, saveStoredTheme } from './storage';
import {
  DEFAULT_THEME,
  THEMES,
  type ThemeTokens,
  type UiThemeId,
} from './tokens';

type ThemeContextValue = {
  themeId: UiThemeId;
  tokens: ThemeTokens;
  setThemeId: (id: UiThemeId) => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<UiThemeId>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadStoredTheme().then((id) => {
      if (!cancelled) {
        setThemeIdState(id);
        applyCssVars(THEMES[id]);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setThemeId = useCallback((id: UiThemeId) => {
    setThemeIdState(id);
    applyCssVars(THEMES[id]);
    void saveStoredTheme(id);
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      tokens: THEMES[themeId],
      setThemeId,
      ready,
    }),
    [themeId, setThemeId, ready],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return ctx;
}
