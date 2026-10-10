/**
 * `opensprint migrate` — report what the current hat shapes can no longer
 * select.
 *
 * Reporting only. The backfill is a judgement and belongs to the
 * `/opsp:migrate` workflow, which does it one record at a time with the
 * operator confirming each (DEC-MIGRATE-SEPARATE-TOOL).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { findMigrations, type Migration } from '../core/migrate.js';

const OPENSPRINT_DIR_NAME = 'opensprint';

export interface MigrateOptions {
  json?: boolean;
}

export async function migrateCommand(options: MigrateOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const opensprintDir = path.join(projectRoot, OPENSPRINT_DIR_NAME);

  if (!fs.existsSync(opensprintDir)) {
    throw new Error(`No ${OPENSPRINT_DIR_NAME}/ directory. Run 'opensprint init' first.`);
  }

  const found = findMigrations(projectRoot, opensprintDir);

  if (options.json) {
    console.log(JSON.stringify({ migrations: found }, null, 2));
    return;
  }

  if (found.length === 0) {
    console.log(chalk.green('\nNothing to migrate. Every record is selectable by its hats.\n'));
    return;
  }

  console.log(chalk.bold(`\n${found.length} record(s) the current shapes cannot select\n`));

  // The view-level finding first: it is how a shape change nobody noticed
  // surfaces, and it explains the record-level ones underneath it.
  const order = (m: Migration) => (m.kind === 'hat-entirely-empty' ? 0 : 1);
  for (const m of [...found].sort((a, b) => order(a) - order(b))) {
    console.log(`  ${chalk.yellow(m.kind)}  ${chalk.cyan(m.subject)}`);
    console.log(`    ${m.detail}`);
    if (m.candidates && m.candidates.length > 0) {
      console.log(chalk.gray(`    candidates: ${m.candidates.join(', ')}`));
    }
  }

  console.log(
    chalk.gray(
      '\nRun /opsp:migrate to work through these. A record needing migration is misfiled,\n' +
        'not wrong — nothing here is re-decided.\n'
    )
  );
}
