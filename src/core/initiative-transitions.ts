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
 * line — `declined` revives, and work falls back a rung whenever a rung above
 * it turns out to be wrong — and a rule derived from an index cannot express
 * that without exceptions that then have to be remembered.
 *
 * Two entries may share a `from` and a `to` and differ in `by`, and a refusal
 * naming both is more use than one naming neither (DEC-ESCALATION-LADDER).
 */
export interface Transition {
  from: InitiativeState;
  to: InitiativeState;
  /** The workflow that performs it, for the refusal message. */
  by: string;
  /** When it fires, in the words the operator would use. */
  when: string;
  /**
   * The hat this move must be made wearing.
   *
   * Declared rather than derived from the state, because a state does not
   * have one owner — `ready-for-attestation` is dev's to leave and product's
   * to pick up, and which hat you need depends on which way you are going.
   */
  hat: readonly string[];
  /**
   * True where making this move means putting a different hat down first.
   *
   * `DS-HATS-AS-CONTEXT` makes most hats the same engineer, so a handoff is
   * invisible unless it is declared. `opensprint advance` requires `--hat` on
   * these, which is the cheapest enforceable version of "change context"
   * (DEC-HAT-HANDOFFS).
   */
  handoff: boolean;
}

export const TRANSITIONS: readonly Transition[] = [
  {
    from: 'exploring',
    to: 'proposed',
    by: '/opsp:propose',
    when: 'the driver-specs, ADRs, milestones and the bar are written',
    hat: ['product', 'maintainer', 'dev', 'devops'],
    handoff: false,
  },
  {
    from: 'exploring',
    to: 'declined',
    by: '/opsp:triage',
    when: 'the idea is dropped, with the reason recorded',
    hat: ['product', 'maintainer'],
    handoff: false,
  },
  {
    from: 'declined',
    to: 'exploring',
    by: '/opsp:triage',
    when: 'a declined idea is revived, keeping its history',
    hat: ['product', 'maintainer'],
    handoff: false,
  },
  {
    from: 'proposed',
    to: 'building',
    by: '/opsp:apply',
    when: 'the first milestone starts',
    hat: ['dev', 'devops'],
    handoff: true,
  },
  {
    from: 'building',
    to: READY_FOR_ATTESTATION,
    by: '/opsp:apply',
    when: 'the last milestone closes — the dev hat is set down',
    hat: ['dev', 'devops'],
    handoff: true,
  },
  {
    from: 'building',
    to: 'proposed',
    by: '/opsp:repropose',
    when: 'the strategy does not survive contact — the goal holds, what was decided does not',
    hat: ['product', 'maintainer'],
    handoff: true,
  },
  {
    from: 'building',
    to: 'exploring',
    by: '/opsp:reexplore',
    when: 'the goal itself is in question',
    hat: ['product', 'maintainer'],
    handoff: true,
  },
  {
    from: READY_FOR_ATTESTATION,
    to: 'building',
    by: '/opsp:attest',
    when: 'a change is requested — everything holds, the work was not finished',
    hat: ['product', 'maintainer'],
    handoff: false,
  },
  {
    from: READY_FOR_ATTESTATION,
    to: 'proposed',
    by: '/opsp:repropose',
    when: 'the strategy must be restated, and its measures with it',
    hat: ['product', 'maintainer'],
    handoff: false,
  },
  {
    from: READY_FOR_ATTESTATION,
    to: 'exploring',
    by: '/opsp:reexplore',
    when: 'the goal no longer holds — back to thinking, writing nothing',
    hat: ['product', 'maintainer'],
    handoff: false,
  },
  {
    from: READY_FOR_ATTESTATION,
    to: 'attested',
    by: '/opsp:attest',
    when: 'every bar carries a posture, and the change questions are answered',
    hat: ['product', 'maintainer'],
    handoff: false,
  },
  {
    from: 'attested',
    to: 'completed',
    by: '/opsp:archive',
    when: 'the views are compiled and the branch merges',
    hat: ['product', 'maintainer', 'dev', 'devops'],
    handoff: true,
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
 * The transition a move corresponds to, or null where it is not one.
 *
 * Several transitions may share `from` and `to` and differ in `by`. Where
 * they do, the caller names the workflow; where it does not, the first is
 * returned, because what the caller needs from it — the hat, and whether it
 * is a handoff — is the same for both.
 */
export function transitionFor(
  from: string | undefined,
  to: string,
  by?: string
): Transition | null {
  const matches = nextStates(from).filter((t) => t.to === to);
  if (matches.length === 0) return null;
  if (by === undefined) return matches[0];
  return matches.find((t) => t.by === by) ?? matches[0];
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
