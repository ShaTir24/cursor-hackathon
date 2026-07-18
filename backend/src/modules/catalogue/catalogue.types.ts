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

export type CataloguePayload = {
  ageGroups: AgeGroup[];
  topics: Topic[];
  themesByAgeGroup: Record<string, Theme[]>;
};
