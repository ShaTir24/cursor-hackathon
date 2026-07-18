/** Local-only auth for Playwright / demos when Nest AUTH_DEV_BYPASS=true. */
export const AUTH_DEV_BYPASS =
  process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === "true";

const DEV_USER_KEY = "edureels.devUserId";

export function getDevUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEV_USER_KEY);
}

export function setDevSession(email: string) {
  const slug = email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "user";
  window.localStorage.setItem(DEV_USER_KEY, `dev-${slug}`);
}

export function clearDevSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEV_USER_KEY);
}

export function hasDevSession(): boolean {
  return Boolean(getDevUserId());
}
