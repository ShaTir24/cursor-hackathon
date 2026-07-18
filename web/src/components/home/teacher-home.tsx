"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { createVideo } from "@/lib/api";
import { listRecent, pushRecent, type RecentVideo } from "@/lib/recent-videos";
import type { Profile } from "@/lib/types";
import { CreateWithAI } from "@/components/home/create-with-ai";
import { EduReelsLogo } from "@/components/brand/edu-reels-logo";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";

type Props = {
  profile: Profile;
};

export function TeacherHome({ profile }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<RecentVideo[]>([]);
  const scope = useEntranceMotion("[data-motion]");

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
    <div ref={scope} className="mx-auto max-w-2xl space-y-8">
      <div data-motion>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Teach
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight md:text-4xl">
          Hi {profile.displayName ?? "teacher"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate a class demo reel. The lesson pack opens beside the player.
        </p>
      </div>

      <section
        data-motion
        className="space-y-3 rounded-xl border border-border/80 bg-card/90 p-5 shadow-sm"
      >
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

      <CreateWithAI
        username={profile.userId}
        placeholder="e.g. A 45-second class demo on photosynthesis for grade 8, with a quick recap quiz."
      />

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
                Class demo stage
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll generate a demo reel plus objectives, talking points,
                and a quiz.
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
            {loading ? "Starting…" : "Generate class demo"}
          </Button>
        </div>
      </section>

      <section data-motion className="space-y-3">
        <h2 className="text-sm font-semibold">Recent</h2>
        {recent.length === 0 ? (
          <Empty className="border border-dashed border-border bg-card/60">
            <EmptyHeader>
              <EmptyMedia>
                <EduReelsLogo size="sm" withWordmark={false} />
              </EmptyMedia>
              <EmptyTitle>No demos yet</EmptyTitle>
              <EmptyDescription>
                Generate your first class demo reel and lesson pack.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        ) : (
          <ItemGroup className="gap-2">
            {recent.map((v) => {
              const q = new URLSearchParams();
              if (v.hlsUrl) q.set("hlsUrl", v.hlsUrl);
              if (v.lessonPackId) q.set("lessonPackId", v.lessonPackId);
              const qs = q.toString();
              return (
                <Item
                  key={v.id}
                  variant="outline"
                  size="sm"
                  render={
                    <Link
                      href={`/player/${v.id}${qs ? `?${qs}` : ""}`}
                    />
                  }
                >
                  <ItemContent>
                    <ItemTitle>
                      {v.title ?? `Demo ${v.id.slice(0, 8)}`}
                    </ItemTitle>
                    <ItemDescription>
                      {new Date(v.at).toLocaleDateString()}
                      {v.lessonPackId ? " · Lesson pack" : ""}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </section>
    </div>
  );
}
