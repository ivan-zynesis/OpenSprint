/**
 * The board template — the page `/opsp:kanban` renders.
 *
 * The page is a package asset, `assets/kanban/board.html`, filled twice. When
 * opensprint writes it into a project, the configuration marker becomes a
 * JSON block of everything opensprint knows: the columns, which states need
 * an owner, the moves each card offers, and how to start the agent the page
 * was generated for. When the render playbook runs, the cards marker becomes
 * the cards, which only git knows (DEC-BOARD-READ-BY-GIT).
 *
 * The columns and the moves are data here rather than code in the page, so
 * the page cannot place a card, or offer a move, that the CLI would not
 * (DEC-CONTINUE-FORWARD-ESCALATE-BACK).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIATIVE_STATES, OWNED_STATES, type InitiativeState } from './initiatives.js';
import { TRANSITIONS, type Transition } from './initiative-transitions.js';
import { MILESTONE_STAGE_MOVES, type MilestoneStage, type StageMove } from './kanban.js';

export interface KanbanColumn {
  key: string;
  title: string;
  states: readonly string[];
  /**
   * Where set, the column also needs the card to be held (true) or not held
   * (false). It is what splits `exploring` into Backlog and Planning without
   * a state of its own (DEC-INITIATIVE-OWNER).
   */
  held?: boolean;
}

/** One column per stage, in board order. A card goes in the first that matches. */
export const KANBAN_COLUMNS: readonly KanbanColumn[] = [
  { key: 'backlog', title: 'Backlog', states: ['exploring'], held: false },
  { key: 'planning', title: 'Planning', states: ['exploring'], held: true },
  { key: 'dev', title: 'Dev', states: ['proposed', 'building'] },
  { key: 'attestation', title: 'Attestation', states: ['ready-for-attestation', 'attested'] },
  { key: 'done', title: 'Done', states: ['completed', 'declined'] },
];

/** The column a card sits in, or undefined for a state outside the vocabulary. */
export function columnOf(state: string, held: boolean): KanbanColumn | undefined {
  return KANBAN_COLUMNS.find(
    (column) => column.states.includes(state) && (column.held === undefined || column.held === held)
  );
}

/**
 * One button on a card: a workflow to start, and the move it makes when its
 * work is done. The button never makes the move itself
 * (DEC-BOARD-BUTTON-LAUNCHES-SESSION).
 */
export interface KanbanMove {
  /** The workflow's short name, as the agent table keys it: `apply`, `triage`. */
  workflow: string;
  label: string;
  from: string;
  to: string;
  hat: readonly string[];
  when: string;
  /** Where set, the move picks the card up, so it lands held. */
  claims?: boolean;
}

/** `/opsp:apply` → `apply`: the name a transition's `by` gives its workflow. */
export function workflowName(by: string): string {
  return by.replace(/^\/opsp:/, '');
}

/** The lifecycle order `INITIATIVE_STATES` lists, which is what makes a move forward or back. */
const order = (state: string) => INITIATIVE_STATES.indexOf(state as InitiativeState);

/**
 * Backlog's way forward, and the one move that is not a transition: triage
 * picking a card up writes an owner, not a state (DEC-INITIATIVE-OWNER).
 */
export const TRIAGE_PICKUP: KanbanMove = {
  workflow: 'triage',
  label: 'Continue: triage',
  from: 'exploring',
  to: 'exploring',
  hat: TRANSITIONS.find((t) => t.by === '/opsp:triage')?.hat ?? ['product', 'maintainer'],
  when: 'picked up: claimed and its strategy brainstormed, or declined with the reason',
  claims: true,
};

/** An escalation's button reads as the rung it opens. */
const ESCALATION_LABELS: Readonly<Record<string, string>> = {
  reexplore: 'Reexplore',
  repropose: 'Repropose',
  attest: 'Request a change',
  triage: 'Revive',
};

function moveOf(t: Transition, label: string): KanbanMove {
  return { workflow: workflowName(t.by), label, from: t.from, to: t.to, hat: t.hat, when: t.when };
}

/**
 * The one way forward from a state: the transition to a later state.
 *
 * Moves into `declined` are not buttons — declining is one of triage's
 * outcomes — and an unheld `exploring` card goes forward by being picked up.
 */
export function continueMove(state: string, held: boolean): KanbanMove | undefined {
  if (state === 'exploring' && !held) return TRIAGE_PICKUP;
  const forward = TRANSITIONS.find(
    (t) => t.from === state && t.to !== 'declined' && order(t.to) > order(t.from)
  );
  return forward === undefined ? undefined : moveOf(forward, `Continue: ${workflowName(forward.by)}`);
}

/** Every way back from a state: each transition to an earlier one, up a rung (DEC-ESCALATION-LADDER). */
export function escalationMoves(state: string): KanbanMove[] {
  return TRANSITIONS.filter((t) => t.from === state && order(t.to) < order(t.from)).map((t) =>
    moveOf(t, ESCALATION_LABELS[workflowName(t.by)] ?? workflowName(t.by))
  );
}

export interface BoardMoves {
  /** Per state, the continue move for a card nobody holds and for one somebody does. */
  continue: Record<string, { unheld?: KanbanMove; held?: KanbanMove }>;
  escalate: Record<string, KanbanMove[]>;
}

export function boardMoves(): BoardMoves {
  const moves: BoardMoves = { continue: {}, escalate: {} };
  for (const state of INITIATIVE_STATES) {
    const unheld = continueMove(state, false);
    const held = continueMove(state, true);
    if (unheld !== undefined || held !== undefined) {
      moves.continue[state] = {
        ...(unheld === undefined ? {} : { unheld }),
        ...(held === undefined ? {} : { held }),
      };
    }
    const back = escalationMoves(state);
    if (back.length > 0) moves.escalate[state] = back;
  }
  return moves;
}

/**
 * How the page starts the agent it was generated for: one entry per tool,
 * built from its command adapter (DEC-BOARD-BUTTON-LAUNCHES-SESSION).
 */
export interface KanbanAgent {
  /** As a person would name it: `Claude Code`. */
  name: string;
  /** Shell words that start a session with the prompt as the next argument; null to copy the prompt alone. */
  launcher: readonly string[] | null;
  /** Per workflow short name: the generated command to invoke, or the skill to name. */
  workflows: Record<string, { command: string } | { skill: string }>;
}

/** One column of an initiative's milestone board: a stage of the opsx cycle (DEC-MILESTONE-BOARD). */
export interface MilestoneColumn {
  key: string;
  title: string;
  stages: readonly MilestoneStage[];
}

/** Five columns; a superseded milestone shows under Done, struck through. */
export const MILESTONE_COLUMNS: readonly MilestoneColumn[] = [
  { key: 'todo', title: 'To do', stages: ['todo'] },
  { key: 'specifying', title: 'Specifying', stages: ['specifying'] },
  { key: 'building', title: 'Building', stages: ['building'] },
  { key: 'review', title: 'Review', stages: ['review'] },
  { key: 'done', title: 'Done', stages: ['done', 'superseded'] },
];

/** The one way back on a ticket, from the stage table: Review to Specifying. */
export function changeRequestMove(): StageMove {
  const move = MILESTONE_STAGE_MOVES.find((m) => m.from === 'review' && m.to === 'specifying');
  if (move === undefined) throw new Error('The stage table has no change request.');
  return move;
}

export const BOARD_TEMPLATE_FILE = 'board.html';
export const BOARD_CONFIG_MARKER = '<!-- opensprint:config -->';
export const BOARD_CARDS_MARKER = '<!-- opensprint:cards -->';

/** The template shipped in the package, beside `dist/` as `schemas/` is. */
export function boardTemplateAssetPath(): string {
  // From dist/core/ (or src/core/ under test) to the package root.
  return path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'kanban', BOARD_TEMPLATE_FILE);
}

/** What opensprint writes into the page: everything it knows that git does not. */
export interface BoardConfig {
  columns: readonly KanbanColumn[];
  /** States where a card with nobody holding it is marked (`owner-undeclared`). */
  owned: readonly string[];
  moves: BoardMoves;
  /** Null where the page was generated for no tool: it then shows no buttons. */
  agent: KanbanAgent | null;
  milestoneColumns: readonly MilestoneColumn[];
  changeRequest: StageMove;
}

export function boardConfig(agent: KanbanAgent | null = null): BoardConfig {
  return {
    columns: KANBAN_COLUMNS,
    owned: OWNED_STATES,
    moves: boardMoves(),
    agent,
    milestoneColumns: MILESTONE_COLUMNS,
    changeRequest: changeRequestMove(),
  };
}

/**
 * The template with its configuration written in, ready for the render
 * playbook. `<` is escaped so that no value can close the script element.
 */
export function renderBoardTemplate(config: BoardConfig = boardConfig()): string {
  const html = fs.readFileSync(boardTemplateAssetPath(), 'utf-8');
  if (!html.includes(BOARD_CONFIG_MARKER) || !html.includes(BOARD_CARDS_MARKER)) {
    throw new Error(`${boardTemplateAssetPath()} is missing its config or cards marker.`);
  }
  const json = JSON.stringify(config).replace(/</g, '\\u003c');
  // A function replacer, so a `$` in the configuration is never read as a pattern.
  return html.replace(
    BOARD_CONFIG_MARKER,
    () => `<script type="application/json" id="board-config">${json}</script>`
  );
}
