import type {
  ApiClient,
  Catalogue,
  CompleteProfileInput,
  Profile,
} from '../types';
import catalogueJson from './catalogue.json';

const catalogue = catalogueJson as Catalogue;

let profile: Profile | null = null;
let forceError = false;

/** Test helpers for UI state demos */
export const mockFlags = {
  setError: (v: boolean) => {
    forceError = v;
  },
  resetProfile: () => {
    profile = null;
  },
};

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (forceError) reject(new Error('Mock catalogue unavailable'));
      else resolve(value);
    }, ms);
  });
}

export const mockApi: ApiClient = {
  async getCatalogue() {
    return delay(catalogue);
  },

  async getThemesForAgeGroup(ageGroupId: string) {
    const themes = catalogue.themesByAgeGroup[ageGroupId];
    if (!themes) throw new Error(`Unknown age group: ${ageGroupId}`);
    return delay({ ageGroupId, themes });
  },

  async getProfile() {
    if (!profile) throw new Error('Profile not found');
    return delay(profile);
  },

  async completeProfile(input: CompleteProfileInput) {
    profile = {
      userId: 'mock-user',
      persona: input.persona,
      ageGroupId: input.ageGroupId ?? null,
      teachingAgeGroupIds: input.teachingAgeGroupIds ?? [],
      topicIds: input.topicIds,
      themeIds: input.themeIds,
      displayName: input.displayName ?? null,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    };
    return delay(profile, 400);
  },
};
