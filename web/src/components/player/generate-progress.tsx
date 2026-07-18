"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  status: string;
  scenesReady: number;
  scenesTotal: number | null;
  errorMessage?: string | null;
};

export function GenerateProgress({
  status,
  scenesReady,
  scenesTotal,
  errorMessage,
}: Props) {
  const total = scenesTotal && scenesTotal > 0 ? scenesTotal : null;
  const value =
    total != null
      ? Math.min(100, Math.round((scenesReady / total) * 100))
      : undefined;
  const failed = status === "failed";
  const ready = status === "ready";

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={failed ? "destructive" : ready ? "secondary" : "outline"}
            className="capitalize"
          >
            {status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {scenesReady}/{total ?? "?"} scenes ready
          </span>
        </div>
        {!failed && !ready && (
          <p className="text-xs text-muted-foreground">Building your reel…</p>
        )}
        {ready && (
          <p className="text-xs font-medium text-primary">Ready to watch</p>
        )}
      </div>
      {failed && errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : (
        <Progress value={value ?? (ready ? 100 : 12)}>
          <span className="sr-only">
            Generation progress {value ?? 0} percent
          </span>
        </Progress>
      )}
    </div>
  );
}
