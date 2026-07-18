import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TtsResult {
  audioPath: string;
  durationMs: number;
  cached: boolean;
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private charsUsedToday = 0;
  private readonly cacheDir: string;
  private readonly fixturesDir: string;
  private readonly model: string;
  private readonly voiceId: string;
  private readonly dailyBudget: number;
  private readonly offline: boolean;

  constructor(private readonly config: ConfigService) {
    const root = process.cwd();
    this.cacheDir = this.config.get('TTS_CACHE_DIR', path.join(root, 'data', 'tts-cache'));
    this.fixturesDir = path.join(root, 'fixtures', 'tts');
    this.model = this.config.get('ELEVENLABS_MODEL', 'eleven_flash_v2_5');
    this.voiceId = this.config.get('ELEVENLABS_VOICE_ID', 'default');
    this.dailyBudget = Number(this.config.get('TTS_DAILY_CHAR_BUDGET', 50000));
    const env = this.config.get('NODE_ENV', 'development');
    this.offline =
      env === 'test' ||
      env === 'dev-offline' ||
      this.config.get('TTS_FORCE_FIXTURES', 'false') === 'true';
    fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  cacheKey(text: string): string {
    return createHash('sha256')
      .update(`${text}|${this.voiceId}|${this.model}`)
      .digest('hex');
  }

  async getOrSynthesize(text: string): Promise<TtsResult> {
    const key = this.cacheKey(text);
    const cachedPath = path.join(this.cacheDir, `${key}.mp3`);
    if (fs.existsSync(cachedPath)) {
      const durationMs = await this.measureDurationMs(cachedPath);
      return { audioPath: cachedPath, durationMs, cached: true };
    }

    if (this.offline) {
      const fixture = this.pickFixture();
      fs.copyFileSync(fixture, cachedPath);
      const durationMs = await this.measureDurationMs(cachedPath);
      this.logger.log(`TTS fixture for hash ${key.slice(0, 8)}`);
      return { audioPath: cachedPath, durationMs, cached: false };
    }

    const estimate = text.length;
    if (this.charsUsedToday + estimate > this.dailyBudget) {
      throw new Error(
        `TTS daily budget exceeded (${this.charsUsedToday}/${this.dailyBudget} chars)`,
      );
    }

    const apiKey = this.config.get<string>('ELEVENLABS_API_KEY');
    if (!apiKey) {
      // Fall back to fixtures rather than failing demos
      const fixture = this.pickFixture();
      fs.copyFileSync(fixture, cachedPath);
      const durationMs = await this.measureDurationMs(cachedPath);
      return { audioPath: cachedPath, durationMs, cached: false };
    }

    const audio = await this.callElevenLabs(text, apiKey);
    fs.writeFileSync(cachedPath, audio);
    this.charsUsedToday += estimate;
    const durationMs = await this.measureDurationMs(cachedPath);
    return { audioPath: cachedPath, durationMs, cached: false };
  }

  private pickFixture(): string {
    const preferred = path.join(this.fixturesDir, 'sample.mp3');
    if (fs.existsSync(preferred)) return preferred;
    const files = fs.existsSync(this.fixturesDir)
      ? fs.readdirSync(this.fixturesDir).filter((f) => f.endsWith('.mp3'))
      : [];
    if (!files.length) {
      throw new Error(
        `No TTS fixtures in ${this.fixturesDir}. Run scripts/generate-fixtures.sh`,
      );
    }
    return path.join(this.fixturesDir, files[0]);
  }

  private async callElevenLabs(text: string, apiKey: string): Promise<Buffer> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: this.model,
      }),
    });
    if (!res.ok) {
      throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  private async measureDurationMs(filePath: string): Promise<number> {
    try {
      const mm = await import('music-metadata');
      const meta = await mm.parseFile(filePath);
      const sec = meta.format.duration ?? 1;
      return Math.round(sec * 1000) + 400; // +400ms padding per pipeline rules
    } catch {
      return 1400;
    }
  }
}
