import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { HlsPackagerService } from './hls/hls-packager.service';
import { LessonPackService } from './lesson-pack.service';
import { LessonPacksController } from './lesson-packs.controller';
import { MediaController } from './media.controller';
import { PipelineService } from './pipeline.service';
import { ResearchService } from './research.service';
import { TtsService } from './tts.service';
import { VideoStore } from './video.store';
import { VideosController } from './videos.controller';

@Module({
  imports: [ConfigModule, ProfilesModule, CatalogueModule],
  controllers: [VideosController, MediaController, LessonPacksController],
  providers: [
    VideoStore,
    TtsService,
    ResearchService,
    HlsPackagerService,
    LessonPackService,
    PipelineService,
  ],
  exports: [PipelineService, VideoStore, HlsPackagerService, LessonPackService],
})
export class GenerationModule {}
