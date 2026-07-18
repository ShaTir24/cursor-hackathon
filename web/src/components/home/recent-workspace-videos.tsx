"use client";

import { useEffect, useState } from "react";
import { Download, Film } from "lucide-react";
import { API_BASE, listWorkspaceVideos, type WorkspaceVideo } from "@/lib/api";
import { EduReelsLogo } from "@/components/brand/edu-reels-logo";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  username: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

function absoluteVideoUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function RecentWorkspaceVideos({
  username,
  emptyTitle = "No reels yet",
  emptyDescription = "Generate your first reel to see it here.",
}: Props) {
  const [videos, setVideos] = useState<WorkspaceVideo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setVideos(null);
    setError(null);
    void listWorkspaceVideos(username)
      .then((res) => {
        if (!cancelled) setVideos(res.videos);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setVideos([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (videos === null) {
    return (
      <section data-motion className="space-y-3">
        <h2 className="text-sm font-semibold">Recent</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section data-motion className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">Recent</h2>
        {videos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {videos.length} reel{videos.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          Could not load workspace videos: {error}
        </p>
      )}

      {videos.length === 0 ? (
        <Empty className="border border-dashed border-border bg-card/60">
          <EmptyHeader>
            <EmptyMedia>
              <EduReelsLogo size="sm" withWordmark={false} />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      ) : (
        <ul
          data-testid="recent-workspace-videos"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {videos.map((v) => {
            const src = absoluteVideoUrl(v.url);
            return (
              <li
                key={v.index}
                className="overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-sm"
              >
                <div className="relative aspect-[9/16] bg-black">
                  <video
                    src={src}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-xs font-medium">
                      <Film className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                      Reel #{v.index}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {new Date(v.mtimeMs).toLocaleString()} · {formatBytes(v.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    render={
                      <a
                        href={src}
                        download={`reel-${v.index}.mp4`}
                        aria-label={`Download reel ${v.index}`}
                      />
                    }
                  >
                    <Download className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
