import { Injectable, OnModuleInit } from '@nestjs/common';
import { CatalogueStore } from '../catalogue/catalogue.store';
import {
  persistedFilePath,
  readJsonFile,
  writeJsonFileAtomic,
} from '../../common/json-persistence';
import {
  AgeGroup,
  ProfileDto,
  ProfileRecord,
  UserRole,
} from './profile.types';

@Injectable()
export class ProfileStore implements OnModuleInit {
  private readonly profiles = new Map<string, ProfileRecord>();
  private readonly file = persistedFilePath('profiles.json');

  constructor(private readonly catalogue: CatalogueStore) {}

  onModuleInit(): void {
    const records = readJsonFile<ProfileRecord[]>(this.file, []);
    for (const r of records) {
      if (r?.userId) this.profiles.set(r.userId, r);
    }
  }

  private flush(): void {
    writeJsonFileAtomic(this.file, [...this.profiles.values()]);
  }

  bootstrap(userId: string): ProfileDto {
    let p = this.profiles.get(userId);
    if (!p) {
      p = {
        userId,
        role: null,
        displayName: null,
        ageGroup: null,
        onboardingComplete: false,
        topicIds: [],
        interestIds: [],
        subjectIds: [],
        gradeBands: [],
      };
      this.profiles.set(userId, p);
      this.flush();
    }
    return this.toDto(p);
  }

  get(userId: string): ProfileDto | undefined {
    const p = this.profiles.get(userId);
    return p ? this.toDto(p) : undefined;
  }

  getRecord(userId: string): ProfileRecord | undefined {
    return this.profiles.get(userId);
  }

  saveOnboarding(input: {
    userId: string;
    role: UserRole;
    displayName: string;
    ageGroup?: AgeGroup;
    topicIds?: string[];
    interestIds?: string[];
    subjectIds?: string[];
    gradeBands?: AgeGroup[];
  }): ProfileDto {
    const p: ProfileRecord = {
      userId: input.userId,
      role: input.role,
      displayName: input.displayName,
      ageGroup: input.role === 'student' ? input.ageGroup ?? null : null,
      onboardingComplete: true,
      topicIds: input.role === 'student' ? input.topicIds ?? [] : [],
      interestIds: input.role === 'student' ? input.interestIds ?? [] : [],
      subjectIds: input.role === 'teacher' ? input.subjectIds ?? [] : [],
      gradeBands: input.role === 'teacher' ? input.gradeBands ?? [] : [],
    };
    this.profiles.set(input.userId, p);
    this.flush();
    return this.toDto(p);
  }

  private toDto(p: ProfileRecord): ProfileDto {
    const { topics, interests } = this.catalogue.list();
    return {
      userId: p.userId,
      role: p.role,
      displayName: p.displayName,
      ageGroup: p.ageGroup,
      onboardingComplete: p.onboardingComplete,
      topics: topics.filter((t) => p.topicIds.includes(t.id)),
      interests: interests.filter((i) => p.interestIds.includes(i.id)),
      subjects: topics.filter((t) => p.subjectIds.includes(t.id)),
      gradeBands: [...p.gradeBands],
    };
  }
}
