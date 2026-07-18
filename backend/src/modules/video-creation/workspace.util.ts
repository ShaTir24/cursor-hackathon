import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Create the next numbered workspace under:
 *   <base>/video-workspaces/<username>/<n>/
 * where <n> is max(existing numeric folders) + 1, defaulting to 1.
 *
 * Base defaults to process.cwd() (typically the backend package when run via
 * npm scripts). Override with VIDEO_WORKSPACES_DIR for an absolute path to the
 * video-workspaces parent (or the video-workspaces folder itself).
 */
export function createNextWorkspace(username: string): string {
  const override = process.env.VIDEO_WORKSPACES_DIR?.trim();
  let workspacesRoot: string;
  if (override) {
    const abs = resolve(override);
    workspacesRoot = abs.endsWith('video-workspaces')
      ? abs
      : join(abs, 'video-workspaces');
  } else {
    // Prefer project root (parent of backend/) when cwd is backend/
    const cwd = process.cwd();
    const projectRoot = /[/\\]backend$/.test(cwd) ? resolve(cwd, '..') : cwd;
    workspacesRoot = join(projectRoot, 'video-workspaces');
  }

  const userDir = join(workspacesRoot, username);
  mkdirSync(userDir, { recursive: true });

  let max = 0;
  if (existsSync(userDir)) {
    for (const name of readdirSync(userDir, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      if (!/^\d+$/.test(name.name)) continue;
      const n = Number(name.name);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }

  const next = max + 1;
  const workspace = join(userDir, String(next));
  mkdirSync(workspace, { recursive: true });
  return workspace;
}
