import * as fs from 'fs';
import * as path from 'path';

/**
 * Durable JSON persistence for the demo stores. Files live on the Docker /data
 * volume (or ./data locally) so profiles, videos, and lesson packs survive API
 * restarts. Not a database — single-process, atomic file writes only.
 */

/**
 * Resolve the directory used for persisted JSON.
 * Priority: PERSIST_DIR env → dirname(HLS_ROOT) (e.g. /data/hls → /data) → ./data
 */
export function resolveDataDir(): string {
  const configured = process.env.PERSIST_DIR;
  if (configured) return path.resolve(configured);
  const hlsRoot = process.env.HLS_ROOT;
  if (hlsRoot) return path.resolve(path.dirname(hlsRoot));
  return path.join(process.cwd(), 'data');
}

export function persistedFilePath(fileName: string): string {
  return path.join(resolveDataDir(), fileName);
}

export function readJsonFile<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt/partial file — fall back rather than crash the API.
    return fallback;
  }
}

/** Write JSON atomically (temp file + rename) so a crash can't truncate data. */
export function writeJsonFileAtomic(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}
