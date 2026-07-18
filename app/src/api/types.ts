export type AgeGroup = {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
};

export type Topic = {
  id: string;
  domain: string;
  label: string;
};

export type Theme = {
  id: string;
  label: string;
  vibe: string;
};

export type Catalogue = {
  ageGroups: AgeGroup[];
  topics: Topic[];
  themesByAgeGroup: Record<string, Theme[]>;
};

export type Persona = 'student' | 'tutor';

export type Profile = {
  userId: string;
  persona: Persona | null;
  ageGroupId: string | null;
  teachingAgeGroupIds: string[];
  topicIds: string[];
  themeIds: string[];
  displayName: string | null;
  onboardingComplete: boolean;
  updatedAt: string;
};

export type CompleteProfileInput = {
  persona: Persona;
  ageGroupId?: string;
  teachingAgeGroupIds?: string[];
  topicIds: string[];
  themeIds: string[];
  displayName?: string;
};

export type ApiClient = {
  getCatalogue: () => Promise<Catalogue>;
  getThemesForAgeGroup: (
    ageGroupId: string,
  ) => Promise<{ ageGroupId: string; themes: Theme[] }>;
  getProfile: () => Promise<Profile>;
  completeProfile: (input: CompleteProfileInput) => Promise<Profile>;
};
