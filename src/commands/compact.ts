/**
 * Compact Command
 *
 * The deterministic half of /opsp:compact. Reports which sections of the
 * compiled hat views have gone stale, records the current state, and gates
 * CI when a view and its records disagree (DEC-010).
 *
 * This command never renders a view. Writing the condensed prose is
 * synthesis and belongs to the skill; what belongs here is the part that can
 * be checked without a model in the loop.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { OPENSPRINT_DIR_NAME } from '../core/config.js';
import { resolveHatRegistry, resolveHatSections, resolveHatRoles } from '../core/hats.js';
import { regenerateBoard, BOARD_FILENAME } from '../core/board.js';

/** Options for `compact seal` (DEC-SCOPED-SEAL). */
export interface SealOptions {
  /** Hats to reseal. Empty or absent means every hat. */
  hats?: string[];
}

/**
 * Narrows a requested hat list to those the registry knows.
 *
 * An unknown name warns and is dropped rather than failing: a typo in --hat
 * should not abort an archive, the same way a malformed registry degrades.
 * Returns undefined when nothing was requested, meaning "every hat".
 */
function requestedHats(
  requested: string[] | undefined,
  registry: readonly string[]
): string[] | undefined {
  if (requested === undefined || requested.length === 0) return undefined;
  const known = new Set(registry);
  const kept = requested.filter((hat) => {
    if (known.has(hat)) return true;
    console.warn(
      chalk.yellow(`Unknown hat '${hat}'. Known hats: ${registry.join(', ')}. Ignoring.`)
    );
    return false;
  });
  return kept.length > 0 ? kept : undefined;
}
import { readInitiatives } from '../core/initiatives.js';
import { attestationOf } from '../core/compact/measures.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../core/compact/records.js';
import {
  groupRecordsByHat,
  resolveSectionInputs,
} from '../core/compact/sections.js';
import {
  readManifest,
  writeManifest,
  hashContent,
  sectionInputHash,
  inputMap,
  viewPath,
  type Manifest,
  type ManifestEntry,
} from '../core/compact/manifest.js';
import {
  classifyAll,
  allFresh,
  type SectionStatus,
} from '../core/compact/status.js';
import {
  buildRuleIndex,
  resolveRuleGlobs,
  resolveObservedFiles,
  detectDiagramConvention,
} from '../core/compact/rules.js';
import { deriveOpenLoops, groupLoopsByHat, type OpenLoop } from '../core/compact/loops.js';

export interface CompactOptions {
  json?: boolean;
  /** Hats to report on. Empty or absent means every hat. */
  hats?: string[];
}

// -----------------------------------------------------------------------------
// Shared scan
// -----------------------------------------------------------------------------

interface Scan {
  opensprintDir: string;
  registry: readonly string[];
  statuses: SectionStatus[];
  unassigned: string[];
  unknownHats: Array<[string, string]>;
  grouped: ReturnType<typeof groupRecordsByHat>;
  driverSpecs: ReturnType<typeof readSourcedDriverSpecs>;
  decisions: ReturnType<typeof readSourcedDecisions>;
}

function scan(projectRoot: string): Scan {
  const opensprintDir = path.join(projectRoot, OPENSPRINT_DIR_NAME);
  if (!fs.existsSync(opensprintDir)) {
    throw new Error(
      `No ${OPENSPRINT_DIR_NAME}/ directory found. Run this from a project with an OpenSprint surrogate.`
    );
  }
  const registry = resolveHatRegistry(projectRoot);
  const driverSpecs = readSourcedDriverSpecs(opensprintDir);
  const decisions = readSourcedDecisions(opensprintDir);
  const grouped = groupRecordsByHat(driverSpecs, decisions, registry);
  const manifest = readManifest(opensprintDir);
  return {
    opensprintDir,
    registry,
    statuses: classifyAll(
      opensprintDir,
      manifest,
      registry,
      grouped,
      (hat) => resolveHatSections(projectRoot, hat),
      (section) => resolveObservedFiles(projectRoot, section)
    ),
    unassigned: grouped.unassigned,
    unknownHats: grouped.unknownHats,
    grouped,
    driverSpecs,
    decisions,
  };
}

/**
 * Harvests rule citations and derives open loops.
 *
 * Kept out of `scan()` because it walks the project's source tree — the most
 * expensive thing compact does. `check` is a gate and must stay cheap, so it
 * never calls this.
 */
function openLoopsFor(projectRoot: string, s: Scan): OpenLoop[] {
  const ids = [...s.driverSpecs.map((r) => r.id), ...s.decisions.map((r) => r.id)];
  const index = buildRuleIndex(projectRoot, ids, resolveRuleGlobs(projectRoot));
  return deriveOpenLoops(
    s.driverSpecs,
    s.decisions,
    index,
    (hat) => resolveHatRoles(projectRoot, hat),
    (hat) => resolveHatSections(projectRoot, hat),
    readInitiatives(s.opensprintDir)
  );
}

function printLoops(loops: readonly OpenLoop[], registry: readonly string[]): void {
  if (loops.length === 0) {
    console.log(chalk.green('No open loops.'));
    return;
  }
  const grouped = groupLoopsByHat(loops, registry);
  console.log(chalk.bold(`\n${loops.length} open loop(s)\n`));
  for (const [hat, items] of grouped) {
    if (items.length === 0) continue;
    console.log(chalk.cyan(`  ${hat ?? '(unassigned)'}`));
    for (const l of items) {
      console.log(`    ${chalk.yellow(l.kind)}  ${l.record}`);
      console.log(chalk.dim(`      ${l.detail}`));
      if (l.rule) console.log(chalk.dim(`      rule: ${l.rule}`));
    }
    console.log();
  }
  console.log(
    chalk.dim('Triage these through /opsp:explore, then /opsp:propose. There is no separate\nremediation workflow — deciding which gap is worth work is a judgement call.')
  );
}

function relative(projectRoot: string, p: string): string {
  return path.relative(projectRoot, p) || p;
}

// -----------------------------------------------------------------------------
// plan — what a renderer would need. Never writes.
// -----------------------------------------------------------------------------

export async function compactPlanCommand(options: CompactOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const s = scan(projectRoot);
  const { statuses, unassigned, unknownHats, registry } = s;
  // Open loops are deliberately not filtered: a loop belongs to the records,
  // not to a view section, so narrowing the plan to one hat must not hide
  // them.
  const requested = requestedHats(options.hats, registry);
  const pending = statuses
    .filter((st) => st.state !== 'fresh')
    .filter((st) => requested === undefined || requested.includes(st.hat));
  const loops = openLoopsFor(projectRoot, s);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          sections: pending.map((s) => ({
            hat: s.hat,
            section: s.section,
            state: s.state,
            added: s.added,
            removed: s.removed,
            modified: s.modified,
            observedAdded: s.observedAdded,
            observedRemoved: s.observedRemoved,
            observedModified: s.observedModified,
            inputs: s.inputs.map((r) => {
              // DEC-021: the renderer needs to know which authority a claim
              // about this record may carry, because only `attested`
              // licenses an unqualified present-tense statement.
              const attestation = attestationOf(r.content);
              return {
                id: r.id,
                path: relative(projectRoot, r.path),
                authority: attestation.authority,
                ...(attestation.verdict === undefined ? {} : { verdict: attestation.verdict }),
                ...(attestation.by === undefined ? {} : { attestedBy: attestation.by }),
                ...(attestation.on === undefined ? {} : { attestedOn: attestation.on }),
              };
            }),
            observes: Object.keys(s.observed).sort(),
          })),
          unassigned,
          unknownHats: unknownHats.map(([id, hat]) => ({ record: id, hat })),
          openLoops: loops,
          diagrams: detectDiagramConvention(projectRoot),
        },
        null,
        2
      )
    );
    return;
  }

  if (pending.length === 0) {
    console.log(chalk.green('All sections are fresh. Nothing to recompile.'));
  } else {
    console.log(chalk.bold(`\n${pending.length} section(s) need recompiling\n`));
    for (const s of pending) {
      console.log(`  ${chalk.cyan(`${s.hat}/${s.section}`)}  ${chalk.yellow(s.state)}`);
      if (s.added.length) console.log(`    added:    ${s.added.join(', ')}`);
      if (s.removed.length) console.log(`    removed:  ${s.removed.join(', ')}`);
      if (s.modified.length) console.log(`    modified: ${s.modified.join(', ')}`);
      if (s.observedAdded.length) console.log(`    observed +: ${s.observedAdded.join(', ')}`);
      if (s.observedRemoved.length) console.log(`    observed -: ${s.observedRemoved.join(', ')}`);
      if (s.observedModified.length) console.log(`    observed ~: ${s.observedModified.join(', ')}`);
      for (const input of s.inputs) {
        console.log(chalk.dim(`    ← ${relative(projectRoot, input.path)}`));
      }
      const observedCount = Object.keys(s.observed).length;
      if (observedCount > 0) {
        console.log(chalk.dim(`    ← observes ${observedCount} file(s)`));
      }
      console.log();
    }
  }

  reportUnrouted(unassigned, unknownHats);
  printLoops(loops, registry);

  const diagrams = detectDiagramConvention(projectRoot);
  const note =
    diagrams.convention === 'mixed'
      ? `mixed — mermaid in ${diagrams.mermaidFiles.length} file(s); ask the operator which to use`
      : diagrams.convention;
  console.log(chalk.dim(`Diagram convention: ${note}`));
}

function reportUnrouted(
  unassigned: readonly string[],
  unknownHats: ReadonlyArray<[string, string]>
): void {
  if (unassigned.length > 0) {
    console.log(chalk.yellow(`Unassigned records (${unassigned.length}): ${unassigned.join(', ')}`));
    console.log(chalk.dim('  These belong to no hat and appear in no view.'));
  }
  for (const [record, hat] of unknownHats) {
    console.log(chalk.yellow(`${record} declares unknown hat "${hat}"`));
  }
}

// -----------------------------------------------------------------------------
// seal — record the current state. The only mode that writes.
// -----------------------------------------------------------------------------

export async function compactSealCommand(options: SealOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const { opensprintDir, registry, grouped } = scan(projectRoot);

  // DEC-SCOPED-SEAL. Two rules, and the second matters more than the first:
  // a caller may scope correctly and still bless a section whose inputs moved
  // while its prose was never regenerated.
  const existing = readManifest(opensprintDir);
  const previousByHat = new Map<string, ManifestEntry[]>();
  for (const entry of existing.entries) {
    const list = previousByHat.get(entry.hat) ?? [];
    list.push(entry);
    previousByHat.set(entry.hat, list);
  }

  const requested = requestedHats(options.hats, registry);
  const inScope = (hat: string): boolean =>
    requested === undefined || requested.includes(hat);

  const entries: ManifestEntry[] = [];
  const unrendered: string[] = [];
  const carried: string[] = [];
  let sealed = 0;

  for (const hat of registry) {
    const file = viewPath(opensprintDir, hat);
    const rendered = fs.existsSync(file)
      ? hashContent(fs.readFileSync(file, 'utf-8'))
      : null;

    const hatHasRecords =
      (grouped.driverSpecsByHat.get(hat)?.length ?? 0) > 0 ||
      (grouped.decisionsByHat.get(hat)?.length ?? 0) > 0;
    if (rendered === null && hatHasRecords) unrendered.push(hat);

    const previous = previousByHat.get(hat) ?? [];
    // Carrying forward keeps the recorded inputHash, which is what preserves
    // the staleness signal. Dropping the entries would report `unsealed`,
    // which is a different and misleading state.
    const unchanged =
      previous.length > 0 && rendered !== null && previous.every((e) => e.outputHash === rendered);

    if (!inScope(hat) || unchanged) {
      entries.push(...previous);
      if (previous.length > 0) carried.push(hat);
      continue;
    }

    for (const section of resolveHatSections(projectRoot, hat)) {
      const inputs = resolveSectionInputs(hat, section, grouped);
      const observed = resolveObservedFiles(projectRoot, section);
      entries.push({
        hat,
        section: section.name,
        inputs: inputMap(inputs),
        observed,
        inputHash: sectionInputHash(inputs, observed),
        outputHash: rendered,
      });
      sealed += 1;
    }
  }

  const manifest: Manifest = { version: 1, entries };
  writeManifest(opensprintDir, manifest);

  // The board is part of the same compile pass (DEC-026). It needs no skill,
  // so it is regenerated here rather than sealed and staleness-gated.
  regenerateBoard(opensprintDir);

  console.log(
    chalk.green(`Sealed ${sealed} section(s) across ${registry.length - carried.length} hat(s).`)
  );
  if (carried.length > 0) {
    console.log(
      chalk.gray(`  carried forward unchanged: ${carried.join(', ')} — not re-rendered or out of scope`)
    );
  }
  console.log(chalk.gray(`  regenerated ${BOARD_FILENAME}`));
  for (const hat of unrendered) {
    console.log(
      chalk.yellow(`  ${hat}: has records but no view at ${relative(projectRoot, viewPath(opensprintDir, hat))}`)
    );
  }
}

// -----------------------------------------------------------------------------
// board — regenerate the board alone. Deterministic, so never gated.
// -----------------------------------------------------------------------------

export async function compactBoardCommand(): Promise<void> {
  const projectRoot = process.cwd();
  const { opensprintDir } = scan(projectRoot);
  regenerateBoard(opensprintDir);
  console.log(chalk.green(`Regenerated ${relative(projectRoot, path.join(opensprintDir, BOARD_FILENAME))}`));
}

// -----------------------------------------------------------------------------
// check — the gate. Never writes.
// -----------------------------------------------------------------------------

export async function compactCheckCommand(options: CompactOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const { statuses, unassigned, unknownHats } = scan(projectRoot);
  const offending = statuses.filter((s) => s.state !== 'fresh');

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ok: offending.length === 0,
          sections: offending.map((s) => ({
            hat: s.hat,
            section: s.section,
            state: s.state,
          })),
          unassigned,
          unknownHats: unknownHats.map(([id, hat]) => ({ record: id, hat })),
        },
        null,
        2
      )
    );
  } else if (allFresh(statuses)) {
    console.log(chalk.green(`All ${statuses.length} section(s) fresh.`));
  } else {
    console.log(chalk.red(`\n${offending.length} section(s) not fresh\n`));
    for (const s of offending) {
      console.log(`  ${chalk.cyan(`${s.hat}/${s.section}`)}  ${chalk.yellow(s.state)}`);
    }
    if (offending.some((s) => s.state === 'tampered')) {
      console.log(
        chalk.dim(
          '\nA tampered view was edited by hand. That edit will be lost on the next recompile.\n' +
            'If the view is wrong, the system is wrong — raise it with /opsp:explore.'
        )
      );
    }
    if (offending.some((s) => s.state === 'unsealed')) {
      console.log(chalk.dim('\nUnsealed sections have never been recorded. Run `opensprint compact seal`.'));
    }
    console.log();
    reportUnrouted(unassigned, unknownHats);
  }

  if (offending.length > 0) process.exit(1);
}

// -----------------------------------------------------------------------------
// loops — the backlog. Never writes, never fails.
// -----------------------------------------------------------------------------

export async function compactLoopsCommand(options: CompactOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const s = scan(projectRoot);
  const loops = openLoopsFor(projectRoot, s);

  if (options.json) {
    console.log(JSON.stringify({ openLoops: loops }, null, 2));
    return;
  }
  printLoops(loops, s.registry);
}
