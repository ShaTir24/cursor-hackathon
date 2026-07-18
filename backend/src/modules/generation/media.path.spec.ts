import * as path from 'path';

describe('Media path safety', () => {
  const hlsRoot = path.resolve('/data/hls');

  function resolveMedia(videoId: string, file: string): string | null {
    if (!videoId || !file || videoId.includes('..') || file.includes('..') || file.includes('/')) {
      return null;
    }
    const full = path.resolve(hlsRoot, videoId, file);
    const rootWithSep = hlsRoot + path.sep;
    if (!full.startsWith(rootWithSep)) return null;
    return full;
  }

  it('allows normal segment paths', () => {
    expect(resolveMedia('abc', 'index.m3u8')).toBe(
      path.resolve('/data/hls/abc/index.m3u8'),
    );
  });

  it('rejects traversal', () => {
    expect(resolveMedia('abc', '../etc/passwd')).toBeNull();
    expect(resolveMedia('..', 'index.m3u8')).toBeNull();
    expect(resolveMedia('abc', 'foo/bar.ts')).toBeNull();
  });
});
