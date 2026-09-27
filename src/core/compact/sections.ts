/**
 * Compact — sections and grouping
 *
 * A compiled hat view is divided into sections, each with its own input set,
 * so that a change to one kind of record does not restage the others
 * (DEC-010). A new ADR restages a hat's `decisions` and leaves its
 * `constraints` alone.
 */

import type { DriverSpecEntry, DecisionEntry } from '../decision-map.js';

/**
 * What kind of record feeds a section.
 *
 * Declaring this per section is what preserves DEC-010's granularity: a
 * section taking `decisions` restages when an ADR moves, while one taking
 * `driver-specs` beside it stays fresh. A section list without input kinds
 * would force every section to take everything and collapse that.
 */
export const SECTION_INPUT_KINDS = [
  'all',
  'driver-specs',
  'decisions',
  'none',
] as const;

export type SectionInputKind = (typeof SECTION_INPUT_KINDS)[number];

/**
 * The named set meaning "the project's rule files".
 *
 * A named set rather than a repeated glob list: `open-loops` derives from the
 * rule index, and the globs are already project configuration. Repeating them
 * would let the two drift, so a project changing `ruleGlobs` would silently
 * stop restaging its open loops.
 */
export const OBSERVES_RULES = 'rules' as const;

/**
 * A section of a hat's view: a name, what records feed it, and what it
 * observes of the system.
 *
 * `observes` is independent of `inputs` because code is orthogonal to record
 * kind — a tech-stack section may want a hat's decisions *and* the manifest
 * files that show what is actually installed.
 */
export interface SectionDef {
  name: string;
  inputs: SectionInputKind;
  observes?: typeof OBSERVES_RULES | string[];
}

/**
 * The sections a hat renders when it declares none of its own.
 *
 * `charter` takes every record the hat owns, because which of them describe
 * the operating model is a judgement the renderer makes (DEC-008) — the
 * engine cannot narrow those inputs without guessing.
 *
 * `open-loops` is computed rather than compiled, so it has no record inputs.
 */
export const DEFAULT_SECTIONS: readonly SectionDef[] = [
  { name: 'charter', inputs: 'all' },
  { name: 'constraints', inputs: 'driver-specs' },
  { name: 'decisions', inputs: 'decisions' },
  // Observes the rules: a deleted guard must restage the section that reports
  // what is guarded, or the view keeps claiming a decision is covered after
  // its only test was removed.
  { name: 'open-loops', inputs: 'none', observes: OBSERVES_RULES },
];

/**
 * Renders a section name as a view heading: `open-loops` -> `Open Loops`.
 *
 * Derived rather than configured, so a project declaring sections states one
 * concept rather than two. A name that cannot be title-cased into the wanted
 * heading is a reason to add a field, not a reason to add one now.
 */
export function headingFor(name: string): string {
  return name
    .split('-')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** A record contributing to a section, reduced to what the manifest needs. */
export interface RecordRef {
  id: string;
  /** Path relative to the project root, for the renderer to read. */
  path: string;
  content: string;
}

export interface GroupedRecords {
  /** Hat name to the driver-specs assigned to it. */
  driverSpecsByHat: Map<string, RecordRef[]>;
  /** Hat name to the decision records assigned to it. */
  decisionsByHat: Map<string, RecordRef[]>;
  /** Records declaring no hats at all. */
  unassigned: string[];
  /** Records declaring a hat outside the resolved registry, as [recordId, hat]. */
  unknownHats: Array<[string, string]>;
}

/** A record is compiled only while it is the current answer. */
function isActive(status: string): boolean {
  return status === 'active' || status === 'accepted';
}

/**
 * Groups active records by every hat they declare.
 *
 * A record declaring two hats appears under both (DEC-016). Records
 * declaring none, or declaring a hat outside the registry, are reported
 * separately rather than silently dropped — an unrouted record is a real
 * state the view should report (DEC-006).
 */
export function groupRecordsByHat(
  driverSpecs: readonly (DriverSpecEntry & { path: string; content: string })[],
  decisions: readonly (DecisionEntry & { path: string; content: string })[],
  registry: readonly string[]
): GroupedRecords {
  const known = new Set(registry);
  const driverSpecsByHat = new Map<string, RecordRef[]>();
  const decisionsByHat = new Map<string, RecordRef[]>();
  const unassigned: string[] = [];
  const unknownHats: Array<[string, string]> = [];

  for (const hat of registry) {
    driverSpecsByHat.set(hat, []);
    decisionsByHat.set(hat, []);
  }

  const place = (
    target: Map<string, RecordRef[]>,
    entry: { id: string; status: string; hats?: string[]; path: string; content: string }
  ): void => {
    if (!isActive(entry.status)) return;

    const hats = entry.hats ?? [];
    if (hats.length === 0) {
      unassigned.push(entry.id);
      return;
    }

    let placed = false;
    for (const hat of hats) {
      if (!known.has(hat)) {
        unknownHats.push([entry.id, hat]);
        continue;
      }
      target.get(hat)?.push({ id: entry.id, path: entry.path, content: entry.content });
      placed = true;
    }
    // Declared only hats the registry does not know: routed nowhere.
    if (!placed && hats.length > 0 && !unassigned.includes(entry.id)) {
      unassigned.push(entry.id);
    }
  };

  for (const spec of driverSpecs) place(driverSpecsByHat, spec);
  for (const decision of decisions) place(decisionsByHat, decision);

  return { driverSpecsByHat, decisionsByHat, unassigned, unknownHats };
}

/**
 * Resolves the input records for one section of one hat's view.
 *
 * Switches on the declared input kind rather than on the section name, so a
 * project can name its sections whatever suits its domain without the engine
 * knowing what those names mean.
 */
export function resolveSectionInputs(
  hat: string,
  section: SectionDef,
  grouped: GroupedRecords
): RecordRef[] {
  const specs = grouped.driverSpecsByHat.get(hat) ?? [];
  const decisions = grouped.decisionsByHat.get(hat) ?? [];

  switch (section.inputs) {
    case 'all':
      return [...specs, ...decisions];
    case 'driver-specs':
      return [...specs];
    case 'decisions':
      return [...decisions];
    case 'none':
      return [];
  }
}
