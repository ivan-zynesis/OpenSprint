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
import {
  hasMeasures,
  parseMeasureAnatomy,
  statesNeighbour,
  mitigatedBy,
  parsePosture,
  normalizeVerdict,
  verdictRequires,
  POSTURE_VERDICTS,
  evidenceReferences,
} from './measures.js';
import type { SectionDef } from './sections.js';
import type { InitiativeEntry } from '../initiatives.js';

export const OPEN_LOOP_KINDS = [
  'constraint-unanswered',
  'constraint-unasserted',
  'decision-unguarded',
  'rule-guards-dead-record',
  'decision-on-superseded',
  'record-unclassified',
  'constraint-unmeasurable',
  // The ex-post half of a measure (DS-MEASURE-ANATOMY). Everything above
  // this line is a property of the record graph; these three are the first
  // that are properties of a measure.
  'measure-unasserted',
  'measure-unexposed',
  'bar-without-neighbour',
  'record-without-objective',
  'strategy-unimplemented',
  'exposure-unmitigated',
  'measure-unattested',
  // An attestation that cites nothing addressable (DS-CI-ATTESTATION). It
  // sits with the measure loops rather than the change loops because it is a
  // property of one measure's evidence, not of the change as a whole.
  'evidence-unresolvable',
  // Properties of a *change* rather than of a record (DEC-042). They fire
  // only once an initiative claims to have been attested — asking who holds
  // a risk before anyone has judged it would be noise.
  'reversibility-unstated',
  'blast-radius-unstated',
  'raci-unassigned',
] as const;

/**
 * Roles that state a target, and therefore owe a measure.
 *
 * An objective is qualitative by definition and a strategy is an approach
 * rather than a target; demanding measures of either would train people to
 * write fake ones.
 */
export const MEASURABLE_ROLES = ['goal', 'bar'] as const;

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

// `hasMeasures` now lives in measures.ts, which owns the section and
// everything beneath it. Re-exported so existing importers are unaffected.
export { hasMeasures } from './measures.js';

function isDead(status: string): boolean {
  return status === 'superseded' || status === 'deprecated';
}

/**
 * Every driver-spec reachable from an active decision, transitively.
 *
 * Descent is transitive for the same reason constraint coverage is: a
 * strategy is frequently answered by a decision that is itself the parent of
 * the one doing the work, and requiring direct descent would report gaps
 * that are not gaps.
 *
 * Guards against a malformed `depends-on` cycle with a visited set, and a
 * dangling reference contributes nothing rather than failing the walk — the
 * same treatment defaultHatsForDecision gives the equivalent walk.
 */
function driverSpecsReachedByDecisions(
  driverSpecIds: ReadonlySet<string>,
  activeDecisions: readonly SourcedDecision[]
): Set<string> {
  const byDecision = new Map<string, readonly string[]>();
  for (const decision of activeDecisions) byDecision.set(decision.id, decision.dependsOn);

  const reached = new Set<string>();
  for (const decision of activeDecisions) {
    const seen = new Set<string>();
    const queue = [...decision.dependsOn];
    while (queue.length > 0) {
      const id = queue.shift() as string;
      if (seen.has(id)) continue;
      seen.add(id);

      if (driverSpecIds.has(id)) {
        reached.add(id);
        continue; // driver specs are roots
      }
      const parents = byDecision.get(id);
      if (parents) queue.push(...parents);
    }
  }
  return reached;
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
  index: RuleIndex,
  rolesFor: (hat: string) => readonly string[] = () => [],
  // Defaults to none, so a caller that does not supply sections sees no
  // record-without-objective loops rather than spurious ones.
  sectionsFor: (hat: string) => readonly SectionDef[] = () => [],
  // Defaults to none, so a caller unaware of initiatives sees no attestation
  // loops rather than spurious ones.
  initiatives: readonly InitiativeEntry[] = [],
  // Whether a repository-relative path exists. Defaults to "yes" — a caller
  // that cannot answer must not manufacture a gap (DEC-007), and the same
  // reasoning gives `readInitiativeGitState` its `undefined`.
  resolvesLocally: (target: string) => boolean = () => true
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

  // ── a driver-spec in a role-declaring hat that carries no role
  //
  // Fires only where a hat declares roles. Otherwise a project not using them
  // would see its entire surrogate reported as a backlog on first run, which
  // is noise rather than a gap.
  //
  // Decisions are exempt (DEC-028). Role classification is a driver-spec
  // concept: product and maintainer run OGSM, dev and devops deliberately do
  // not, so a decision has nothing to classify against. Before this, an ADR
  // declaring `maintainer` as a cc hat harvested as unclassified the moment
  // it was written.
  for (const record of driverSpecs) {
    if (!isActive(record.status)) continue;
    if (record.role && record.role.length > 0) continue;
    const hats = record.hats ?? [];
    const declaring = hats.filter((h) => rolesFor(h).length > 0);
    if (declaring.length === 0) continue;
    const accepted = [...new Set(declaring.flatMap((h) => [...rolesFor(h)]))].sort();
    loops.push({
      kind: 'record-unclassified',
      record: record.id,
      hats,
      detail: `No role declared. ${declaring.join(', ')} accepts: ${accepted.join(', ')}.`,
    });
  }

  // ── a strategy nobody implemented (DS-STRATEGY-ALTITUDE, DEC-020)
  //
  // constraint-unanswered is satisfied by any child decision, even one
  // implementing something else, and fires on every driver-spec so a
  // strategy is lost among goals and objectives. Only a strategy promises an
  // approach that something should build.
  //
  // No hat is named here. DEC-028 makes every decision owned by dev or
  // devops, so any descending decision is an implementing one — and
  // DS-SQUAD-HATS makes the hat set a property of the project, so
  // hardcoding `maintainer` would exempt a project's own hats.
  const driverSpecIds = new Set(driverSpecs.map((spec) => spec.id));
  const implemented = driverSpecsReachedByDecisions(driverSpecIds, activeDecisions);
  for (const spec of driverSpecs) {
    if (!isActive(spec.status)) continue;
    if (!(spec.role ?? []).includes('strategy')) continue;
    if (implemented.has(spec.id)) continue;
    loops.push({
      kind: 'strategy-unimplemented',
      record: spec.id,
      hats: spec.hats ?? [],
      detail: 'States an approach with no decision descending from it. Intent nobody built.',
    });
  }

  // ── a record its hat's sections cannot select
  //
  // Where every section of a hat filters on `objective`, a record declaring
  // none is invisible in that hat's view — not reported, not rendered,
  // silently dropped. This was found the hard way: five records cc'd to
  // `maintainer` with valid roles vanished from the grid because they
  // carried no objective.
  //
  // Fires only where the hat leaves no unfiltered section to catch them, so
  // a hat with a general section (as `maintainer` has in `posture`) only
  // reports records that section's roles do not accept either.
  for (const record of driverSpecs) {
    if (!isActive(record.status)) continue;
    if (record.objective !== undefined) continue;
    const roles = record.role ?? [];

    for (const hat of record.hats ?? []) {
      const sections = sectionsFor(hat);
      if (sections.length === 0) continue;
      // A section with no objective filter can still take this record,
      // provided its roles accept it.
      //
      // A section taking no records cannot make a record reachable. `open-loops`
      // declares `inputs: 'none'` and no roles, and treating "no roles" as
      // "takes anything" made every record look selectable — which is why this
      // check silently never fired in production.
      const reachable = sections.some(
        (section) =>
          section.inputs !== 'none' &&
          section.objective === undefined &&
          (section.roles === undefined ||
            section.roles.length === 0 ||
            roles.some((role) => section.roles?.includes(role)))
      );
      if (reachable) continue;
      loops.push({
        kind: 'record-without-objective',
        record: record.id,
        hats: record.hats ?? [],
        detail: `No objective declared, and every section of '${hat}' that could take it filters on one. The record is invisible in that view.`,
      });
    }
  }

  // ── the ex-post half of a measure (DS-MEASURE-ANATOMY)
  //
  // These three ask about an outcome rather than about the record graph.
  // Nothing before this point could: the harvest could report that a
  // constraint had no measure, never that a measure went unanswered.
  //
  // Presence is the test, never adequacy. Whether evidence is *good*
  // evidence is /opsp:attest's judgement, and DEC-032 governs what it must
  // reference; code can only check that something is there.
  for (const record of driverSpecs) {
    if (!isActive(record.status)) continue;
    if (!hasMeasures(record.content)) continue;

    const anatomy = parseMeasureAnatomy(record.content);
    const hats = record.hats ?? [];

    // DEC-041: posture is the judgement, and evidence and exposure are what
    // that judgement requires. They were never peers — evidence is cited when
    // claiming the bar held, exposure is recorded when it did not. Demanding
    // both regardless reported a passing measure as deficient for not
    // documenting a failure that did not happen.
    const stated = anatomy.posture === undefined ? undefined : parsePosture(anatomy.posture).verdict;
    const verdict = normalizeVerdict(stated);

    if (anatomy.posture === undefined) {
      // "Nobody has judged this" is a different and more urgent finding than
      // "this lacks evidence", and the old rules could not make it.
      loops.push({
        kind: 'measure-unattested',
        record: record.id,
        hats,
        detail: 'States a measure with no `### Posture`. Nobody has judged whether the bar was met.',
      });
    } else if (verdict === null) {
      loops.push({
        kind: 'measure-unattested',
        record: record.id,
        hats,
        detail:
          `States a posture with an unrecognised verdict${stated ? ` ('${stated}')` : ''}. ` +
          `Accepted: ${POSTURE_VERDICTS.join(', ')}.`,
      });
    } else if (verdictRequires(verdict) === 'evidence' && anatomy.evidence === undefined) {
      loops.push({
        kind: 'measure-unasserted',
        record: record.id,
        hats,
        detail: `Claims the bar was '${verdict}' with no \`### Evidence\`. A claim of success nothing asserts is an opinion.`,
      });
    } else if (verdictRequires(verdict) === 'exposure' && anatomy.exposure === undefined) {
      loops.push({
        kind: 'measure-unexposed',
        record: record.id,
        hats,
        detail: `Records a verdict of '${verdict}' with no \`### Exposure\`. Nothing says what remains at risk.`,
      });
    }

    // DS-CI-ATTESTATION: evidence is an artifact the pipeline produced and
    // the pull request can address. An `### Evidence` block of prose claims
    // the bar was met and leaves nobody able to check, which is the failure
    // the attested authority exists to rule out.
    if (anatomy.evidence !== undefined) {
      const refs = evidenceReferences(anatomy.evidence);
      if (refs.length === 0) {
        loops.push({
          kind: 'evidence-unresolvable',
          record: record.id,
          hats,
          detail:
            'The `### Evidence` block names no addressable artifact. Write a markdown link ' +
            'or a backticked repository-relative path; prose describing a belief is not evidence.',
        });
      } else {
        const missing = refs
          .filter((ref) => ref.form === 'local' && !resolvesLocally(ref.target))
          .map((ref) => ref.target);
        if (missing.length > 0) {
          loops.push({
            kind: 'evidence-unresolvable',
            record: record.id,
            hats,
            detail: `Cites ${missing.map((t) => `\`${t}\``).join(', ')}, which is not in the tree.`,
          });
        }
      }
    }

    // DS-FORWARD-CLOSURE: an exposure pointing at nothing is a confession;
    // one pointing at planned work is a managed risk. The loop closes
    // forward, because an exposure found at attestation has no backward
    // target — nothing went wrong upstream.
    if (anatomy.exposure !== undefined && mitigatedBy(anatomy.exposure) === null) {
      loops.push({
        kind: 'exposure-unmitigated',
        record: record.id,
        hats,
        detail: 'States an exposure with no `mitigated-by`. A risk with no planned work is a confession.',
      });
    }

    // A value saying "unrecorded" satisfies this: stating the gap is an
    // honest answer, and punishing it would only train the line away.
    if (anatomy.bar !== undefined && !statesNeighbour(anatomy.bar)) {
      loops.push({
        kind: 'bar-without-neighbour',
        record: record.id,
        hats,
        detail:
          'States a bar with no `neighbour`. The position not taken is what makes a future trade arguable rather than re-litigated.',
      });
    }
  }

  // ── a target with no way to tell whether it is met
  const measurable = new Set<string>(MEASURABLE_ROLES);
  for (const record of driverSpecs) {
    if (!isActive(record.status)) continue;
    // Any measurable role qualifies the record, and it is reported once —
    // a record stating both a goal and its strategy has one set of measures.
    if (!record.role || !record.role.some((role) => measurable.has(role))) continue;
    if (hasMeasures(record.content)) continue;
    loops.push({
      kind: 'constraint-unmeasurable',
      record: record.id,
      hats: record.hats ?? [],
      detail: `Stated as a ${record.role} but carries no populated '## Measures' section — nothing says how it is known to be met.`,
    });
  }

  // ── what an attestation left unanswered (DEC-042)
  //
  // Scoped to initiatives that claim to have been attested. Before that
  // point these questions have no answer yet, and reporting them would train
  // the operator to ignore the loop that matters once they do.
  for (const initiative of initiatives) {
    const claimsAttested = initiative.state === 'attested' || initiative.state === 'completed';
    if (!claimsAttested) continue;

    const attestation = initiative.attestation;

    if (attestation?.door === undefined) {
      loops.push({
        kind: 'reversibility-unstated',
        record: initiative.id,
        hats: [],
        detail: 'Attested without saying whether this is a one-way or two-way door.',
      });
    }

    if (attestation?.blastRadius === undefined) {
      loops.push({
        kind: 'blast-radius-unstated',
        record: initiative.id,
        hats: [],
        detail: 'Attested without recording what the change affects.',
      });
    }

    const rows = attestation?.raci ?? [];
    if (rows.length === 0) {
      loops.push({
        kind: 'raci-unassigned',
        record: initiative.id,
        hats: [],
        detail:
          'Attested with no RACI at all. Nothing records who holds this once the pull request closes.',
      });
    } else {
      // A row naming a system is a complete answer — RACI is the residue
      // after automation, so only the manual rows owe names.
      const unowned = rows.filter(
        (row) => !row.automated && (row.responsible === undefined || row.accountable === undefined)
      );
      for (const row of unowned) {
        const missing = [
          row.responsible === undefined ? 'Responsible' : null,
          row.accountable === undefined ? 'Accountable' : null,
        ].filter((m): m is string => m !== null);
        loops.push({
          kind: 'raci-unassigned',
          record: initiative.id,
          hats: [],
          detail: `'${row.concern}' is not handled by a system and names no ${missing.join(' or ')}.`,
        });
      }
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
