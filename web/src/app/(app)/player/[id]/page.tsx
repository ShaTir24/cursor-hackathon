"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getLessonPack, getVideo } from "@/lib/api";
import type { LessonPack } from "@/lib/types";
import { HlsPlayer } from "@/components/player/hls-player";
import { GenerateProgress } from "@/components/player/generate-progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { BookOpen, ListChecks, MessageSquareText, Target } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EduReelsLogo } from "@/components/brand/edu-reels-logo";

function PackSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Target;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-accent text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <h3 className="font-display text-base tracking-tight">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function PlayerInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const videoId = params.id;
  const initialHls = search.get("hlsUrl") ?? "";
  const lessonPackId = search.get("lessonPackId");

  const [hlsUrl, setHlsUrl] = useState(initialHls);
  const [status, setStatus] = useState("processing");
  const [scenesReady, setScenesReady] = useState(0);
  const [scenesTotal, setScenesTotal] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [pack, setPack] = useState<LessonPack | null>(null);
  const [packLoading, setPackLoading] = useState(Boolean(lessonPackId));
  const [packError, setPackError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      try {
        const v = await getVideo(videoId);
        if (cancelled) return;
        setStatus(v.status);
        setScenesReady(v.scenesReady);
        setScenesTotal(v.scenesTotal);
        if (v.hlsUrl) setHlsUrl(v.hlsUrl);
        setVideoError(v.error ?? null);
        if (v.status === "ready" || v.status === "failed") {
          if (timer) clearInterval(timer);
          timer = null;
        }
      } catch {
        /* keep polling until terminal */
      }
    };

    void tick();
    timer = setInterval(() => void tick(), 2000);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [videoId]);

  const loadPack = useCallback(() => {
    if (!lessonPackId) return;
    setPackLoading(true);
    setPackError(null);
    void getLessonPack(lessonPackId)
      .then((p) => {
        setPack(p);
        setPackLoading(false);
      })
      .catch((e) => {
        setPackError(e instanceof Error ? e.message : String(e));
        setPackLoading(false);
      });
  }, [lessonPackId]);

  useEffect(() => {
    loadPack();
  }, [loadPack]);

  const showPackChrome = Boolean(lessonPackId);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <EduReelsLogo size="sm" withWordmark={false} className="shrink-0" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/home" />}>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Player</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          {showPackChrome && (
            <Sheet>
              <SheetTrigger
                data-testid="lesson-pack-open"
                render={
                  <Button variant="outline" size="sm">
                    <BookOpen className="size-4" />
                    Lesson pack
                  </Button>
                }
              />
              <SheetContent
                className="w-full sm:max-w-md"
                data-testid="lesson-pack-panel"
              >
                <SheetHeader>
                  <SheetTitle className="font-display">Lesson pack</SheetTitle>
                  <SheetDescription>
                    Teaching companion for this reel — objectives, talking
                    points, and quiz.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6 px-4 pb-8">
                  {packLoading && <Skeleton className="h-40 w-full" />}
                  {packError && (
                    <Alert variant="destructive">
                      <AlertDescription className="flex flex-wrap items-center gap-3">
                        <span>{packError}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={loadPack}
                        >
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  {pack && !packLoading && (
                    <>
                      <PackSection icon={Target} title="Objectives">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {pack.payload.objectives.map((o) => (
                            <li
                              key={o}
                              className="flex gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                            >
                              <span
                                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                                aria-hidden
                              />
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </PackSection>
                      <Separator />
                      <PackSection
                        icon={MessageSquareText}
                        title="Talking points"
                      >
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {pack.payload.talkingPoints.map((o) => (
                            <li
                              key={o}
                              className="rounded-lg border border-border/60 bg-card px-3 py-2"
                            >
                              {o}
                            </li>
                          ))}
                        </ul>
                      </PackSection>
                      <Separator />
                      <PackSection icon={ListChecks} title="Quiz">
                        <ol className="list-none space-y-4">
                          {pack.payload.quiz.map((q, qi) => (
                            <li
                              key={q.q}
                              className="rounded-xl border border-border bg-card p-3"
                            >
                              <p className="text-sm font-medium">
                                <span className="mr-2 text-xs font-semibold text-primary">
                                  Q{qi + 1}
                                </span>
                                {q.q}
                              </p>
                              <ul className="mt-2 space-y-1.5 pl-1 text-sm text-muted-foreground">
                                {q.choices.map((c, i) => (
                                  <li
                                    key={c}
                                    className={
                                      i === q.answerIndex
                                        ? "rounded-md bg-accent px-2 py-1 font-medium text-primary"
                                        : "px-2 py-1"
                                    }
                                  >
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ol>
                      </PackSection>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <GenerateProgress
        status={status}
        scenesReady={scenesReady}
        scenesTotal={scenesTotal}
        errorMessage={videoError}
      />

      <div className="overflow-hidden rounded-xl border border-border/80 bg-stone-950 shadow-lg ring-1 ring-black/5">
        {hlsUrl ? (
          <HlsPlayer hlsUrl={hlsUrl} />
        ) : (
          <Skeleton className="aspect-video w-full rounded-none bg-stone-900" />
        )}
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <Skeleton className="aspect-video w-full max-w-5xl rounded-xl" />
      }
    >
      <PlayerInner />
    </Suspense>
  );
}
