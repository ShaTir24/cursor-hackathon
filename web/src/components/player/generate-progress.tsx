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
    total != null ? Math.min(100, Math.round((scenesReady / total) * 100)) : undefined;
  const failed = status === "failed";

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={failed ? "destructive" : "secondary"}
          className="capitalize"
        >
          {status}
        </Badge>
        <Badge variant="outline">
          {scenesReady}/{total ?? "?"} scenes
        </Badge>
      </div>
      {failed && errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : (
        <Progress value={value ?? (status === "ready" ? 100 : 10)}>
          <span className="sr-only">
            Generation progress {value ?? 0} percent
          </span>
        </Progress>
      )}
    </div>
  );
}
