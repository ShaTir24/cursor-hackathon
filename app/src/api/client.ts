import type {
  ApiClient,
  Catalogue,
  CompleteProfileInput,
  Profile,
  UiTheme,
} from './types';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const TOKEN = process.env.EXPO_PUBLIC_DEV_USER_ID ?? 'dev-user-1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message ?? res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const realApi: ApiClient = {
  getCatalogue: () => request<Catalogue>('/catalogue'),
  getThemesForAgeGroup: (ageGroupId) =>
    request(`/catalogue/age-groups/${ageGroupId}/themes`),
  getProfile: () => request<Profile>('/users/me/profile'),
  completeProfile: (input: CompleteProfileInput) =>
    request<Profile>('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  updateUiTheme: (uiTheme: UiTheme) =>
    request<Profile>('/users/me/profile/theme', {
      method: 'PATCH',
      body: JSON.stringify({ uiTheme }),
    }),
};
