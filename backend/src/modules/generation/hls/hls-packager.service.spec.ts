import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { HlsPackagerService } from './hls-packager.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegStatic = require('ffmpeg-static') as string;

describe('HlsPackagerService', () => {
  let service: HlsPackagerService;
  let root: string;

  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'hls-root-'));
    const moduleRef = await Test.createTestingModule({
      providers: [
        HlsPackagerService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, def?: string) => {
              if (key === 'HLS_ROOT') return root;
              if (key === 'FFMPEG_PATH') return ffmpegStatic;
              if (key === 'HLS_TARGET_DURATION_SEC') return '6';
              return def;
            },
          },
        },
      ],
    }).compile();
    service = moduleRef.get(HlsPackagerService);
    service.onModuleInit();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('refuses pack when ffmpeg missing', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HlsPackagerService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, def?: string) => {
              if (key === 'HLS_ROOT') return root;
              if (key === 'FFMPEG_PATH') return '/nonexistent/ffmpeg-binary';
              return def ?? '6';
            },
          },
        },
      ],
    }).compile();
    const bad = moduleRef.get(HlsPackagerService);
    bad.onModuleInit();
    await expect(
      bad.packScene({
        videoId: 'v1',
        sceneId: 1,
        audioPath: __filename,
        imagePath: __filename,
        durationMs: 1000,
      }),
    ).rejects.toThrow(/ffmpeg not found/);
  });

  it('packs fixture image+audio into EVENT playlist', async () => {
    const fixtures = path.join(__dirname, '../../../../fixtures');
    const imagePath = path.join(fixtures, 'visuals', 'scene.png');
    const audioPath = path.join(fixtures, 'tts', 'sample.mp3');
    expect(fs.existsSync(imagePath)).toBe(true);
    expect(fs.existsSync(audioPath)).toBe(true);
    const out = await service.packScene({
      videoId: 'vid-test',
      sceneId: 1,
      audioPath,
      imagePath,
      durationMs: 1000,
    });
    expect(out.segmentFile).toBe('seg_0001.ts');
    const pl = fs.readFileSync(service.playlistPath('vid-test'), 'utf8');
    expect(pl).toContain('seg_0001.ts');
    expect(pl).not.toContain('#EXT-X-ENDLIST');
    await service.finalize('vid-test');
    const pl2 = fs.readFileSync(service.playlistPath('vid-test'), 'utf8');
    expect(pl2).toContain('#EXT-X-ENDLIST');
  });
});
