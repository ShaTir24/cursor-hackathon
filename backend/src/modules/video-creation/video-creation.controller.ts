import {
  Body,
  Controller,
  Get,
  Headers,
  MessageEvent,
  NotFoundException,
  Param,
  Post,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream, statSync } from 'node:fs';
import { Observable } from 'rxjs';
import { Public } from '../auth/jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoCreationService } from './video-creation.service';
import { resolveWorkspaceOutput } from './workspace.util';

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

  /**
   * Stream the generated reel for a workspace (`output.mp4` at the workspace
   * root, or the newest `*.mp4` inside it). Public so a plain <video> tag can
   * load it, with HTTP Range support for scrubbing / Safari playback.
   */
  @Public()
  @Get('output/:username/:index')
  serveOutput(
    @Param('username') username: string,
    @Param('index') index: string,
    @Headers('range') range: string | undefined,
    @Res() res: Response,
  ): void {
    const file = resolveWorkspaceOutput(username, index);
    if (!file) {
      throw new NotFoundException('No generated video found for this workspace');
    }

    const { size } = statSync(file);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      const start = match && match[1] ? parseInt(match[1], 10) : 0;
      const end = match && match[2] ? parseInt(match[2], 10) : size - 1;
      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start > end ||
        start >= size
      ) {
        res.status(416).setHeader('Content-Range', `bytes */${size}`);
        res.end();
        return;
      }
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      res.setHeader('Content-Length', end - start + 1);
      createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.setHeader('Content-Length', size);
    createReadStream(file).pipe(res);
  }
}
