"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Brain,
  CircleCheck,
  CircleX,
  Clock,
  Loader2,
  Sparkles,
  Square,
  Terminal,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { API_BASE } from "@/lib/api";

type LineKind =
  | "system"
  | "thinking"
  | "assistant"
  | "tool"
  | "result"
  | "info"
  | "err"
  | "done"
  | "out";
type LogLine = { id: number; kind: LineKind; text: string };
type Phase = "idle" | "running" | "done" | "error";

type JobInput = { prompt: string; username: string };

function readJob(searchParams: URLSearchParams): JobInput | null {
  const jobId = searchParams.get("job");
  if (jobId) {
    try {
      const raw = sessionStorage.getItem(`vc:${jobId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<JobInput>;
        if (parsed.prompt) {
          return {
            prompt: parsed.prompt,
            username: parsed.username || "guest",
          };
        }
      }
    } catch {
      // fall through to query param
    }
  }
  const prompt = searchParams.get("prompt");
  if (prompt) return { prompt, username: "guest" };
  return null;
}

/** Parse one SSE event block ("event: x\ndata: y") into {type, data}. */
function parseEvent(block: string): { type: string; data: string } {
  let type = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) type = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  return { type, data: dataLines.join("\n") };
}

/**
 * Build the served MP4 URL from the agent's workspace path. The backend serves
 * `output.mp4` (or the newest mp4) at /video-creation/output/:username/:index.
 * Workspace looks like `.../video-workspaces/<username>/<index>`.
 */
function outputUrlFromWorkspace(workspace: string | undefined): string | null {
  if (!workspace) return null;
  const parts = workspace.split(/[/\\]/).filter(Boolean);
  const index = parts.at(-1);
  const username = parts.at(-2);
  if (!index || !username || !/^\d+$/.test(index)) return null;
  return `${API_BASE}/api/v1/video-creation/output/${encodeURIComponent(
    username,
  )}/${encodeURIComponent(index)}`;
}

/** Pull readable text out of a cursor-agent message content array. */
function contentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (part && typeof part === "object" && "text" in part) {
        return String((part as { text?: unknown }).text ?? "");
      }
      return "";
    })
    .join("");
}

function truncate(value: string, max = 160): string {
  const s = value.trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** Format milliseconds as an elapsed timer, e.g. "0.0s", "12.3s", "1:04.2". */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, ms) / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}

/** First string-valued key found on an object, collapsed to a single line. */
function firstString(
  obj: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.replace(/\s+/g, " ").trim();
  }
  return undefined;
}

/** Friendly labels for cursor-agent tool_call kinds (`<kind>ToolCall`). */
const TOOL_LABELS: Record<string, string> = {
  readToolCall: "Read",
  writeToolCall: "Write",
  editToolCall: "Edit",
  deleteToolCall: "Delete",
  lsToolCall: "List",
  globToolCall: "Glob",
  grepToolCall: "Grep",
  shellToolCall: "Shell",
  bashToolCall: "Shell",
  todoToolCall: "Todo",
  webSearchToolCall: "Web search",
  fetchToolCall: "Fetch",
  mcpToolCall: "MCP",
  taskToolCall: "Task",
};

/** Turn an unknown `fooToolCall` key into a readable label. */
function prettyKind(kind: string): string {
  if (!kind) return "Tool";
  const base = kind.replace(/ToolCall$/, "");
  if (!base) return "Tool";
  return base.charAt(0).toUpperCase() + base.slice(1).replace(/_/g, " ");
}

/** Extract the most useful arguments from a tool_call for display. */
function summarizeToolArgs(kind: string, args: unknown): string {
  if (!args || typeof args !== "object") return "";
  const a = args as Record<string, unknown>;
  const str = (key: string): string | undefined =>
    typeof a[key] === "string" ? (a[key] as string) : undefined;

  switch (kind) {
    case "readToolCall":
    case "writeToolCall":
    case "editToolCall":
    case "deleteToolCall":
    case "lsToolCall":
      return str("path") ?? str("target") ?? "";
    case "shellToolCall":
    case "bashToolCall":
      return truncate(str("command") ?? "", 200);
    case "grepToolCall":
      return str("pattern") ?? str("query") ?? "";
    case "globToolCall":
      return str("globPattern") ?? str("pattern") ?? str("path") ?? "";
    case "todoToolCall": {
      const todos = a.todos;
      return Array.isArray(todos) ? `${todos.length} item(s)` : "";
    }
    case "webSearchToolCall":
      return str("query") ?? str("search_term") ?? "";
    case "fetchToolCall":
      return str("url") ?? "";
    case "mcpToolCall": {
      const head = [str("server"), str("tool") ?? str("name")]
        .filter(Boolean)
        .join(" · ");
      const inner = a.args ?? a.arguments;
      if (inner && typeof inner === "object") {
        try {
          return truncate(`${head} ${JSON.stringify(inner)}`, 200);
        } catch {
          return head;
        }
      }
      return head;
    }
    default: {
      const path = str("path") ?? str("command") ?? str("query") ?? str("url");
      if (path) return truncate(path, 200);
      try {
        const s = JSON.stringify(a);
        return s === "{}" ? "" : truncate(s, 200);
      } catch {
        return "";
      }
    }
  }
}

/** Summarize a completed tool_call result into a short status line. */
function summarizeToolResult(
  result: unknown,
): { ok: boolean; text: string } {
  if (!result || typeof result !== "object") return { ok: true, text: "" };
  const r = result as Record<string, unknown>;

  if (r.error != null && r.error !== "") {
    const msg =
      typeof r.error === "string" ? r.error : JSON.stringify(r.error);
    return { ok: false, text: truncate(msg, 220) };
  }

  const success = (
    r.success && typeof r.success === "object" ? r.success : r
  ) as Record<string, unknown>;

  const bits: string[] = [];
  const numFields: [string, string][] = [
    ["totalLines", "lines"],
    ["linesCreated", "lines created"],
    ["linesEdited", "lines edited"],
    ["linesAdded", "added"],
    ["linesRemoved", "removed"],
    ["fileSize", "bytes"],
    ["matchCount", "matches"],
    ["numMatches", "matches"],
    ["numFiles", "files"],
    ["resultCount", "results"],
  ];
  for (const [key, label] of numFields) {
    const v = success[key];
    if (typeof v === "number") bits.push(`${v} ${label}`);
  }

  const exit = success.exitCode ?? success.exit_code;
  const exitOk = exit == null || exit === 0;
  if (typeof exit === "number" && exit !== 0) bits.push(`exit ${exit}`);

  const preview = firstString(success, [
    "stdout",
    "output",
    "content",
    "result",
    "text",
    "message",
    "summary",
  ]);
  if (preview) bits.push(truncate(preview, 140));

  return { ok: exitOk, text: bits.join(", ") };
}

const KIND_STYLE: Record<LineKind, string> = {
  system: "text-sky-400",
  info: "text-sky-400",
  thinking: "text-zinc-400 italic",
  assistant: "text-zinc-100",
  tool: "text-amber-300",
  result: "text-emerald-400",
  err: "text-red-400",
  done: "font-semibold text-emerald-400",
  out: "text-zinc-300",
};

const KIND_ICON: Partial<Record<LineKind, typeof Sparkles>> = {
  system: Terminal,
  info: Terminal,
  thinking: Brain,
  assistant: Sparkles,
  tool: Wrench,
  result: CircleCheck,
};

export function CreateClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<LogLine[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [summary, setSummary] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);
  const startedRef = useRef(false);
  // Streaming accumulators so word-by-word deltas grow one bubble instead of many.
  const assistantRef = useRef<{ id: number; text: string } | null>(null);
  const thinkingRef = useRef<{ id: number; text: string } | null>(null);
  // Track in-flight tool calls by call_id so "completed" annotates the same line.
  const toolLinesRef = useRef<Map<string, { id: number; base: string }>>(
    new Map(),
  );

  const pushEntry = useCallback((kind: LineKind, text: string): number => {
    const id = idRef.current++;
    setLines((prev) => [...prev, { id, kind, text }]);
    return id;
  }, []);

  const updateEntry = useCallback((id: number, text: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)));
  }, []);

  const appendStreaming = useCallback(
    (ref: typeof assistantRef, kind: LineKind, chunk: string) => {
      if (!chunk) return;
      if (!ref.current) {
        const id = idRef.current++;
        ref.current = { id, text: chunk };
        setLines((prev) => [...prev, { id, kind, text: chunk }]);
        return;
      }
      ref.current.text += chunk;
      updateEntry(ref.current.id, ref.current.text);
    },
    [updateEntry],
  );

  /** Replace the accumulated text (used for canonical/final flush frames). */
  const replaceStreaming = useCallback(
    (ref: typeof assistantRef, kind: LineKind, full: string) => {
      if (!full) return;
      if (!ref.current) {
        const id = idRef.current++;
        ref.current = { id, text: full };
        setLines((prev) => [...prev, { id, kind, text: full }]);
        return;
      }
      ref.current.text = full;
      updateEntry(ref.current.id, full);
    },
    [updateEntry],
  );

  /** Start (or reuse) a tool line and remember it by call_id. */
  const startTool = useCallback(
    (callId: string, label: string, argSummary: string) => {
      if (callId && toolLinesRef.current.has(callId)) return;
      const base = argSummary ? `▸ ${label}  ${argSummary}` : `▸ ${label}`;
      const id = idRef.current++;
      setLines((prev) => [...prev, { id, kind: "tool", text: base }]);
      if (callId) toolLinesRef.current.set(callId, { id, base });
    },
    [],
  );

  /** Annotate a tool line once its result arrives (or add a standalone line). */
  const annotateTool = useCallback(
    (callId: string, label: string, ok: boolean, detail: string) => {
      const mark = ok ? "✓" : "✗";
      const suffix = detail ? `${mark} ${detail}` : mark;
      const tracked = callId ? toolLinesRef.current.get(callId) : undefined;
      if (tracked) {
        updateEntry(tracked.id, `${tracked.base}\n   ${suffix}`);
        toolLinesRef.current.delete(callId);
        return;
      }
      const id = idRef.current++;
      setLines((prev) => [
        ...prev,
        { id, kind: ok ? "result" : "err", text: `${label}: ${suffix}` },
      ]);
    },
    [updateEntry],
  );

  /** Interpret one cursor-agent stream-json object into the live log. */
  const handleJson = useCallback(
    (o: Record<string, unknown>) => {
      const type = String(o.type ?? "");
      const subtype = String(o.subtype ?? "");
      // stream-partial-output dedup markers:
      //  - buffered flush before a tool call → has `model_call_id`
      //  - final canonical flush → no `timestamp_ms`
      //  - live delta → has `timestamp_ms`, no `model_call_id`
      const hasTs = o.timestamp_ms != null;
      const isBufferedDup = o.model_call_id != null;

      switch (type) {
        case "system":
          assistantRef.current = null;
          thinkingRef.current = null;
          toolLinesRef.current.clear();
          if (subtype === "init") {
            const model = String(o.model ?? "Auto");
            const cwd =
              typeof o.cwd === "string" ? ` · ${o.cwd as string}` : "";
            pushEntry("system", `Session started · model ${model}${cwd}`);
          } else if (subtype) {
            pushEntry("system", `System: ${subtype}`);
          }
          return;

        case "user":
          return; // our own prompt echoed back

        case "thinking": {
          assistantRef.current = null;
          if (subtype === "completed") {
            thinkingRef.current = null;
            return;
          }
          const text = String(o.text ?? o.thinking ?? "");
          if (!text || isBufferedDup) return;
          if (hasTs) appendStreaming(thinkingRef, "thinking", text);
          else replaceStreaming(thinkingRef, "thinking", text);
          return;
        }

        case "assistant": {
          thinkingRef.current = null;
          const msg = o.message as { content?: unknown } | undefined;
          const text = contentText(msg?.content) || String(o.text ?? "");
          if (!text || isBufferedDup) return; // skip pre-tool buffered copy
          if (hasTs) appendStreaming(assistantRef, "assistant", text);
          else replaceStreaming(assistantRef, "assistant", text); // final flush
          return;
        }

        case "tool_call": {
          assistantRef.current = null;
          thinkingRef.current = null;
          const call = o.tool_call as
            | Record<string, { args?: unknown; result?: unknown }>
            | undefined;
          const callId = String(o.call_id ?? o.callId ?? "");
          const kind = call ? Object.keys(call)[0] ?? "" : "";
          const detail = kind && call ? call[kind] : undefined;
          const label = TOOL_LABELS[kind] ?? prettyKind(kind);

          if (subtype === "completed") {
            const { ok, text } = summarizeToolResult(detail?.result);
            annotateTool(callId, label, ok, text);
          } else {
            startTool(callId, label, summarizeToolArgs(kind, detail?.args));
          }
          return;
        }

        // Legacy / alternate tool shapes (name-only).
        case "tool_use":
        case "tool": {
          assistantRef.current = null;
          thinkingRef.current = null;
          const name =
            (o.name as string) ||
            ((o.tool as { name?: string })?.name ?? "tool");
          const rawArgs = o.input ?? o.args ?? o.parameters;
          const argSummary =
            rawArgs && typeof rawArgs === "object"
              ? truncate(JSON.stringify(rawArgs), 200)
              : "";
          startTool(String(o.id ?? o.call_id ?? ""), name, argSummary);
          return;
        }

        case "result": {
          assistantRef.current = null;
          thinkingRef.current = null;
          const text =
            (typeof o.result === "string" ? o.result : "") ||
            (typeof o.text === "string" ? o.text : "") ||
            subtype ||
            "done";
          const dur =
            typeof o.duration_ms === "number"
              ? ` · ${Math.round((o.duration_ms as number) / 1000)}s`
              : "";
          pushEntry(
            subtype === "error" ? "err" : "result",
            `${subtype === "error" ? "✗" : "✓"} ${truncate(text, 400)}${dur}`,
          );
          return;
        }

        default:
          if (typeof o.text === "string" && o.text) {
            pushEntry("out", o.text);
          }
      }
    },
    [appendStreaming, replaceStreaming, startTool, annotateTool, pushEntry],
  );

  const handleData = useCallback(
    (data: string) => {
      const trimmed = data.trim();
      if (!trimmed) return;
      if (trimmed.startsWith("{")) {
        try {
          handleJson(JSON.parse(trimmed) as Record<string, unknown>);
          return;
        } catch {
          // not JSON — fall through to raw
        }
      }
      pushEntry("out", trimmed);
    },
    [handleJson, pushEntry],
  );

  const run = useCallback(
    async (job: JobInput) => {
      startTimeRef.current = performance.now();
      setElapsedMs(0);
      setPhase("running");
      const controller = new AbortController();
      abortRef.current = controller;
      pushEntry("info", `Starting Cursor agent for ${job.username}…`);

      try {
        const res = await fetch("/api/video-creation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(job),
          signal: controller.signal,
        });

        if (!res.body) {
          throw new Error(`No response stream (status ${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finished = false;

        while (!finished) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sep: number;
          while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            if (!block.trim()) continue;

            const { type, data } = parseEvent(block);
            if (type === "done") {
              finished = true;
              assistantRef.current = null;
              thinkingRef.current = null;
              try {
                const info = JSON.parse(data) as {
                  exitCode?: number;
                  workspace?: string;
                  error?: string;
                };
                const ok = (info.exitCode ?? 1) === 0 && !info.error;
                setPhase(ok ? "done" : "error");
                setSummary(
                  info.workspace ? `Workspace: ${info.workspace}` : null,
                );
                if (ok) {
                  const url = outputUrlFromWorkspace(info.workspace);
                  if (url) setVideoUrl(url);
                }
                pushEntry(
                  "done",
                  ok
                    ? `Finished (exit ${info.exitCode})`
                    : `Failed (exit ${info.exitCode ?? "?"})${info.error ? `: ${info.error}` : ""}`,
                );
              } catch {
                setPhase("done");
                pushEntry("done", data || "Done");
              }
              break;
            }
            if (type === "error") {
              assistantRef.current = null;
              thinkingRef.current = null;
              try {
                const parsed = JSON.parse(data) as { message?: string };
                pushEntry("err", parsed.message ?? data);
              } catch {
                pushEntry("err", data);
              }
              continue;
            }
            handleData(data);
          }
        }

        // If the stream ended without an explicit done event.
        setPhase((p) => (p === "running" ? "done" : p));
      } catch (err) {
        if (controller.signal.aborted) {
          pushEntry("info", "Stopped");
          setPhase("error");
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        pushEntry("err", message);
        setPhase("error");
      }
    },
    [handleData, pushEntry],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const job = readJob(searchParams);
    if (!job) {
      setPhase("error");
      pushEntry("err", "No prompt provided. Go back and enter a prompt.");
      return;
    }
    setPrompt(job.prompt);
    void run(job);
    // NOTE: no abort on cleanup here. React StrictMode (dev) mounts, unmounts,
    // then remounts; aborting in cleanup would cancel the only in-flight request
    // (the `startedRef` guard stops it from restarting). Cancellation is handled
    // explicitly via the Stop button instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Live elapsed-time counter: ticks every 100ms while running, then freezes
  // on the final elapsed value once the job completes, errors, or is stopped.
  useEffect(() => {
    if (phase !== "running") {
      if (startTimeRef.current != null) {
        setElapsedMs(performance.now() - startTimeRef.current);
      }
      return;
    }
    const tick = () => {
      if (startTimeRef.current != null) {
        setElapsedMs(performance.now() - startTimeRef.current);
      }
    };
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [phase]);

  function stop() {
    abortRef.current?.abort();
  }

  const statusBadge = {
    idle: <Badge variant="secondary">Preparing…</Badge>,
    running: (
      <Badge className="gap-1 bg-primary text-primary-foreground">
        <Loader2 className="size-3 animate-spin" aria-hidden />
        Running
      </Badge>
    ),
    done: (
      <Badge className="gap-1 bg-emerald-600 text-white">
        <CircleCheck className="size-3" aria-hidden />
        Completed
      </Badge>
    ),
    error: (
      <Badge variant="destructive" className="gap-1">
        <CircleX className="size-3" aria-hidden />
        Failed
      </Badge>
    ),
  }[phase];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Video creation
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-tight md:text-3xl">
            Cursor agent stream
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {statusBadge}
          <div
            data-testid="elapsed-timer"
            className="flex items-center gap-1.5 font-mono text-sm tabular-nums text-muted-foreground"
            title={
              phase === "running"
                ? "Time since video creation started"
                : "Total time taken"
            }
          >
            <Clock className="size-3.5" aria-hidden />
            <span className={phase === "running" ? "text-foreground" : undefined}>
              {formatElapsed(elapsedMs)}
            </span>
          </div>
        </div>
      </div>

      {prompt && (
        <div className="rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Prompt</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {prompt}
          </p>
        </div>
      )}

      {videoUrl && (
        <div className="space-y-3 rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Your reel</h2>
            <Button variant="outline" size="sm" render={<a href={videoUrl} download="output.mp4" />}>
              Download
            </Button>
          </div>
          <div className="flex justify-center">
            <video
              key={videoUrl}
              data-testid="output-video"
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="block aspect-[9/16] h-[70vh] max-h-[640px] w-auto rounded-lg bg-black object-contain shadow-lg"
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-zinc-950 shadow-sm">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
          <span className="size-3 rounded-full bg-red-500/80" />
          <span className="size-3 rounded-full bg-yellow-500/80" />
          <span className="size-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-zinc-400">
            /api/v1/video-creation · SSE
          </span>
        </div>
        <div
          ref={scrollRef}
          data-testid="sse-log"
          className="h-[440px] space-y-1.5 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
        >
          {lines.length === 0 ? (
            <p className="text-zinc-500">Waiting for output…</p>
          ) : (
            lines.map((l) => {
              const Icon = KIND_ICON[l.kind];
              return (
                <div
                  key={l.id}
                  className={`flex gap-2 ${KIND_STYLE[l.kind]}`}
                >
                  {Icon ? (
                    <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}
                  <span className="whitespace-pre-wrap break-words">
                    {l.text}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {summary && (
        <Alert>
          <AlertDescription className="font-mono text-xs">
            {summary}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {phase === "running" ? (
          <Button variant="destructive" onClick={stop}>
            <Square className="size-4" aria-hidden />
            Stop
          </Button>
        ) : (
          <Button onClick={() => router.push("/home")}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to home
          </Button>
        )}
        <Button variant="outline" render={<Link href="/home" />}>
          Home
        </Button>
      </div>
    </div>
  );
}
