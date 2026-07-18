import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
} from '@nestjs/common';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CurrentUser, type AuthUser } from '../auth/jwt-auth.guard';
import { ProfileStore } from './profile.store';
import { AgeGroup, UserRole } from './profile.types';

class OnboardingBody {
  @IsEnum(['student', 'teacher'] as const)
  role!: UserRole;

  @IsString()
  @MinLength(1)
  displayName!: string;

  @ValidateIf((o: OnboardingBody) => o.role === 'student')
  @IsEnum(['8-10', '11-13', '14-16', '17-18'] as const)
  ageGroup?: AgeGroup;

  @ValidateIf((o: OnboardingBody) => o.role === 'student')
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('all', { each: true })
  topicIds?: string[];

  @ValidateIf((o: OnboardingBody) => o.role === 'student')
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('all', { each: true })
  interestIds?: string[];

  @ValidateIf((o: OnboardingBody) => o.role === 'teacher')
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  subjectIds?: string[];

  @ValidateIf((o: OnboardingBody) => o.role === 'teacher')
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(['8-10', '11-13', '14-16', '17-18'] as const, { each: true })
  gradeBands?: AgeGroup[];
}

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly store: ProfileStore) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    const profile = this.store.get(user.userId) ?? this.store.bootstrap(user.userId);
    return { profile };
  }

  @Put('onboarding')
  onboard(@CurrentUser() user: AuthUser, @Body() body: OnboardingBody) {
    if (body.role === 'student') {
      if (!body.ageGroup || !body.topicIds || !body.interestIds) {
        throw new BadRequestException('Student onboarding requires ageGroup, topicIds, interestIds');
      }
    } else if (!body.subjectIds || !body.gradeBands) {
      throw new BadRequestException('Teacher onboarding requires subjectIds, gradeBands');
    }
    const profile = this.store.saveOnboarding({
      userId: user.userId,
      role: body.role,
      displayName: body.displayName,
      ageGroup: body.ageGroup,
      topicIds: body.topicIds,
      interestIds: body.interestIds,
      subjectIds: body.subjectIds,
      gradeBands: body.gradeBands,
    });
    return { profile };
  }
}
