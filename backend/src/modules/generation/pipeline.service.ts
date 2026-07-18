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
      playlistType: 'EVENT',
      scenesReady: 0,
      scenesTotal: null,
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
    this.packager.ensureVideoDir(id);

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
      this.run(id, dto).catch((err) => {
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
