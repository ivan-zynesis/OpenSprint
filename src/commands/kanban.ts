/**
 * `opensprint kanban` — the live board on its own remote branch.
 *
 * `init` creates the board and seeds it in one commit, so onboarding is one
 * step. `seed` adds what the board lacks and reports what disagrees with its
 * initiative; `--resync` rewrites those cards, which is how a card written
 * wrong is corrected without anyone editing the branch by hand
 * (DEC-CARD-WRITES-THROUGH-CLI).
 *
 * Reads for people are git playbooks in a skill, not commands here
 * (DEC-BOARD-READ-BY-GIT).
 */

import * as path from 'node:path';
import chalk from 'chalk';
import { OPENSPRINT_DIR_NAME } from '../core/config.js';
import { collectAllBranches, CHECKOUT_SOURCE } from '../core/board.js';
import { gitUserName } from '../core/initiative-git.js';
import {
  DEFAULT_KANBAN_REMOTE,
  KANBAN_BRANCH,
  kanbanNow,
  planSeed,
  readBoard,
  transact,
  type CardSource,
  type SeedReport,
  type Transaction,
} from '../core/kanban.js';

export interface KanbanOptions {
  /** Report what would be written, and push nothing. */
  dryRun?: boolean;
  json?: boolean;
  /** `seed` only: rewrite cards that disagree with their initiative. */
  resync?: boolean;
}

/**
 * Every initiative this machine knows, with where each was read from.
 *
 * The same precedence as the cross-branch board (DEC-BOARD-ALL-BRANCHES):
 * seeding is the one moment the board is built from "latest known", so it
 * uses the most complete "latest known" there is.
 */
function knownInitiatives(projectRoot: string): CardSource[] {
  const { initiatives, sources } = collectAllBranches(path.join(projectRoot, OPENSPRINT_DIR_NAME));
  return initiatives.map((entry) => ({
    entry,
    // Forward slashes, so the history line reads the same from every platform.
    source:
      sources.get(entry.path) === CHECKOUT_SOURCE
        ? path.relative(projectRoot, entry.path).split(path.sep).join('/')
        : entry.path,
  }));
}

function run(mode: 'init' | 'seed', options: KanbanOptions, only?: string): void {
  const projectRoot = process.cwd();
  // One board every checkout and every playbook agrees on (DEC-BOARD-ON-REMOTE-BRANCH).
  const remote = DEFAULT_KANBAN_REMOTE;
  const board = `${remote}/${KANBAN_BRANCH}`;
  let sources = knownInitiatives(projectRoot);
  if (only !== undefined) {
    sources = sources.filter((s) => s.entry.id === only || s.entry.stem === only);
    if (sources.length === 0) {
      throw new Error(`No initiative '${only}' in this checkout or on any opsp/* branch this machine has.`);
    }
  }
  const stamp = { at: kanbanNow(), by: gitUserName(projectRoot) ?? 'unknown' };

  // A workflow seeding its own new item runs on projects that never made a
  // board, so with an initiative named a missing board is a note, not an error.
  let noBoard = false;
  const decide = (snapshot: Parameters<typeof planSeed>[0]): Transaction<SeedReport> => {
    if (mode === 'seed' && snapshot.commit === null) {
      if (only === undefined) {
        throw new Error(`${board} does not exist. 'opensprint kanban init' creates and seeds it.`);
      }
      noBoard = true;
      return { write: null, value: { existed: false, added: [], drifted: [], resynced: [], agreeing: 0 } };
    }
    return planSeed(snapshot, sources, { mode, resync: options.resync === true, stamp });
  };

  let report: SeedReport;
  let commit: string | null;
  let wrote: boolean;
  if (options.dryRun === true) {
    const snapshot = readBoard(projectRoot, remote);
    const plan = decide(snapshot);
    report = plan.value;
    commit = snapshot.commit;
    wrote = false;
  } else {
    ({ value: report, commit, wrote } = transact(projectRoot, remote, decide));
  }

  if (noBoard) {
    if (options.json) {
      console.log(JSON.stringify({ board, commit: null, wrote: false, noBoard: true }, null, 2));
    } else {
      console.log();
      console.log(chalk.dim(`  ${remote} has no live board, so there is no card to add. 'opensprint kanban init' creates one.`));
      console.log();
    }
    return;
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        { board, commit, wrote, dryRun: options.dryRun === true, ...report },
        null,
        2
      )
    );
    return;
  }

  const short = (sha: string | null) => (sha === null ? '—' : sha.slice(0, 7));
  const dry = options.dryRun === true ? chalk.dim('  (dry run — nothing pushed)') : '';
  console.log();
  if (mode === 'init' && report.existed) {
    console.log(`  ${chalk.bold(board)} already exists at ${short(commit)} — nothing to create.`);
    console.log(chalk.dim(`  'opensprint kanban seed' adds what it lacks and reports what disagrees.`));
    console.log();
    return;
  }
  if (!report.existed) {
    console.log(
      `  ${chalk.bold(board)} ${options.dryRun === true ? 'would be created' : `created at ${short(commit)}`}` +
        ` with ${report.added.length} card(s)${dry}`
    );
  } else {
    console.log(`  ${chalk.bold(board)} @ ${short(commit)}${dry}`);
  }

  const would = options.dryRun === true ? 'would be ' : '';
  for (const { id, state } of report.added) {
    console.log(`  ${chalk.green('+')} ${id}  ${chalk.dim(`${would}added at ${state}`)}`);
  }
  for (const { id, drift } of report.drifted) {
    const fields = drift
      .map((d) => (d.card === undefined ? d.field : `${d.field} ${d.card} → ${d.initiative}`))
      .join(', ');
    const fixed = report.resynced.includes(id);
    console.log(
      `  ${fixed ? chalk.cyan('~') : chalk.yellow('!')} ${id}  ${fixed ? `${would}resynced` : 'differs'}: ${fields}`
    );
  }
  if (report.existed && report.agreeing > 0) {
    console.log(chalk.dim(`  ${report.agreeing} card(s) agree with their initiative`));
  }
  if (report.drifted.length > report.resynced.length) {
    console.log(chalk.dim(`  'opensprint kanban seed --resync' rewrites the cards that differ from their initiative.`));
  }
  if (report.existed && !wrote && report.added.length === 0 && report.resynced.length === 0) {
    console.log(chalk.dim('  nothing to write'));
  }
  console.log();
}

export async function kanbanInitCommand(options: KanbanOptions = {}): Promise<void> {
  if (options.resync === true) {
    throw new Error("--resync belongs to 'opensprint kanban seed'.");
  }
  run('init', options);
}

export async function kanbanSeedCommand(initiative?: string, options: KanbanOptions = {}): Promise<void> {
  run('seed', options, initiative);
}
