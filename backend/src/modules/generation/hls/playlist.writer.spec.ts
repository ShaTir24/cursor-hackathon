import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PlaylistWriter } from './playlist.writer';

describe('PlaylistWriter', () => {
  let dir: string;
  let playlistPath: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hls-pl-'));
    playlistPath = path.join(dir, 'index.m3u8');
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('appends segments without ENDLIST', () => {
    const w = new PlaylistWriter(playlistPath, 6);
    w.append({ filename: 'seg_0001.ts', durationSec: 4.2 });
    w.append({ filename: 'seg_0002.ts', durationSec: 5.1 });
    const body = fs.readFileSync(playlistPath, 'utf8');
    expect(body).toContain('#EXT-X-PLAYLIST-TYPE:EVENT');
    expect(body).toContain('seg_0001.ts');
    expect(body).toContain('seg_0002.ts');
    expect(body).not.toContain('#EXT-X-ENDLIST');
    expect(w.segmentCount).toBe(2);
  });

  it('finalize adds ENDLIST and blocks further append', () => {
    const w = new PlaylistWriter(playlistPath, 6);
    w.append({ filename: 'seg_0001.ts', durationSec: 3 });
    w.finalize();
    const body = fs.readFileSync(playlistPath, 'utf8');
    expect(body).toContain('#EXT-X-ENDLIST');
    expect(() => w.append({ filename: 'seg_0002.ts', durationSec: 1 })).toThrow(/finalize/);
  });

  it('writes atomically via temp rename', () => {
    const writes: string[] = [];
    const renames: Array<[string, string]> = [];
    const fakeFs = {
      writeFileSync: (p: string, data: string) => {
        writes.push(p);
        fs.writeFileSync(p, data);
      },
      renameSync: (from: string, to: string) => {
        renames.push([from, to]);
        fs.renameSync(from, to);
      },
    };
    const w = new PlaylistWriter(playlistPath, 6, fakeFs);
    w.append({ filename: 'a.ts', durationSec: 1 });
    expect(writes.some((p) => p.endsWith('.tmp'))).toBe(true);
    expect(renames.some(([, to]) => to === playlistPath)).toBe(true);
  });
});
