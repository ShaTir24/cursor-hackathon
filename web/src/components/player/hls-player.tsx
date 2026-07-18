"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { API_BASE } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  hlsUrl: string;
  className?: string;
};

export function HlsPlayer({ hlsUrl, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const src = hlsUrl.startsWith("http") ? hlsUrl : `${API_BASE}${hlsUrl}`;

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setLoading(true);
    setError(null);
    let hls: Hls | null = null;
    let cancelled = false;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => setLoading(false), {
        once: true,
      });
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        liveDurationInfinity: true,
        manifestLoadingMaxRetry: 12,
        manifestLoadingRetryDelay: 1000,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) setLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal && !cancelled) {
          setError("HLS playback failed — playlist may still be warming up");
          setLoading(false);
        }
      });
    } else {
      setError("HLS is not supported in this browser");
      setLoading(false);
    }

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src, retryKey]);

  return (
    <div
      data-testid="hls-player"
      className={`relative aspect-video w-full overflow-hidden rounded-lg bg-foreground ${className ?? ""}`}
    >
      {loading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-foreground/90"
          aria-live="polite"
        >
          <Skeleton className="h-8 w-48 bg-muted-foreground/40" />
          <p className="text-sm text-primary-foreground/80">
            Waiting for first HLS segment…
          </p>
        </div>
      )}
      {error && (
        <Alert
          variant="destructive"
          className="absolute bottom-3 left-3 right-3 z-20"
        >
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button type="button" size="sm" variant="outline" onClick={retry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        playsInline
        data-testid="hls-video"
      />
    </div>
  );
}
