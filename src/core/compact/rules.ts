/**
 * Compact — rule harvesting
 *
 * DEC-013: the link between a decision and the rule guarding it is harvested
 * from code, not declared in the record. A rule cites the record it guards;
 * the record says nothing about its rules.
 *
 * The data settled it. Across cashier, 69 of 96 rule files already cite a
 * record while only 4 of 64 decision records cite a test. The links exist —
 * nothing was reading them.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import fg from 'fast-glob';
import { readProjectConfig } from '../project-config.js';
import { hashContent } from './manifest.js';
import { OBSERVES_RULES, type SectionDef } from './sections.js';

/**
 * Default rule-file patterns.
 *
 * Surveying four projects in production use gives five distinct suffixes, and
 * one of them — ai-gateway — uses *only* `.unit.ts`. A default of `*.test.*`
 * would match nothing there and report every decision unguarded, which is a
 * worse failure than scanning a few extra files.
 */
export const DEFAULT_RULE_GLOBS = [
  '**/*.test.*',
  '**/*.spec.*',
  '**/*.i9n.*',
  '**/*.unit.*',
  '**/*.e2e.*',
  '**/*_test.*',
] as const;

/**
 * Directories never scanned.
 *
 * `opensprint` and `openspec` are excluded because otherwise every record
 * would cite itself and its own ancestors, and the whole surrogate would
 * report as fully guarded by itself.
 */
export const EXCLUDED_DIRS = [
  'opensprint',
  'openspec',
  'node_modules',
  'dist',
  'build',
  '.git',
] as const;

/** Shape of a record id: DS-KEBAB-NAME or DEC-NNN. */
const RECORD_ID_PATTERN = /\b(?:DEC-\d{3}|DS-[A-Z][A-Z0-9-]*[A-Z0-9])\b/g;

export interface RuleIndex {
  /** Record id to the project-relative paths of rule files citing it. */
  byRecord: Map<string, string[]>;
  /** Rule file path to the record ids it cites. */
  byRule: Map<string, string[]>;
  /** Ids shaped like a record but resolving to none, by rule file. */
  unresolved: Map<string, string[]>;
  /** Rule files scanned. */
  scanned: string[];
}

/**
 * Resolves the rule globs for a project, falling back to the default when the
 * declared value is absent or malformed.
 */
export function resolveRuleGlobs(projectRoot: string): readonly string[] {
  const config = readProjectConfig(projectRoot);
  const declared = config?.ruleGlobs;
  if (declared && declared.length > 0) return declared;
  return DEFAULT_RULE_GLOBS;
}

/** Finds rule files, project-relative, excluding the surrogate and build output. */
export function findRuleFiles(
  projectRoot: string,
  globs: readonly string[] = DEFAULT_RULE_GLOBS
): string[] {
  const entries = fg.sync([...globs], {
    cwd: projectRoot,
    ignore: EXCLUDED_DIRS.map((d) => `${d}/**`),
    dot: false,
    onlyFiles: true,
    followSymbolicLinks: false,
    suppressErrors: true,
  });
  // fast-glob returns posix separators; normalise so callers see platform paths.
  return entries.map((e) => e.split('/').join(path.sep)).sort();
}

/**
 * Extracts record citations from a rule file's content.
 *
 * Any occurrence of a known record id counts. DEC-013's point is to read the
 * links that already exist, and in the field they exist as ids in comments,
 * describe blocks and test names — not as a structured annotation. Requiring
 * one would mean asking every project to re-author what it already has.
 */
export function extractCitations(
  content: string,
  knownIds: ReadonlySet<string>
): { cited: string[]; unresolved: string[] } {
  const found = new Set(content.match(RECORD_ID_PATTERN) ?? []);
  const cited: string[] = [];
  const unresolved: string[] = [];
  for (const id of found) {
    (knownIds.has(id) ? cited : unresolved).push(id);
  }
  return { cited: cited.sort(), unresolved: unresolved.sort() };
}

/** Builds the record→rule index by scanning the project's rule files. */
export function buildRuleIndex(
  projectRoot: string,
  recordIds: readonly string[],
  globs: readonly string[] = DEFAULT_RULE_GLOBS
): RuleIndex {
  const known = new Set(recordIds);
  const byRecord = new Map<string, string[]>();
  const byRule = new Map<string, string[]>();
  const unresolved = new Map<string, string[]>();

  for (const id of recordIds) byRecord.set(id, []);

  const scanned = findRuleFiles(projectRoot, globs);
  for (const rel of scanned) {
    let content: string;
    try {
      content = fs.readFileSync(path.join(projectRoot, rel), 'utf-8');
    } catch {
      continue; // a file that vanished mid-scan contributes nothing
    }
    const { cited, unresolved: missing } = extractCitations(content, known);
    if (cited.length > 0) byRule.set(rel, cited);
    if (missing.length > 0) unresolved.set(rel, missing);
    for (const id of cited) byRecord.get(id)?.push(rel);
  }

  return { byRecord, byRule, unresolved, scanned };
}


/**
 * Resolves the files a section observes, with their content hashes.
 *
 * `rules` resolves through the project's rule globs rather than repeating
 * them, so the two cannot drift. Explicit globs resolve directly, under the
 * same exclusions — a section observing the surrogate would make the view
 * depend on itself.
 *
 * Paths are project-relative with separators normalised to `/`, so a manifest
 * written on Windows matches one written on macOS.
 */
export function resolveObservedFiles(
  projectRoot: string,
  section: SectionDef
): Record<string, string> {
  const declared = section.observes;
  if (!declared) return {};

  const globs = declared === OBSERVES_RULES ? resolveRuleGlobs(projectRoot) : declared;
  const out: Record<string, string> = {};

  for (const rel of findRuleFiles(projectRoot, globs)) {
    const key = rel.split(path.sep).join('/');
    try {
      out[key] = hashContent(fs.readFileSync(path.join(projectRoot, rel), 'utf-8'));
    } catch {
      // A file that vanished mid-scan contributes nothing rather than failing.
    }
  }
  return out;
}
