/**
 * Pack backend/data/demo-source.mp4 (or HLS_DEMO_MP4) into data/hls/demo/index.m3u8
 * Run: cd backend && npx ts-node scripts/pack-demo-hls.ts
 */
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { HlsPackagerService } from '../src/modules/generation/hls/hls-packager.service';

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  const configured = process.env.HLS_DEMO_MP4;
  const preferred = path.join(dataDir, 'demo-source.mp4');
  let mp4 =
    configured && fs.existsSync(configured)
      ? configured
      : fs.existsSync(preferred)
        ? preferred
        : null;
  if (!mp4) {
    const found = fs.existsSync(dataDir)
      ? fs.readdirSync(dataDir).find((f) => f.toLowerCase().endsWith('.mp4'))
      : undefined;
    if (found) mp4 = path.join(dataDir, found);
  }
  if (!mp4) {
    throw new Error(
      'No demo MP4. Place a file at backend/data/demo-source.mp4 (or set HLS_DEMO_MP4).',
    );
  }

  const root = path.join(process.cwd(), 'data', 'hls');
  let ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bundled = require('ffmpeg-static') as string | null;
    if (bundled) ffmpegPath = process.env.FFMPEG_PATH || bundled;
  } catch {
    /* system ffmpeg */
  }
  const config = {
    get: (key: string, def?: string) => {
      if (key === 'HLS_ROOT') return root;
      if (key === 'FFMPEG_PATH') return ffmpegPath;
      if (key === 'HLS_TARGET_DURATION_SEC') return '4';
      return def;
    },
  } as ConfigService;

  const packager = new HlsPackagerService(config);
  packager.onModuleInit();
  const videoId = 'demo';
  const { segmentCount, playlistPath } = await packager.packMp4(videoId, mp4);
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        mp4,
        playlistPath,
        segmentCount,
        playUrl: `http://localhost:3000/media/${videoId}/index.m3u8`,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
