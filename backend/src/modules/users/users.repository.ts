import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export type UiTheme = 'lagoon' | 'ink';

export type ProfileRecord = {
  userId: string;
  persona: 'student' | 'tutor' | null;
  ageGroupId: string | null;
  teachingAgeGroupIds: string[];
  topicIds: string[];
  themeIds: string[];
  displayName: string | null;
  onboardingComplete: boolean;
  onboardingCompletedAt: string | null;
  uiTheme: UiTheme;
  updatedAt: string;
};

type ProfileRow = {
  user_id: string;
  persona: 'student' | 'tutor' | null;
  age_group_id: string | null;
  teaching_age_group_ids: string[] | null;
  topic_ids: string[] | null;
  theme_ids: string[] | null;
  display_name: string | null;
  onboarding_complete: boolean;
  onboarding_completed_at: string | null;
  ui_theme: UiTheme;
  updated_at: string;
};

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);
  private readonly memory = new Map<string, ProfileRecord>();

  constructor(private readonly supabase: SupabaseService) {}

  async findByUserId(userId: string): Promise<ProfileRecord | undefined> {
    if (!this.supabase.isEnabled) {
      return this.memory.get(userId);
    }
    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      this.logger.error(`findByUserId failed: ${error.message}`);
      throw error;
    }
    return data ? this.fromRow(data as ProfileRow) : undefined;
  }

  async upsert(profile: ProfileRecord): Promise<ProfileRecord> {
    if (!this.supabase.isEnabled) {
      this.memory.set(profile.userId, profile);
      return profile;
    }
    const row = this.toRow(profile);
    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .upsert(row, { onConflict: 'user_id' })
      .select('*')
      .single();
    if (error) {
      this.logger.error(`upsert failed: ${error.message}`);
      throw error;
    }
    return this.fromRow(data as ProfileRow);
  }

  private toRow(profile: ProfileRecord): ProfileRow {
    return {
      user_id: profile.userId,
      persona: profile.persona,
      age_group_id: profile.ageGroupId,
      teaching_age_group_ids: profile.teachingAgeGroupIds,
      topic_ids: profile.topicIds,
      theme_ids: profile.themeIds,
      display_name: profile.displayName,
      onboarding_complete: profile.onboardingComplete,
      onboarding_completed_at: profile.onboardingCompletedAt,
      ui_theme: profile.uiTheme,
      updated_at: profile.updatedAt,
    };
  }

  private fromRow(row: ProfileRow): ProfileRecord {
    return {
      userId: row.user_id,
      persona: row.persona,
      ageGroupId: row.age_group_id,
      teachingAgeGroupIds: row.teaching_age_group_ids ?? [],
      topicIds: row.topic_ids ?? [],
      themeIds: row.theme_ids ?? [],
      displayName: row.display_name,
      onboardingComplete: row.onboarding_complete,
      onboardingCompletedAt: row.onboarding_completed_at,
      uiTheme: row.ui_theme ?? 'lagoon',
      updatedAt: row.updated_at,
    };
  }
}
