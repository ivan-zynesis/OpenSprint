/**
 * Initiatives — the deterministic half
 *
 * An initiative is a **container, not a record** (DS-PROGRESSIVE-CRYSTALLIZATION):
 * it neither constrains nor decides, which is what every driver-spec and ADR
 * does. It tracks work, and it fills progressively — born at intake, carrying
 * more of OGSM as the work crystallizes.
 *
 * Until now it was the one artifact class with no code behind it. Every
 * reference to `initiatives/` in src/ was prose inside a skill template, so an
 * initiative's state, its milestones and its membership were legible to a
 * model and invisible to code. DEC-024 named that as the obstacle: a state
 * machine needs a parser first.
 *
 * Nothing here writes. Reading is the whole surface.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseFrontmatter } from './decision-map.js';

/** A unit of work inside an initiative: one opsx change cycle. */
export interface Milestone {
  /**
   * The opsx change name, which is what makes a milestone traceable to the
   * branch that implemented it. Empty when the line carried no colon.
   */
  name: string;
  description: string;
  done: boolean;
  /**
   * Marked `- [~]`: decided against after the initiative was planned, and
   * neither done nor outstanding.
   *
   * A superseded milestone is listed rather than deleted, for the same reason
   * DEC-035 keeps a declined initiative: why the work was dropped is worth
   * more than the line. It is excluded from progress, so an initiative is not
   * held open by work nobody intends to do.
   */
  superseded: boolean;
}

/**
 * How reversible a change is (DEC-042).
 *
 * An explicit pair rather than free text: the whole value of the question is
 * that it has two answers and you must pick one.
 */
export const DOORS = ['one-way', 'two-way'] as const;
export type Door = (typeof DOORS)[number];

/**
 * One row of the RACI table: a follow-up concern, and who holds it after the
 * pull request closes.
 *
 * `handledBy` naming a system is a complete answer — RACI is the **residue
 * after automation**, so the table grows only where the automation does not.
 */
export interface RaciRow {
  concern: string;
  handledBy: string;
  /** True where `handledBy` names a system rather than stating it is manual. */
  automated: boolean;
  responsible?: string;
  accountable?: string;
  consulted?: string;
  informed?: string;
}

/**
 * What an attestation recorded about the change itself, as opposed to about
 * any one measure.
 *
 * Reversibility and blast radius are properties of the whole change — a
 * one-way door is one-way whichever bar you are looking at — which is why
 * they live here rather than under `## Measures` (DEC-042).
 */
export interface Attestation {
  door?: Door;
  blastRadius?: string;
  raci: RaciRow[];
}

export interface InitiativeEntry {
  id: string;
  /** `active` by default, matching how driver-specs default. */
  status: string;
  /** How far down OGSM this has crystallized (DEC-024). Absent on older files. */
  state?: string;
  /**
   * The person holding the card — who to ask where the work stands.
   *
   * A person, not a hat: a hat says which accountability a move is made in,
   * and an owner says who is making it. Absent on files written before the
   * field existed, and on a backlog item nobody has picked up.
   */
  owner?: string;
  created?: string;
  completed?: string;
  /** Other initiatives this one builds on. */
  dependsOn: string[];
  milestones: Milestone[];
  /**
   * Checkbox lines found outside `## Milestones`, with the section holding
   * them.
   *
   * `/opsp:repropose` appends milestones under a dated heading rather than
   * into the section, so strict scoping would drop them silently. Reporting
   * them instead keeps the scoping predictable without losing the work —
   * the board can surface them, and the real fix belongs in re-exploration's
   * output format.
   */
  orphanedMilestones: Array<Milestone & { section: string }>;
  /** What `/opsp:attest` recorded about the change, when it has run. */
  attestation?: Attestation;
  /** Driver-specs this initiative claims, from `## Driver Specs`. */
  driverSpecs: string[];
  /** Decisions this initiative claims, from `## ADRs`. */
  decisions: string[];
  /** Path to the file, so a caller can open it. */
  path: string;
  /** Filename without `.md`, which may differ from `id` once DEC-036 lands. */
  stem: string;
}

/**
 * The body of a second-level section, ending at the next one.
 *
 * Scoping matters here: a checkbox in `## Description` is prose, not a
 * milestone, and a list item in `## Open Questions` is not membership.
 */
export function sectionBody(content: string, heading: string): string | null {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^##\\s+${escaped}\\s*$`, 'im'));
  if (!match || match.index === undefined) return null;
  const after = content.slice(match.index + match[0].length);
  const next = after.search(/^##\s/m);
  return next === -1 ? after : after.slice(0, next);
}

/**
 * Reads the `## Milestones` section.
 *
 * A line with no colon still becomes a milestone, with its whole text as the
 * description and an empty name: reporting a malformed milestone beats
 * dropping it silently, which is the failure mode that leaves an initiative
 * looking complete when it is not.
 */
export function parseMilestones(content: string): Milestone[] {
  const body = sectionBody(content, 'Milestones');
  if (body === null) return [];

  const milestones: Milestone[] = [];
  for (const line of body.split('\n')) {
    const match = line.match(/^\s*[-*]\s*\[([ xX~])\]\s*(.+)$/);
    if (!match) continue;
    const marker = match[1].toLowerCase();
    const done = marker === 'x';
    const superseded = marker === '~';
    const text = match[2].trim();
    const colon = text.indexOf(':');
    if (colon === -1) {
      milestones.push({ name: '', description: text, done, superseded });
    } else {
      milestones.push({
        name: text.slice(0, colon).trim(),
        description: text.slice(colon + 1).trim(),
        done,
        superseded,
      });
    }
  }
  return milestones;
}

/**
 * Checkbox lines living outside `## Milestones`.
 *
 * Scoped parsing is right — a checkbox in `## Description` is prose — but a
 * re-explored initiative keeps real milestones under a dated heading, and
 * dropping those without a word is the failure that makes an initiative look
 * complete when it is not.
 */
export function parseOrphanedMilestones(
  content: string
): Array<Milestone & { section: string }> {
  const out: Array<Milestone & { section: string }> = [];
  let section = '';
  for (const line of content.split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      section = heading[1];
      continue;
    }
    if (section.toLowerCase() === 'milestones') continue;
    const match = line.match(/^\s*[-*]\s*\[([ xX~])\]\s*(.+)$/);
    if (!match) continue;
    const marker = match[1].toLowerCase();
    const text = match[2].trim();
    const colon = text.indexOf(':');
    out.push({
      name: colon === -1 ? '' : text.slice(0, colon).trim(),
      description: colon === -1 ? text : text.slice(colon + 1).trim(),
      done: marker === 'x',
      superseded: marker === '~',
      section,
    });
  }
  return out;
}

/** A table cell that says nothing: empty, a dash, or an em-dash. */
function absent(cell: string): boolean {
  const v = cell.trim();
  return v === '' || v === '-' || v === '—' || v === '–' || v === 'n/a';
}

/**
 * True where a "handled by" cell names a system rather than stating that the
 * concern is manual.
 *
 * Explicit markers rather than inference: a row saying it is not automated
 * must say so, because guessing wrong here means a concern nobody holds
 * reads as covered.
 */
function namesSystem(handledBy: string): boolean {
  const v = handledBy.trim().toLowerCase();
  if (absent(v)) return false;
  return !(
    v.includes('not automated') ||
    v.includes('not handled') ||
    v.includes('manual') ||
    v.includes('none')
  );
}

/**
 * Reads the `## Attestation` section an initiative carries once attested.
 *
 * Lenient on the dash forms markdown tables collect, and on a table with
 * fewer columns than expected — a hand-written table that is under-filled is
 * milestone 12's `raci-unassigned` to report, not this parser's to reject.
 */
export function parseAttestation(content: string): Attestation | undefined {
  const body = sectionBody(content, 'Attestation');
  if (body === null) return undefined;

  const labelled = (label: string): string | undefined => {
    for (const line of body.split('\n')) {
      const m = line.match(new RegExp(`^\\s*[-*]\\s*\\*\\*\\s*${label}\\s*\\*\\*\\s*:\\s*(.+)$`, 'i'));
      if (m && m[1].trim().length > 0) return m[1].trim();
    }
    return undefined;
  };

  const doorRaw = labelled('door');
  const door = DOORS.find((d) => doorRaw !== undefined && doorRaw.toLowerCase().startsWith(d));

  const raci: RaciRow[] = [];
  for (const line of body.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    // Skip the header and its separator.
    if (/^-{2,}$/.test(cells[0].replace(/[:\s]/g, '')) ) continue;
    if (cells[0].toLowerCase() === 'concern') continue;
    const [concern, handledBy, r, a, c, i] = cells;
    if (absent(concern)) continue;
    raci.push({
      concern,
      handledBy: handledBy ?? '',
      automated: namesSystem(handledBy ?? ''),
      ...(r && !absent(r) ? { responsible: r } : {}),
      ...(a && !absent(a) ? { accountable: a } : {}),
      ...(c && !absent(c) ? { consulted: c } : {}),
      ...(i && !absent(i) ? { informed: i } : {}),
    });
  }

  return {
    ...(door === undefined ? {} : { door }),
    ...(labelled('blast-radius') === undefined ? {} : { blastRadius: labelled('blast-radius') as string }),
    raci,
  };
}

/**
 * Reads the record ids from a list section.
 *
 * Both spellings are read by one parser — a bare `- DS-EXAMPLE` and a
 * `- DEC-018 — the six are the shipped section list` — because two parsers
 * for two spellings is how the two spellings start to mean different things.
 */
function parseMembership(content: string, heading: string): string[] {
  const body = sectionBody(content, heading);
  if (body === null) return [];

  const ids: string[] = [];
  for (const line of body.split('\n')) {
    const match = line.match(/^\s*[-*]\s+(\S+)/);
    if (!match) continue;
    // A checkbox is a milestone, not a member — guards a section that
    // mixes the two.
    if (match[1] === '[' || match[1].startsWith('[')) continue;
    ids.push(match[1]);
  }
  return ids;
}

/**
 * Parses one initiative file, or returns null where it declares no `id`.
 *
 * Separate from reading the directory so that a file read from another
 * branch goes through this same parser: two parsers for one artifact is how
 * the board and the state check start to disagree about what it says.
 */
export function parseInitiative(
  content: string,
  filePath: string,
  stem: string
): InitiativeEntry | null {
  const fm = parseFrontmatter(content);
  if (!fm || !fm.id) return null;

  const dependsOn = Array.isArray(fm['depends-on'])
    ? (fm['depends-on'] as string[])
    : [];
  const owner = typeof fm.owner === 'string' ? fm.owner.trim() : '';

  return {
    id: fm.id as string,
    status: (fm.status as string) || 'active',
    ...(typeof fm.state === 'string' ? { state: fm.state } : {}),
    ...(owner.length > 0 ? { owner } : {}),
    ...(fm.created === undefined ? {} : { created: String(fm.created) }),
    ...(fm.completed === undefined ? {} : { completed: String(fm.completed) }),
    dependsOn,
    milestones: parseMilestones(content),
    orphanedMilestones: parseOrphanedMilestones(content),
    ...(parseAttestation(content) === undefined ? {} : { attestation: parseAttestation(content) }),
    driverSpecs: parseMembership(content, 'Driver Specs'),
    decisions: parseMembership(content, 'ADRs'),
    path: filePath,
    stem,
  };
}

/**
 * Reads every initiative, sorted by filename for a stable order.
 *
 * A file with no `id` is skipped rather than failing the read: an initiatives
 * directory may hold a note, and one unparseable file must not blind the
 * board to every other.
 */
export function readInitiatives(opensprintDir: string): InitiativeEntry[] {
  const dir = path.join(opensprintDir, 'initiatives');
  if (!fs.existsSync(dir)) return [];

  const entries: InitiativeEntry[] = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(dir, file);
    const entry = parseInitiative(
      fs.readFileSync(filePath, 'utf-8'),
      filePath,
      file.slice(0, -'.md'.length)
    );
    if (entry !== null) entries.push(entry);
  }
  return entries;
}

/**
 * Resolves an initiative by `id` first, then by filename stem.
 *
 * Id before filename is what lets DEC-036 date-prefix these files without
 * touching a single skill: every one of them constructs
 * `initiatives/<name>.md` today, and resolving by frontmatter makes the
 * filename a view, exactly as it already is for driver-specs and decisions.
 *
 * A duplicate id returns the first in directory order and warns, rather than
 * silently shadowing. A registry would be a stronger guarantee and
 * DS-PARALLEL-EXEC makes one impossible across worktrees.
 */
export function resolveInitiative(
  opensprintDir: string,
  nameOrId: string
): InitiativeEntry | null {
  const all = readInitiatives(opensprintDir);

  const byId = all.filter((entry) => entry.id === nameOrId);
  if (byId.length > 1) {
    console.warn(
      `More than one initiative declares id '${nameOrId}': ` +
        `${byId.map((e) => e.stem).join(', ')}. Using the first.`
    );
  }
  if (byId.length > 0) return byId[0];

  return all.find((entry) => entry.stem === nameOrId) ?? null;
}

/**
 * The states an initiative may declare, in lifecycle order.
 *
 * DS-PROGRESSIVE-CRYSTALLIZATION makes an initiative's state how far down
 * OGSM it has crystallized: Objective and Goal at exploration, Strategy and
 * the bar at proposal, posture and evidence at attestation. The vocabulary is
 * fixed in code rather than configured per project — DS-SQUAD-HATS's
 * reasoning about hats does not transfer, because a hat is a property of the
 * product while a lifecycle stage is a property of the method, and a state
 * machine whose vocabulary varies cannot be checked.
 *
 * `declined` sits at the end as a terminal state rather than a stage
 * (DEC-035): a backlog without an exit becomes a graveyard.
 *
 * `ready-for-attestation` is the handoff (DEC-STATE-MACHINE). Every
 * milestone is done and nothing has been judged — the one moment a change
 * stops being dev's and becomes product and maintainer's. DS-HATS-AS-CONTEXT
 * makes that the same engineer, so without a state marking it the handoff
 * happens silently or not at all.
 */
export const INITIATIVE_STATES = [
  'exploring',
  'proposed',
  'building',
  'ready-for-attestation',
  'attested',
  'completed',
  'declined',
] as const;

export type InitiativeState = (typeof INITIATIVE_STATES)[number];

/**
 * The states in which a card must name an owner.
 *
 * Work in flight — building, waiting at the handoff, attested but not yet
 * closed. A backlog item nobody has picked up is unowned by definition, and a
 * proposal may wait for whoever starts it; neither is a problem.
 */
export const OWNED_STATES: readonly InitiativeState[] = [
  'building',
  'ready-for-attestation',
  'attested',
];

/** States from which no further work is expected. */
export function isTerminalState(state: string): boolean {
  return state === 'completed' || state === 'declined';
}

/**
 * Position in the lifecycle, or -1 for a value outside the vocabulary.
 * `declined` is terminal rather than a stage, so it has no meaningful order.
 */
export function stateIndex(state: string): number {
  const index = INITIATIVE_STATES.indexOf(state as InitiativeState);
  return state === 'declined' ? -1 : index;
}

export type StateProblemKind = 'state-unknown' | 'state-contradicted' | 'state-undeclared';

/**
 * What git says about an initiative's branch.
 *
 * The third input to the state check (DEC-024). Declared state and filled
 * cells can agree with each other and both be wrong about reality — an
 * initiative whose work merged weeks ago but still says `building` is the
 * dangling case this exists to catch, and it was the original motivation:
 * a fully implemented PR merging while the initiative was never closed.
 */
export interface InitiativeGitState {
  /** Whether `opsp/<id>` exists as a ref at all. */
  branchExists: boolean;
  /** Whether that branch has been merged into the trunk. */
  merged: boolean;
}

export interface StateProblem {
  initiative: string;
  kind: StateProblemKind;
  detail: string;
}

/**
 * Reports where an initiative's declared state is impossible given its
 * content.
 *
 * Deliberately not a derived state compared for equality. DEC-024 rejected
 * full derivation one layer up for being brittle, and the same applies here:
 * an initiative legitimately sits between states, with milestones delivered
 * out of order or a proposal whose driver-specs are still forming. So the
 * question is narrower — is the declared state *impossible*? — which reports
 * the drift worth reporting and stays quiet about the rest.
 */
export function checkInitiativeState(
  entry: InitiativeEntry,
  git?: InitiativeGitState
): StateProblem[] {
  const problems: StateProblem[] = [];
  const { state, id } = entry;

  if (state === undefined) {
    // A resolved initiative is silent. Reporting one forever is how a check
    // trains the operator to ignore it — the same failure DEC-035 avoids for
    // declined candidates.
    if (entry.status !== 'completed' && entry.status !== 'declined') {
      problems.push({
        initiative: id,
        kind: 'state-undeclared',
        detail: `Active but declares no state, so it cannot be placed on a board. Accepted: ${INITIATIVE_STATES.join(', ')}.`,
      });
    }
    return problems;
  }

  if (!INITIATIVE_STATES.includes(state as InitiativeState)) {
    problems.push({
      initiative: id,
      kind: 'state-unknown',
      detail: `Declares state '${state}'. Accepted: ${INITIATIVE_STATES.join(', ')}.`,
    });
    return problems;
  }

  // A candidate dropped before any work is exactly the case where content and
  // state look contradictory and are not.
  if (state === 'declined') return problems;

  // Superseded milestones are neither done nor outstanding, so they must not
  // hold an initiative open.
  const live = entry.milestones.filter((m) => !m.superseded);
  const total = live.length;
  const done = live.filter((m) => m.done).length;
  const claims =
    entry.driverSpecs.length > 0 || entry.decisions.length > 0 || total > 0;

  const contradiction = (detail: string) =>
    problems.push({ initiative: id, kind: 'state-contradicted', detail });

  if (state === 'exploring' && done > 0) {
    contradiction(`Declares 'exploring' but ${done} milestone(s) are already done.`);
  }

  // The same contradiction one state further along, and the one that went
  // unreported longest: every initiative in this repository sat at 'proposed'
  // while its milestones closed, because nothing advanced it (DEC-STATE-MACHINE).
  if (state === 'proposed' && done > 0) {
    contradiction(
      `Declares 'proposed' but ${done} milestone(s) are already done. ` +
        `/opsp:apply advances to 'building' when the first milestone starts.`
    );
  }

  // The handoff that did not happen. Work is finished and the initiative
  // still claims to be in flight, so nobody has been told to pick up a
  // different hat.
  if (state === 'building' && total > 0 && done === total) {
    contradiction(
      `Declares 'building' but all ${total} milestone(s) are done. ` +
        `/opsp:apply advances to 'ready-for-attestation' when the last one closes.`
    );
  }

  // attested and completed are not distinguished from one another here:
  // nothing in the content separates "every milestone done" from "every bar
  // attested" until /opsp:attest exists.
  if (
    (state === 'ready-for-attestation' || state === 'attested' || state === 'completed') &&
    total > 0 &&
    done < total
  ) {
    contradiction(`Declares '${state}' but ${total - done} of ${total} milestone(s) are outstanding.`);
  }

  if (stateIndex(state) >= stateIndex('proposed') && !claims) {
    contradiction(
      `Declares '${state}' but claims no driver-specs, decisions or milestones — nothing was proposed.`
    );
  }

  if (state === 'building' && total === 0) {
    contradiction(`Declares 'building' but has no milestones.`);
  }

  if (state === 'ready-for-attestation' && total === 0) {
    contradiction(`Declares 'ready-for-attestation' but has no milestones — nothing was built.`);
  }

  // ── git, the third input (DEC-024)
  //
  // Reported only where git actually knows something. A caller that supplies
  // nothing sees exactly the checks it saw before.
  if (git !== undefined && git.branchExists && git.merged) {
    if (stateIndex(state) >= 0 && stateIndex(state) < stateIndex('attested')) {
      contradiction(
        `Declares '${state}', but opsp/${id} has merged. Work landed and the initiative was never closed.`
      );
    }
  }

  return problems;
}
