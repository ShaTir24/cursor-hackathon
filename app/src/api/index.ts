import { realApi } from './client';
import { mockApi } from './mocks/onboarding';
import type { ApiClient } from './types';

/** Stage 5: set EXPO_PUBLIC_USE_MOCKS=false (see app/.env.example) to hit Nest. */
const useMocks = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

export const api: ApiClient = useMocks ? mockApi : realApi;
export type { ApiClient, Catalogue, Profile, Persona } from './types';
