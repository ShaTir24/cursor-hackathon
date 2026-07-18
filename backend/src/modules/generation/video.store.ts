import { Injectable } from '@nestjs/common';

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
export class VideoStore {
  private readonly videos = new Map<string, VideoRecord>();

  save(record: VideoRecord): void {
    this.videos.set(record.id, { ...record });
  }

  get(id: string): VideoRecord | undefined {
    const v = this.videos.get(id);
    return v ? { ...v } : undefined;
  }
}
