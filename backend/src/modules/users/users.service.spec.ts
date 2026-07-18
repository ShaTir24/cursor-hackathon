import { BadRequestException } from '@nestjs/common';
import { CatalogueService } from '../catalogue/catalogue.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const supabase = {
    isEnabled: false,
    getClient: () => {
      throw new Error('not configured');
    },
    onModuleInit: () => undefined,
  } as unknown as SupabaseService;

  const service = new UsersService(
    new UsersRepository(supabase),
    new CatalogueService(),
  );

  it('completes a student profile', async () => {
    const profile = await service.completeProfile('user-1', {
      persona: 'student',
      ageGroupId: 'ages_5_10',
      topicIds: ['topic_science_tech'],
      themeIds: ['theme_pokemon'],
      displayName: 'Ada',
      uiTheme: 'lagoon',
    });
    expect(profile.onboardingComplete).toBe(true);
    expect(profile.onboardingCompletedAt).toBeTruthy();
    expect(profile.uiTheme).toBe('lagoon');
    expect(profile.persona).toBe('student');
  });

  it('rejects themes outside the student age bucket', async () => {
    await expect(
      service.completeProfile('user-2', {
        persona: 'student',
        ageGroupId: 'ages_5_10',
        topicIds: ['topic_math'],
        themeIds: ['theme_executive_brief'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('completes a tutor profile and patches theme', async () => {
    const profile = await service.completeProfile('tutor-1', {
      persona: 'tutor',
      teachingAgeGroupIds: ['ages_15_18', 'ages_19_24'],
      topicIds: ['topic_coding_ai', 'topic_careers'],
      themeIds: ['theme_genz_fyp', 'theme_campus_cafe'],
    });
    expect(profile.teachingAgeGroupIds).toEqual([
      'ages_15_18',
      'ages_19_24',
    ]);
    const themed = await service.updateTheme('tutor-1', { uiTheme: 'ink' });
    expect(themed.uiTheme).toBe('ink');
  });
});
