import { createClient } from "@/lib/supabase/client";
import type { CatalogueItem, LessonPack, Profile, VideoStatus } from "@/lib/types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return token;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Catalogue is @Public on Nest */
export async function fetchCatalogue() {
  const res = await fetch(`${API_BASE}/api/v1/catalogue`);
  if (!res.ok) throw new Error(`Catalogue failed: ${res.status}`);
  return res.json() as Promise<{
    topics: CatalogueItem[];
    interests: CatalogueItem[];
  }>;
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
