import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  type Dirent,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** Walk up from `start` looking for a directory that contains `.cursor/skills`. */
function findProjectRootWithSkills(start: string): string | null {
  let dir = resolve(start);
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, '.cursor', 'skills'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** Resolve the base project root (parent of backend/ when run via npm scripts). */
function resolveProjectRoot(): string {
  const cwd = process.cwd();
  return /[/\\]backend$/.test(cwd) ? resolve(cwd, '..') : cwd;
}

/**
 * Absolute path to the `.cursor/skills` source to seed each workspace with.
 * Override with SKILLS_SOURCE_DIR (path to a `.cursor/skills` folder or its parent).
 */
function resolveSkillsSource(): string | null {
  const override = process.env.SKILLS_SOURCE_DIR?.trim();
  if (override) {
    const abs = resolve(override);
    if (abs.endsWith(join('.cursor', 'skills'))) {
      return existsSync(abs) ? abs : null;
    }
    const candidate = join(abs, '.cursor', 'skills');
    return existsSync(candidate) ? candidate : null;
  }
  const root = findProjectRootWithSkills(process.cwd()) ?? resolveProjectRoot();
  const candidate = join(root, '.cursor', 'skills');
  return existsSync(candidate) ? candidate : null;
}

/**
 * Create the next numbered workspace under:
 *   <base>/video-workspaces/<username>/<n>/
 * where <n> is max(existing numeric folders) + 1, defaulting to 1.
 *
 * By default the project's `.cursor/skills` is copied into the new workspace
 * (at `<workspace>/.cursor/skills`) so the spawned agent has the MentorScroll
 * skills available. Disable with VIDEO_CREATION_COPY_SKILLS=0.
 *
 * Base defaults to the project root (parent of backend/ when run via npm
 * scripts). Override with VIDEO_WORKSPACES_DIR for an absolute path to the
 * video-workspaces parent (or the video-workspaces folder itself).
 */
/** Absolute path to the `video-workspaces` parent (honors VIDEO_WORKSPACES_DIR). */
export function resolveWorkspacesRoot(): string {
  const override = process.env.VIDEO_WORKSPACES_DIR?.trim();
  if (override) {
    const abs = resolve(override);
    return abs.endsWith('video-workspaces') ? abs : join(abs, 'video-workspaces');
  }
  return join(resolveProjectRoot(), 'video-workspaces');
}

export function createNextWorkspace(username: string): string {
  const workspacesRoot = resolveWorkspacesRoot();
  const userDir = join(workspacesRoot, username);
  mkdirSync(userDir, { recursive: true });

  let max = 0;
  for (const entry of readdirSync(userDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!/^\d+$/.test(entry.name)) continue;
    const n = Number(entry.name);
    if (Number.isFinite(n) && n > max) max = n;
  }

  const next = max + 1;
  const workspace = join(userDir, String(next));
  mkdirSync(workspace, { recursive: true });

  if (process.env.VIDEO_CREATION_COPY_SKILLS !== '0') {
    const skillsSource = resolveSkillsSource();
    if (skillsSource) {
      const skillsDest = join(workspace, '.cursor', 'skills');
      mkdirSync(dirname(skillsDest), { recursive: true });
      cpSync(skillsSource, skillsDest, { recursive: true });
    }
  }

  return workspace;
}

const USERNAME_RE = /^[a-zA-Z0-9_-]+$/;
const INDEX_RE = /^\d+$/;

/** Find the newest `*.mp4` under `dir` (shallow-recursive, skips heavy dirs). */
function findNewestMp4(dir: string, depth = 3): string | null {
  let newest: { path: string; mtime: number } | null = null;
  const walk = (current: string, level: number): void => {
    let entries: Dirent[];
    try {
      entries = readdirSync(current, {
        withFileTypes: true,
        encoding: 'utf8',
      });
    } catch {
      return;
    }
    for (const entry of entries) {
      const name = entry.name;
      const full = join(current, name);
      if (entry.isDirectory()) {
        if (level <= 0) continue;
        if (['node_modules', '.git', 'frames', '.cursor'].includes(name))
          continue;
        if (/^frames_/.test(name)) continue;
        walk(full, level - 1);
      } else if (entry.isFile() && name.toLowerCase().endsWith('.mp4')) {
        const mtime = statSync(full).mtimeMs;
        if (!newest || mtime > newest.mtime) newest = { path: full, mtime };
      }
    }
  };
  walk(dir, depth);
  return newest ? (newest as { path: string }).path : null;
}

/**
 * Resolve the deliverable video for `<username>/<index>`.
 * Prefers the canonical `output.mp4` at the workspace root; falls back to the
 * newest `*.mp4` produced anywhere inside the workspace.
 * Returns `null` when the username/index are invalid or nothing is found.
 */
export function resolveWorkspaceOutput(
  username: string,
  index: string,
): string | null {
  if (!USERNAME_RE.test(username) || !INDEX_RE.test(index)) return null;

  const root = resolveWorkspacesRoot();
  const workspace = resolve(join(root, username, index));
  const rootWithSep = root.endsWith('/') ? root : `${root}/`;
  if (!workspace.startsWith(rootWithSep)) return null; // path traversal guard
  if (!existsSync(workspace)) return null;

  const canonical = join(workspace, 'output.mp4');
  if (existsSync(canonical) && statSync(canonical).isFile()) return canonical;

  return findNewestMp4(workspace);
}

export type WorkspaceVideoMeta = {
  index: string;
  mtimeMs: number;
  size: number;
};

/**
 * List numbered workspaces under `<username>` that have a playable MP4,
 * newest first. Returns [] when the username is invalid or the user folder
 * does not exist.
 */
export function listUserWorkspaceVideos(username: string): WorkspaceVideoMeta[] {
  if (!USERNAME_RE.test(username)) return [];

  const root = resolveWorkspacesRoot();
  const userDir = resolve(join(root, username));
  const rootWithSep = root.endsWith('/') ? root : `${root}/`;
  if (!userDir.startsWith(rootWithSep)) return [];
  if (!existsSync(userDir) || !statSync(userDir).isDirectory()) return [];

  const out: WorkspaceVideoMeta[] = [];
  for (const entry of readdirSync(userDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !INDEX_RE.test(entry.name)) continue;
    const file = resolveWorkspaceOutput(username, entry.name);
    if (!file) continue;
    try {
      const st = statSync(file);
      out.push({
        index: entry.name,
        mtimeMs: st.mtimeMs,
        size: st.size,
      });
    } catch {
      // skip unreadable entries
    }
  }

  out.sort((a, b) => b.mtimeMs - a.mtimeMs || Number(b.index) - Number(a.index));
  return out;
}
