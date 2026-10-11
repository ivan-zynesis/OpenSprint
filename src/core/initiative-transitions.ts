/**
 * The initiative state machine — who may move a card, and when.
 *
 * `DEC-035` named the states and nothing moved between them. Two of six
 * transitions were implemented in prose, `proposed` was never written at all
 * because `/opsp:propose`'s frontmatter template omitted the field, and
 * `/opsp:archive` gated a merge on `attested` — a state nothing could
 * produce. Every initiative in this repository reached `building` by hand.
 *
 * A prose instruction saying "now set `state:`" is precisely what failed, so
 * the transitions live here as data and are applied by a command. A workflow
 * runs `opensprint advance`; it does not edit frontmatter and hope.
 */

import * as fs from 'node:fs';
import { INITIATIVE_STATES, type InitiativeState } from './initiatives.js';

/**
 * The handoff state: every milestone is done, nothing has been judged.
 *
 * It is not cosmetic. `DS-HATS-AS-CONTEXT` makes most hats the same engineer,
 * so the moment a change stops being `dev`'s and becomes `product` and
 * `maintainer`'s is invisible unless something marks it. `building` and
 * `attested` cannot mark it between them: the first says work is happening
 * and the second says judgement already happened, and the whole point is the
 * gap where neither is true and somebody must pick a different hat up.
 */
export const READY_FOR_ATTESTATION = 'ready-for-attestation' as const;

/**
 * Every legal move, with the tool that owns it and what it means.
 *
 * An explicit table rather than an ordering rule. The lifecycle is not a
 * line — `declined` revives, and `ready-for-attestation` falls back to
 * `building` when re-planning adds work — and a rule derived from an index
 * cannot express either without exceptions that then have to be remembered.
 */
export interface Transition {
  from: InitiativeState;
  to: InitiativeState;
  /** The workflow that performs it, for the refusal message. */
  by: string;
  /** When it fires, in the words the operator would use. */
  when: string;
}

export const TRANSITIONS: readonly Transition[] = [
  {
    from: 'exploring',
    to: 'proposed',
    by: '/opsp:propose',
    when: 'the driver-specs, ADRs, milestones and the bar are written',
  },
  {
    from: 'exploring',
    to: 'declined',
    by: '/opsp:triage',
    when: 'the idea is dropped, with the reason recorded',
  },
  {
    from: 'declined',
    to: 'exploring',
    by: '/opsp:triage',
    when: 'a declined idea is revived, keeping its history',
  },
  {
    from: 'proposed',
    to: 'building',
    by: '/opsp:apply',
    when: 'the first milestone starts',
  },
  {
    from: 'building',
    to: READY_FOR_ATTESTATION,
    by: '/opsp:apply',
    when: 'the last milestone closes — the dev hat is set down',
  },
  {
    from: READY_FOR_ATTESTATION,
    to: 'building',
    by: '/opsp:reexplore',
    when: 're-planning adds work that was not there',
  },
  {
    from: READY_FOR_ATTESTATION,
    to: 'attested',
    by: '/opsp:attest',
    when: 'every bar carries a posture, and the change questions are answered',
  },
  {
    from: 'attested',
    to: 'completed',
    by: '/opsp:archive',
    when: 'the views are compiled and the branch merges',
  },
];

export interface TransitionRefusal {
  /** Why this move is not allowed, in one line. */
  reason: string;
  /** Where the initiative can go from where it is. */
  legal: Transition[];
}

/**
 * Whether a move is legal, and why not when it is not.
 *
 * Returns null for a legal move. Refusing with the alternatives attached is
 * what makes the machine usable from a workflow: an agent that asked for the
 * wrong move is told which move it wanted.
 */
export function checkTransition(
  from: string | undefined,
  to: string
): TransitionRefusal | null {
  const legal = nextStates(from);

  if (!INITIATIVE_STATES.includes(to as InitiativeState)) {
    return {
      reason: `'${to}' is not a state. Accepted: ${INITIATIVE_STATES.join(', ')}.`,
      legal,
    };
  }

  // An initiative written before states existed, or by propose while its
  // template omitted the field. Setting one is a repair, not a move, so any
  // state is reachable — refusing would leave the record stuck forever.
  if (from === undefined) return null;

  if (from === to) {
    return { reason: `Already '${to}'.`, legal };
  }

  if (legal.some((t) => t.to === to)) return null;

  return {
    reason: `'${from}' does not move to '${to}'.`,
    legal,
  };
}

/**
 * Every state an initiative can reach from where it is.
 *
 * Takes a plain string, because a record may declare a state outside the
 * vocabulary — `state-unknown` reports that, and this returns nothing rather
 * than throwing on a record the tool is trying to help fix.
 */
export function nextStates(from: string | undefined): Transition[] {
  if (from === undefined) return [];
  return TRANSITIONS.filter((t) => t.from === from);
}

/**
 * Writes `state:` into an initiative's frontmatter, in place.
 *
 * Rewrites the one line, or inserts the field after `status:` where it is
 * absent — which is the common repair, since `/opsp:propose` wrote initiatives
 * without it. Nothing else in the file is touched: an initiative carries
 * prose a transition has no business rewriting.
 */
export function writeState(filePath: string, to: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match === null) {
    throw new Error(`${filePath} has no frontmatter to write a state into.`);
  }

  const body = match[1];
  const updated = /^state:.*$/m.test(body)
    ? body.replace(/^state:.*$/m, `state: ${to}`)
    : /^status:.*$/m.test(body)
      ? body.replace(/^(status:.*)$/m, `$1\nstate: ${to}`)
      : `${body}\nstate: ${to}`;

  fs.writeFileSync(filePath, content.replace(match[0], `---\n${updated}\n---`), 'utf-8');
}
