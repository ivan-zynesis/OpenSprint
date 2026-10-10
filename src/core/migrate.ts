/**
 * Migration — what the current shapes can no longer select
 *
 * A project's records are written against the hat shapes of the day. When
 * those shapes move — a hat gains objectives, a role vocabulary changes — the
 * records do not become wrong. They become **misfiled**, and a misfiled record
 * is invisible rather than broken, which is worse (DS-BACKWARD-COMPAT makes it
 * parse; nothing makes it appear).
 *
 * This is deliberately not /opsp:rebuild-assess (DEC-MIGRATE-SEPARATE-TOOL).
 * That asks whether a decision still holds now the *world* moved. This asks
 * where a record belongs now the *schema* moved.
 *
 * Detection lives here as data so it can be checked without a model. Choosing
 * which of seven objectives a bar belongs to is judgement, and belongs to the
 * workflow.
 */

import {
  resolveHatRegistry,
  resolveHatSections,
  resolveHatRoles,
  resolveHatObjectives,
} from './hats.js';
import { readSourcedDriverSpecs, readSourcedDecisions } from './compact/records.js';
import { groupRecordsByHat, resolveSectionInputs } from './compact/sections.js';
import { parseMeasureAnatomy } from './compact/measures.js';

export const MIGRATION_KINDS = [
  /** A role no hat of the record accepts any more. */
  'role-not-accepted',
  /** Every section that could take it filters on `objective`, and it declares none. */
  'objective-missing',
  /** A `role: bar` record predating the measure-anatomy sub-block form. */
  'bar-not-in-anatomy',
  /** A hat holding records where every section selects nothing. */
  'hat-entirely-empty',
] as const;

export type MigrationKind = (typeof MIGRATION_KINDS)[number];

export interface Migration {
  kind: MigrationKind;
  /** The record, or the hat for `hat-entirely-empty`. */
  subject: string;
  hats: string[];
  detail: string;
  /** What the operator will be asked to choose between, where there is a closed set. */
  candidates?: string[];
}

function isActive(status: string): boolean {
  return status === 'active' || status === 'accepted';
}

/**
 * Finds every record the current shapes cannot select, and every hat that has
 * stopped selecting anything.
 *
 * Returns data rather than printing, so the detection is testable without a
 * model and reusable by anything that wants to count or surface it.
 */
export function findMigrations(projectRoot: string, opensprintDir: string): Migration[] {
  const registry = resolveHatRegistry(projectRoot);
  const driverSpecs = readSourcedDriverSpecs(opensprintDir).filter((r) => isActive(r.status));
  const decisions = readSourcedDecisions(opensprintDir).filter((r) => isActive(r.status));
  const grouped = groupRecordsByHat(driverSpecs, decisions, registry);

  const found: Migration[] = [];

  for (const spec of driverSpecs) {
    const hats = spec.hats ?? [];
    const roles = spec.role ?? [];

    // ── a role the hats have stopped accepting
    const accepted = [...new Set(hats.flatMap((h) => [...resolveHatRoles(projectRoot, h)]))];
    if (accepted.length > 0) {
      const orphaned = roles.filter((role) => !accepted.includes(role));
      for (const role of orphaned) {
        found.push({
          kind: 'role-not-accepted',
          subject: spec.id,
          hats,
          detail: `Carries role '${role}', which ${hats.join(' and ')} no longer accepts.`,
          candidates: accepted.sort(),
        });
      }
    }

    // ── a record no section can select, because they all filter on objective
    if (spec.objective === undefined) {
      for (const hat of hats) {
        const sections = resolveHatSections(projectRoot, hat);
        if (sections.length === 0) continue;
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
        const objectives = [...resolveHatObjectives(projectRoot, hat)];
        found.push({
          kind: 'objective-missing',
          subject: spec.id,
          hats,
          detail: `Declares no objective, and every section of '${hat}' that could take it filters on one.`,
          ...(objectives.length > 0 ? { candidates: objectives } : {}),
        });
      }
    }

    // ── a bar predating the sub-block form
    if (roles.includes('bar') && parseMeasureAnatomy(spec.content).bar === undefined) {
      found.push({
        kind: 'bar-not-in-anatomy',
        subject: spec.id,
        hats,
        detail:
          "Carries role 'bar' with no `### Bar` sub-block. The bar belongs under `## Measures` as part of the measure anatomy.",
      });
    }
  }

  // ── a hat that has stopped selecting anything
  //
  // The only finding that is a property of the view rather than of a record,
  // and the one that catches a shape change nobody noticed.
  for (const hat of registry) {
    const held =
      (grouped.driverSpecsByHat.get(hat)?.length ?? 0) +
      (grouped.decisionsByHat.get(hat)?.length ?? 0);
    if (held === 0) continue;

    const sections = resolveHatSections(projectRoot, hat).filter((s) => s.inputs !== 'none');
    if (sections.length === 0) continue;
    const selectsAnything = sections.some(
      (section) => resolveSectionInputs(hat, section, grouped).length > 0
    );
    if (selectsAnything) continue;

    found.push({
      kind: 'hat-entirely-empty',
      subject: hat,
      hats: [hat],
      detail: `Holds ${held} record(s), and every section selects none of them. The shape likely moved underneath them.`,
    });
  }

  return found;
}
