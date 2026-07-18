import { Injectable } from '@nestjs/common';

export type ProfileRecord = {
  userId: string;
  persona: 'student' | 'tutor' | null;
  ageGroupId: string | null;
  teachingAgeGroupIds: string[];
  topicIds: string[];
  themeIds: string[];
  displayName: string | null;
  onboardingComplete: boolean;
  updatedAt: string;
};

/** In-memory store for hackathon MVP; swap for Supabase/TypeORM later. */
@Injectable()
export class UsersRepository {
  private readonly profiles = new Map<string, ProfileRecord>();

  findByUserId(userId: string): ProfileRecord | undefined {
    return this.profiles.get(userId);
  }

  upsert(profile: ProfileRecord): ProfileRecord {
    this.profiles.set(profile.userId, profile);
    return profile;
  }
}
