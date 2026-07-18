import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { VideoCreationController } from './video-creation.controller';
import { VideoCreationService } from './video-creation.service';

@Module({
  controllers: [VideoCreationController],
  providers: [VideoCreationService, ApiKeyGuard],
})
export class VideoCreationModule {}
