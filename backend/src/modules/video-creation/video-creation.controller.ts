import { Body, Controller, MessageEvent, Post, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Public } from '../auth/public.decorator';
import { ApiKeyGuard } from './api-key.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoCreationService } from './video-creation.service';

@Controller('video-creation')
export class VideoCreationController {
  constructor(private readonly videoCreation: VideoCreationService) {}

  @Public()
  @UseGuards(ApiKeyGuard)
  @Post()
  @Sse()
  create(@Body() dto: CreateVideoDto): Observable<MessageEvent> {
    return this.videoCreation.create(dto);
  }
}
