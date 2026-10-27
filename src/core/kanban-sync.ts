/**
 * Moving a card from a workflow — the live board as a second write.
 *
 * Workflows move initiatives through `opensprint advance` and `opensprint
 * claim`, so those two commands are where every card moves
 * (DEC-CARD-WRITES-THROUGH-CLI). The initiative file stays the record and the
 * card mirrors it: a card write that fails never undoes or blocks the move it
 * follows. It reports, and `opensprint kanban seed` finds the drift later.
 *
 * Claims are the exception to "file first". The point of a claim on the
 * board is that the remote arbitrates between two machines, so the card is
 * claimed before the file is, and a refused claim writes nothing anywhere.
 */

import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import type { InitiativeEntry } from './initiatives.js';
import { checkTransition } from './initiative-transitions.js';
import {
  DEFAULT_KANBAN_REMOTE,
  KANBAN_BRANCH,
  cardFromInitiative,
  cardPath,
  checkStageMove,
  historyLine,
  kanbanNow,
  mirrorMilestones,
  renderCard,
  transact,
  type BoardSnapshot,
  type Card,
  type MilestoneStage,
} from './kanban.js';

/**
 * What happened to the card. Never thrown, so a move is never lost to the
 * board — except a refusal, which is the caller asking for something the
 * board must not do.
 */
export type BoardWrite =
  | { outcome: 'written'; commit: string; detail: string }
  | { outcome: 'unchanged'; detail: string }
  | { outcome: 'drift'; detail: string }
  /** The project has no such remote: it never opted in, so nothing is said. */
  | { outcome: 'no-remote' }
  | { outcome: 'no-board'; detail: string }
  | { outcome: 'failed'; detail: string };

/** A write the board refuses on its merits, not for want of a network. Thrown, and never swallowed. */
export class BoardRefusalError extends Error {}

/** A claim on a card someone else holds. Thrown so that the claim stops before the file is written. */
export class ClaimRefusedError extends BoardRefusalError {
  constructor(readonly id: string, readonly holder: string) {
    super(
      `'${id}' is held by ${holder} on ${DEFAULT_KANBAN_REMOTE}/${KANBAN_BRANCH}. ` +
        `Ask them first; --take-over reassigns it. Nothing was written.`
    );
  }
}

export interface CardWriteOptions {
  /** Who is making the write, for the history line. */
  by: string;
  remote?: string;
  attempts?: number;
}

const NO_BOARD = `${DEFAULT_KANBAN_REMOTE} has no live board — 'opensprint kanban init' creates one`;

function hasRemote(root: string, remote: string): boolean {
  try {
    execFileSync('git', ['remote', 'get-url', remote], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    return true;
  } catch {
    return false;
  }
}

/** The card for an initiative, or a new one made from it, as `seed` would make it. */
function cardFor(
  root: string,
  board: BoardSnapshot,
  entry: InitiativeEntry,
  at: string,
  by: string
): { card: Card; isNew: boolean } {
  const existing = board.cards.find((c) => c.id === entry.id);
  if (existing !== undefined) return { card: existing, isNew: false };
  // Forward slashes, so the history line reads the same from every platform.
  const source = path.relative(root, entry.path).split(path.sep).join('/');
  return { card: cardFromInitiative({ entry, source }, { at, by }), isNew: true };
}

/** Runs one card transaction, turning everything but a refused claim into an outcome. */
function write(
  root: string,
  options: CardWriteOptions,
  decide: (board: BoardSnapshot, at: string) => { card: Card; message: string; detail: string } | BoardWrite
): BoardWrite {
  const remote = options.remote ?? DEFAULT_KANBAN_REMOTE;
  if (!hasRemote(root, remote)) return { outcome: 'no-remote' };
  try {
    const result = transact(
      root,
      remote,
      (board) => {
        if (board.commit === null) return { write: null, value: { outcome: 'no-board', detail: NO_BOARD } as BoardWrite };
        const decided = decide(board, kanbanNow());
        if ('outcome' in decided) return { write: null, value: decided };
        return {
          write: { changes: { [cardPath(decided.card.id)]: renderCard(decided.card) }, message: decided.message },
          value: { outcome: 'written', commit: '', detail: decided.detail } as BoardWrite,
        };
      },
      options.attempts
    );
    const value = result.value;
    return value.outcome === 'written' ? { ...value, commit: result.commit ?? '' } : value;
  } catch (error) {
    if (error instanceof BoardRefusalError) throw error;
    return { outcome: 'failed', detail: (error as Error).message };
  }
}

/**
 * Moves the card the way `advance` just moved the initiative.
 *
 * `entry` is the initiative as it was before the move, so a missing card is
 * created at the state it is leaving and the history shows the move. The card
 * validates its own move against the table: a card that drifted is left alone
 * and the drift reported, because writing it would invent a move nobody made.
 */
export function moveCard(
  root: string,
  entry: InitiativeEntry,
  to: string,
  options: CardWriteOptions & { workflow?: string }
): BoardWrite {
  return write(root, options, (board, at) => {
    const { card, isNew } = cardFor(root, board, entry, at, options.by);
    const from = card.state.length === 0 ? undefined : card.state;
    if (from === to && !isNew) return { outcome: 'unchanged', detail: `the card already shows ${to}` };
    if (from !== to) {
      const refusal = checkTransition(from, to);
      if (refusal !== null) {
        return {
          outcome: 'drift',
          detail:
            `the card shows ${from}, and ${from} → ${to} is not a move, so it was left alone. ` +
            `'opensprint kanban seed --resync' corrects it.`,
        };
      }
    }
    const moved: Card = {
      ...card,
      state: to,
      updated: at,
      history: from === to ? card.history : [...card.history, historyLine(at, `${from ?? '(no state)'} → ${to}`, options.by, options.workflow)],
    };
    return { card: moved, message: `kanban: ${card.id} → ${to}`, detail: `card ${from ?? '(no state)'} → ${to}` };
  });
}

/**
 * Claims the card for `owner`, or puts it down where `owner` is null.
 *
 * The check runs inside the transaction, against the board as it is on every
 * attempt: of two claims racing for an unheld card, the loser's retry reads
 * the winner's name and is refused rather than overwriting it.
 */
export function claimCard(
  root: string,
  entry: InitiativeEntry,
  owner: string | null,
  options: CardWriteOptions & { takeOver?: boolean }
): BoardWrite {
  return write(root, options, (board, at) => {
    const { card, isNew } = cardFor(root, board, entry, at, options.by);
    const from = card.owner ?? null;
    if (from === owner && !isNew) {
      return { outcome: 'unchanged', detail: owner === null ? 'the card is already unowned' : `the card already names ${owner}` };
    }
    if (owner !== null && from !== null && from !== owner && options.takeOver !== true) {
      throw new ClaimRefusedError(card.id, from);
    }
    const claimed: Card = { ...card, updated: at };
    if (owner === null) delete claimed.owner;
    else claimed.owner = owner;
    if (from !== owner) {
      const note = from !== null && owner !== null ? `taken over from ${from}` : undefined;
      claimed.history = [...card.history, historyLine(at, `owner ${from ?? 'unowned'} → ${owner ?? 'unowned'}`, options.by, note)];
    }
    return {
      card: claimed,
      message: owner === null ? `kanban: ${card.id} put down` : `kanban: ${owner} claims ${card.id}`,
      detail: `card owner ${from ?? 'unowned'} → ${owner ?? 'unowned'}`,
    };
  });
}

/**
 * Moves one milestone's stage on the card, as apply reaches each step of its
 * opsx cycle (DEC-MILESTONE-BOARD).
 *
 * The card's milestones are mirrored from the file first, so a milestone a
 * repropose added or superseded appears without a seed. The file decides two
 * things: a milestone is done only where it is checked off, and one leaves
 * `todo` only when every live milestone before it is done. The rest is the
 * stage table's.
 */
export function stageCard(
  root: string,
  entry: InitiativeEntry,
  milestone: string,
  stage: MilestoneStage,
  options: CardWriteOptions
): BoardWrite {
  return write(root, options, (board, at) => {
    const { card, isNew } = cardFor(root, board, entry, at, options.by);
    const milestones = mirrorMilestones(card.milestones, entry.milestones);
    const index = milestones.findIndex((m) => m.name === milestone);
    if (index === -1) {
      const names = milestones.map((m) => m.name).filter((n) => n.length > 0);
      throw new BoardRefusalError(
        `'${entry.id}' has no milestone '${milestone}'.` + (names.length === 0 ? '' : ` Its milestones: ${names.join(', ')}.`)
      );
    }
    const mirrored = isNew || JSON.stringify(milestones) !== JSON.stringify(card.milestones);
    const from = milestones[index].stage;

    if (from === stage) {
      if (!mirrored) return { outcome: 'unchanged', detail: `${milestone} is already ${stage}` };
      // The file moved it — most often to done, once apply checks it off. One history line, as every write gets.
      const before = card.milestones.find((m) => m.name === milestone)?.stage;
      const what =
        before !== undefined && before !== stage
          ? `milestone ${milestone}: ${before} → ${stage}`
          : 'milestones follow the initiative';
      return {
        card: { ...card, milestones, updated: at, history: [...card.history, historyLine(at, what, options.by)] },
        message: `kanban: ${card.id} ${what}`,
        detail: before !== undefined && before !== stage ? `${milestone} ${before} → ${stage}` : what,
      };
    }
    if (stage === 'done') {
      // Mirroring already made a checked milestone done, so this one is not checked.
      throw new BoardRefusalError(
        `'${milestone}' is not checked off in the initiative. Check it off there first — the file says what is done.`
      );
    }
    const refusal = checkStageMove(from, stage);
    if (refusal !== null) throw new BoardRefusalError(`${milestone}: ${refusal}`);
    if (from === 'todo') {
      const earlier = milestones.slice(0, index).find((m) => m.stage !== 'done' && m.stage !== 'superseded');
      if (earlier !== undefined) {
        throw new BoardRefusalError(
          `'${earlier.name || earlier.description}' comes first: milestones run in order, and it is ${earlier.stage}.`
        );
      }
    }

    const moved = milestones.map((m, i) => (i === index ? { ...m, stage } : m));
    return {
      card: {
        ...card,
        milestones: moved,
        updated: at,
        history: [...card.history, historyLine(at, `milestone ${milestone}: ${from} → ${stage}`, options.by)],
      },
      message: `kanban: ${card.id} ${milestone} → ${stage}`,
      detail: `${milestone} ${from} → ${stage}`,
    };
  });
}

/** One line for a command's output, or null where there is nothing worth saying. */
export function describeBoardWrite(result: BoardWrite): { tone: 'dim' | 'warn'; text: string } | null {
  const board = `${DEFAULT_KANBAN_REMOTE}/${KANBAN_BRANCH}`;
  switch (result.outcome) {
    case 'no-remote':
      return null;
    case 'written':
      return { tone: 'dim', text: `${board} · ${result.detail} (${result.commit.slice(0, 7)})` };
    case 'unchanged':
      return { tone: 'dim', text: `${board} · ${result.detail}` };
    case 'no-board':
      return { tone: 'dim', text: result.detail };
    case 'drift':
      return { tone: 'warn', text: `${board} · ${result.detail}` };
    case 'failed':
      return { tone: 'warn', text: `${board} · the card was not updated: ${result.detail}` };
  }
}
