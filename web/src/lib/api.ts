import { createClient } from "@/lib/supabase/client";
import type { CatalogueItem, LessonPack, Profile, VideoStatus } from "@/lib/types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...auth,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

function asItem(raw: {
  id?: string;
  slug?: string;
  label?: string;
}): CatalogueItem | null {
  if (!raw?.id || !raw?.label) return null;
  return {
    id: raw.id,
    slug: raw.slug ?? String(raw.id).replace(/^topic_|^theme_/, ""),
    label: raw.label,
  };
}

/** Normalize catalogue so UI never sees undefined arrays. */
export function normalizeCatalogue(raw: unknown): {
  topics: CatalogueItem[];
  interests: CatalogueItem[];
} {
  const data = (raw ?? {}) as {
    topics?: Array<{ id?: string; slug?: string; label?: string }>;
    interests?: Array<{ id?: string; slug?: string; label?: string }>;
    themesByAgeGroup?: Record<
      string,
      Array<{ id?: string; slug?: string; label?: string }>
    >;
  };

  const topics = (data.topics ?? [])
    .map(asItem)
    .filter((x): x is CatalogueItem => Boolean(x));

  const interests = (data.interests ?? [])
    .map(asItem)
    .filter((x): x is CatalogueItem => Boolean(x));

  if (interests.length === 0 && data.themesByAgeGroup) {
    const seen = new Set<string>();
    for (const themes of Object.values(data.themesByAgeGroup)) {
      for (const theme of themes ?? []) {
        const item = asItem(theme);
        if (item && !seen.has(item.id)) {
          seen.add(item.id);
          interests.push(item);
        }
      }
    }
  }

  return { topics, interests };
}

/** Catalogue is @Public on Nest */
export async function fetchCatalogue() {
  const res = await fetch(`${API_BASE}/api/v1/catalogue`);
  if (!res.ok) throw new Error(`Catalogue failed: ${res.status}`);
  return normalizeCatalogue(await res.json());
}

export function bootstrapProfile() {
  return api<{ profile: Profile }>("/api/v1/auth/bootstrap", { method: "POST" });
}

export function getMe() {
  return api<{ profile: Profile }>("/api/v1/profiles/me");
}

export function submitOnboarding(body: Record<string, unknown>) {
  return api<{ profile: Profile }>("/api/v1/profiles/onboarding", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function createVideo(body: Record<string, unknown> = {}) {
  return api<VideoStatus>("/api/v1/videos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getVideo(id: string) {
  return api<VideoStatus>(`/api/v1/videos/${id}`);
}

export function getLessonPack(id: string) {
  return api<LessonPack>(`/api/v1/lesson-packs/${id}`);
}

export type WorkspaceVideo = {
  index: string;
  mtimeMs: number;
  size: number;
  url: string;
};

/** List playable reels under video-workspaces/<username> (public endpoint). */
export async function listWorkspaceVideos(username: string) {
  const res = await fetch(
    `${API_BASE}/api/v1/video-creation/workspaces/${encodeURIComponent(username)}`,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<{ username: string; videos: WorkspaceVideo[] }>;
}
