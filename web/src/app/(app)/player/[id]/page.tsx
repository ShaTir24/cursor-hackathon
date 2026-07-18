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
import { BookOpen } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="mx-auto max-w-5xl animate-in fade-in duration-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/home" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Player</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
                  <SheetTitle>Lesson pack</SheetTitle>
                  <SheetDescription>
                    Objectives, talking points, and quiz for this reel.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 px-4 pb-6">
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
                      <section>
                        <h3 className="mb-2 text-sm font-semibold">Objectives</h3>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {pack.payload.objectives.map((o) => (
                            <li key={o}>{o}</li>
                          ))}
                        </ul>
                      </section>
                      <Separator />
                      <section>
                        <h3 className="mb-2 text-sm font-semibold">
                          Talking points
                        </h3>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {pack.payload.talkingPoints.map((o) => (
                            <li key={o}>{o}</li>
                          ))}
                        </ul>
                      </section>
                      <Separator />
                      <section aria-label="Quiz">
                        <h3 className="mb-2 text-sm font-semibold">Quiz</h3>
                        <ol className="list-decimal space-y-3 pl-5 text-sm">
                          {pack.payload.quiz.map((q) => (
                            <li key={q.q}>
                              <p className="font-medium">{q.q}</p>
                              <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                                {q.choices.map((c, i) => (
                                  <li
                                    key={c}
                                    className={
                                      i === q.answerIndex
                                        ? "font-medium text-primary"
                                        : undefined
                                    }
                                  >
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ol>
                      </section>
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

      {hlsUrl ? (
        <HlsPlayer hlsUrl={hlsUrl} />
      ) : (
        <Skeleton className="aspect-video w-full" />
      )}
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<Skeleton className="aspect-video w-full max-w-5xl" />}>
      <PlayerInner />
    </Suspense>
  );
}
