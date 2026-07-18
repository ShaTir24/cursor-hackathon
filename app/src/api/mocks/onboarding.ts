import type {
  ApiClient,
  Catalogue,
  CompleteProfileInput,
  Profile,
  UiTheme,
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
    const now = new Date().toISOString();
    profile = {
      userId: 'mock-user',
      persona: input.persona,
      ageGroupId: input.ageGroupId ?? null,
      teachingAgeGroupIds: input.teachingAgeGroupIds ?? [],
      topicIds: input.topicIds,
      themeIds: input.themeIds,
      displayName: input.displayName ?? null,
      onboardingComplete: true,
      onboardingCompletedAt: now,
      uiTheme: input.uiTheme ?? 'lagoon',
      updatedAt: now,
    };
    return delay(profile, 400);
  },

  async updateUiTheme(uiTheme: UiTheme) {
    if (!profile) throw new Error('Profile not found');
    profile = {
      ...profile,
      uiTheme,
      updatedAt: new Date().toISOString(),
    };
    return delay(profile);
  },
};
