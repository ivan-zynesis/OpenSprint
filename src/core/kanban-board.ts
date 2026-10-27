/**
 * The board template — the page `/opsp:kanban` renders.
 *
 * The page is a package asset, `assets/kanban/board.html`, filled twice. When
 * opensprint writes it into a project, the configuration marker becomes a
 * JSON block of everything opensprint knows: the columns, and which states
 * need an owner. When the render playbook runs, the cards marker becomes the
 * cards, which only git knows (DEC-BOARD-READ-BY-GIT).
 *
 * The columns are data here rather than code in the page, so the page and
 * the CLI cannot place a card differently (DEC-CONTINUE-FORWARD-ESCALATE-BACK).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OWNED_STATES } from './initiatives.js';

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
}

export function boardConfig(): BoardConfig {
  return { columns: KANBAN_COLUMNS, owned: OWNED_STATES };
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
