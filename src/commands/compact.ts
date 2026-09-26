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
import { resolveHatRegistry } from '../core/hats.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../core/compact/records.js';
import {
  groupRecordsByHat,
  resolveSectionInputs,
  SECTION_NAMES,
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

export interface CompactOptions {
  json?: boolean;
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
}

function scan(projectRoot: string): Scan {
  const opensprintDir = path.join(projectRoot, OPENSPRINT_DIR_NAME);
  if (!fs.existsSync(opensprintDir)) {
    throw new Error(
      `No ${OPENSPRINT_DIR_NAME}/ directory found. Run this from a project with an OpenSprint surrogate.`
    );
  }
  const registry = resolveHatRegistry(projectRoot);
  const grouped = groupRecordsByHat(
    readSourcedDriverSpecs(opensprintDir),
    readSourcedDecisions(opensprintDir),
    registry
  );
  const manifest = readManifest(opensprintDir);
  return {
    opensprintDir,
    registry,
    statuses: classifyAll(opensprintDir, manifest, registry, grouped),
    unassigned: grouped.unassigned,
    unknownHats: grouped.unknownHats,
    grouped,
  };
}

function relative(projectRoot: string, p: string): string {
  return path.relative(projectRoot, p) || p;
}

// -----------------------------------------------------------------------------
// plan — what a renderer would need. Never writes.
// -----------------------------------------------------------------------------

export async function compactPlanCommand(options: CompactOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const { statuses, unassigned, unknownHats } = scan(projectRoot);
  const pending = statuses.filter((s) => s.state !== 'fresh');

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
            inputs: s.inputs.map((r) => ({
              id: r.id,
              path: relative(projectRoot, r.path),
            })),
          })),
          unassigned,
          unknownHats: unknownHats.map(([id, hat]) => ({ record: id, hat })),
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
      for (const input of s.inputs) {
        console.log(chalk.dim(`    ← ${relative(projectRoot, input.path)}`));
      }
      console.log();
    }
  }

  reportUnrouted(unassigned, unknownHats);
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

export async function compactSealCommand(): Promise<void> {
  const projectRoot = process.cwd();
  const { opensprintDir, registry, grouped } = scan(projectRoot);

  const entries: ManifestEntry[] = [];
  const unrendered: string[] = [];

  for (const hat of registry) {
    const file = viewPath(opensprintDir, hat);
    const rendered = fs.existsSync(file)
      ? hashContent(fs.readFileSync(file, 'utf-8'))
      : null;

    const hatHasRecords =
      (grouped.driverSpecsByHat.get(hat)?.length ?? 0) > 0 ||
      (grouped.decisionsByHat.get(hat)?.length ?? 0) > 0;
    if (rendered === null && hatHasRecords) unrendered.push(hat);

    for (const section of SECTION_NAMES) {
      const inputs = resolveSectionInputs(hat, section, grouped);
      entries.push({
        hat,
        section,
        inputs: inputMap(inputs),
        inputHash: sectionInputHash(inputs),
        outputHash: rendered,
      });
    }
  }

  const manifest: Manifest = { version: 1, entries };
  writeManifest(opensprintDir, manifest);

  console.log(chalk.green(`Sealed ${entries.length} section(s) across ${registry.length} hat(s).`));
  for (const hat of unrendered) {
    console.log(
      chalk.yellow(`  ${hat}: has records but no view at ${relative(projectRoot, viewPath(opensprintDir, hat))}`)
    );
  }
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
