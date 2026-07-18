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

export function StudentHome({ profile }: Props) {
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
      const res = await createVideo({});
      pushRecent(profile.userId, {
        id: res.id,
        title: res.title,
        hlsUrl: res.hlsUrl,
        lessonPackId: res.lessonPackId,
      });
      router.push(
        `/player/${res.id}?hlsUrl=${encodeURIComponent(res.hlsUrl)}`,
      );
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
          Learn
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">
          Hi {profile.displayName ?? "learner"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate a reel tuned to your topics and interests.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Your focus</h2>
        <div className="flex flex-wrap gap-2">
          {profile.topics.map((t) => (
            <Badge key={t.id} variant="secondary">
              {t.label}
            </Badge>
          ))}
          {profile.interests.map((i) => (
            <Badge key={i.id} variant="outline">
              {i.label}
            </Badge>
          ))}
          {profile.topics.length === 0 && profile.interests.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No topics yet — update profile setup.
            </p>
          )}
        </div>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        data-testid="generate-submit"
        size="lg"
        onClick={() => void onGenerate()}
        disabled={loading}
        className="bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
      >
        {loading ? "Starting…" : "Generate learning reel"}
      </Button>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Recent</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reels yet. Generate your first one.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/player/${v.id}${v.hlsUrl ? `?hlsUrl=${encodeURIComponent(v.hlsUrl)}` : ""}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors duration-150 hover:border-primary/40"
                >
                  <span className="truncate font-medium">
                    {v.title ?? `Reel ${v.id.slice(0, 8)}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
