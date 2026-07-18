"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { createVideo } from "@/lib/api";
import { pushRecent } from "@/lib/recent-videos";
import type { Profile } from "@/lib/types";
import { CreateWithAI } from "@/components/home/create-with-ai";
import { RecentWorkspaceVideos } from "@/components/home/recent-workspace-videos";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";

type Props = {
  profile: Profile;
};

export function StudentHome({ profile }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scope = useEntranceMotion("[data-motion]");

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
    <div ref={scope} className="mx-auto max-w-2xl space-y-8">
      <div data-motion>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Learn
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight md:text-4xl">
          Hi {profile.displayName ?? "learner"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate a reel tuned to your topics and interests.
        </p>
      </div>

      <section
        data-motion
        className="space-y-3 rounded-xl border border-border/80 bg-card/90 p-5 shadow-sm"
      >
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

      <CreateWithAI username={profile.userId} />

      {error && (
        <Alert variant="destructive" data-motion>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section
        data-motion
        className="relative overflow-hidden rounded-xl border border-primary/20 bg-accent/40 p-6"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10"
        />
        <div className="relative space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg tracking-tight">
                Ready when you are
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll build a short personalized learning reel from your
                focus.
              </p>
            </div>
          </div>
          <Button
            data-testid="generate-submit"
            size="lg"
            onClick={() => void onGenerate()}
            disabled={loading}
            className="bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
          >
            {loading ? "Starting…" : "Generate learning reel"}
          </Button>
        </div>
      </section>

      <RecentWorkspaceVideos
        username={profile.userId}
        emptyTitle="No reels yet"
        emptyDescription="Generate your first personalized learning reel to get started."
      />
    </div>
  );
}
