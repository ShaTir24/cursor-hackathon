import { Injectable, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  persistedFilePath,
  readJsonFile,
  writeJsonFileAtomic,
} from '../../common/json-persistence';

export interface LessonPackPayload {
  objectives: string[];
  talkingPoints: string[];
  quiz: { q: string; choices: string[]; answerIndex: number }[];
}

export interface LessonPackRecord {
  id: string;
  videoId: string;
  userId: string;
  payload: LessonPackPayload;
}

@Injectable()
export class LessonPackService implements OnModuleInit {
  private readonly packs = new Map<string, LessonPackRecord>();
  private readonly file = persistedFilePath('lesson-packs.json');

  onModuleInit(): void {
    const records = readJsonFile<LessonPackRecord[]>(this.file, []);
    for (const r of records) {
      if (r?.id) this.packs.set(r.id, r);
    }
  }

  private flush(): void {
    writeJsonFileAtomic(this.file, [...this.packs.values()]);
  }

  create(input: {
    videoId: string;
    userId: string;
    topicLabel: string;
    gradeBand: string;
  }): LessonPackRecord {
    const payload: LessonPackPayload = {
      objectives: [
        `Explain ${input.topicLabel} in age-appropriate language (${input.gradeBand})`,
        `Connect ${input.topicLabel} to a familiar classroom example`,
        `Check understanding with a short formative quiz`,
      ],
      talkingPoints: [
        `Hook: ask what students already know about ${input.topicLabel}`,
        `Core model: break ${input.topicLabel} into inputs → process → output`,
        `Practice: one applied scenario using everyday language`,
        `Exit ticket: one-sentence summary from each student`,
      ],
      quiz: [
        {
          q: `What is the best first step when learning ${input.topicLabel}?`,
          choices: [
            'Memorize a definition only',
            'Name inputs, process, and output',
            'Skip to advanced problems',
            'Ignore prior knowledge',
          ],
          answerIndex: 1,
        },
        {
          q: `Why use a familiar theme when teaching ${input.topicLabel}?`,
          choices: [
            'It wastes time',
            'It improves memory and engagement',
            'It replaces the curriculum',
            'It only helps teachers',
          ],
          answerIndex: 1,
        },
        {
          q: `After the video, students should be able to…`,
          choices: [
            'Recite jargon without meaning',
            'Explain the idea in one sentence',
            'Teach a different subject',
            'Avoid asking questions',
          ],
          answerIndex: 1,
        },
      ],
    };
    const record: LessonPackRecord = {
      id: uuidv4(),
      videoId: input.videoId,
      userId: input.userId,
      payload,
    };
    this.packs.set(record.id, record);
    this.flush();
    return record;
  }

  get(id: string): LessonPackRecord | undefined {
    return this.packs.get(id);
  }

  getForOwner(id: string, userId: string): LessonPackRecord | undefined {
    const p = this.packs.get(id);
    if (!p || p.userId !== userId) return undefined;
    return p;
  }
}
