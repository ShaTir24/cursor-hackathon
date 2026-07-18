import { execFile, spawn, type ChildProcess } from 'child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/** Avoid passing the full Nest / Docker parent env into `execve` — Linux returns E2BIG when argv+env exceeds limits. */
const MAX_AGENT_ENV_VALUE_LEN = 32 * 1024;

const BASE_AGENT_ENV_KEYS = [
  'PATH',
  'HOME',
  'USER',
  'LOGNAME',
  'SHELL',
  'LANG',
  'LC_ALL',
  'LC_CTYPE',
  'TZ',
  'TMPDIR',
  'TEMP',
  'TERM',
  'HOSTNAME',
  'NODE_EXTRA_CA_CERTS',
  'SSL_CERT_FILE',
  'REQUESTS_CA_BUNDLE',
  'CURL_CA_BUNDLE',
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
  'ALL_PROXY',
  'http_proxy',
  'https_proxy',
  'no_proxy',
  'all_proxy',
  'CURSOR_AGENT_BIN',
  'CURSOR_TRUST',
] as const;

function isSafeAgentEnvValue(v: string | undefined): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= MAX_AGENT_ENV_VALUE_LEN;
}

/**
 * Curated env for the Cursor CLI child. Merges small `CURSOR_*` keys from the parent
 * (except when overridden) so installs can still honor e.g. `CURSOR_AGENT_BIN`.
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
    if (!k.startsWith('CURSOR_') || k === 'CURSOR_API_KEY') continue;
    if (isSafeAgentEnvValue(v)) out[k] = v;
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) out[k] = v;
  }
  if (!isSafeAgentEnvValue(out.PATH)) {
    out.PATH = isSafeAgentEnvValue(process.env.PATH)
      ? process.env.PATH
      : '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
  }
  if (!isSafeAgentEnvValue(out.HOME)) {
    out.HOME = homedir();
  }
  out.NODE_ENV = process.env.NODE_ENV ?? 'production';
  return out as NodeJS.ProcessEnv;
}

/** Resolved `agent` binary path after first successful `--version`. */
let cachedAgentPath: string | null = null;

function candidateAgentPaths(): string[] {
  const fromEnv = process.env.CURSOR_AGENT_BIN?.trim();
  const list: string[] = [];
  if (fromEnv) list.push(fromEnv);
  list.push(join(homedir(), '.local', 'bin', 'agent'));
  list.push('/root/.local/bin/agent');
  return [...new Set(list.filter(Boolean))];
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Probe known locations plus PATH name `agent`, with several rounds and backoff
 * before failing (Docker cold start can miss `agent` on PATH briefly).
 */
async function resolveVerifiedAgentPath(): Promise<string> {
  if (cachedAgentPath) return cachedAgentPath;

  const explicit = candidateAgentPaths().filter((p) => existsSync(p));
  const tryOrder = [...new Set([...explicit, 'agent'])];

  const versionTimeoutMs = Number(process.env.CURSOR_AGENT_VERSION_TIMEOUT_MS ?? 120_000);
  const maxRounds = Math.max(
    3,
    Math.min(25, Number(process.env.CURSOR_AGENT_PROBE_ATTEMPTS ?? 12)),
  );

  for (let round = 0; round < maxRounds; round++) {
    for (const agentPath of tryOrder) {
      if (agentPath !== 'agent' && !existsSync(agentPath)) continue;
      try {
        await execFileAsync(agentPath, ['--version'], {
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
      '(e.g. /root/.local/bin/agent in Docker). See https://cursor.com/docs/cli/installation',
  );
}

function shouldTrust(): boolean {
  if (process.env.CURSOR_TRUST === '0') return false;
  return true;
}

export interface SpawnAgentOptions {
  prompt: string;
  workspace: string;
  apiKey: string;
  model?: string;
  env?: Record<string, string | undefined>;
}

/** Map auto/default sentinels to the CLI model key `Auto`; pass explicit models through unchanged. */
export function resolveCliModelArg(model: string | undefined): string | undefined {
  const m = (model || '').trim();
  if (!m || /^default$/i.test(m) || /^auto$/i.test(m)) return 'Auto';
  return m;
}

export async function spawnAgent(options: SpawnAgentOptions): Promise<ChildProcess> {
  const agentPath = await resolveVerifiedAgentPath();
  const args = [
    '-f',
    '-p',
    options.prompt,
    '--output-format',
    'stream-json',
    '--stream-partial-output',
    '--approve-mcps',
  ];

  if (shouldTrust()) {
    args.push('--trust');
  }
  if (options.workspace) {
    args.push('--workspace', options.workspace);
  }
  const cliModel = resolveCliModelArg(options.model);
  if (cliModel) {
    args.push('--model', cliModel);
  }

  const child = spawn(agentPath, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: buildAgentChildEnv({
      CURSOR_API_KEY: options.apiKey,
      // Secrets the MentorScroll skills expect at agent runtime (TTS + web research + Mixamo).
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      EXA_API_KEY: process.env.EXA_API_KEY,
      MIXAMO_ACCESS_TOKEN: process.env.MIXAMO_ACCESS_TOKEN,
      ...(options.env ?? {}),
    }),
  });

  // Prompt is passed via `-p`; close stdin so the CLI does not block waiting for EOF.
  if (child.stdin) {
    child.stdin.end();
  }

  return child;
}
