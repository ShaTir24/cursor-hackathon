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

export type LearningPriority = {
  topicId: string;
  priority: number;
  complexConcepts: string[];
  videoPattern: string;
};

export type AgeLearningProfile = {
  trendingInterests: string[];
  contentGuidance: string;
  priorities: LearningPriority[];
};

export type Catalogue = {
  ageGroups: AgeGroup[];
  topics: Topic[];
  learningPrioritiesByAgeGroup: Record<string, AgeLearningProfile>;
  themesByAgeGroup: Record<string, Theme[]>;
};

export type Persona = 'student' | 'tutor';
export type UiTheme = 'lagoon' | 'ink';

export type Profile = {
  userId: string;
  persona: Persona | null;
  ageGroupId: string | null;
  teachingAgeGroupIds: string[];
  topicIds: string[];
  themeIds: string[];
  displayName: string | null;
  onboardingComplete: boolean;
  onboardingCompletedAt: string | null;
  uiTheme: UiTheme;
  updatedAt: string;
};

export type CompleteProfileInput = {
  persona: Persona;
  ageGroupId?: string;
  teachingAgeGroupIds?: string[];
  topicIds: string[];
  themeIds: string[];
  displayName?: string;
  uiTheme?: UiTheme;
};

export type ApiClient = {
  getCatalogue: () => Promise<Catalogue>;
  getThemesForAgeGroup: (
    ageGroupId: string,
  ) => Promise<{ ageGroupId: string; themes: Theme[] }>;
  getProfile: () => Promise<Profile>;
  completeProfile: (input: CompleteProfileInput) => Promise<Profile>;
  updateUiTheme: (uiTheme: UiTheme) => Promise<Profile>;
};
