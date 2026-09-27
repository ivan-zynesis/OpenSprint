/**
 * Hat Registry
 *
 * The hat taxonomy (DS-SQUAD-HATS), its per-project registry, and the
 * validation and inference helpers used when assigning a hat to a record.
 *
 * A hat is a context boundary. It names the accountability for a record, and
 * therefore the single human who reviews it, receives its escalations, and
 * triages its backlog (DS-SME-OWNERSHIP). DEC-012 fixes one hat per record:
 * a record with two owners has none.
 *
 * Nothing here writes to a file. Inference produces a suggestion; the owner
 * confirms it.
 */

import { readProjectConfig } from './project-config.js';
import {
  DEFAULT_SECTIONS,
  SECTION_INPUT_KINDS,
  type SectionDef,
  type SectionInputKind,
} from './compact/sections.js';

/**
 * The default hat set.
 *
 * Projects may declare their own in openspec/config.yaml, because the hat set
 * is a property of the product rather than of the tool: a back-office system
 * needs no designer hat, a consumer product does.
 *
 * There is deliberately no `agreements` hat. DEC-016 removed it: a record that
 * crosses hats declares both of them, rather than being exiled to a file no
 * one owns.
 */
export const DEFAULT_HATS = [
  'product',
  'maintainer',
  'dev',
  'devops',
] as const;

/**
 * The accepted driver-spec `type` values.
 *
 * These were documented in schema prose and in the template but never
 * validated anywhere in src/, which is how `type: driver-spec` reached
 * production records.
 */
export const DRIVER_SPEC_TYPES = [
  'product',
  'legal',
  'compliance',
  'reliability',
  'architecture',
  'business',
] as const;

export type DriverSpecType = (typeof DRIVER_SPEC_TYPES)[number];

const DRIVER_SPEC_TYPE_SET: ReadonlySet<string> = new Set(DRIVER_SPEC_TYPES);

/**
 * Default hat per driver-spec type.
 *
 * There is deliberately no entry resolving to `devops`. No driver-spec type
 * implies it, and an infrastructure decision usually descends from a
 * reliability constraint, so inferring it would mean guessing from keywords —
 * the pattern matching this codebase avoids. Devops records are assigned by
 * owner confirmation instead.
 */
const DRIVER_SPEC_TYPE_TO_HAT: Readonly<Record<DriverSpecType, string>> = {
  product: 'product',
  business: 'product',
  legal: 'maintainer',
  compliance: 'maintainer',
  reliability: 'maintainer',
  architecture: 'dev',
};

/**
 * A node in the decision dependency graph, for ancestry walks.
 */
export interface DecisionAncestryNode {
  id: string;
  dependsOn: readonly string[];
}

/**
 * Resolves the hat registry for a project.
 *
 * Returns the project's declared `hats` when it is a non-empty array of
 * strings, otherwise DEFAULT_HATS. A malformed value is reported by
 * readProjectConfig and degrades to the default rather than failing.
 */
export function resolveHatRegistry(projectRoot: string): readonly string[] {
  const declared = readProjectConfig(projectRoot)?.hats;
  if (Array.isArray(declared)) {
    return declared.length > 0 ? declared : DEFAULT_HATS;
  }
  if (declared && typeof declared === 'object') {
    const names = Object.keys(declared);
    return names.length > 0 ? names : DEFAULT_HATS;
  }
  return DEFAULT_HATS;
}

const INPUT_KIND_SET: ReadonlySet<string> = new Set(SECTION_INPUT_KINDS);

/**
 * Resolves the sections a hat renders.
 *
 * A hat that declares none gets DEFAULT_SECTIONS rather than an empty list:
 * otherwise adopting per-hat sections for one hat would silently blank every
 * other hat's view.
 *
 * A section declaring an unknown input kind degrades that hat to the defaults
 * and warns. Rendering it with a guessed kind would put content under a
 * heading nobody asked for.
 */
export function resolveHatSections(
  projectRoot: string,
  hat: string
): readonly SectionDef[] {
  const declared = readProjectConfig(projectRoot)?.hats;
  if (!declared || Array.isArray(declared)) return DEFAULT_SECTIONS;

  const sections = declared[hat]?.sections;
  if (!sections || sections.length === 0) return DEFAULT_SECTIONS;

  const bad = sections.filter((s) => !INPUT_KIND_SET.has(s.inputs));
  if (bad.length > 0) {
    console.warn(
      `Hat '${hat}' declares section(s) with an unknown 'inputs' value: ` +
        `${bad.map((s) => `${s.name}=${s.inputs}`).join(', ')}. ` +
        `Accepted: ${SECTION_INPUT_KINDS.join(', ')}. Using the default sections.`
    );
    return DEFAULT_SECTIONS;
  }

  return sections.map((s) => ({ name: s.name, inputs: s.inputs as SectionInputKind }));
}

/**
 * Validates a hat value by explicit membership lookup against the registry.
 * Comparison is case-sensitive: hat names are config values, not filenames,
 * so they do not inherit filesystem case-folding differences.
 */
export function isValidHat(value: unknown, registry: readonly string[]): boolean {
  if (typeof value !== 'string') return false;
  return new Set(registry).has(value);
}

/**
 * Normalises a frontmatter `hats` value to a list.
 *
 * A record declares one or more hats (DEC-016). Both spellings are accepted —
 * `hats: product` and `hats: [product, maintainer]` — and normalise to a list
 * with duplicates removed and order preserved.
 *
 * Returns null for a malformed value, including an empty list: a record that
 * declares the key must say something with it.
 */
export function normalizeHats(value: unknown): string[] | null {
  const raw = typeof value === 'string' ? [value] : value;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (!raw.every((entry) => typeof entry === 'string' && entry.length > 0)) return null;
  return [...new Set(raw as string[])];
}

/**
 * Returns the subset of `hats` absent from the registry, empty when all are
 * valid. Explicit membership lookup, not pattern matching.
 */
export function invalidHats(
  hats: readonly string[],
  registry: readonly string[]
): string[] {
  const known = new Set(registry);
  return hats.filter((hat) => !known.has(hat));
}

/**
 * Validates a driver-spec `type` by explicit membership lookup.
 */
export function isValidDriverSpecType(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return DRIVER_SPEC_TYPE_SET.has(value);
}

/**
 * Suggests default hats for a driver spec from its `type`.
 * Returns an empty list for a type with no mapping, including an invalid one.
 */
export function defaultHatsForDriverSpec(type: unknown): string[] {
  if (!isValidDriverSpecType(type)) return [];
  const hat = DRIVER_SPEC_TYPE_TO_HAT[type as DriverSpecType];
  return hat === undefined ? [] : [hat];
}

/**
 * Suggests default hats for a decision record by walking `depends-on` to its
 * nearest driver-spec ancestors.
 *
 * Returns a single-element list when every such ancestor resolves to the same
 * hat. Returns an empty list when they disagree, when there are none, or when
 * any ancestor's type has no mapping — all of which leave the record
 * unassigned pending owner confirmation.
 *
 * Inference never proposes more than one hat. A record that genuinely crosses
 * hats (DEC-016) is assigned by its owner, not guessed at.
 *
 * @param decisionId - the decision to infer for
 * @param decisions - every decision by id, for the ancestry walk
 * @param driverSpecTypes - driver-spec id to its `type`
 */
export function defaultHatsForDecision(
  decisionId: string,
  decisions: ReadonlyMap<string, DecisionAncestryNode>,
  driverSpecTypes: ReadonlyMap<string, string>
): string[] {
  const hats = new Set<string>();
  const seen = new Set<string>();
  const queue: string[] = [decisionId];

  while (queue.length > 0) {
    const id = queue.shift() as string;
    // Guards against a malformed depends-on cycle.
    if (seen.has(id)) continue;
    seen.add(id);

    const driverSpecType = driverSpecTypes.get(id);
    if (driverSpecType !== undefined) {
      const inferred = defaultHatsForDriverSpec(driverSpecType);
      // An unmappable ancestor makes the whole inference untrustworthy.
      if (inferred.length === 0) return [];
      for (const hat of inferred) hats.add(hat);
      continue; // driver specs are roots
    }

    const node = decisions.get(id);
    // A dangling reference contributes nothing rather than failing the walk.
    if (!node) continue;
    for (const parent of node.dependsOn) {
      queue.push(parent);
    }
  }

  if (hats.size !== 1) return [];
  return [...hats];
}
