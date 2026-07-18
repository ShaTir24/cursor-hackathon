import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { HlsPackagerService } from './hls/hls-packager.service';
import { LessonPackService } from './lesson-pack.service';
import { ResearchService } from './research.service';
import { TtsService } from './tts.service';
import { VideoRecord, VideoStore } from './video.store';

export interface CreateVideoDto {
  topic: string;
  interest: string;
  language: string;
  grade: string;
  userId: string;
  purpose: 'learn' | 'teach';
  topicId?: string | null;
  interestId?: string | null;
  includeLessonPack?: boolean;
}

export interface SceneDraft {
  id: number;
  narration: string;
  onScreenText: string;
  visualType: 'bullet_card' | 'image' | 'diagram';
}

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);
  private readonly visualFixture: string;

  constructor(
    private readonly config: ConfigService,
    private readonly store: VideoStore,
    private readonly tts: TtsService,
    private readonly research: ResearchService,
    private readonly packager: HlsPackagerService,
    private readonly lessonPacks: LessonPackService,
  ) {
    this.visualFixture = path.join(process.cwd(), 'fixtures', 'visuals', 'scene.png');
  }

  async start(dto: CreateVideoDto): Promise<VideoRecord> {
    const id = uuidv4();
    const demoMp4 = this.resolveDemoMp4();
    const title =
      dto.purpose === 'teach'
        ? `Class demo: ${dto.topic}`
        : `${dto.topic} for ${dto.interest} fans`;
    const record: VideoRecord = {
      id,
      userId: dto.userId,
      title,
      status: 'processing',
      hlsUrl: `/media/${id}/index.m3u8`,
      playlistType: demoMp4 ? 'VOD' : 'EVENT',
      scenesReady: 0,
      scenesTotal: demoMp4 ? 1 : null,
      purpose: dto.purpose,
      topicId: dto.topicId ?? null,
      interestId: dto.interestId ?? null,
      lessonPackId: null,
      timeline: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.save(record);
    // Scene pipeline seeds an empty EVENT playlist; MP4 pack overwrites with VOD.
    this.packager.ensureVideoDir(id, { seedPlaylist: !demoMp4 });

    if (dto.purpose === 'teach' && dto.includeLessonPack !== false) {
      const pack = this.lessonPacks.create({
        videoId: id,
        userId: dto.userId,
        topicLabel: dto.topic,
        gradeBand: dto.grade,
      });
      record.lessonPackId = pack.id;
      this.store.save(record);
    }

    setImmediate(() => {
      const work = demoMp4
        ? this.runDemoMp4(id, dto, demoMp4)
        : this.run(id, dto);
      work.catch((err) => {
        this.logger.error(`Pipeline failed ${id}: ${err}`);
        const cur = this.store.get(id);
        if (cur) {
          cur.status = 'failed';
          cur.error = err instanceof Error ? err.message : String(err);
          cur.updatedAt = new Date().toISOString();
          this.store.save(cur);
        }
      });
    });

    return this.store.get(id)!;
  }

  /**
   * Demo / HLS test path: when HLS_USE_DEMO_MP4 is auto|true and a source MP4
   * exists (HLS_DEMO_MP4 or data/demo-source.mp4 or any data/*.mp4), skip TTS
   * scenes and ffmpeg-pack that file into VOD HLS.
   */
  resolveDemoMp4(): string | null {
    const flag = String(
      this.config.get('HLS_USE_DEMO_MP4', 'auto'),
    ).toLowerCase();
    if (flag === 'false' || flag === '0' || flag === 'off') {
      return null;
    }

    const configured = this.config.get<string>('HLS_DEMO_MP4');
    if (configured && fs.existsSync(configured) && fs.statSync(configured).isFile()) {
      return path.resolve(configured);
    }

    const dataDir = path.join(process.cwd(), 'data');
    const preferred = path.join(dataDir, 'demo-source.mp4');
    if (fs.existsSync(preferred) && fs.statSync(preferred).isFile()) {
      return preferred;
    }

    if (!fs.existsSync(dataDir)) return null;
    const mp4s = fs
      .readdirSync(dataDir)
      .filter((f) => f.toLowerCase().endsWith('.mp4'))
      .map((f) => path.join(dataDir, f))
      .filter((p) => fs.statSync(p).isFile());
    return mp4s[0] ?? null;
  }

  private async runDemoMp4(
    videoId: string,
    dto: CreateVideoDto,
    mp4Path: string,
  ): Promise<void> {
    this.logger.log(`Using demo MP4 for HLS: ${mp4Path}`);
    const { segmentCount } = await this.packager.packMp4(videoId, mp4Path);
    const done = this.store.get(videoId)!;
    done.status = 'ready';
    done.playlistType = 'VOD';
    done.scenesReady = 1;
    done.scenesTotal = 1;
    done.timeline = {
      videoId,
      title: done.title,
      language: dto.language,
      scenes: [
        {
          id: 1,
          narration: `Demo HLS from ${path.basename(mp4Path)}`,
          audioUrl: '',
          durationMs: Math.max(1000, segmentCount * 4000),
          visual: { type: 'image', payload: { text: dto.topic } },
          onScreenText: dto.topic,
        },
      ],
    };
    done.updatedAt = new Date().toISOString();
    this.store.save(done);
    this.logger.log(
      `Video ${videoId} ready from demo MP4 (${segmentCount} HLS segments)`,
    );
  }

  private async run(videoId: string, dto: CreateVideoDto): Promise<void> {
    const snippets = await this.research.enrichTopic(dto.topic);
    const scenes = this.buildScenes(dto, snippets);
    const cur = this.store.get(videoId)!;
    cur.scenesTotal = scenes.length;
    this.store.save(cur);

    const ttsResults = await Promise.all(
      scenes.map(async (s) => ({ scene: s, audio: await this.tts.getOrSynthesize(s.narration) })),
    );

    const timelineScenes = [];
    for (const { scene, audio } of ttsResults) {
      const imagePath = this.renderBulletCard(videoId, scene);
      await this.packager.packScene({
        videoId,
        sceneId: scene.id,
        audioPath: audio.audioPath,
        imagePath,
        durationMs: audio.durationMs,
      });
      timelineScenes.push({
        id: scene.id,
        narration: scene.narration,
        audioUrl: `/media/${videoId}/scene_${scene.id}.mp3`,
        durationMs: audio.durationMs,
        visual: { type: scene.visualType, payload: { text: scene.onScreenText } },
        onScreenText: scene.onScreenText,
      });
      const dest = path.join(this.packager.videoDir(videoId), `scene_${scene.id}.mp3`);
      fs.copyFileSync(audio.audioPath, dest);

      const updated = this.store.get(videoId)!;
      updated.scenesReady = scene.id;
      updated.updatedAt = new Date().toISOString();
      this.store.save(updated);
    }

    await this.packager.finalize(videoId);
    const done = this.store.get(videoId)!;
    done.status = 'ready';
    done.playlistType = 'VOD';
    done.timeline = {
      videoId,
      title: done.title,
      language: dto.language,
      scenes: timelineScenes,
    };
    done.updatedAt = new Date().toISOString();
    this.store.save(done);
    this.logger.log(`Video ${videoId} ready (${scenes.length} scenes)`);
  }

  buildScenes(dto: CreateVideoDto, snippets: { text: string }[]): SceneDraft[] {
    const fact = snippets[0]?.text?.slice(0, 120);
    if (dto.purpose === 'teach') {
      return [
        {
          id: 1,
          narration: `Teachers: here is a class-ready intro to ${dto.topic} for grades ${dto.grade}.`,
          onScreenText: dto.topic,
          visualType: 'bullet_card',
        },
        {
          id: 2,
          narration: fact
            ? `Share this fact with the class: ${fact}`
            : `Ask students what they already know about ${dto.topic}.`,
          onScreenText: 'Class hook',
          visualType: 'bullet_card',
        },
        {
          id: 3,
          narration: `Model ${dto.topic} as inputs, process, and output so every learner can follow.`,
          onScreenText: 'Inputs → Process → Output',
          visualType: 'diagram',
        },
        {
          id: 4,
          narration: `Try a quick check: students explain ${dto.topic} in one sentence to a partner.`,
          onScreenText: 'Turn and talk',
          visualType: 'bullet_card',
        },
        {
          id: 5,
          narration: `Wrap up with the exit ticket in your lesson pack. You can replay this demo anytime.`,
          onScreenText: 'Exit ticket',
          visualType: 'bullet_card',
        },
      ];
    }

    const hook = fact
      ? `Here's a real fact: ${fact}`
      : `Let's explore ${dto.topic} through ${dto.interest}.`;
    return [
      {
        id: 1,
        narration: `${hook} We'll keep it simple for grade ${dto.grade}.`,
        onScreenText: dto.topic,
        visualType: 'bullet_card',
      },
      {
        id: 2,
        narration: `Imagine ${dto.topic} as something from ${dto.interest}. That mental picture helps memory.`,
        onScreenText: `${dto.interest} metaphor`,
        visualType: 'bullet_card',
      },
      {
        id: 3,
        narration: `Key idea: ${dto.topic} has inputs, a process, and an output. Spot each part.`,
        onScreenText: 'Inputs → Process → Output',
        visualType: 'diagram',
      },
      {
        id: 4,
        narration: `Try explaining ${dto.topic} to a friend who loves ${dto.interest} in one sentence.`,
        onScreenText: 'Your turn',
        visualType: 'bullet_card',
      },
      {
        id: 5,
        narration: `Great work. You just personalized ${dto.topic} with ${dto.interest}. Replay anytime.`,
        onScreenText: 'Done',
        visualType: 'bullet_card',
      },
    ];
  }

  private renderBulletCard(videoId: string, scene: SceneDraft): string {
    const dest = path.join(this.packager.videoDir(videoId), `visual_${scene.id}.png`);
    if (!fs.existsSync(this.visualFixture)) {
      throw new Error(`Missing visual fixture ${this.visualFixture}`);
    }
    fs.copyFileSync(this.visualFixture, dest);
    return dest;
  }
}
