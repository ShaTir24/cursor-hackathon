import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { PlaylistWriter } from './playlist.writer';

export interface PackSceneInput {
  videoId: string;
  sceneId: number;
  audioPath: string;
  imagePath: string;
  durationMs: number;
}

@Injectable()
export class HlsPackagerService implements OnModuleInit {
  private readonly logger = new Logger(HlsPackagerService.name);
  private readonly writers = new Map<string, PlaylistWriter>();
  private readonly queues = new Map<string, Promise<void>>();
  private ffmpegPath: string;
  private hlsRoot: string;
  private targetDurationSec: number;

  constructor(private readonly config: ConfigService) {
    const bundled = (() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('ffmpeg-static') as string | null;
      } catch {
        return null;
      }
    })();
    this.ffmpegPath =
      this.config.get<string>('FFMPEG_PATH') || bundled || 'ffmpeg';
    this.hlsRoot = this.config.get<string>('HLS_ROOT', path.join(process.cwd(), 'data', 'hls'));
    this.targetDurationSec = Number(this.config.get('HLS_TARGET_DURATION_SEC', 6));
  }

  onModuleInit(): void {
    fs.mkdirSync(this.hlsRoot, { recursive: true });
  }

  videoDir(videoId: string): string {
    const dir = path.resolve(this.hlsRoot, videoId);
    if (!dir.startsWith(path.resolve(this.hlsRoot) + path.sep) && dir !== path.resolve(this.hlsRoot)) {
      throw new Error('Invalid videoId path');
    }
    return dir;
  }

  playlistPath(videoId: string): string {
    return path.join(this.videoDir(videoId), 'index.m3u8');
  }

  ensureVideoDir(videoId: string): string {
    const dir = this.videoDir(videoId);
    fs.mkdirSync(dir, { recursive: true });
    if (!this.writers.has(videoId)) {
      this.writers.set(
        videoId,
        new PlaylistWriter(this.playlistPath(videoId), this.targetDurationSec),
      );
      // Seed empty EVENT playlist so clients can attach early
      const w = this.writers.get(videoId)!;
      if (w.segmentCount === 0 && !fs.existsSync(this.playlistPath(videoId))) {
        fs.writeFileSync(
          this.playlistPath(videoId),
          [
            '#EXTM3U',
            '#EXT-X-VERSION:3',
            `#EXT-X-TARGETDURATION:${Math.ceil(this.targetDurationSec)}`,
            '#EXT-X-MEDIA-SEQUENCE:0',
            '#EXT-X-PLAYLIST-TYPE:EVENT',
            '',
          ].join('\n'),
        );
      }
    }
    return dir;
  }

  /** Serializes pack operations per videoId (ordered publish). */
  async packScene(input: PackSceneInput): Promise<{ segmentFile: string; durationSec: number }> {
    const prev = this.queues.get(input.videoId) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    this.queues.set(
      input.videoId,
      prev.then(() => gate),
    );
    await prev;
    try {
      return await this.packSceneUnlocked(input);
    } finally {
      release();
    }
  }

  async finalize(videoId: string): Promise<void> {
    const prev = this.queues.get(videoId) ?? Promise.resolve();
    await prev;
    const writer = this.writers.get(videoId);
    if (!writer) {
      throw new Error(`No playlist for video ${videoId}`);
    }
    writer.finalize();
  }

  private async packSceneUnlocked(
    input: PackSceneInput,
  ): Promise<{ segmentFile: string; durationSec: number }> {
    await this.assertFfmpeg();
    const dir = this.ensureVideoDir(input.videoId);
    const durationSec = Math.max(0.1, input.durationMs / 1000);
    const segmentFile = `seg_${String(input.sceneId).padStart(4, '0')}.ts`;
    const segmentPath = path.join(dir, segmentFile);

    if (!fs.existsSync(input.audioPath)) {
      throw new Error(`Audio missing: ${input.audioPath}`);
    }
    if (!fs.existsSync(input.imagePath)) {
      throw new Error(`Image missing: ${input.imagePath}`);
    }

    // Loop still image for audio duration, mux AAC/H264 into MPEG-TS
    await this.runFfmpeg([
      '-y',
      '-loop',
      '1',
      '-i',
      input.imagePath,
      '-i',
      input.audioPath,
      '-vf',
      'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
      '-c:v',
      'libx264',
      '-tune',
      'stillimage',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-pix_fmt',
      'yuv420p',
      '-shortest',
      '-t',
      durationSec.toFixed(3),
      '-f',
      'mpegts',
      segmentPath,
    ]);

    const writer = this.writers.get(input.videoId)!;
    writer.append({ filename: segmentFile, durationSec });
    this.logger.log(`Packed scene ${input.sceneId} → ${segmentFile} (${durationSec.toFixed(2)}s)`);
    return { segmentFile, durationSec };
  }

  private async assertFfmpeg(): Promise<void> {
    try {
      await this.runFfmpeg(['-version']);
    } catch {
      throw new Error(
        `ffmpeg not found at "${this.ffmpegPath}". Install ffmpeg or set FFMPEG_PATH.`,
      );
    }
  }

  runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', (d) => {
        stderr += d.toString();
      });
      child.on('error', (err) => reject(err));
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
      });
    });
  }
}
