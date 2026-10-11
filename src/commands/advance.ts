/**
 * `opensprint advance` — move an initiative to its next state.
 *
 * The transitions were prose, and prose is what failed: `/opsp:propose`
 * never wrote `proposed`, `/opsp:apply` never wrote `building`, and
 * `/opsp:archive` gated a merge on `attested` — a state no tool produced.
 * A workflow now runs a command that refuses an illegal move and names the
 * legal ones, so a transition is something the system did rather than
 * something an agent remembered (`DEC-STATE-MACHINE`).
 */

import * as path from 'node:path';
import chalk from 'chalk';
import { OPENSPRINT_DIR_NAME } from '../core/config.js';
import { resolveInitiative, checkInitiativeState, readInitiatives } from '../core/initiatives.js';
import { readInitiativeGitState } from '../core/initiative-git.js';
import { checkTransition, writeState, nextStates } from '../core/initiative-transitions.js';
import { regenerateBoard, BOARD_FILENAME } from '../core/board.js';

export interface AdvanceOptions {
  to?: string;
  json?: boolean;
  /** Report the move and the problems it would leave, without writing. */
  dryRun?: boolean;
}

export async function advanceCommand(
  nameOrId: string | undefined,
  options: AdvanceOptions = {}
): Promise<void> {
  const projectRoot = process.cwd();
  const opensprintDir = path.join(projectRoot, OPENSPRINT_DIR_NAME);

  if (nameOrId === undefined || nameOrId.length === 0) {
    const open = readInitiatives(opensprintDir).filter(
      (e) => e.state !== 'completed' && e.state !== 'declined'
    );
    throw new Error(
      'Name the initiative to advance.' +
        (open.length === 0
          ? ''
          : ` Open: ${open.map((e) => `${e.id} (${e.state ?? 'no state'})`).join(', ')}.`)
    );
  }

  const entry = resolveInitiative(opensprintDir, nameOrId);
  if (entry === null) {
    throw new Error(`No initiative '${nameOrId}'. Run 'opensprint compact board' to list them.`);
  }

  if (options.to === undefined || options.to.length === 0) {
    const legal = entry.state === undefined ? [] : nextStates(entry.state);
    throw new Error(
      `Name the state to advance to with --to. ` +
        (legal.length === 0
          ? `'${entry.id}' declares ${entry.state === undefined ? 'no state' : `'${entry.state}'`}.`
          : `From '${entry.state}': ${legal.map((t) => `${t.to} (${t.by})`).join(', ')}.`)
    );
  }

  const refusal = checkTransition(entry.state, options.to);
  if (refusal !== null) {
    throw new Error(
      `${refusal.reason}` +
        (refusal.legal.length === 0
          ? ''
          : ` From '${entry.state}' you may go to: ${refusal.legal
              .map((t) => `${t.to} — ${t.when} (${t.by})`)
              .join('; ')}.`)
    );
  }

  const from = entry.state;

  if (options.dryRun !== true) {
    writeState(entry.path, options.to);
    regenerateBoard(opensprintDir);
  }

  // Re-read so the check sees what was written, not what was asked for.
  const after = options.dryRun === true ? entry : resolveInitiative(opensprintDir, entry.id) ?? entry;
  const problems = checkInitiativeState(
    { ...after, state: options.to },
    readInitiativeGitState(projectRoot, entry.id)
  );

  if (options.json) {
    console.log(
      JSON.stringify(
        { initiative: entry.id, from: from ?? null, to: options.to, dryRun: options.dryRun === true, problems },
        null,
        2
      )
    );
    return;
  }

  const arrow = from === undefined ? `(no state) → ${options.to}` : `${from} → ${options.to}`;
  console.log();
  console.log(
    `  ${chalk.bold(entry.id)}  ${arrow}${options.dryRun === true ? chalk.dim('  (dry run)') : ''}`
  );
  if (options.dryRun !== true) {
    console.log(chalk.dim(`  ${path.relative(projectRoot, entry.path)} · ${BOARD_FILENAME} regenerated`));
  }

  // Advancing is not a gate — the state is recorded and the disagreement is
  // reported beside it. Refusing here would make a tool that records what
  // happened into one that decides what may happen (DS-SURROGATE-SCOPE).
  if (problems.length > 0) {
    console.log();
    console.log(chalk.yellow(`  ${problems.length} thing(s) the record now disagrees with:`));
    for (const problem of problems) console.log(`    ${chalk.dim(problem.kind)}  ${problem.detail}`);
  }
  console.log();
}
