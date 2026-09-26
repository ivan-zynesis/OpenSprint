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
 * The sections of a hat view, in render order.
 *
 * `charter` takes every record the hat owns, because which of them describe
 * the operating model is a judgement the renderer makes (DEC-008) — the
 * engine cannot narrow those inputs without guessing.
 *
 * `open-loops` is computed rather than compiled, so it has no record inputs.
 */
export const SECTION_NAMES = [
  'charter',
  'constraints',
  'decisions',
  'open-loops',
] as const;

export type SectionName = (typeof SECTION_NAMES)[number];

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
 * `open-loops` returns an empty list by design: it is computed from the
 * record set rather than compiled from record content.
 */
export function resolveSectionInputs(
  hat: string,
  section: SectionName,
  grouped: GroupedRecords
): RecordRef[] {
  const specs = grouped.driverSpecsByHat.get(hat) ?? [];
  const decisions = grouped.decisionsByHat.get(hat) ?? [];

  switch (section) {
    case 'charter':
      return [...specs, ...decisions];
    case 'constraints':
      return [...specs];
    case 'decisions':
      return [...decisions];
    case 'open-loops':
      return [];
  }
}
