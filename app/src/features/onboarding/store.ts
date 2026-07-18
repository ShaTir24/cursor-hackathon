import { create } from 'zustand';
import type { Persona } from '../../api/types';

type OnboardingState = {
  persona: Persona | null;
  ageGroupId: string | null;
  teachingAgeGroupIds: string[];
  topicIds: string[];
  themeIds: string[];
  displayName: string;
  setPersona: (p: Persona) => void;
  setAgeGroupId: (id: string) => void;
  toggleTeachingAge: (id: string) => void;
  toggleTopic: (id: string) => void;
  toggleTheme: (id: string) => void;
  setDisplayName: (name: string) => void;
  reset: () => void;
};

const initial = {
  persona: null as Persona | null,
  ageGroupId: null as string | null,
  teachingAgeGroupIds: [] as string[],
  topicIds: [] as string[],
  themeIds: [] as string[],
  displayName: '',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setPersona: (persona) =>
    set({
      persona,
      ageGroupId: null,
      teachingAgeGroupIds: [],
      themeIds: [],
    }),
  setAgeGroupId: (ageGroupId) => set({ ageGroupId, themeIds: [] }),
  toggleTeachingAge: (id) =>
    set((s) => {
      const has = s.teachingAgeGroupIds.includes(id);
      const teachingAgeGroupIds = has
        ? s.teachingAgeGroupIds.filter((x) => x !== id)
        : [...s.teachingAgeGroupIds, id];
      return { teachingAgeGroupIds, themeIds: [] };
    }),
  toggleTopic: (id) =>
    set((s) => ({
      topicIds: s.topicIds.includes(id)
        ? s.topicIds.filter((x) => x !== id)
        : s.topicIds.length >= 12
          ? s.topicIds
          : [...s.topicIds, id],
    })),
  toggleTheme: (id) =>
    set((s) => ({
      themeIds: s.themeIds.includes(id)
        ? s.themeIds.filter((x) => x !== id)
        : s.themeIds.length >= 8
          ? s.themeIds
          : [...s.themeIds, id],
    })),
  setDisplayName: (displayName) => set({ displayName }),
  reset: () => set(initial),
}));
