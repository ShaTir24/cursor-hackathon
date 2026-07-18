export type RecentVideo = {
  id: string;
  title?: string;
  hlsUrl?: string;
  lessonPackId?: string | null;
  at: number;
};

const MAX = 5;

function key(userId: string) {
  return `edureels:recent:${userId}`;
}

export function listRecent(userId: string): RecentVideo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentVideo[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecent(
  userId: string,
  entry: Omit<RecentVideo, "at"> & { at?: number },
): RecentVideo[] {
  const next: RecentVideo = {
    id: entry.id,
    title: entry.title,
    hlsUrl: entry.hlsUrl,
    lessonPackId: entry.lessonPackId ?? null,
    at: entry.at ?? Date.now(),
  };
  const prev = listRecent(userId).filter((v) => v.id !== next.id);
  const merged = [next, ...prev].slice(0, MAX);
  try {
    localStorage.setItem(key(userId), JSON.stringify(merged));
  } catch {
    /* ignore quota */
  }
  return merged;
}
