/**
 * What a branch changes, against what.
 *
 * `/opsp:attest` reviews a change, and a change is a range: this branch
 * against the one it will merge into. Nothing established that range, so the
 * attester had to be told what it was reviewing — which is the one thing the
 * operator should never have to spell out, because git already knows.
 *
 * Kept out of `initiative-git.ts` because the two answer different
 * questions. That module asks whether one initiative's branch has merged;
 * this one asks what the working branch contains. Both shell out, and
 * neither is reached by reading a record.
 *
 * **Scope, not rationale.** This reports commit *subjects* and a file-level
 * stat. It never reads a patch, and never reads a commit message body. That
 * line is `DEC-ATTEST-CHANGE-FRAME`: the shape and extent of a change tell an
 * attester what is under review, while the patch and the message body argue
 * for it — and `DEC-040` keeps the argument out of the attester's context.
 */

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseFrontmatter } from './decision-map.js';
import { OPENSPRINT_DIR_NAME } from './config.js';

/**
 * Branches a change is merged into, in preference order.
 *
 * An explicit list rather than a pattern, and tried only after the remote's
 * own default. `develop` and `trunk` are here because a team that uses one
 * of them uses it for everything, and guessing `main` at such a team would
 * frame every review against a branch nobody merges to.
 */
export const BASE_BRANCH_CANDIDATES = ['main', 'master', 'develop', 'trunk'] as const;

/** How the base was arrived at, so a wrong guess is visible rather than silent. */
export const BASE_ORIGINS = ['explicit', 'remote-head', 'candidate'] as const;

export type BaseOrigin = (typeof BASE_ORIGINS)[number];

export interface FrameCommit {
  sha: string;
  /** The subject line only. The body is rationale and is never read. */
  subject: string;
}

export interface FrameFile {
  path: string;
  added: number;
  removed: number;
}

export interface ChangeFrame {
  /** The current branch, or null in a detached HEAD. */
  source: string | null;
  head: string;
  base: string;
  baseFrom: BaseOrigin;
  /** Where the branch left the base. */
  mergeBase: string;
  /** Oldest first, so the range reads in the order it happened. */
  commits: FrameCommit[];
  files: FrameFile[];
  /** Initiative ids whose records this range touches. */
  initiatives: string[];
  /** Change names archived in this range. */
  archivedChanges: string[];
}

function git(projectRoot: string, args: string[]): string | null {
  try {
    return execFileSync('git', args, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024,
    }).trim();
  } catch {
    return null;
  }
}

function verify(projectRoot: string, ref: string): boolean {
  return git(projectRoot, ['rev-parse', '--verify', '--quiet', ref]) !== null;
}

/**
 * The branch this change is merged into.
 *
 * The remote's own default comes first, because that is what a pull request
 * will actually target. `initiative-git.ts` deliberately does not read it —
 * it is absent in a fresh clone and misleading in a fork — and both of those
 * objections are answered here by reporting *how* the base was chosen, so
 * the operator sees a fork's wrong answer and corrects it.
 */
export function resolveBase(
  projectRoot: string,
  explicit?: string
): { base: string; baseFrom: BaseOrigin } | null {
  if (explicit !== undefined && explicit.length > 0) {
    return verify(projectRoot, explicit) ? { base: explicit, baseFrom: 'explicit' } : null;
  }

  const remoteHead = git(projectRoot, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  if (remoteHead !== null && verify(projectRoot, remoteHead)) {
    return { base: remoteHead, baseFrom: 'remote-head' };
  }

  for (const candidate of BASE_BRANCH_CANDIDATES) {
    if (verify(projectRoot, candidate)) return { base: candidate, baseFrom: 'candidate' };
  }
  return null;
}

/** `12\t3\tsrc/a.ts` — a binary file reports `-` for both counts. */
function parseNumstat(raw: string): FrameFile[] {
  const files: FrameFile[] = [];
  for (const line of raw.split('\n')) {
    if (line.trim().length === 0) continue;
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    const [added, removed, ...rest] = parts;
    files.push({
      path: rest.join('\t'),
      added: added === '-' ? 0 : Number.parseInt(added, 10) || 0,
      removed: removed === '-' ? 0 : Number.parseInt(removed, 10) || 0,
    });
  }
  return files;
}

/** `<sha> <subject>` — `%s` is the subject alone, never the body. */
function parseCommits(raw: string): FrameCommit[] {
  const commits: FrameCommit[] = [];
  for (const line of raw.split('\n')) {
    if (line.trim().length === 0) continue;
    const space = line.indexOf(' ');
    if (space === -1) continue;
    commits.push({ sha: line.slice(0, space), subject: line.slice(space + 1) });
  }
  return commits;
}

/**
 * The initiative ids whose records this range touches.
 *
 * Read from each touched file's frontmatter rather than from its filename:
 * `DEC-036` prefixes initiative filenames with a date, so the stem is not the
 * id. A file deleted in the range is skipped — it cannot be read, and an
 * initiative that no longer exists is not one being attested.
 */
function touchedInitiatives(projectRoot: string, files: readonly FrameFile[]): string[] {
  const dir = `${OPENSPRINT_DIR_NAME}/initiatives/`;
  const ids = new Set<string>();
  for (const file of files) {
    if (!file.path.startsWith(dir) || !file.path.endsWith('.md')) continue;
    const abs = path.join(projectRoot, file.path);
    if (!fs.existsSync(abs)) continue;
    const id = parseFrontmatter(fs.readFileSync(abs, 'utf-8'))?.id;
    if (typeof id === 'string') ids.add(id);
  }
  return [...ids].sort();
}

/** Change names archived in this range, by the directory they landed in. */
function archivedChanges(files: readonly FrameFile[]): string[] {
  const names = new Set<string>();
  for (const file of files) {
    const parts = file.path.split('/');
    const at = parts.indexOf('archive');
    if (at === -1 || parts[at - 1] !== 'changes' || parts.length <= at + 1) continue;
    names.add(parts[at + 1]);
  }
  return [...names].sort();
}

/**
 * What the current branch changes, against the branch it merges into.
 *
 * Returns undefined where git cannot answer — no binary, no repository, no
 * base branch, or a branch with no common ancestor. The caller can then say
 * so rather than present a frame it invented, which is the same reasoning
 * `readInitiativeGitState` uses for its own undefined.
 */
export function resolveChangeFrame(
  projectRoot: string,
  explicitBase?: string
): ChangeFrame | undefined {
  const head = git(projectRoot, ['rev-parse', '--short', 'HEAD']);
  if (head === null) return undefined;

  const resolved = resolveBase(projectRoot, explicitBase);
  if (resolved === null) return undefined;

  const mergeBase = git(projectRoot, ['merge-base', resolved.base, 'HEAD']);
  if (mergeBase === null) return undefined;

  const range = `${mergeBase}..HEAD`;
  const rawCommits = git(projectRoot, ['log', '--reverse', '--format=%h %s', range]) ?? '';
  const rawFiles = git(projectRoot, ['diff', '--numstat', `${mergeBase}...HEAD`]) ?? '';
  const files = parseNumstat(rawFiles);

  // Null on a detached HEAD: git prints `HEAD`, which is not a branch name.
  const branch = git(projectRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const source = branch === null || branch === 'HEAD' ? null : branch;

  return {
    source,
    head,
    base: resolved.base,
    baseFrom: resolved.baseFrom,
    mergeBase: git(projectRoot, ['rev-parse', '--short', mergeBase]) ?? mergeBase,
    commits: parseCommits(rawCommits),
    files,
    initiatives: touchedInitiatives(projectRoot, files),
    archivedChanges: archivedChanges(files),
  };
}
