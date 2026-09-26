/**
 * Compact — open loop derivation
 *
 * DS-LOOP-CLOSURE needs four arrows: constraint → decision → implementation →
 * rule, and back. The first two are recorded. These are the ones nothing was
 * watching.
 *
 * Every loop here is a graph or index query. Nothing reads record prose and
 * nothing guesses, which is what makes DEC-007's "do not invent a gap"
 * enforceable rather than aspirational — an invented gap costs someone a
 * triage conversation about nothing.
 */

import type { SourcedDriverSpec, SourcedDecision } from './records.js';
import type { RuleIndex } from './rules.js';

export const OPEN_LOOP_KINDS = [
  'constraint-unanswered',
  'constraint-unasserted',
  'decision-unguarded',
  'rule-guards-dead-record',
  'decision-on-superseded',
] as const;

export type OpenLoopKind = (typeof OPEN_LOOP_KINDS)[number];

export interface OpenLoop {
  kind: OpenLoopKind;
  /** The record the loop is about. */
  record: string;
  /** Hats accountable for it; empty when the record is unassigned. */
  hats: string[];
  /** One line stating what is missing. */
  detail: string;
  /** The rule file involved, for rule-guards-dead-record. */
  rule?: string;
}

function isActive(status: string): boolean {
  return status === 'active' || status === 'accepted';
}

function isDead(status: string): boolean {
  return status === 'superseded' || status === 'deprecated';
}

/**
 * Derives every open loop from the records, the decision graph and the rule
 * index.
 *
 * Constraint coverage is deliberately transitive: a driver-spec counts as
 * asserted when the decisions answering it are cited, not when a rule names
 * the driver-spec itself. Measured on cashier, only 4 of 17 driver-specs are
 * cited by a test directly, yet DS-MULTI-TENANT-ISOLATION is fully guarded —
 * its tests cite the decisions that answer it. Requiring direct citation
 * would report 13 gaps that are not gaps.
 */
export function deriveOpenLoops(
  driverSpecs: readonly SourcedDriverSpec[],
  decisions: readonly SourcedDecision[],
  index: RuleIndex
): OpenLoop[] {
  const loops: OpenLoop[] = [];
  const activeDecisions = decisions.filter((d) => isActive(d.status));
  const byId = new Map<string, { status: string; hats?: string[] }>();
  for (const r of [...driverSpecs, ...decisions]) byId.set(r.id, r);

  const cited = (id: string): string[] => index.byRecord.get(id) ?? [];

  // ── constraint → decision, and constraint → rule (transitively)
  for (const spec of driverSpecs) {
    if (!isActive(spec.status)) continue;
    const answering = activeDecisions.filter((d) => d.dependsOn.includes(spec.id));
    const hats = spec.hats ?? [];

    if (answering.length === 0) {
      loops.push({
        kind: 'constraint-unanswered',
        record: spec.id,
        hats,
        detail: 'No active decision answers this constraint.',
      });
      continue;
    }

    const guarded = answering.some((d) => cited(d.id).length > 0);
    if (!guarded) {
      const names = answering.map((d) => d.id).join(', ');
      loops.push({
        kind: 'constraint-unasserted',
        record: spec.id,
        hats,
        detail: `Answered by ${names}, but no rule cites any of them.`,
      });
    }
  }

  // ── decision → rule
  for (const decision of activeDecisions) {
    if (cited(decision.id).length === 0) {
      loops.push({
        kind: 'decision-unguarded',
        record: decision.id,
        hats: decision.hats ?? [],
        detail: 'No rule cites this decision.',
      });
    }
  }

  // ── rule → a record that is no longer the answer
  for (const [rule, ids] of index.byRule) {
    for (const id of ids) {
      const record = byId.get(id);
      if (record && isDead(record.status)) {
        loops.push({
          kind: 'rule-guards-dead-record',
          record: id,
          hats: record.hats ?? [],
          detail: `Rule cites ${id}, whose status is ${record.status}.`,
          rule,
        });
      }
    }
  }

  // ── a decision still resting on something that was superseded beneath it
  for (const decision of activeDecisions) {
    const dead = decision.dependsOn.filter((id) => {
      const parent = byId.get(id);
      return parent !== undefined && isDead(parent.status);
    });
    if (dead.length > 0) {
      loops.push({
        kind: 'decision-on-superseded',
        record: decision.id,
        hats: decision.hats ?? [],
        detail: `Depends on ${dead.join(', ')}, which is no longer active. Re-evaluate with /opsp:rebuild-assess.`,
      });
    }
  }

  return loops;
}

/** Groups loops by hat. Loops on unassigned records collect under `null`. */
export function groupLoopsByHat(
  loops: readonly OpenLoop[],
  registry: readonly string[]
): Map<string | null, OpenLoop[]> {
  const out = new Map<string | null, OpenLoop[]>();
  for (const hat of registry) out.set(hat, []);
  out.set(null, []);

  for (const loop of loops) {
    if (loop.hats.length === 0) {
      out.get(null)!.push(loop);
      continue;
    }
    for (const hat of loop.hats) {
      if (!out.has(hat)) out.set(hat, []);
      out.get(hat)!.push(loop);
    }
  }
  return out;
}
