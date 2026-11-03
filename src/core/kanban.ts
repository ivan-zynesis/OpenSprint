/**
 * The live board — in-flight initiative state on its own remote branch.
 *
 * `BOARD.md` is compiled from whatever one checkout knows, and
 * `--all-branches` makes that "whatever this machine fetched". DS-LIVE-BOARD
 * wants one copy every checkout reads the same way, and
 * DEC-BOARD-ON-REMOTE-BRANCH puts it on a branch of the remote that holds
 * nothing else: a README and one plain-text file per card.
 *
 * Nothing here checks the branch out. Cards are read from the fetched commit,
 * and a write builds its commit in a throwaway index and pushes it as a
 * fast-forward. A push that loses a race is rejected by the remote, so the
 * write re-reads the board and re-applies itself rather than forcing
 * (DEC-CARD-WRITES-THROUGH-CLI).
 */

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { InitiativeEntry, Milestone } from './initiatives.js';
import { initiativeBranch, readBlobs } from './initiative-git.js';

/** One name every checkout agrees on is the whole point of the store. */
export const KANBAN_BRANCH = 'kanban';
export const DEFAULT_KANBAN_REMOTE = 'origin';
export const KANBAN_README = 'README.md';
/** Git paths always use `/`. */
export const KANBAN_CARDS_DIR = 'cards';

export const KANBAN_README_TEXT =
  '# kanban\n\n' +
  'This branch is a board, not code. One file per card under `cards/`.\n' +
  'Change it only through `opensprint kanban`: every move is a commit, and a\n' +
  'write that loses a race is re-read and re-applied, never forced.\n';

export function cardPath(id: string): string {
  return path.posix.join(KANBAN_CARDS_DIR, `${id}.md`);
}

/** The remote-tracking ref a fetch of the board lands in. */
export function kanbanTrackingRef(remote: string): string {
  return `refs/remotes/${remote}/${KANBAN_BRANCH}`;
}

/**
 * Where a milestone is in the opsx cycle `/opsp:apply` runs for it
 * (DEC-MILESTONE-BOARD). `superseded` is shown with `done`, struck through.
 */
export const MILESTONE_STAGES = [
  'todo',
  'specifying',
  'building',
  'review',
  'done',
  'superseded',
] as const;
export type MilestoneStage = (typeof MILESTONE_STAGES)[number];

/**
 * The stages only the board knows. The initiative file records open, done
 * and superseded; where apply has a milestone open is a fact about apply's
 * progress, written to the card and nowhere else.
 */
const IN_PROGRESS_STAGES: readonly MilestoneStage[] = ['specifying', 'building', 'review'];

/** One move of a milestone's stage, as `/opsp:apply` makes it (DEC-MILESTONE-BOARD). */
export interface StageMove {
  from: MilestoneStage;
  to: MilestoneStage;
  /** When it fires, in the words the operator would use. */
  when: string;
}

/**
 * Every legal stage move. An explicit table, as `TRANSITIONS` is for
 * initiatives: forward through the opsx cycle, and back from Review only, as
 * a change request. `superseded` is reached through the initiative file, by a
 * repropose, never by a stage move.
 */
export const MILESTONE_STAGE_MOVES: readonly StageMove[] = [
  { from: 'todo', to: 'specifying', when: 'its opsx change is created' },
  { from: 'specifying', to: 'building', when: 'its change worktree is made' },
  { from: 'building', to: 'review', when: 'its change is archived and merged, waiting at the checkpoint' },
  { from: 'review', to: 'done', when: 'the checkpoint approves it and it is checked off' },
  { from: 'review', to: 'specifying', when: 'a change request: a corrective opsx change' },
];

/** Null where the move is legal; otherwise why not, naming the moves that are. */
export function checkStageMove(from: string, to: string): string | null {
  if (MILESTONE_STAGE_MOVES.some((m) => m.from === from && m.to === to)) return null;
  const legal = MILESTONE_STAGE_MOVES.filter((m) => m.from === from);
  return (
    `'${from}' does not move to '${to}'.` +
    (legal.length === 0
      ? ` Nothing moves from '${from}'.`
      : ` From '${from}': ${legal.map((m) => `${m.to} — ${m.when}`).join('; ')}.`)
  );
}

export interface CardMilestone {
  name: string;
  description: string;
  stage: MilestoneStage;
}

export interface Card {
  id: string;
  title: string;
  state: string;
  owner?: string;
  created: string;
  updated: string;
  branch: string;
  summary: string;
  milestones: CardMilestone[];
  /** One line per write, oldest first, without the list marker. */
  history: string[];
}

/** Frontmatter fields, in the order they are written. */
const CARD_FIELDS = ['id', 'title', 'state', 'owner', 'created', 'updated', 'branch'] as const;
type CardField = (typeof CARD_FIELDS)[number];

const MILESTONES_HEADING = '## Milestones';
const HISTORY_HEADING = '## History';

/**
 * Reads a card. Returns null where there is no frontmatter or no id.
 *
 * Line-based on purpose: the page that renders cards loads no libraries
 * (DS-RUNTIME-LESS-BOARD), so the syntax is whatever it can parse by hand. A
 * frontmatter value is the rest of its line. A card with no
 * `## Milestones` — every card imported before milestones were on cards —
 * reads as having none.
 */
export function parseCard(text: string): Card | null {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (match === null) return null;

  const fields: Partial<Record<CardField, string>> = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-z]+):\s?(.*)$/);
    if (kv !== null && (CARD_FIELDS as readonly string[]).includes(kv[1])) {
      fields[kv[1] as CardField] = kv[2].trim();
    }
  }
  if (!fields.id) return null;

  // Split the body at its second-level headings; what precedes the first is the summary.
  const sections = new Map<string, string>();
  let current = '';
  const lines: string[] = [];
  const flush = () => sections.set(current, lines.splice(0).join('\n'));
  for (const line of match[2].split('\n')) {
    if (line === MILESTONES_HEADING || line === HISTORY_HEADING) {
      flush();
      current = line;
      continue;
    }
    lines.push(line);
  }
  flush();

  const listItems = (heading: string) =>
    (sections.get(heading) ?? '')
      .split('\n')
      .filter((line) => line.startsWith('- '))
      .map((line) => line.slice(2));

  const milestones: CardMilestone[] = [];
  for (const item of listItems(MILESTONES_HEADING)) {
    const m = item.match(/^\[([a-z]+)\]\s?(.*)$/);
    if (m === null) continue;
    const stage = (MILESTONE_STAGES as readonly string[]).includes(m[1])
      ? (m[1] as MilestoneStage)
      : 'todo';
    const colon = m[2].indexOf(':');
    milestones.push(
      colon === -1
        ? { name: '', description: m[2].trim(), stage }
        : { name: m[2].slice(0, colon).trim(), description: m[2].slice(colon + 1).trim(), stage }
    );
  }

  return {
    id: fields.id,
    title: fields.title || fields.id,
    state: fields.state ?? '',
    ...(fields.owner ? { owner: fields.owner } : {}),
    created: fields.created ?? '',
    updated: fields.updated ?? '',
    branch: fields.branch ?? initiativeBranch(fields.id),
    summary: (sections.get('') ?? '').trim(),
    milestones,
    history: listItems(HISTORY_HEADING),
  };
}

/** Writes a card. `renderCard(parseCard(text))` gives back `text` for any card this wrote. */
export function renderCard(card: Card): string {
  const front = CARD_FIELDS.filter((f) => card[f] !== undefined && card[f] !== '').map(
    (f) => `${f}: ${card[f]}`
  );
  const parts = [`---\n${front.join('\n')}\n---`];
  if (card.summary.length > 0) parts.push(card.summary);
  if (card.milestones.length > 0) {
    const items = card.milestones.map((m) => `- [${m.stage}] ${`${m.name}: ${m.description}`.trimEnd()}`);
    parts.push(`${MILESTONES_HEADING}\n\n${items.join('\n')}`);
  }
  parts.push(`${HISTORY_HEADING}\n\n${card.history.map((h) => `- ${h}`).join('\n')}`);
  return `${parts.join('\n\n')}\n`;
}

/** An ISO time to the second, which is what history lines and `updated` carry. */
export function kanbanNow(date: Date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** `<time>  <what>  by <who>`, and ` — <note>` where there is one. */
export function historyLine(at: string, what: string, by: string, note?: string): string {
  return `${at}  ${what}  by ${by}${note ? ` — ${note}` : ''}`;
}

/**
 * The state a card starts at. An initiative declaring no state is placed by
 * its status, as `BOARD.md` places it.
 */
export function initialCardState(entry: InitiativeEntry): string {
  if (entry.state !== undefined) return entry.state;
  return entry.status === 'completed' ? 'completed' : 'exploring';
}

/** Identifies a milestone across a card and its initiative: by name, or by description where it has none. */
const milestoneKey = (m: { name: string; description: string }) =>
  m.name.length > 0 ? `name:${m.name}` : `description:${m.description}`;

/**
 * The initiative's milestones as the card should show them.
 *
 * Done and superseded come from the file. An open milestone keeps the stage
 * the card already shows where that stage is one only the board knows, and
 * is `todo` otherwise.
 */
export function mirrorMilestones(
  current: readonly CardMilestone[],
  milestones: readonly Milestone[]
): CardMilestone[] {
  const shown = new Map(current.map((m) => [milestoneKey(m), m.stage]));
  return milestones.map((m) => {
    let stage: MilestoneStage = 'todo';
    if (m.done) stage = 'done';
    else if (m.superseded) stage = 'superseded';
    else {
      const was = shown.get(milestoneKey(m));
      if (was !== undefined && IN_PROGRESS_STAGES.includes(was)) stage = was;
    }
    return { name: m.name, description: m.description, stage };
  });
}

export interface CardSource {
  entry: InitiativeEntry;
  /** Where the initiative was read from, as the history line names it. */
  source: string;
}

export interface Stamp {
  /** From `kanbanNow`. */
  at: string;
  by: string;
}

/** A new card for an initiative the board does not have yet. */
export function cardFromInitiative({ entry, source }: CardSource, { at, by }: Stamp): Card {
  const state = initialCardState(entry);
  return {
    id: entry.id,
    title: entry.id,
    state,
    ...(entry.owner === undefined ? {} : { owner: entry.owner }),
    created: entry.created ?? at.slice(0, 10),
    updated: at,
    branch: initiativeBranch(entry.id),
    summary: entry.summary ?? '',
    milestones: mirrorMilestones([], entry.milestones),
    history: [historyLine(at, `imported at ${state} from ${source}`, by)],
  };
}

/** The fields a card mirrors from its initiative. Title, created and branch are fixed at import. */
export const DRIFT_FIELDS = ['state', 'owner', 'summary', 'milestones'] as const;
export type DriftField = (typeof DRIFT_FIELDS)[number];

export interface Drift {
  field: DriftField;
  /** What the card shows and what the initiative says — for `state` and `owner`, which fit on a line. */
  card?: string;
  initiative?: string;
}

const UNOWNED = 'unowned';

/** Where a card disagrees with its initiative. Empty where they agree. */
export function cardDrift(card: Card, entry: InitiativeEntry): Drift[] {
  const drift: Drift[] = [];
  const state = initialCardState(entry);
  if (card.state !== state) drift.push({ field: 'state', card: card.state, initiative: state });
  if ((card.owner ?? '') !== (entry.owner ?? '')) {
    drift.push({ field: 'owner', card: card.owner ?? UNOWNED, initiative: entry.owner ?? UNOWNED });
  }
  if (card.summary !== (entry.summary ?? '')) drift.push({ field: 'summary' });
  const mirrored = mirrorMilestones(card.milestones, entry.milestones);
  if (JSON.stringify(mirrored) !== JSON.stringify(card.milestones)) drift.push({ field: 'milestones' });
  return drift;
}

/**
 * The card rewritten from its initiative, with one history line naming what
 * changed. Returns null where nothing does.
 *
 * A repair, not a move: the state it copies was validated where it was set,
 * on the initiative, by `opensprint advance` (DEC-STATE-MACHINE).
 */
export function resyncCard(card: Card, { entry, source }: CardSource, { at, by }: Stamp): Card | null {
  const drift = cardDrift(card, entry);
  if (drift.length === 0) return null;
  const what = drift
    .map((d) => (d.card === undefined ? d.field : `${d.field} ${d.card} → ${d.initiative}`))
    .join(', ');
  const rewritten: Card = {
    ...card,
    state: initialCardState(entry),
    summary: entry.summary ?? '',
    milestones: mirrorMilestones(card.milestones, entry.milestones),
    updated: at,
    history: [...card.history, historyLine(at, `resynced ${what} from ${source}`, by)],
  };
  if (entry.owner === undefined) delete rewritten.owner;
  else rewritten.owner = entry.owner;
  return rewritten;
}

// ── git ─────────────────────────────────────────────────────────────────────

interface GitCall {
  input?: string;
  env?: NodeJS.ProcessEnv;
}

function git(root: string, args: string[], call: GitCall = {}): string {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf-8',
      input: call.input,
      env: call.env ?? process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trimEnd();
  } catch (error) {
    const stderr = (error as { stderr?: Buffer | string }).stderr;
    const detail = stderr === undefined ? (error as Error).message : String(stderr).trim();
    throw new Error(`git ${args[0]} failed: ${detail}`);
  }
}

/** What the remote's board branch points at, or null where it has none. Throws where the remote cannot be asked. */
function remoteBoardCommit(root: string, remote: string): string | null {
  const ref = `refs/heads/${KANBAN_BRANCH}`;
  // Exact ref only: a pattern would also match refs/heads/opsp/kanban.
  for (const line of git(root, ['ls-remote', remote, ref]).split('\n')) {
    const [sha, name] = line.split('\t');
    if (name === ref) return sha;
  }
  return null;
}

/** The board at one commit. `commit` is null where the remote has no board yet. */
export interface BoardSnapshot {
  commit: string | null;
  cards: Card[];
}

/**
 * Fetches the board into its remote-tracking ref and returns its commit, or
 * null where the remote has no board. Nothing is checked out.
 */
export function fetchBoard(root: string, remote: string): string | null {
  const tracking = kanbanTrackingRef(remote);
  if (remoteBoardCommit(root, remote) === null) {
    try {
      git(root, ['update-ref', '-d', tracking]);
    } catch {
      // Nothing to delete.
    }
    return null;
  }
  git(root, ['fetch', '--quiet', remote, `+refs/heads/${KANBAN_BRANCH}:${tracking}`]);
  return git(root, ['rev-parse', tracking]);
}

/** Every card at `commit`, in path order. */
export function readCards(root: string, commit: string | null): Card[] {
  if (commit === null) return [];
  const listing = git(root, ['ls-tree', '-r', '--name-only', commit, '--', KANBAN_CARDS_DIR]);
  const files = listing
    .split('\n')
    .filter((file) => file.endsWith('.md'))
    .sort();
  const blobs = readBlobs(root, files.map((file) => `${commit}:${file}`));
  const cards: Card[] = [];
  for (const blob of blobs) {
    const card = blob === null ? null : parseCard(blob);
    if (card !== null) cards.push(card);
  }
  return cards;
}

/** Fetches and reads the board. */
export function readBoard(root: string, remote: string): BoardSnapshot {
  const commit = fetchBoard(root, remote);
  return { commit, cards: readCards(root, commit) };
}

/** Files to write, by path; null removes one. */
export type BoardChanges = Record<string, string | null>;

/**
 * Commits `changes` on top of `parent` and pushes it as a fast-forward.
 *
 * Returns the new commit, or null where the push lost a race: the remote's
 * board is no longer `parent`. Any other failure throws with git's message.
 * With no parent the commit is an orphan, sharing no history with code.
 */
export function writeBoard(
  root: string,
  remote: string,
  parent: string | null,
  changes: BoardChanges,
  message: string
): string | null {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-kanban-'));
  const env = { ...process.env, GIT_INDEX_FILE: path.join(tmp, 'index') };
  try {
    git(root, parent === null ? ['read-tree', '--empty'] : ['read-tree', parent], { env });
    for (const [file, content] of Object.entries(changes)) {
      if (content === null) {
        git(root, ['update-index', '--force-remove', file], { env });
        continue;
      }
      const blob = git(root, ['hash-object', '-w', '--stdin'], { input: content });
      git(root, ['update-index', '--add', '--cacheinfo', `100644,${blob},${file}`], { env });
    }
    const tree = git(root, ['write-tree'], { env });
    const commit = git(root, ['commit-tree', tree, ...(parent === null ? [] : ['-p', parent]), '-m', message]);

    try {
      // No --force: the remote refuses anything that is not a fast-forward of what was read.
      git(root, ['push', '--quiet', remote, `${commit}:refs/heads/${KANBAN_BRANCH}`]);
    } catch (error) {
      // Asked rather than read from the message: if the board moved, this
      // write lost a race; if it did not, the push failed for its own reason.
      if (remoteBoardCommit(root, remote) !== parent) return null;
      throw error;
    }
    git(root, ['update-ref', kanbanTrackingRef(remote), commit]);
    return commit;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/** What a transaction decided: the files to write, or null to write nothing, and what to report. */
export interface Transaction<T> {
  write: { changes: BoardChanges; message: string } | null;
  value: T;
}

export interface TransactResult<T> {
  value: T;
  /** The board after the transaction: the new commit, or the one read where nothing was written. */
  commit: string | null;
  wrote: boolean;
  attempts: number;
}

export const DEFAULT_KANBAN_ATTEMPTS = 8;

/** Blocks for `ms`. The CLI is synchronous throughout, and this runs once per lost race. */
function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Reads the board, applies `decide` and pushes what it returns, re-reading
 * and re-applying when another writer got there first.
 *
 * `decide` runs on every attempt against the board as it is then, so a check
 * it makes — a card someone else holds, a board that already exists — is
 * made against what the write will land on.
 */
export function transact<T>(
  root: string,
  remote: string,
  decide: (board: BoardSnapshot) => Transaction<T>,
  attempts: number = DEFAULT_KANBAN_ATTEMPTS
): TransactResult<T> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const board = readBoard(root, remote);
    const { write, value } = decide(board);
    if (write === null) return { value, commit: board.commit, wrote: false, attempts: attempt };
    const commit = writeBoard(root, remote, board.commit, write.changes, write.message);
    if (commit !== null) return { value, commit, wrote: true, attempts: attempt };
    if (attempt < attempts) sleep(Math.min(2000, 50 * 2 ** attempt) * (0.5 + Math.random()));
  }
  throw new Error(
    `Gave up after ${attempts} attempts: ${remote}/${KANBAN_BRANCH} kept changing underneath this write. Nothing was written.`
  );
}

// ── seeding ─────────────────────────────────────────────────────────────────

export interface SeedReport {
  /** Whether the board existed before this ran. */
  existed: boolean;
  added: Array<{ id: string; state: string }>;
  drifted: Array<{ id: string; drift: Drift[] }>;
  resynced: string[];
  /** Cards that agree with their initiative. */
  agreeing: number;
}

export interface SeedOptions {
  /** `init`: create the board, and do nothing where one exists. `seed`: add to an existing one. */
  mode: 'init' | 'seed';
  resync?: boolean;
  stamp: Stamp;
}

/**
 * What `init` or `seed` would write to `board`, given every initiative this
 * machine knows. Pure, so a dry run reports exactly what a real run writes.
 */
export function planSeed(
  board: BoardSnapshot,
  sources: readonly CardSource[],
  options: SeedOptions
): Transaction<SeedReport> {
  const report: SeedReport = {
    existed: board.commit !== null,
    added: [],
    drifted: [],
    resynced: [],
    agreeing: 0,
  };
  if (options.mode === 'init' && board.commit !== null) return { write: null, value: report };

  const changes: BoardChanges = {};
  if (board.commit === null) changes[KANBAN_README] = KANBAN_README_TEXT;

  const byId = new Map(board.cards.map((card) => [card.id, card]));
  for (const source of [...sources].sort((a, b) => (a.entry.id < b.entry.id ? -1 : a.entry.id > b.entry.id ? 1 : 0))) {
    const card = byId.get(source.entry.id);
    if (card === undefined) {
      const created = cardFromInitiative(source, options.stamp);
      changes[cardPath(created.id)] = renderCard(created);
      report.added.push({ id: created.id, state: created.state });
      continue;
    }
    const drift = cardDrift(card, source.entry);
    if (drift.length === 0) {
      report.agreeing += 1;
      continue;
    }
    report.drifted.push({ id: card.id, drift });
    if (options.resync === true) {
      const rewritten = resyncCard(card, source, options.stamp);
      if (rewritten !== null) {
        changes[cardPath(card.id)] = renderCard(rewritten);
        report.resynced.push(card.id);
      }
    }
  }

  if (Object.keys(changes).length === 0) return { write: null, value: report };

  const parts: string[] = [];
  if (report.added.length > 0) parts.push(`add ${report.added.map((a) => a.id).join(', ')}`);
  if (report.resynced.length > 0) parts.push(`resync ${report.resynced.join(', ')}`);
  const message =
    board.commit === null
      ? `kanban: init with ${report.added.length} card(s)`
      : `kanban: seed — ${parts.join('; ')}`;
  return { write: { changes, message }, value: report };
}
