import { BadRequestException } from '@nestjs/common';
import { CatalogueService } from '../catalogue/catalogue.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const service = new UsersService(new UsersRepository(), new CatalogueService());

  it('completes a student profile', () => {
    const profile = service.completeProfile('user-1', {
      persona: 'student',
      ageGroupId: 'ages_5_10',
      topicIds: ['topic_science_tech'],
      themeIds: ['theme_pokemon'],
      displayName: 'Ada',
    });
    expect(profile.onboardingComplete).toBe(true);
    expect(profile.persona).toBe('student');
    expect(profile.ageGroupId).toBe('ages_5_10');
  });

  it('rejects themes outside the student age bucket', () => {
    expect(() =>
      service.completeProfile('user-2', {
        persona: 'student',
        ageGroupId: 'ages_5_10',
        topicIds: ['topic_math'],
        themeIds: ['theme_executive_brief'],
      }),
    ).toThrow(BadRequestException);
  });

  it('completes a tutor profile with teaching ages', () => {
    const profile = service.completeProfile('tutor-1', {
      persona: 'tutor',
      teachingAgeGroupIds: ['ages_15_18', 'ages_19_24'],
      topicIds: ['topic_coding_ai', 'topic_careers'],
      themeIds: ['theme_genz_fyp', 'theme_campus_cafe'],
    });
    expect(profile.teachingAgeGroupIds).toEqual([
      'ages_15_18',
      'ages_19_24',
    ]);
    expect(profile.ageGroupId).toBeNull();
  });
});
