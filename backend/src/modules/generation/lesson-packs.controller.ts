import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/jwt-auth.guard';
import { LessonPackService } from './lesson-pack.service';

@Controller('lesson-packs')
export class LessonPacksController {
  constructor(private readonly packs: LessonPackService) {}

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const pack = this.packs.getForOwner(id, user.userId);
    if (!pack) throw new NotFoundException('Lesson pack not found');
    return {
      id: pack.id,
      videoId: pack.videoId,
      payload: pack.payload,
    };
  }
}
