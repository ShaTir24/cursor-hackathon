export interface PlaylistSegment {
  filename: string;
  durationSec: number;
}

/**
 * Writes HLS EVENT playlists atomically. No EXT-X-ENDLIST until finalize().
 */
export class PlaylistWriter {
  private segments: PlaylistSegment[] = [];
  private finalized = false;
  private readonly targetDurationSec: number;

  constructor(
    private readonly playlistPath: string,
    targetDurationSec = 6,
    private readonly fs: {
      writeFileSync: (path: string, data: string) => void;
      renameSync: (from: string, to: string) => void;
    } = require('fs'),
  ) {
    this.targetDurationSec = Math.max(1, Math.ceil(targetDurationSec));
  }

  get segmentCount(): number {
    return this.segments.length;
  }

  get isFinalized(): boolean {
    return this.finalized;
  }

  append(segment: PlaylistSegment): void {
    if (this.finalized) {
      throw new Error('Cannot append after finalize()');
    }
    if (!segment.filename || segment.durationSec <= 0) {
      throw new Error('Invalid segment');
    }
    this.segments.push(segment);
    this.flush(false);
  }

  finalize(): void {
    if (this.finalized) return;
    this.finalized = true;
    this.flush(true);
  }

  private flush(endList: boolean): void {
    const lines: string[] = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      `#EXT-X-TARGETDURATION:${this.targetDurationSec}`,
      '#EXT-X-MEDIA-SEQUENCE:0',
      '#EXT-X-PLAYLIST-TYPE:EVENT',
    ];
    for (const seg of this.segments) {
      lines.push(`#EXTINF:${seg.durationSec.toFixed(3)},`);
      lines.push(seg.filename);
    }
    if (endList) {
      lines.push('#EXT-X-ENDLIST');
    }
    const body = lines.join('\n') + '\n';
    const tmp = `${this.playlistPath}.tmp`;
    this.fs.writeFileSync(tmp, body);
    this.fs.renameSync(tmp, this.playlistPath);
  }
}
