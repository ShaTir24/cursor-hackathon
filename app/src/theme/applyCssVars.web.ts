import type { ThemeTokens } from './tokens';

/** Web-only: set CSS variables for NativeWind `app-*` colors. */
export function applyCssVars(tokens: ThemeTokens): void {
  const root = document.documentElement;
  root.dataset.theme = tokens.id;
  root.style.setProperty('--color-bg', tokens.bg);
  root.style.setProperty('--color-surface', tokens.surface);
  root.style.setProperty('--color-text', tokens.text);
  root.style.setProperty('--color-muted', tokens.muted);
  root.style.setProperty('--color-accent', tokens.accent);
  root.style.setProperty('--color-accent-soft', tokens.accentSoft);
  root.style.setProperty('--color-border', tokens.border);
  root.style.setProperty('--color-success', tokens.success);
  root.style.setProperty('--color-error', tokens.error);
  root.style.setProperty('--color-on-accent', tokens.onAccent);
}
