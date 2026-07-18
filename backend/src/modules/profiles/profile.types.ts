export type UserRole = 'student' | 'teacher';
export type AgeGroup = '8-10' | '11-13' | '14-16' | '17-18';

export interface CatalogueItem {
  id: string;
  slug: string;
  label: string;
}

export interface ProfileDto {
  userId: string;
  role: UserRole | null;
  displayName: string | null;
  ageGroup: AgeGroup | null;
  onboardingComplete: boolean;
  topics: CatalogueItem[];
  interests: CatalogueItem[];
  subjects: CatalogueItem[];
  gradeBands: AgeGroup[];
}

export interface ProfileRecord {
  userId: string;
  role: UserRole | null;
  displayName: string | null;
  ageGroup: AgeGroup | null;
  onboardingComplete: boolean;
  topicIds: string[];
  interestIds: string[];
  subjectIds: string[];
  gradeBands: AgeGroup[];
}
