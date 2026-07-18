import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { CurrentUser, type AuthUser } from '../auth/jwt-auth.guard';
import { CatalogueStore } from '../catalogue/catalogue.store';
import { ProfileStore } from '../profiles/profile.store';
import { PipelineService } from './pipeline.service';
import { VideoStore } from './video.store';

class CreateVideoBody {
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  interestId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  language?: string;

  @IsOptional()
  @IsEnum(['learn', 'teach'] as const)
  purpose?: 'learn' | 'teach';

  @IsOptional()
  @IsBoolean()
  includeLessonPack?: boolean;

  /** Legacy free-text fallback when catalogue ids omitted */
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  interest?: string;

  @IsOptional()
  @IsString()
  grade?: string;
}

@Controller('videos')
export class VideosController {
  constructor(
    private readonly pipeline: PipelineService,
    private readonly store: VideoStore,
    private readonly profiles: ProfileStore,
    private readonly catalogue: CatalogueStore,
  ) {}

  @Post()
  @HttpCode(202)
  async create(@Body() body: CreateVideoBody, @CurrentUser() user: AuthUser) {
    const profile = this.profiles.get(user.userId) ?? this.profiles.bootstrap(user.userId);
    if (!profile.onboardingComplete || !profile.role) {
      throw new ForbiddenException('Complete onboarding before generating video');
    }

    const purpose = body.purpose ?? (profile.role === 'teacher' ? 'teach' : 'learn');

    let topicLabel = body.topic;
    let interestLabel = body.interest;
    let topicId = body.topicId ?? null;
    let interestId = body.interestId ?? null;
    let grade = body.grade;

    if (profile.role === 'student') {
      const topic = topicId
        ? this.catalogue.getTopic(topicId)
        : profile.topics[0];
      const interest = interestId
        ? this.catalogue.getInterest(interestId)
        : profile.interests[0];
      if (!topic || !interest) {
        throw new ForbiddenException('Profile missing topics/interests');
      }
      topicId = topic.id;
      interestId = interest.id;
      topicLabel = topic.label;
      interestLabel = interest.label;
      grade = grade ?? profile.ageGroup ?? '11-13';
    } else {
      const subject = topicId
        ? this.catalogue.getTopic(topicId)
        : profile.subjects[0];
      if (!subject) throw new ForbiddenException('Profile missing subjects');
      topicId = subject.id;
      topicLabel = subject.label;
      interestLabel = interestLabel ?? 'classroom';
      grade = grade ?? profile.gradeBands[0] ?? '11-13';
      const interest = interestId
        ? this.catalogue.getInterest(interestId)
        : this.catalogue.interestBySlug('cricket');
      interestId = interest?.id ?? null;
      if (interest) interestLabel = interest.label;
    }

    const record = await this.pipeline.start({
      topic: topicLabel!,
      interest: interestLabel!,
      language: body.language ?? 'en',
      grade: grade!,
      userId: user.userId,
      purpose,
      topicId,
      interestId,
      includeLessonPack: body.includeLessonPack,
    });

    return {
      id: record.id,
      status: record.status,
      title: record.title,
      hlsUrl: record.hlsUrl,
      playlistType: record.playlistType,
      scenesReady: record.scenesReady,
      scenesTotal: record.scenesTotal,
      lessonPackId: record.lessonPackId,
    };
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const record = this.store.get(id);
    if (!record || record.userId !== user.userId) {
      throw new NotFoundException('Video not found');
    }
    return {
      id: record.id,
      status: record.status,
      title: record.title,
      hlsUrl: record.hlsUrl,
      playlistType: record.playlistType,
      scenesReady: record.scenesReady,
      scenesTotal: record.scenesTotal,
      timeline: record.timeline,
      error: record.error,
      lessonPackId: record.lessonPackId,
      purpose: record.purpose,
    };
  }
}
