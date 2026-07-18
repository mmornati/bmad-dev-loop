// install.js — programmatic entrypoint for `npm install` or programmatic use.
// Thin wrapper that re-exports the bin script's install command logic.

import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL_SRC = join(PKG_DIR, 'skills', 'bmad-dev-loop');

export function installSkill({ target, scope = 'project' } = {}) {
  if (!existsSync(SKILL_SRC)) {
    throw new Error(`source skill not found at ${SKILL_SRC}`);
  }
  let base;
  if (target) {
    base = resolve(process.cwd(), target);
  } else if (scope === 'global') {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (!home) throw new Error('cannot determine HOME; pass target');
    base = join(home, '.config', 'opencode', 'skills');
  } else {
    base = resolve(process.cwd(), '.opencode', 'skills');
  }
  const dest = join(base, 'bmad-dev-loop');
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(SKILL_SRC, dest, { recursive: true });
  return dest;
}
