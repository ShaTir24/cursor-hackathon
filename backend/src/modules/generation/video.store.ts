import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  persistedFilePath,
  readJsonFile,
  writeJsonFileAtomic,
} from '../../common/json-persistence';

export type VideoStatus = 'processing' | 'ready' | 'failed';
export type PlaylistType = 'EVENT' | 'VOD';

export interface VideoTimeline {
  videoId: string;
  title: string;
  language: string;
  scenes: {
    id: number;
    narration: string;
    audioUrl: string;
    durationMs: number;
    visual: { type: 'bullet_card' | 'image' | 'diagram'; payload: unknown };
    onScreenText?: string;
  }[];
}

export interface VideoRecord {
  id: string;
  userId: string;
  title: string;
  status: VideoStatus;
  hlsUrl: string;
  playlistType: PlaylistType;
  scenesReady: number;
  scenesTotal: number | null;
  purpose: 'learn' | 'teach';
  topicId: string | null;
  interestId: string | null;
  lessonPackId: string | null;
  timeline: VideoTimeline | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class VideoStore implements OnModuleInit {
  private readonly videos = new Map<string, VideoRecord>();
  private readonly file = persistedFilePath('videos.json');

  onModuleInit(): void {
    const records = readJsonFile<VideoRecord[]>(this.file, []);
    for (const r of records) {
      if (r?.id) {
        // A reel mid-generation when the API stopped can never resume.
        if (r.status === 'processing') {
          r.status = 'failed';
          r.error = 'Generation interrupted by restart';
        }
        this.videos.set(r.id, r);
      }
    }
  }

  private flush(): void {
    writeJsonFileAtomic(this.file, [...this.videos.values()]);
  }

  save(record: VideoRecord): void {
    this.videos.set(record.id, { ...record });
    this.flush();
  }

  get(id: string): VideoRecord | undefined {
    const v = this.videos.get(id);
    return v ? { ...v } : undefined;
  }
}
