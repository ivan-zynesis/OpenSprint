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
  SECTION_NAMES,
  resolveSectionInputs,
  type GroupedRecords,
  type RecordRef,
  type SectionName,
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
  section: SectionName;
  state: SectionState;
  /** Records feeding this section, for the renderer to read (DEC-011). */
  inputs: RecordRef[];
  /** Record ids added since the manifest was written. */
  added: string[];
  /** Record ids removed since the manifest was written. */
  removed: string[];
  /** Record ids whose content changed since the manifest was written. */
  modified: string[];
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
  section: SectionName,
  grouped: GroupedRecords
): SectionStatus {
  const inputs = resolveSectionInputs(hat, section, grouped);
  const entry = findEntry(manifest, hat, section);
  const base: Omit<SectionStatus, 'state'> = {
    hat,
    section,
    inputs,
    added: [],
    removed: [],
    modified: [],
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

  if (sectionInputHash(inputs) !== entry.inputHash) {
    return { ...base, state: 'stale', added, removed, modified };
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

/** Classifies every section of every hat in the registry. */
export function classifyAll(
  opensprintDir: string,
  manifest: Manifest,
  registry: readonly string[],
  grouped: GroupedRecords
): SectionStatus[] {
  const out: SectionStatus[] = [];
  for (const hat of registry) {
    for (const section of SECTION_NAMES) {
      out.push(classifySection(opensprintDir, manifest, hat, section, grouped));
    }
  }
  return out;
}

/** True when every section is fresh — the only state `check` accepts. */
export function allFresh(statuses: readonly SectionStatus[]): boolean {
  return statuses.every((s) => s.state === 'fresh');
}
