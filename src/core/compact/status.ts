/**
 * Compact — staleness classification
 *
 * DEC-010 names two failure states, stale and tampered. The engine reports
 * four: `unsealed` is separated out because every project is unsealed before
 * its first seal, and reporting that as drift would claim a change that
 * never happened.
 */

import * as fs from 'node:fs';
import {
  resolveSectionInputs,
  type GroupedRecords,
  type RecordRef,
  type SectionDef,
} from './sections.js';
import {
  findEntry,
  hashContent,
  inputMap,
  sectionInputHash,
  viewPath,
  type Manifest,
} from './manifest.js';

export const SECTION_STATES = ['fresh', 'stale', 'tampered', 'unsealed'] as const;
export type SectionState = (typeof SECTION_STATES)[number];

export interface SectionStatus {
  hat: string;
  section: string;
  state: SectionState;
  /** Records feeding this section, for the renderer to read (DEC-011). */
  inputs: RecordRef[];
  /** Record ids added since the manifest was written. */
  added: string[];
  /** Record ids removed since the manifest was written. */
  removed: string[];
  /** Record ids whose content changed since the manifest was written. */
  modified: string[];
  /** Observed files feeding this section, path to content hash. */
  observed: Record<string, string>;
  /** Observed paths added since the manifest was written. */
  observedAdded: string[];
  /** Observed paths removed since the manifest was written. */
  observedRemoved: string[];
  /** Observed paths whose content changed since the manifest was written. */
  observedModified: string[];
}

/**
 * Classifies one section against the manifest.
 *
 * Order matters. An absent entry is unsealed regardless of anything else.
 * Input drift outranks output drift, because a section whose records moved
 * needs re-rendering whether or not someone also edited the view.
 */
export function classifySection(
  opensprintDir: string,
  manifest: Manifest,
  hat: string,
  section: SectionDef,
  grouped: GroupedRecords,
  observed: Readonly<Record<string, string>> = {}
): SectionStatus {
  const inputs = resolveSectionInputs(hat, section, grouped);
  const entry = findEntry(manifest, hat, section.name);
  const base: Omit<SectionStatus, 'state'> = {
    hat,
    section: section.name,
    inputs,
    added: [],
    removed: [],
    modified: [],
    observed: { ...observed },
    observedAdded: [],
    observedRemoved: [],
    observedModified: [],
  };

  if (!entry) {
    return { ...base, state: 'unsealed' };
  }

  const current = inputMap(inputs);
  const recorded = entry.inputs ?? {};
  const added = Object.keys(current).filter((id) => !(id in recorded)).sort();
  const removed = Object.keys(recorded).filter((id) => !(id in current)).sort();
  const modified = Object.keys(current)
    .filter((id) => id in recorded && recorded[id] !== current[id])
    .sort();

  const recordedObs = entry.observed ?? {};
  const observedAdded = Object.keys(observed).filter((f) => !(f in recordedObs)).sort();
  const observedRemoved = Object.keys(recordedObs).filter((f) => !(f in observed)).sort();
  const observedModified = Object.keys(observed)
    .filter((f) => f in recordedObs && recordedObs[f] !== observed[f])
    .sort();

  if (sectionInputHash(inputs, observed) !== entry.inputHash) {
    return {
      ...base,
      state: 'stale',
      added,
      removed,
      modified,
      observedAdded,
      observedRemoved,
      observedModified,
    };
  }

  // Inputs match. The only remaining question is whether the view still says
  // what it said when it was sealed.
  const file = viewPath(opensprintDir, hat);
  const rendered = fs.existsSync(file) ? hashContent(fs.readFileSync(file, 'utf-8')) : null;

  if (entry.outputHash === null) {
    // Sealed while unrendered; still waiting on a renderer.
    return { ...base, state: rendered === null ? 'unsealed' : 'tampered' };
  }
  if (rendered !== entry.outputHash) {
    return { ...base, state: 'tampered' };
  }
  return { ...base, state: 'fresh' };
}

/**
 * Classifies every section of every hat.
 *
 * Iterates each hat's own sections, so hats with different shapes are each
 * classified against what they actually declare. A manifest entry naming a
 * section a hat no longer declares is simply never looked up — ignored rather
 * than reported, since nothing is claiming anything about it.
 */
export function classifyAll(
  opensprintDir: string,
  manifest: Manifest,
  registry: readonly string[],
  grouped: GroupedRecords,
  sectionsFor: (hat: string) => readonly SectionDef[],
  observedFor: (section: SectionDef) => Record<string, string> = () => ({})
): SectionStatus[] {
  const out: SectionStatus[] = [];
  for (const hat of registry) {
    for (const section of sectionsFor(hat)) {
      out.push(
        classifySection(opensprintDir, manifest, hat, section, grouped, observedFor(section))
      );
    }
  }
  return out;
}

/** True when every section is fresh — the only state `check` accepts. */
export function allFresh(statuses: readonly SectionStatus[]): boolean {
  return statuses.every((s) => s.state === 'fresh');
}
