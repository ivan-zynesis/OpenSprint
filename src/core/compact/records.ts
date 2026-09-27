/**
 * Compact — record reading
 *
 * decision-map reads records for the tree and needs only their metadata.
 * The compiler additionally needs each record's path, so the renderer can
 * open it, and its content, so the engine can hash it. This reader returns
 * both, reusing decision-map's frontmatter parsing rather than repeating it.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseFrontmatter } from '../decision-map.js';
import type { DriverSpecEntry, DecisionEntry } from '../decision-map.js';
import { normalizeHats } from '../hats.js';

export type SourcedDriverSpec = DriverSpecEntry & {
  path: string;
  content: string;
  /** Role within the hat, when classified. */
  role?: string;
  /** Other driver-specs this one exists because of. */
  dependsOn: string[];
};
export type SourcedDecision = DecisionEntry & {
  path: string;
  content: string;
  /** Role within the hat, when classified. */
  role?: string;
};

function readDir(dir: string): Array<{ file: string; content: string }> {
  if (!fs.existsSync(dir)) return [];
  const out: Array<{ file: string; content: string }> = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.md')) continue;
    out.push({ file, content: fs.readFileSync(path.join(dir, file), 'utf-8') });
  }
  return out;
}

/** Reads driver specs with their path and content. */
export function readSourcedDriverSpecs(opensprintDir: string): SourcedDriverSpec[] {
  const dir = path.join(opensprintDir, 'driver-specs');
  const out: SourcedDriverSpec[] = [];
  for (const { file, content } of readDir(dir)) {
    const fm = parseFrontmatter(content);
    if (!fm || !fm.id) continue;
    out.push({
      id: fm.id as string,
      type: (fm.type as string) || 'unknown',
      status: (fm.status as string) || 'active',
      hats: normalizeHats(fm.hats) ?? undefined,
      role: typeof fm.role === 'string' ? fm.role : undefined,
      // The same field name the decision layer uses: the relationship means
      // the same thing, and a second name would mean a second parser.
      dependsOn: Array.isArray(fm['depends-on']) ? (fm['depends-on'] as string[]) : [],
      path: path.join(opensprintDir, 'driver-specs', file),
      content,
    });
  }
  return out;
}

/** Reads decision records with their path and content. */
export function readSourcedDecisions(opensprintDir: string): SourcedDecision[] {
  const dir = path.join(opensprintDir, 'ADRs');
  const out: SourcedDecision[] = [];
  for (const { file, content } of readDir(dir)) {
    const fm = parseFrontmatter(content);
    if (!fm || !fm.id) continue;
    const dependsOn = Array.isArray(fm['depends-on']) ? (fm['depends-on'] as string[]) : [];
    out.push({
      id: fm.id as string,
      status: (fm.status as string) || 'accepted',
      dependsOn,
      depth: typeof fm.depth === 'number' ? fm.depth : 0,
      summary: '',
      hats: normalizeHats(fm.hats) ?? undefined,
      role: typeof fm.role === 'string' ? fm.role : undefined,
      path: path.join(opensprintDir, 'ADRs', file),
      content,
    });
  }
  return out;
}
