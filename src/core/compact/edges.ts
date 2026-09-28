/**
 * Compact — driver-spec edges
 *
 * The decision layer has always been a graph: every ADR carries `depends-on`.
 * The driver-spec layer has not, which is why DECISION-MAP renders
 * driver-specs as independent roots — nothing records a relationship between
 * them, and no project can answer which constraint exists because of which.
 *
 * These edges are validated, not constrained. Existence, record type and
 * acyclicity are mechanical and catch real mistakes. Whether an edge respects
 * a causal ordering is not checked: no project has recorded one yet, and a
 * rule that rejects a legitimate arrangement on day one teaches people to
 * stop recording edges.
 */

import type { SourcedDriverSpec, SourcedDecision } from './records.js';

export const EDGE_PROBLEM_KINDS = ['dangling', 'points-at-decision', 'cycle'] as const;
export type EdgeProblemKind = (typeof EDGE_PROBLEM_KINDS)[number];

export interface EdgeProblem {
  kind: EdgeProblemKind;
  /** The driver-spec carrying the offending edge, or a member of the cycle. */
  record: string;
  /** The id it points at; for a cycle, the records forming it. */
  target?: string;
  cycle?: string[];
  detail: string;
}

export interface EdgeValidation {
  problems: EdgeProblem[];
  /** Edges that survived validation, by driver-spec id. */
  edges: Map<string, string[]>;
}

/**
 * Validates the driver-spec graph.
 *
 * A record involved in a cycle loses its edges but is otherwise untouched, so
 * one bad loop does not stop the rest of the surrogate compiling — the stance
 * readProjectConfig already takes toward a malformed field.
 */
export function validateDriverSpecEdges(
  driverSpecs: readonly SourcedDriverSpec[],
  decisions: readonly SourcedDecision[]
): EdgeValidation {
  const specIds = new Set(driverSpecs.map((s) => s.id));
  const decisionIds = new Set(decisions.map((d) => d.id));
  const problems: EdgeProblem[] = [];
  const edges = new Map<string, string[]>();

  for (const spec of driverSpecs) {
    const kept: string[] = [];
    for (const target of spec.dependsOn) {
      if (specIds.has(target)) {
        kept.push(target);
      } else if (decisionIds.has(target)) {
        problems.push({
          kind: 'points-at-decision',
          record: spec.id,
          target,
          detail: `${spec.id} depends on ${target}, a decision record. A constraint does not exist because of a decision — the dependency runs the other way.`,
        });
      } else {
        problems.push({
          kind: 'dangling',
          record: spec.id,
          target,
          detail: `${spec.id} depends on ${target}, which is not a driver spec.`,
        });
      }
    }
    edges.set(spec.id, kept);
  }

  for (const cycle of findCycles(edges)) {
    for (const member of cycle) edges.set(member, []);
    problems.push({
      kind: 'cycle',
      record: cycle[0] as string,
      cycle,
      detail: `Cycle among driver specs: ${cycle.join(' -> ')} -> ${cycle[0]}. Their edges are ignored.`,
    });
  }

  return { problems, edges };
}

/** Every simple cycle, found by depth-first search over the edge map. */
function findCycles(edges: ReadonlyMap<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const seen = new Set<string>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  const visit = (id: string): void => {
    if (onStack.has(id)) {
      const start = stack.indexOf(id);
      if (start >= 0) cycles.push(stack.slice(start));
      return;
    }
    if (seen.has(id)) return;
    seen.add(id);
    stack.push(id);
    onStack.add(id);
    for (const next of edges.get(id) ?? []) visit(next);
    stack.pop();
    onStack.delete(id);
  };

  for (const id of edges.keys()) visit(id);
  return cycles;
}
