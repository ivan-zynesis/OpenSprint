/**
 * What git knows about an initiative.
 *
 * Kept out of `initiatives.ts` so that parsing a record never shells out:
 * reading the surrogate must work in a tarball, a test fixture, or anywhere
 * without a git binary. The state check takes this as an optional third
 * input and reports nothing extra when it is absent (DEC-024).
 */

import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import { parseInitiative, type InitiativeEntry, type InitiativeGitState } from './initiatives.js';

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

/** The configured `user.name`, which is who `opensprint claim` names by default. */
export function gitUserName(projectRoot: string): string | undefined {
  const name = git(projectRoot, ['config', 'user.name']);
  return name === null || name.length === 0 ? undefined : name;
}

/** An initiative read from a branch rather than from the checkout. */
export interface BranchInitiative {
  entry: InitiativeEntry;
  /** The branch it was read from, as a person would type it: `opsp/x`, `origin/opsp/x`. */
  branch: string;
  /** The full ref, for comparing two copies of the same card. */
  ref: string;
}

/** Where initiatives live inside a tree. Git paths always use `/`. */
const INITIATIVES_TREE_DIR = path.posix.join('opensprint', 'initiatives');

/**
 * The `opsp/<id>` branches git knows, local first, then remote-tracking.
 *
 * Explicit shapes rather than a pattern over every ref: `refs/heads/opsp/<id>`
 * and `refs/remotes/<remote>/opsp/<id>`, one segment of id each, which is the
 * naming `initiativeBranch` writes (DS-SURROGATE-GIT-CONTRACT).
 */
function opspRefs(projectRoot: string): Array<{ ref: string; branch: string; id: string }> {
  const out = git(projectRoot, ['for-each-ref', '--format=%(refname)', 'refs/heads/opsp', 'refs/remotes']);
  if (out === null || out.length === 0) return [];

  const refs: Array<{ ref: string; branch: string; id: string }> = [];
  for (const ref of out.split('\n')) {
    const parts = ref.split('/');
    if (parts.length === 4 && parts[0] === 'refs' && parts[1] === 'heads' && parts[2] === 'opsp') {
      refs.push({ ref, branch: `opsp/${parts[3]}`, id: parts[3] });
    } else if (parts.length === 5 && parts[1] === 'remotes' && parts[3] === 'opsp') {
      refs.push({ ref, branch: `${parts[2]}/opsp/${parts[4]}`, id: parts[4] });
    }
  }
  return refs;
}

/**
 * Reads blobs in one call. `git cat-file --batch` answers each `<ref>:<path>`
 * with a header and exactly that many bytes, so the output is cut by byte
 * count — a UTF-8 initiative would split wrongly if cut by characters.
 */
function readBlobs(projectRoot: string, specs: readonly string[]): Array<string | null> {
  if (specs.length === 0) return [];
  let raw: Buffer;
  try {
    raw = execFileSync('git', ['cat-file', '--batch'], {
      cwd: projectRoot,
      input: `${specs.join('\n')}\n`,
      stdio: ['pipe', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return specs.map(() => null);
  }

  const blobs: Array<string | null> = [];
  let offset = 0;
  for (let i = 0; i < specs.length; i += 1) {
    const newline = raw.indexOf(0x0a, offset);
    if (newline === -1) break;
    const header = raw.subarray(offset, newline).toString('utf-8');
    offset = newline + 1;
    const match = header.match(/^\S+ (\S+) (\d+)$/);
    if (match === null) {
      blobs.push(null); // `<spec> missing`
      continue;
    }
    const size = Number(match[2]);
    blobs.push(match[1] === 'blob' ? raw.subarray(offset, offset + size).toString('utf-8') : null);
    offset += size + 1;
  }
  while (blobs.length < specs.length) blobs.push(null);
  return blobs;
}

/**
 * The initiative each `opsp/<id>` branch carries, read without checking it out.
 *
 * A branch owns one card: the initiative whose `id` is the branch's own. Other
 * initiative files on that branch are whatever it inherited from the trunk,
 * and reading them would let a stale copy speak for work happening elsewhere.
 *
 * Committed work only. Uncommitted files in another worktree, and branches
 * never pushed from another machine, are invisible — git has no record of
 * them. Returns nothing where git cannot answer, as `readInitiativeGitState`
 * does.
 */
export function readBranchInitiatives(projectRoot: string): BranchInitiative[] {
  const found: BranchInitiative[] = [];
  for (const { ref, branch, id } of opspRefs(projectRoot)) {
    const listing = git(projectRoot, ['ls-tree', '--name-only', `${ref}:${INITIATIVES_TREE_DIR}`]);
    if (listing === null || listing.length === 0) continue;

    const files = listing.split('\n').filter((file) => file.endsWith('.md')).sort();
    const blobs = readBlobs(
      projectRoot,
      files.map((file) => `${ref}:${path.posix.join(INITIATIVES_TREE_DIR, file)}`)
    );
    for (let i = 0; i < files.length; i += 1) {
      const content = blobs[i];
      if (content === null) continue;
      const entry = parseInitiative(
        content,
        `${branch}:${path.posix.join(INITIATIVES_TREE_DIR, files[i])}`,
        files[i].slice(0, -'.md'.length)
      );
      if (entry !== null && entry.id === id) {
        found.push({ entry, branch, ref });
        break;
      }
    }
  }
  return found;
}

/** True where `a` is an ancestor of `b` and not the same commit: `b` has everything `a` has, and more. */
function strictlyBehind(projectRoot: string, a: string, b: string): boolean {
  const left = git(projectRoot, ['rev-parse', '--verify', '--quiet', a]);
  const right = git(projectRoot, ['rev-parse', '--verify', '--quiet', b]);
  if (left === null || right === null || left === right) return false;
  return git(projectRoot, ['merge-base', '--is-ancestor', a, b]) !== null;
}

/**
 * Which copy of one card to show, when several branches carry it.
 *
 * `copies` arrive local first, then remote-tracking in name order. The first
 * is kept unless a later copy is strictly ahead of it: someone pushed a newer
 * card — a claim, a state move — that this machine fetched and has not merged.
 * Showing the stale local copy there would tell the reader nobody holds a card
 * somebody has just claimed. Copies that diverged keep the first, since
 * neither contains the other and the local one is the reader's own work.
 */
export function freshestCopy(
  projectRoot: string,
  copies: readonly BranchInitiative[]
): BranchInitiative {
  let chosen = copies[0];
  for (const other of copies.slice(1)) {
    if (strictlyBehind(projectRoot, chosen.ref, other.ref)) chosen = other;
  }
  return chosen;
}
