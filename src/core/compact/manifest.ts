/**
 * Compact — provenance manifest
 *
 * DEC-010 requires recording, per hat and per section, the record ids and
 * content hashes a section was compiled from, plus a hash of the rendered
 * output. That is what makes a view unable to disagree silently with the
 * records it derives from, whether the records moved or the view did.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import type { RecordRef, SectionName } from './sections.js';

export const MANIFEST_FILENAME = '.manifest.json';
export const SQUAD_DIRNAME = 'squad';

export interface ManifestEntry {
  hat: string;
  section: SectionName;
  /** Contributing record ids to their content hashes. */
  inputs: Record<string, string>;
  /** Combined hash over the sorted inputs. */
  inputHash: string;
  /** Hash of the rendered view file, or null when nothing was rendered. */
  outputHash: string | null;
}

export interface Manifest {
  version: 1;
  entries: ManifestEntry[];
}

/**
 * Hashes content after normalising line endings.
 *
 * A Windows checkout that rewrites LF to CRLF must not change a hash, or
 * every section would read as stale on one platform and fresh on another.
 */
export function hashContent(text: string): string {
  return createHash('sha256').update(text.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

/**
 * Combines a section's record hashes into one.
 *
 * Inputs are sorted by record id first, so that `readdir` order — which
 * differs across platforms — cannot change the result.
 */
export function sectionInputHash(records: readonly RecordRef[]): string {
  const pairs = records
    .map((r) => [r.id, hashContent(r.content)] as const)
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const combined = pairs.map(([id, hash]) => `${id}:${hash}`).join('\n');
  return createHash('sha256').update(combined, 'utf8').digest('hex');
}

/** Record ids to content hashes, for storing in a manifest entry. */
export function inputMap(records: readonly RecordRef[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of records) out[r.id] = hashContent(r.content);
  return out;
}

export function manifestPath(opensprintDir: string): string {
  return path.join(opensprintDir, SQUAD_DIRNAME, MANIFEST_FILENAME);
}

export function viewPath(opensprintDir: string, hat: string): string {
  return path.join(opensprintDir, SQUAD_DIRNAME, `${hat}.md`);
}

export function indexPath(opensprintDir: string): string {
  return path.join(opensprintDir, SQUAD_DIRNAME, 'index.md');
}

/**
 * Reads the manifest.
 *
 * A missing or malformed manifest reads as empty rather than throwing: the
 * correct response to an unreadable manifest is to report every section
 * unsealed, not to fail the command.
 */
export function readManifest(opensprintDir: string): Manifest {
  const file = manifestPath(opensprintDir);
  if (!fs.existsSync(file)) return { version: 1, entries: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray((parsed as Manifest).entries)
    ) {
      return { version: 1, entries: [] };
    }
    return { version: 1, entries: (parsed as Manifest).entries };
  } catch {
    return { version: 1, entries: [] };
  }
}

export function writeManifest(opensprintDir: string, manifest: Manifest): void {
  const dir = path.join(opensprintDir, SQUAD_DIRNAME);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(manifestPath(opensprintDir), JSON.stringify(manifest, null, 2) + '\n');
}

export function findEntry(
  manifest: Manifest,
  hat: string,
  section: SectionName
): ManifestEntry | undefined {
  return manifest.entries.find((e) => e.hat === hat && e.section === section);
}
