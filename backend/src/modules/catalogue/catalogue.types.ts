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

export type CataloguePayload = {
  ageGroups: AgeGroup[];
  topics: Topic[];
  learningPrioritiesByAgeGroup: Record<string, AgeLearningProfile>;
  themesByAgeGroup: Record<string, Theme[]>;
};
