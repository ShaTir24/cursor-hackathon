import { execFile, spawn, type ChildProcess } from "child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "util";
import type { AgentMode } from "@/lib/types";
import { getConfig } from "@/lib/session-store";

const execFileAsync = promisify(execFile);

/** Avoid passing the full Next.js / K8s parent env into `execve` — Linux returns E2BIG when argv+env exceeds limits. */
const MAX_AGENT_ENV_VALUE_LEN = 32 * 1024;

const BASE_AGENT_ENV_KEYS = [
  "PATH",
  "HOME",
  "USER",
  "LOGNAME",
  "SHELL",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "TZ",
  "TMPDIR",
  "TEMP",
  "TERM",
  "HOSTNAME",
  "NODE_EXTRA_CA_CERTS",
  "SSL_CERT_FILE",
  "REQUESTS_CA_BUNDLE",
  "CURL_CA_BUNDLE",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
  "ALL_PROXY",
  "http_proxy",
  "https_proxy",
  "no_proxy",
  "all_proxy",
  "CURSOR_AGENT_BIN",
  "CURSOR_TRUST",
  /** Python used by graphifyy host preflight + agent shell (`python -m graphify`). */
  "CLR_PYTHON",
] as const;

function isSafeAgentEnvValue(v: string | undefined): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= MAX_AGENT_ENV_VALUE_LEN;
}

/**
 * Curated env for the Cursor CLI child. Merges small `CURSOR_*` keys from the parent (except API key)
 * so installs can still honor e.g. `CURSOR_AGENT_BIN`, without copying huge injected config blobs.
 */
export function buildAgentChildEnv(
  overrides: Record<string, string | undefined>,
): NodeJS.ProcessEnv {
  const out: Record<string, string> = {};
  for (const k of BASE_AGENT_ENV_KEYS) {
    const v = process.env[k];
    if (isSafeAgentEnvValue(v)) out[k] = v;
  }
  for (const [k, v] of Object.entries(process.env)) {
    if (!k.startsWith("CURSOR_") || k === "CURSOR_API_KEY") continue;
    if (isSafeAgentEnvValue(v)) out[k] = v;
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) out[k] = v;
  }
  if (!isSafeAgentEnvValue(out.PATH)) {
    out.PATH = isSafeAgentEnvValue(process.env.PATH)
      ? process.env.PATH
      : "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";
  }
  if (!isSafeAgentEnvValue(out.HOME)) {
    out.HOME = homedir();
  }
  out.NODE_ENV = process.env.NODE_ENV ?? "production";
  return out as NodeJS.ProcessEnv;
}

/** Resolved `agent` binary path after first successful `--version` (avoids flaky PATH on cold start). */
let cachedAgentPath: string | null = null;

function candidateAgentPaths(): string[] {
  const fromEnv = process.env.CURSOR_AGENT_BIN?.trim();
  const list: string[] = [];
  if (fromEnv) list.push(fromEnv);
  list.push(join(homedir(), ".local", "bin", "agent"));
  list.push("/root/.local/bin/agent");
  return [...new Set(list.filter(Boolean))];
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Cursor's install can lazy-init the CLI; Docker cold start sometimes misses `agent` on PATH for the
 * first exec. Probe known locations (including `/root/.local/bin/agent`) plus PATH name `agent`,
 * with several rounds and backoff before failing.
 */
async function resolveVerifiedAgentPath(): Promise<string> {
  if (cachedAgentPath) return cachedAgentPath;

  const explicit = candidateAgentPaths().filter((p) => existsSync(p));
  const tryOrder = [...new Set([...explicit, "agent"])];

  const versionTimeoutMs = Number(process.env.CURSOR_AGENT_VERSION_TIMEOUT_MS ?? 120_000);
  const maxRounds = Math.max(
    3,
    Math.min(25, Number(process.env.CURSOR_AGENT_PROBE_ATTEMPTS ?? 12)),
  );

  for (let round = 0; round < maxRounds; round++) {
    for (const agentPath of tryOrder) {
      if (agentPath !== "agent" && !existsSync(agentPath)) continue;
      try {
        await execFileAsync(agentPath, ["--version"], {
          timeout: versionTimeoutMs,
          env: buildAgentChildEnv({}),
          windowsHide: true,
        });
        cachedAgentPath = agentPath;
        return agentPath;
      } catch {
        /* try next candidate / round */
      }
    }
    if (round < maxRounds - 1) {
      await sleep(250 + round * 350);
    }
  }

  throw new Error(
    "Could not find the 'agent' CLI after repeated probes. Install Cursor CLI or set CURSOR_AGENT_BIN " +
      "(e.g. /root/.local/bin/agent in Docker). See https://cursor.com/docs/cli/installation",
  );
}

export interface AgentSpawnDiagnostics {
  agentId: string;
  phase?: "launch" | "followup" | "chat";
}

export interface AgentOptions {
  prompt: string;
  sessionId?: string;
  workspace?: string;
  model?: string;
  mode?: AgentMode;
  env?: Record<string, string | undefined>;
  /** When set, logs spawn/exit/stall diagnostics under `[cloud-agent:cli]`. */
  diagnostics?: AgentSpawnDiagnostics;
}

function shouldLogCli(): boolean {
  return process.env.CLR_CLOUD_AGENT_LOG !== "0" && process.env.CLR_RUN_LOG !== "0";
}

function logCli(event: string, detail: Record<string, unknown>): void {
  if (!shouldLogCli()) return;
  console.warn(`[cloud-agent:cli] ${event}`, detail);
}

/** Redact `-p` prompt text; keep flags and paths for debugging. */
function describeSpawnArgv(args: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-p" && i + 1 < args.length) {
      out.push("-p", `<${args[i + 1].length} chars>`);
      i += 1;
      continue;
    }
    out.push(args[i]);
  }
  return out;
}

function cliStallWarnMs(): number {
  const n = Number(process.env.CURSOR_CLI_STALL_WARN_MS ?? 120_000);
  return Number.isFinite(n) && n > 0 ? n : 120_000;
}

function cliHeartbeatMs(): number {
  const n = Number(process.env.CURSOR_CLI_HEARTBEAT_MS ?? 60_000);
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}

/** Process-level diagnostics (stdout stall, exit, byte counts). Safe alongside stream consumers. */
export function attachAgentChildDiagnostics(
  child: ChildProcess,
  meta: AgentSpawnDiagnostics & {
    agentPath: string;
    modelRequested?: string;
    modelCliArg?: string;
    workspace?: string;
    sessionId?: string;
    mode?: AgentMode;
    promptChars: number;
  },
): void {
  const startedAt = Date.now();
  let stdoutBytes = 0;
  let stderrBytes = 0;
  let lastStdoutAt: number | null = null;
  let stderrTail = "";
  /** Log at most one stall warning per idle episode (reset when stdout resumes). */
  let stallWarnLogged = false;

  const onStdout = (chunk: Buffer | string): void => {
    const n = typeof chunk === "string" ? Buffer.byteLength(chunk) : chunk.length;
    stdoutBytes += n;
    lastStdoutAt = Date.now();
    stallWarnLogged = false;
  };
  const onStderr = (chunk: Buffer | string): void => {
    const text = typeof chunk === "string" ? chunk : chunk.toString();
    const n = Buffer.byteLength(text);
    stderrBytes += n;
    stderrTail = (stderrTail + text).slice(-4000);
  };

  child.stdout?.on("data", onStdout);
  child.stderr?.on("data", onStderr);

  const stallTimer = setInterval(() => {
    if (child.exitCode !== null || child.killed) return;
    const idleMs = lastStdoutAt === null ? Date.now() - startedAt : Date.now() - lastStdoutAt;
    if (idleMs >= cliStallWarnMs()) {
      if (stallWarnLogged) return;
      stallWarnLogged = true;
      logCli("process.stdout_stall", {
        agentId: meta.agentId,
        phase: meta.phase,
        pid: child.pid ?? null,
        elapsedMs: Date.now() - startedAt,
        idleMs,
        stdoutBytes,
        stderrBytes,
        hint:
          stdoutBytes > 0
            ? "CLI idle during a long tool run (install/build/edit) — normal; agent stays RUNNING until exit"
            : "CLI still alive but no stdout — check API key, workspace, and agent binary",
      });
    }
  }, cliStallWarnMs());

  const cliHeartbeatEnabled = process.env.CURSOR_CLI_HEARTBEAT === "1";
  const heartbeat = cliHeartbeatEnabled
    ? setInterval(() => {
        if (child.exitCode !== null || child.killed) return;
        logCli("process.heartbeat", {
          agentId: meta.agentId,
          phase: meta.phase,
          pid: child.pid ?? null,
          elapsedMs: Date.now() - startedAt,
          stdoutBytes,
          stderrBytes,
          msSinceLastStdout: lastStdoutAt !== null ? Date.now() - lastStdoutAt : null,
        });
      }, cliHeartbeatMs())
    : null;

  const cleanup = (): void => {
    clearInterval(stallTimer);
    if (heartbeat) clearInterval(heartbeat);
    child.stdout?.off("data", onStdout);
    child.stderr?.off("data", onStderr);
  };

  child.once("spawn", () => {
    logCli("process.spawned", {
      agentId: meta.agentId,
      phase: meta.phase,
      pid: child.pid ?? null,
      agentPath: meta.agentPath,
    });
  });

  child.once("error", (err) => {
    cleanup();
    logCli("process.error", {
      agentId: meta.agentId,
      phase: meta.phase,
      pid: child.pid ?? null,
      elapsedMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
      stdoutBytes,
      stderrBytes,
    });
  });

  child.once("close", (code, signal) => {
    cleanup();
    logCli("process.close", {
      agentId: meta.agentId,
      phase: meta.phase,
      pid: child.pid ?? null,
      exitCode: code,
      signal: signal ?? null,
      elapsedMs: Date.now() - startedAt,
      stdoutBytes,
      stderrBytes,
      msSinceLastStdout: lastStdoutAt !== null ? Date.now() - lastStdoutAt : null,
      ...(stderrTail.trim() ? { stderrTail: stderrTail.trim().slice(-800) } : {}),
      ...(code !== 0
        ? { hint: "Non-zero exit — launcher may leave agent RUNNING until error handler runs" }
        : {}),
      ...(stdoutBytes === 0
        ? {
            hint: "No stdout — stream-json never arrived; check API key, workspace, and agent binary",
          }
        : {}),
    });
  });
}

/** Map auto/default sentinels to the CLI model key `Auto`; pass explicit models through unchanged. */
export function resolveCliModelArg(model: string | undefined): string | undefined {
  const m = (model || "").trim();
  if (!m || /^default$/i.test(m) || /^auto$/i.test(m)) return "Auto";
  return m;
}

/** Cursor CLI `--mode` accepts `ask` | `plan`. Launchpad `agent` omits the flag (CLI default execution). */
export function resolveCliModeArg(
  mode: AgentMode | string | undefined,
): "ask" | "plan" | undefined {
  if (!mode) return undefined;
  const normalized = String(mode).trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "ask") return "ask";
  if (normalized === "plan") return "plan";
  // Launchpad "agent" is a product mode (run + publish), not CLI plan — omit --mode.
  if (normalized === "agent") return undefined;
  return undefined;
}

async function shouldTrust(): Promise<boolean> {
  if (process.env.CURSOR_TRUST === "0") return false;
  if (process.env.CURSOR_TRUST === "1") return true;
  const val = await getConfig("trust");
  return val !== "0";
}

export async function spawnAgent(options: AgentOptions): Promise<ChildProcess> {
  const agentPath = await resolveVerifiedAgentPath();
  const args = [
    "-f",
    "-p",
    options.prompt,
    "--output-format",
    "stream-json",
    "--stream-partial-output",
    "--approve-mcps",
  ];

  const trust = await shouldTrust();
  if (trust) {
    args.push("--trust");
  }
  if (options.sessionId) {
    args.push("--resume", options.sessionId);
  }
  if (options.workspace) {
    args.push("--workspace", options.workspace);
  }
  const cliModel = resolveCliModelArg(options.model);
  if (cliModel) {
    args.push("--model", cliModel);
  }
  const cliMode = resolveCliModeArg(options.mode);
  if (cliMode) {
    args.push("--mode", cliMode);
  }

  const spawnMeta = {
    agentPath,
    modelRequested: options.model,
    modelCliArg: cliModel,
    workspace: options.workspace,
    sessionId: options.sessionId,
    modeRequested: options.mode,
    modeCliArg: cliMode,
    promptChars: options.prompt.length,
    trust,
    argv: describeSpawnArgv(args),
  };

  logCli("spawn.start", {
    ...(options.diagnostics ?? {}),
    ...spawnMeta,
  });

  const child = spawn(agentPath, args, {
    stdio: ["pipe", "pipe", "pipe"],
    env: buildAgentChildEnv(options.env ?? {}),
  });

  if (options.diagnostics) {
    attachAgentChildDiagnostics(child, {
      ...options.diagnostics,
      agentPath,
      modelRequested: options.model,
      modelCliArg: cliModel,
      workspace: options.workspace,
      sessionId: options.sessionId,
      mode: options.mode,
      promptChars: options.prompt.length,
    });
  }

  // Prompt is passed via `-p`; close stdin so the CLI does not block waiting for EOF.
  if (child.stdin) {
    child.stdin.end();
    logCli("spawn.stdin_closed", {
      ...(options.diagnostics ?? {}),
      pid: child.pid ?? null,
    });
  }

  return child;
}
