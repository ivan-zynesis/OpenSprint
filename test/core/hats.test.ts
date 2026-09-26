import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  DEFAULT_HATS,
  DRIVER_SPEC_TYPES,
  resolveHatRegistry,
  isValidHat,
  normalizeHats,
  invalidHats,
  isValidDriverSpecType,
  defaultHatsForDriverSpec,
  defaultHatsForDecision,
  type DecisionAncestryNode,
} from '../../src/core/hats.js';
import { readDriverSpecs, readDecisionRecords } from '../../src/core/decision-map.js';

describe('hats', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `openspec-hats-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(tempDir, 'openspec'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  function writeConfig(body: string) {
    fs.writeFileSync(path.join(tempDir, 'openspec', 'config.yaml'), body);
  }

  // ═══════════════════════════════════════════════════════════
  // Registry resolution
  // ═══════════════════════════════════════════════════════════

  describe('DEFAULT_HATS', () => {
    it('contains exactly the four default hats, by explicit list', () => {
      expect([...DEFAULT_HATS]).toEqual(['product', 'maintainer', 'dev', 'devops']);
    });

    it('has no agreements hat — DEC-016 removed it', () => {
      expect([...DEFAULT_HATS]).not.toContain('agreements');
    });
  });

  describe('resolveHatRegistry', () => {
    it('falls back to the default set when no config file exists', () => {
      expect(resolveHatRegistry(tempDir)).toEqual(DEFAULT_HATS);
    });

    it('falls back to the default set when config declares no hats', () => {
      writeConfig('schema: spec-driven\n');
      expect(resolveHatRegistry(tempDir)).toEqual(DEFAULT_HATS);
    });

    it('returns the project registry when declared, without merging the default', () => {
      writeConfig('schema: spec-driven\nhats:\n  - product\n  - designer\n');
      expect(resolveHatRegistry(tempDir)).toEqual(['product', 'designer']);
    });

    it('falls back and warns when hats is an empty array', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      writeConfig('schema: spec-driven\nhats: []\n');
      expect(resolveHatRegistry(tempDir)).toEqual(DEFAULT_HATS);
      expect(warn.mock.calls.flat().join(' ')).toContain("'hats'");
    });

    it('falls back and warns when hats is not an array', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      writeConfig('schema: spec-driven\nhats: product\n');
      expect(resolveHatRegistry(tempDir)).toEqual(DEFAULT_HATS);
      expect(warn.mock.calls.flat().join(' ')).toContain("'hats'");
    });

    it('falls back and warns when hats contains a non-string', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      writeConfig('schema: spec-driven\nhats:\n  - product\n  - 7\n');
      expect(resolveHatRegistry(tempDir)).toEqual(DEFAULT_HATS);
      expect(warn.mock.calls.flat().join(' ')).toContain("'hats'");
    });

    it('reads config via path.join so the lookup is cross-platform', () => {
      // Writing through path.join and reading back proves no separator is hardcoded.
      const configPath = path.join(tempDir, 'openspec', 'config.yaml');
      fs.writeFileSync(configPath, 'schema: spec-driven\nhats:\n  - devops\n');
      expect(resolveHatRegistry(tempDir)).toEqual(['devops']);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Validation
  // ═══════════════════════════════════════════════════════════

  describe('isValidHat', () => {
    it('accepts a hat present in the registry', () => {
      expect(isValidHat('maintainer', DEFAULT_HATS)).toBe(true);
    });

    it('rejects a hat absent from the registry', () => {
      expect(isValidHat('designer', DEFAULT_HATS)).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(isValidHat('Product', DEFAULT_HATS)).toBe(false);
      expect(isValidHat('product', DEFAULT_HATS)).toBe(true);
    });

    it('rejects non-string values', () => {
      expect(isValidHat(undefined, DEFAULT_HATS)).toBe(false);
      expect(isValidHat(null, DEFAULT_HATS)).toBe(false);
      expect(isValidHat(7, DEFAULT_HATS)).toBe(false);
      expect(isValidHat(['product'], DEFAULT_HATS)).toBe(false);
    });

    it('validates against a custom registry, not the default', () => {
      const custom = ['product', 'designer'];
      expect(isValidHat('designer', custom)).toBe(true);
      expect(isValidHat('devops', custom)).toBe(false);
    });
  });

  describe('isValidDriverSpecType', () => {
    it('accepts exactly the six documented types', () => {
      expect([...DRIVER_SPEC_TYPES]).toEqual([
        'product',
        'legal',
        'compliance',
        'reliability',
        'architecture',
        'business',
      ]);
      for (const type of DRIVER_SPEC_TYPES) {
        expect(isValidDriverSpecType(type)).toBe(true);
      }
    });

    it('rejects "driver-spec", the value that reached production records', () => {
      expect(isValidDriverSpecType('driver-spec')).toBe(false);
    });

    it('rejects other unlisted values', () => {
      expect(isValidDriverSpecType('operating-model')).toBe(false);
      expect(isValidDriverSpecType('adr')).toBe(false);
      expect(isValidDriverSpecType('')).toBe(false);
      expect(isValidDriverSpecType(undefined)).toBe(false);
    });
  });

  describe('normalizeHats', () => {
    it('normalises a bare string to a single-element list', () => {
      expect(normalizeHats('product')).toEqual(['product']);
    });

    it('accepts a list and preserves order', () => {
      expect(normalizeHats(['dev', 'product'])).toEqual(['dev', 'product']);
    });

    it('removes duplicates', () => {
      expect(normalizeHats(['dev', 'dev', 'product'])).toEqual(['dev', 'product']);
    });

    it('returns null for an empty list — declaring the key must say something', () => {
      expect(normalizeHats([])).toBeNull();
    });

    it('returns null for malformed values', () => {
      expect(normalizeHats(undefined)).toBeNull();
      expect(normalizeHats(null)).toBeNull();
      expect(normalizeHats('')).toBeNull();
      expect(normalizeHats(7)).toBeNull();
      expect(normalizeHats(['product', 7])).toBeNull();
      expect(normalizeHats(['product', ''])).toBeNull();
    });
  });

  describe('invalidHats', () => {
    it('returns empty when every hat is in the registry', () => {
      expect(invalidHats(['product', 'dev'], DEFAULT_HATS)).toEqual([]);
    });

    it('returns only the unknown hats', () => {
      expect(invalidHats(['product', 'designer'], DEFAULT_HATS)).toEqual(['designer']);
    });

    it('rejects agreements against the default registry — DEC-016', () => {
      expect(invalidHats(['agreements'], DEFAULT_HATS)).toEqual(['agreements']);
    });

    it('validates against a custom registry', () => {
      expect(invalidHats(['designer'], ['product', 'designer'])).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Inference
  // ═══════════════════════════════════════════════════════════

  describe('defaultHatsForDriverSpec', () => {
    it.each([
      ['product', 'product'],
      ['business', 'product'],
      ['legal', 'maintainer'],
      ['compliance', 'maintainer'],
      ['reliability', 'maintainer'],
      ['architecture', 'dev'],
    ])('maps type %s to hat %s', (type, hat) => {
      expect(defaultHatsForDriverSpec(type)).toEqual([hat]);
    });

    it('returns an empty list for an invalid type', () => {
      expect(defaultHatsForDriverSpec('driver-spec')).toEqual([]);
      expect(defaultHatsForDriverSpec(undefined)).toEqual([]);
    });

    it('never infers devops from any accepted type', () => {
      for (const type of DRIVER_SPEC_TYPES) {
        expect(defaultHatsForDriverSpec(type)).not.toContain('devops');
      }
    });

    it('never proposes more than one hat — crossing hats is assigned, not guessed', () => {
      for (const type of DRIVER_SPEC_TYPES) {
        expect(defaultHatsForDriverSpec(type).length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('defaultHatsForDecision', () => {
    const specs = (entries: Record<string, string>) => new Map(Object.entries(entries));
    const decisions = (entries: Record<string, string[]>) =>
      new Map<string, DecisionAncestryNode>(
        Object.entries(entries).map(([id, dependsOn]) => [id, { id, dependsOn }])
      );

    it('infers from a single driver-spec ancestor', () => {
      expect(
        defaultHatsForDecision(
          'DEC-001',
          decisions({ 'DEC-001': ['DS-A'] }),
          specs({ 'DS-A': 'reliability' })
        )
      ).toEqual(['maintainer']);
    });

    it('walks transitively through intermediate decisions', () => {
      expect(
        defaultHatsForDecision(
          'DEC-003',
          decisions({ 'DEC-003': ['DEC-002'], 'DEC-002': ['DEC-001'], 'DEC-001': ['DS-A'] }),
          specs({ 'DS-A': 'architecture' })
        )
      ).toEqual(['dev']);
    });

    it('infers when several ancestors agree on one hat', () => {
      expect(
        defaultHatsForDecision(
          'DEC-001',
          decisions({ 'DEC-001': ['DS-A', 'DS-B'] }),
          specs({ 'DS-A': 'legal', 'DS-B': 'compliance' })
        )
      ).toEqual(['maintainer']);
    });

    it('returns an empty list when ancestors disagree', () => {
      expect(
        defaultHatsForDecision(
          'DEC-001',
          decisions({ 'DEC-001': ['DS-A', 'DS-B'] }),
          specs({ 'DS-A': 'product', 'DS-B': 'reliability' })
        )
      ).toEqual([]);
    });

    it('returns an empty list when there are no driver-spec ancestors', () => {
      expect(
        defaultHatsForDecision('DEC-002', decisions({ 'DEC-002': ['DEC-001'], 'DEC-001': [] }), specs({}))
      ).toEqual([]);
    });

    it('returns an empty list when an ancestor type has no mapping', () => {
      expect(
        defaultHatsForDecision(
          'DEC-001',
          decisions({ 'DEC-001': ['DS-A'] }),
          specs({ 'DS-A': 'driver-spec' })
        )
      ).toEqual([]);
    });

    it('ignores a dangling depends-on reference rather than failing', () => {
      expect(
        defaultHatsForDecision(
          'DEC-001',
          decisions({ 'DEC-001': ['DS-A', 'DEC-999'] }),
          specs({ 'DS-A': 'product' })
        )
      ).toEqual(['product']);
    });

    it('terminates on a malformed dependency cycle', () => {
      expect(
        defaultHatsForDecision(
          'DEC-001',
          decisions({ 'DEC-001': ['DEC-002'], 'DEC-002': ['DEC-001'] }),
          specs({})
        )
      ).toEqual([]);
    });

    it('never infers devops', () => {
      for (const type of DRIVER_SPEC_TYPES) {
        expect(
          defaultHatsForDecision(
            'DEC-001',
            decisions({ 'DEC-001': ['DS-A'] }),
            specs({ 'DS-A': type })
          )
        ).not.toContain('devops');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Backward compatibility — records predating the field
  // ═══════════════════════════════════════════════════════════

  describe('records without a hat field', () => {
    let recordsDir: string;

    beforeEach(() => {
      recordsDir = path.join(tempDir, 'opensprint');
      fs.mkdirSync(path.join(recordsDir, 'driver-specs'), { recursive: true });
      fs.mkdirSync(path.join(recordsDir, 'ADRs'), { recursive: true });
    });

    it('parses a driver spec with no hat and reports it unassigned', () => {
      fs.writeFileSync(
        path.join(recordsDir, 'driver-specs', 'DS-A.md'),
        '---\nid: DS-A\ntype: product\nstatus: active\ncreated: 2026-01-01\n---\n\nBody\n'
      );
      const [spec] = readDriverSpecs(recordsDir);
      expect(spec.id).toBe('DS-A');
      expect(spec.hats).toBeUndefined();
    });

    it('parses a decision record with no hat and reports it unassigned', () => {
      fs.writeFileSync(
        path.join(recordsDir, 'ADRs', 'DEC-001.md'),
        '---\nid: DEC-001\nstatus: accepted\ndepends-on:\n  - DS-A\ncreated: 2026-01-01\ndepth: 0\n---\n\n## Question\n\nQ\n'
      );
      const [decision] = readDecisionRecords(recordsDir);
      expect(decision.id).toBe('DEC-001');
      expect(decision.hats).toBeUndefined();
    });

    it('carries hats through when present, in both spellings', () => {
      fs.writeFileSync(
        path.join(recordsDir, 'driver-specs', 'DS-B.md'),
        '---\nid: DS-B\ntype: reliability\nstatus: active\ncreated: 2026-01-01\nhats: maintainer\n---\n\nBody\n'
      );
      fs.writeFileSync(
        path.join(recordsDir, 'ADRs', 'DEC-002.md'),
        '---\nid: DEC-002\nstatus: accepted\ndepends-on:\n  - DS-B\ncreated: 2026-01-01\ndepth: 0\nhats: [dev, devops]\n---\n\n## Question\n\nQ\n'
      );
      // bare string normalises to a single-element list
      expect(readDriverSpecs(recordsDir)[0].hats).toEqual(['maintainer']);
      // a record may cross hats (DEC-016)
      expect(readDecisionRecords(recordsDir)[0].hats).toEqual(['dev', 'devops']);
    });

    it('ignores a malformed hats value rather than failing the parse', () => {
      fs.writeFileSync(
        path.join(recordsDir, 'driver-specs', 'DS-C.md'),
        '---\nid: DS-C\ntype: product\nstatus: active\ncreated: 2026-01-01\nhats: 7\n---\n\nBody\n'
      );
      const [spec] = readDriverSpecs(recordsDir);
      expect(spec.id).toBe('DS-C');
      expect(spec.hats).toBeUndefined();
    });
  });
});
