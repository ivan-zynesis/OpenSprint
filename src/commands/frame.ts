/**
 * `opensprint frame` — what this branch changes, and against what.
 *
 * The orientation step `/opsp:attest` was missing. An attester landing in a
 * worktree knew neither what range it was reviewing nor which initiatives
 * were in it, so the operator had to say — and an operator spelling out what
 * git already knows is how a review starts from the wrong premise.
 *
 * Prints scope only: commit subjects and a file-level stat. Never a patch
 * (DEC-ATTEST-CHANGE-FRAME).
 */

import chalk from 'chalk';
import { resolveChangeFrame, BASE_BRANCH_CANDIDATES } from '../core/change-frame.js';

export interface FrameOptions {
  json?: boolean;
  base?: string;
}

/** Why this base, in words, so a wrong guess is arguable rather than silent. */
const BASE_EXPLANATION: Readonly<Record<string, string>> = {
  explicit: 'given on the command line',
  'remote-head': "the remote's default branch — what a pull request would target",
  candidate: 'no remote default; first branch found from the known candidates',
};

export async function frameCommand(options: FrameOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const frame = resolveChangeFrame(projectRoot, options.base);

  if (frame === undefined) {
    if (options.json) {
      console.log(JSON.stringify({ frame: null }, null, 2));
      return;
    }
    throw new Error(
      'Could not resolve a change frame. There must be a git repository, a HEAD, ' +
        `and a base branch — one of ${BASE_BRANCH_CANDIDATES.join(', ')}, the remote's ` +
        'default, or one given with --base.'
    );
  }

  if (options.json) {
    console.log(JSON.stringify({ frame }, null, 2));
    return;
  }

  const added = frame.files.reduce((n, f) => n + f.added, 0);
  const removed = frame.files.reduce((n, f) => n + f.removed, 0);

  console.log();
  console.log(chalk.bold('  ' + (frame.source ?? `(detached at ${frame.head})`)));
  console.log(chalk.dim(`  → ${frame.base}  (${BASE_EXPLANATION[frame.baseFrom] ?? frame.baseFrom})`));
  console.log(chalk.dim(`  forked at ${frame.mergeBase}`));
  console.log();

  if (frame.commits.length === 0) {
    console.log(chalk.yellow('  No commits in this range — nothing to review.\n'));
    return;
  }

  console.log(
    `  ${frame.commits.length} commit(s), ${frame.files.length} file(s), ` +
      chalk.green(`+${added}`) + ' ' + chalk.red(`-${removed}`)
  );
  console.log();

  if (frame.initiatives.length > 0) {
    console.log(chalk.bold('  Initiatives touched'));
    for (const id of frame.initiatives) console.log(`    ${id}`);
    console.log();
  }

  if (frame.archivedChanges.length > 0) {
    console.log(chalk.bold(`  Changes archived (${frame.archivedChanges.length})`));
    for (const name of frame.archivedChanges) console.log(`    ${name}`);
    console.log();
  }

  console.log(chalk.bold('  Commits'));
  for (const commit of frame.commits) {
    console.log(`    ${chalk.dim(commit.sha)}  ${commit.subject}`);
  }
  console.log();
  console.log(
    chalk.dim('  Subjects and a file stat only — never a patch, never a message body.')
  );
  console.log();
}
