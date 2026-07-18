import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Public } from '../auth/jwt-auth.guard';

@Controller('media')
export class MediaController {
  private readonly hlsRoot: string;

  constructor(config: ConfigService) {
    this.hlsRoot = path.resolve(
      config.get('HLS_ROOT', path.join(process.cwd(), 'data', 'hls')),
    );
  }

  @Public()
  @Get(':videoId/:file')
  serve(
    @Param('videoId') videoId: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    if (!videoId || !file || videoId.includes('..') || file.includes('..') || file.includes('/')) {
      throw new BadRequestException('Invalid path');
    }
    const full = path.resolve(this.hlsRoot, videoId, file);
    const rootWithSep = this.hlsRoot.endsWith(path.sep)
      ? this.hlsRoot
      : this.hlsRoot + path.sep;
    if (!full.startsWith(rootWithSep)) {
      throw new BadRequestException('Path traversal denied');
    }
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      throw new NotFoundException('Media not found');
    }

    if (full.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache');
    } else if (full.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/mp2t');
    } else if (full.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (full.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.createReadStream(full).pipe(res);
  }
}
