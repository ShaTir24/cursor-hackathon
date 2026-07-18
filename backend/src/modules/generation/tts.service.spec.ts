import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { TtsService } from './tts.service';

describe('TtsService', () => {
  let service: TtsService;
  let cacheDir: string;

  beforeEach(async () => {
    cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tts-cache-'));
    const moduleRef = await Test.createTestingModule({
      providers: [
        TtsService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, def?: string) => {
              if (key === 'TTS_CACHE_DIR') return cacheDir;
              if (key === 'NODE_ENV') return 'test';
              if (key === 'TTS_DAILY_CHAR_BUDGET') return '100';
              if (key === 'ELEVENLABS_MODEL') return 'eleven_flash_v2_5';
              if (key === 'ELEVENLABS_VOICE_ID') return 'default';
              return def;
            },
          },
        },
      ],
    }).compile();
    service = moduleRef.get(TtsService);
  });

  afterEach(() => {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  });

  it('returns fixture audio in test env and caches by hash', async () => {
    const a = await service.getOrSynthesize('Hello photosynthesis');
    expect(fs.existsSync(a.audioPath)).toBe(true);
    expect(a.durationMs).toBeGreaterThan(0);
    const b = await service.getOrSynthesize('Hello photosynthesis');
    expect(b.cached).toBe(true);
    expect(b.audioPath).toBe(a.audioPath);
  });
});
