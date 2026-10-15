/**
 * `opensprint claim` — name who holds an initiative's card.
 *
 * A board without owners answers "where is everything" and not "who is on
 * it", which is the question a kanban exists for. The owner is written by a
 * command for the same reason a state is (`DEC-STATE-MACHINE`): a prose
 * instruction to edit frontmatter is the thing that was never followed.
 *
 * Claiming moves nothing. The state stays where it is; `opensprint advance`
 * moves it.
 */

import * as path from 'node:path';
import chalk from 'chalk';
import { OPENSPRINT_DIR_NAME } from '../core/config.js';
import { resolveInitiative, readInitiatives, isTerminalState } from '../core/initiatives.js';
import { gitUserName } from '../core/initiative-git.js';
import { writeOwner } from '../core/initiative-transitions.js';
import { regenerateBoard, BOARD_FILENAME } from '../core/board.js';

export interface ClaimOptions {
  /** Who takes the card. Defaults to git's `user.name`. */
  owner?: string;
  /** Put the card down: remove the owner. */
  release?: boolean;
  json?: boolean;
  /** Report the change without writing it. */
  dryRun?: boolean;
}

export async function claimCommand(
  nameOrId: string | undefined,
  options: ClaimOptions = {}
): Promise<void> {
  const projectRoot = process.cwd();
  const opensprintDir = path.join(projectRoot, OPENSPRINT_DIR_NAME);

  if (nameOrId === undefined || nameOrId.length === 0) {
    const open = readInitiatives(opensprintDir).filter(
      (e) => e.state === undefined || !isTerminalState(e.state)
    );
    throw new Error(
      'Name the initiative to claim.' +
        (open.length === 0
          ? ''
          : ` Open: ${open.map((e) => `${e.id} (${e.owner ?? 'unowned'})`).join(', ')}.`)
    );
  }

  const entry = resolveInitiative(opensprintDir, nameOrId);
  if (entry === null) {
    throw new Error(
      `No initiative '${nameOrId}' in this checkout. ` +
        `Run 'opensprint compact board --all-branches' to see which branch holds it, then switch to its worktree.`
    );
  }

  if (entry.state !== undefined && isTerminalState(entry.state)) {
    throw new Error(`'${entry.id}' is ${entry.state}. There is no work left to hold.`);
  }

  if (options.release === true && options.owner !== undefined) {
    throw new Error('Pass --owner to take the card, or --release to put it down — not both.');
  }

  const from = entry.owner ?? null;
  let to: string | null;
  if (options.release === true) {
    to = null;
  } else {
    const named = options.owner?.trim() ?? gitUserName(projectRoot);
    if (named === undefined || named.length === 0) {
      throw new Error(
        `Nobody to name: git has no user.name here. Re-run with --owner <name>.`
      );
    }
    to = named;
  }

  const changed = from !== to;
  if (changed && options.dryRun !== true) {
    writeOwner(entry.path, to);
    regenerateBoard(opensprintDir);
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          initiative: entry.id,
          from,
          to,
          changed,
          dryRun: options.dryRun === true,
        },
        null,
        2
      )
    );
    return;
  }

  const show = (owner: string | null) => (owner === null ? 'unowned' : owner);
  console.log();
  if (!changed) {
    console.log(`  ${chalk.bold(entry.id)}  already ${show(to)} — nothing to change`);
  } else {
    console.log(
      `  ${chalk.bold(entry.id)}  owner: ${show(from)} → ${show(to)}` +
        (options.dryRun === true ? chalk.dim('  (dry run)') : '')
    );
    if (from !== null && to !== null) {
      console.log(chalk.yellow(`  reassigned from ${from}`));
    }
    if (options.dryRun !== true) {
      console.log(chalk.dim(`  ${path.relative(projectRoot, entry.path)} · ${BOARD_FILENAME} regenerated`));
    }
  }
  console.log();
}
