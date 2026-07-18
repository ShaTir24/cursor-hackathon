"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createVideo } from "@/lib/api";
import { listRecent, pushRecent, type RecentVideo } from "@/lib/recent-videos";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type Props = {
  profile: Profile;
};

export function TeacherHome({ profile }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<RecentVideo[]>([]);

  useEffect(() => {
    setRecent(listRecent(profile.userId));
  }, [profile.userId]);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await createVideo({ includeLessonPack: true });
      pushRecent(profile.userId, {
        id: res.id,
        title: res.title,
        hlsUrl: res.hlsUrl,
        lessonPackId: res.lessonPackId,
      });
      const q = new URLSearchParams({ hlsUrl: res.hlsUrl });
      if (res.lessonPackId) q.set("lessonPackId", res.lessonPackId);
      router.push(`/player/${res.id}?${q.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Teach
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">
          Hi {profile.displayName ?? "teacher"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate a class demo reel. Lesson pack (objectives, talking points,
          quiz) opens beside the player.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Your classroom</h2>
        <div className="flex flex-wrap gap-2">
          {profile.subjects.map((s) => (
            <Badge key={s.id} variant="secondary">
              {s.label}
            </Badge>
          ))}
          {profile.gradeBands.map((g) => (
            <Badge key={g} variant="outline">
              Grades {g}
            </Badge>
          ))}
          {profile.subjects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No subjects yet — update profile setup.
            </p>
          )}
        </div>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Button
          data-testid="generate-submit"
          size="lg"
          onClick={() => void onGenerate()}
          disabled={loading}
          className="bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
        >
          {loading ? "Starting…" : "Generate class demo"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Includes lesson pack by default.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Recent demos</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No demos yet. Generate one for your next class.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((v) => {
              const q = new URLSearchParams();
              if (v.hlsUrl) q.set("hlsUrl", v.hlsUrl);
              if (v.lessonPackId) q.set("lessonPackId", v.lessonPackId);
              const qs = q.toString();
              return (
                <li key={v.id}>
                  <Link
                    href={`/player/${v.id}${qs ? `?${qs}` : ""}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors duration-150 hover:border-primary/40"
                  >
                    <span className="truncate font-medium">
                      {v.title ?? `Demo ${v.id.slice(0, 8)}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
