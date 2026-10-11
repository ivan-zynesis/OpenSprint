/**
 * What git knows about an initiative.
 *
 * Kept out of `initiatives.ts` so that parsing a record never shells out:
 * reading the surrogate must work in a tarball, a test fixture, or anywhere
 * without a git binary. The state check takes this as an optional third
 * input and reports nothing extra when it is absent (DEC-024).
 */

import { execFileSync } from 'node:child_process';
import type { InitiativeGitState } from './initiatives.js';

/** Branch names follow `opsp/<initiative-id>` (DS-SURROGATE-GIT-CONTRACT). */
export function initiativeBranch(id: string): string {
  return `opsp/${id}`;
}

function git(projectRoot: string, args: string[]): string | null {
  try {
    return execFileSync('git', args, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    // No git, no repository, or the ref does not exist. All mean the same
    // thing here: git has nothing to say, so the check learns nothing.
    return null;
  }
}

/**
 * Resolves the trunk, preferring what the repository actually uses.
 *
 * Explicit candidates rather than parsing `origin/HEAD`, which is absent in
 * a fresh clone and misleading in a fork.
 */
function trunkOf(projectRoot: string): string | null {
  for (const candidate of ['main', 'master']) {
    if (git(projectRoot, ['rev-parse', '--verify', '--quiet', candidate]) !== null) {
      return candidate;
    }
  }
  return null;
}

/**
 * What git says about one initiative's branch.
 *
 * Returns undefined where git cannot answer — no repository, no trunk, no
 * binary — so that the caller can tell "not merged" from "unknowable".
 */
export function readInitiativeGitState(
  projectRoot: string,
  id: string
): InitiativeGitState | undefined {
  const branch = initiativeBranch(id);
  const trunk = trunkOf(projectRoot);
  if (trunk === null) return undefined;

  const exists = git(projectRoot, ['rev-parse', '--verify', '--quiet', branch]) !== null;
  if (!exists) return { branchExists: false, merged: false };

  // `--is-ancestor` exits non-zero when it is not, which git() turns into
  // null — so a null here means "not merged" rather than "unknowable",
  // because the branch is known to exist.
  const merged =
    git(projectRoot, ['merge-base', '--is-ancestor', branch, trunk]) !== null;

  return { branchExists: true, merged };
}
