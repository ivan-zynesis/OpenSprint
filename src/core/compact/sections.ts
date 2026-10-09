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
  /**
   * Heading to render, when title-casing the name cannot produce it.
   *
   * The maintainer objectives carry commas and ampersands that no
   * title-casing of a kebab-case name yields, which is the case this field
   * was reserved for. A section without one derives its heading as before.
   */
  heading?: string;
  inputs: SectionInputKind;
  /**
   * Roles this section accepts. Without it a section takes every record of
   * its input kind — which would make all of product's sections share an
   * input hash and restage together, losing the granularity DEC-010 exists
   * for.
   */
  roles?: string[];
  /**
   * The objective this section takes records for, filtered independently of
   * `roles`.
   *
   * Roles and objectives are different axes: a record is a goal *about*
   * security, so collapsing them would make `goal` and `security-access`
   * mutually exclusive. A section declaring both takes a record only if it
   * matches on each.
   */
  objective?: string;
  observes?: typeof OBSERVES_RULES | string[];
}

/**
 * The maintainer hat's inherited objectives (DS-MAINTAINER-INHERITED).
 *
 * Unlike product's objective, which each project discovers, these are the
 * technical concerns present in substantially every software project — which
 * is why the accountability spun off from product and is held by a
 * specialist (DEC-018).
 *
 * An explicit ordered list rather than anything derived: if we ship them, we
 * track them by name in a constant. A project adds an eighth by declaring its
 * own maintainer sections; the list is expected to move, and
 * `availability & continuity` was itself added on review after being
 * declined twice.
 */
export const MAINTAINER_OBJECTIVES: readonly { name: string; heading: string }[] = [
  { name: 'security-access', heading: 'Security & Access' },
  { name: 'isolation-confidentiality', heading: 'Isolation & Confidentiality' },
  { name: 'privacy-retention-legal', heading: 'Privacy, Retention & Legal' },
  { name: 'integrity-correctness', heading: 'Integrity & Correctness' },
  { name: 'change-quality', heading: 'Change & Quality' },
  { name: 'availability-continuity', heading: 'Availability & Continuity' },
  { name: 'cost-budget', heading: 'Cost & Budget' },
];

/** The roles a maintainer objective's records may take. */
const MAINTAINER_OBJECTIVE_ROLES = ['goal', 'strategy'];

/**
 * Default observation globs, by explicit list per ecosystem.
 *
 * These are what a section describing the system reads. A project overrides
 * them by declaring its own sections; the defaults exist so that the shapes
 * work on a project that has configured nothing.
 */
export const TECH_STACK_GLOBS = [
  'package.json',
  '*/package.json',
  '*/*/package.json',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  'tsconfig.json',
  'go.mod',
  'Cargo.toml',
  'pyproject.toml',
  'requirements.txt',
  'Gemfile',
  'pom.xml',
  'build.gradle',
  '*.csproj',
] as const;

export const ENTITY_SCHEMA_GLOBS = [
  '**/migrations/**/*.sql',
  '**/migrations/**/*.ts',
  '**/schema.prisma',
  '**/schema.sql',
  '**/*.schema.ts',
  '**/models/**/*.py',
  '**/entities/**/*.ts',
] as const;

export const INFRA_GLOBS = [
  '**/*.tf',
  '**/*.tfvars',
  '**/terragrunt.hcl',
  '**/docker-compose*.yml',
  '**/docker-compose*.yaml',
  '**/Dockerfile*',
  '**/*.k8s.yaml',
  '**/helm/**/*.yaml',
] as const;

export const GITOPS_GLOBS = [
  '.github/workflows/*.yml',
  '.github/workflows/*.yaml',
  'bitbucket-pipelines.yml',
  '.gitlab-ci.yml',
  'Jenkinsfile',
  '.circleci/config.yml',
  'azure-pipelines.yml',
] as const;

/**
 * Observes the rules: a deleted guard must restage the section that reports
 * what is guarded, or the view keeps claiming a decision is covered after its
 * only test was removed.
 */
const OPEN_LOOPS: SectionDef = { name: 'open-loops', inputs: 'none', observes: OBSERVES_RULES };

/**
 * The shape for a hat the tool has no default for.
 *
 * `charter` takes every record the hat owns, because which of them describe
 * the operating model is a judgement the renderer makes (DEC-008).
 *
 * A project declaring its own `designer` hat lands here — an unknown hat is
 * not an error, since DS-SQUAD-HATS makes the hat set a project's own.
 */
export const GENERIC_SECTIONS: readonly SectionDef[] = [
  { name: 'charter', inputs: 'all' },
  { name: 'constraints', inputs: 'driver-specs' },
  { name: 'decisions', inputs: 'decisions' },
  OPEN_LOOPS,
];

/**
 * Default sections per hat.
 *
 * The four accountabilities produce different *kinds* of knowledge rather than
 * the same kind about different subjects, so one shape cannot serve them all.
 * Product states a chain of intent; maintainer states positions on spectrums;
 * dev and devops describe a system.
 *
 * None of them enumerate records (DS-BIG-PICTURE): a section earns its place
 * by conveying the domain, not by giving every record somewhere to live.
 */
export const DEFAULT_SECTIONS_BY_HAT: Readonly<Record<string, readonly SectionDef[]>> = {
  // A causal chain: objective, therefore goals, therefore strategies.
  // `measures` aggregates across goals — the QA bridge, rendered.
  product: [
    { name: 'objective', inputs: 'driver-specs', roles: ['objective'] },
    { name: 'goals', inputs: 'driver-specs', roles: ['goal'] },
    { name: 'strategies', inputs: 'driver-specs', roles: ['strategy'] },
    { name: 'measures', inputs: 'driver-specs', roles: ['goal'], observes: OBSERVES_RULES },
    OPEN_LOOPS,
  ],
  // Seven inherited objectives, each with its own goal and strategy
  // (DS-MAINTAINER-INHERITED, DEC-018). An objective with no records still
  // renders: an empty row is the finding, which is DS-FULL-COVERAGE made
  // positional rather than harvested.
  maintainer: [
    // The hat's own posture, above the grid: what standard we hold ourselves
    // to at all, which is upstream of every objective rather than one of
    // them. Per-measure posture is a sub-block under `## Measures`; this is
    // the hat-level statement those deviate from.
    { name: 'posture', inputs: 'driver-specs' as SectionInputKind, roles: ['posture'] },
    ...MAINTAINER_OBJECTIVES.map((objective) => ({
      name: objective.name,
      heading: objective.heading,
      inputs: 'driver-specs' as SectionInputKind,
      roles: [...MAINTAINER_OBJECTIVE_ROLES],
      objective: objective.name,
    })),
    OPEN_LOOPS,
  ],
  // Describes the system, citing decisions where they explain a choice.
  dev: [
    { name: 'tech-stack', inputs: 'decisions', observes: [...TECH_STACK_GLOBS] },
    { name: 'runtime-topology', inputs: 'decisions' },
    { name: 'entity-schema', inputs: 'decisions', observes: [...ENTITY_SCHEMA_GLOBS] },
    OPEN_LOOPS,
  ],
  devops: [
    { name: 'infra-architecture', inputs: 'decisions', observes: [...INFRA_GLOBS] },
    { name: 'gitops', inputs: 'decisions', observes: [...GITOPS_GLOBS] },
    OPEN_LOOPS,
  ],
};

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
  /**
   * Roles within the hat, for role-filtered sections.
   *
   * A list because a record may state both a goal and its strategy — the
   * treatment DEC-016 gave `hats`, applied to the other classification axis.
   */
  role?: string[];
  /** The objective this record serves, for objective-filtered sections. */
  objective?: string;
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
    entry: {
      id: string;
      status: string;
      hats?: string[];
      role?: string[];
      objective?: string;
      path: string;
      content: string;
    }
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
      target.get(hat)?.push({
        id: entry.id,
        role: entry.role,
        objective: entry.objective,
        path: entry.path,
        content: entry.content,
      });
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

  let candidates: RecordRef[];
  switch (section.inputs) {
    case 'all':
      candidates = [...specs, ...decisions];
      break;
    case 'driver-specs':
      candidates = [...specs];
      break;
    case 'decisions':
      candidates = [...decisions];
      break;
    case 'none':
      return [];
  }

  // Objective and roles filter independently, so a maintainer section takes a
  // record only when it serves that objective AND holds one of those roles.
  if (section.objective !== undefined) {
    candidates = candidates.filter((r) => r.objective === section.objective);
  }

  if (!section.roles || section.roles.length === 0) return candidates;

  // A record with no role is excluded from a role-filtered section: it has not
  // been placed in the chain, and record-unclassified already reports it.
  const accepted = new Set(section.roles);
  return candidates.filter((r) => r.role !== undefined && r.role.some((role) => accepted.has(role)));
}

/**
 * The heading a section renders under.
 *
 * Declared wins, because some headings cannot be derived: no title-casing of
 * `privacy-retention-legal` yields "Privacy, Retention & Legal". The name
 * stays the identifier used in configuration and provenance.
 */
export function headingOf(section: SectionDef): string {
  return section.heading ?? headingFor(section.name);
}
