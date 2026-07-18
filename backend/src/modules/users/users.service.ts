import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogueService } from '../catalogue/catalogue.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { ProfileRecord, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly catalogue: CatalogueService,
  ) {}

  getProfile(userId: string): ProfileRecord {
    const profile = this.repo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  completeProfile(userId: string, dto: CompleteProfileDto): ProfileRecord {
    this.validateCatalogueRefs(dto);

    const teachingAgeGroupIds =
      dto.persona === 'tutor' ? (dto.teachingAgeGroupIds ?? []) : [];
    const ageGroupId =
      dto.persona === 'student' ? (dto.ageGroupId ?? null) : null;

    if (dto.persona === 'student' && !ageGroupId) {
      throw new BadRequestException('ageGroupId is required for students');
    }
    if (dto.persona === 'tutor' && teachingAgeGroupIds.length === 0) {
      throw new BadRequestException(
        'teachingAgeGroupIds is required for tutors',
      );
    }

    const profile: ProfileRecord = {
      userId,
      persona: dto.persona,
      ageGroupId,
      teachingAgeGroupIds,
      topicIds: dto.topicIds,
      themeIds: dto.themeIds,
      displayName: dto.displayName ?? null,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    };
    return this.repo.upsert(profile);
  }

  private validateCatalogueRefs(dto: CompleteProfileDto): void {
    const ageIds = this.catalogue.getAgeGroupIds();
    const topicIds = this.catalogue.getTopicIds();

    if (dto.persona === 'student' && dto.ageGroupId && !ageIds.has(dto.ageGroupId)) {
      throw new BadRequestException(`Unknown ageGroupId: ${dto.ageGroupId}`);
    }
    if (dto.persona === 'tutor') {
      for (const id of dto.teachingAgeGroupIds ?? []) {
        if (!ageIds.has(id)) {
          throw new BadRequestException(`Unknown teaching age group: ${id}`);
        }
      }
    }
    for (const id of dto.topicIds) {
      if (!topicIds.has(id)) {
        throw new BadRequestException(`Unknown topicId: ${id}`);
      }
    }

    const relevantAgeIds =
      dto.persona === 'student'
        ? [dto.ageGroupId!].filter(Boolean)
        : (dto.teachingAgeGroupIds ?? []);
    const allowedThemes =
      this.catalogue.getThemeIdsForAgeGroups(relevantAgeIds);
    for (const id of dto.themeIds) {
      if (!allowedThemes.has(id)) {
        throw new BadRequestException(
          `Theme ${id} is not valid for selected age group(s)`,
        );
      }
    }
  }
}
