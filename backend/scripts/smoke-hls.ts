/**
 * Smoke: pack one fixture scene into an EVENT playlist then finalize.
 * Run: cd backend && npx ts-node scripts/smoke-hls.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { HlsPackagerService } from '../src/modules/generation/hls/hls-packager.service';

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegStatic = require('ffmpeg-static') as string;
  const root = path.join(process.cwd(), 'data', 'hls-smoke');
  fs.rmSync(root, { recursive: true, force: true });
  const config = {
    get: (key: string, def?: string) => {
      if (key === 'HLS_ROOT') return root;
      if (key === 'FFMPEG_PATH') return ffmpegStatic;
      if (key === 'HLS_TARGET_DURATION_SEC') return '6';
      return def;
    },
  } as ConfigService;

  const packager = new HlsPackagerService(config);
  packager.onModuleInit();
  const videoId = 'smoke';
  packager.ensureVideoDir(videoId);
  await packager.packScene({
    videoId,
    sceneId: 1,
    audioPath: path.join(process.cwd(), 'fixtures/tts/sample.mp3'),
    imagePath: path.join(process.cwd(), 'fixtures/visuals/scene.png'),
    durationMs: 1200,
  });
  const mid = fs.readFileSync(packager.playlistPath(videoId), 'utf8');
  if (mid.includes('#EXT-X-ENDLIST')) throw new Error('ENDLIST too early');
  await packager.finalize(videoId);
  const end = fs.readFileSync(packager.playlistPath(videoId), 'utf8');
  if (!end.includes('#EXT-X-ENDLIST')) throw new Error('missing ENDLIST');
  // Nest Logger preference — smoke script is CLI
  process.stdout.write(`OK ${packager.playlistPath(videoId)}\n`);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
