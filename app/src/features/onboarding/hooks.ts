import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import type { CompleteProfileInput, UiTheme } from '../../api/types';

export function useCatalogue() {
  return useQuery({
    queryKey: ['catalogue'],
    queryFn: () => api.getCatalogue(),
  });
}

export function useCompleteProfile() {
  return useMutation({
    mutationFn: (input: CompleteProfileInput) => api.completeProfile(input),
  });
}

export function useUpdateUiTheme() {
  return useMutation({
    mutationFn: (uiTheme: UiTheme) => api.updateUiTheme(uiTheme),
  });
}

export function relevantAgeGroupIds(args: {
  persona: 'student' | 'tutor' | null;
  ageGroupId: string | null;
  teachingAgeGroupIds: string[];
}): string[] {
  if (args.persona === 'student' && args.ageGroupId) return [args.ageGroupId];
  if (args.persona === 'tutor') return args.teachingAgeGroupIds;
  return [];
}
