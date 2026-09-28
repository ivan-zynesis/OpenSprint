import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { resolveHatRegistry, resolveHatSections, DEFAULT_HATS } from '../../src/core/hats.js';
import {
  DEFAULT_SECTIONS_BY_HAT,
  GENERIC_SECTIONS,
  resolveSectionInputs,
  groupRecordsByHat,
} from '../../src/core/compact/sections.js';
import { classifySection, classifyAll } from '../../src/core/compact/status.js';
import {
  readManifest,
  writeManifest,
  inputMap,
  sectionInputHash,
  viewPath,
  hashContent,
} from '../../src/core/compact/manifest.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../../src/core/compact/records.js';

describe('per-hat sections', () => {
  let root: string;
  const sprint = () => path.join(root, 'opensprint');

  beforeEach(() => {
    root = path.join(os.tmpdir(), `openspec-hatsec-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'ADRs'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  const config = (body: string) =>
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), `schema: spec-driven\n${body}`);

  const spec = (id: string, hats: string) =>
    fs.writeFileSync(
      path.join(sprint(), 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: product\nstatus: active\ncreated: 2026-01-01\nhats: ${hats}\n---\n\nBody ${id}\n`
    );
  const dec = (id: string, hats: string, body = 'Q') =>
    fs.writeFileSync(
      path.join(sprint(), 'ADRs', `${id}.md`),
      `---\nid: ${id}\nstatus: accepted\ndepends-on:\n  - DS-A\ncreated: 2026-01-01\ndepth: 0\nhats: ${hats}\n---\n\n## Question\n\n${body}\n`
    );
  const group = () =>
    groupRecordsByHat(readSourcedDriverSpecs(sprint()), readSourcedDecisions(sprint()), resolveHatRegistry(root));

  // ═══════════════════════════════════════════════════════════
  // Backward compatibility — the list form older configs carry
  // ═══════════════════════════════════════════════════════════

  describe('backward compatibility (DS-BACKWARD-COMPAT)', () => {
    it('no hats key resolves to the default hats, each with its own shape', () => {
      expect(resolveHatRegistry(root)).toEqual(DEFAULT_HATS);
      for (const hat of DEFAULT_HATS) {
        expect(resolveHatSections(root, hat)).toEqual(DEFAULT_SECTIONS_BY_HAT[hat]);
      }
    });

    it('the list form keeps working and keeps its meaning', () => {
      config('hats:\n  - product\n  - dev\n');
      expect(resolveHatRegistry(root)).toEqual(['product', 'dev']);
      expect(resolveHatSections(root, 'dev')).toEqual(DEFAULT_SECTIONS_BY_HAT.dev);
      expect(resolveHatSections(root, 'product')).toEqual(DEFAULT_SECTIONS_BY_HAT.product);
    });

    it('an empty list degrades to the defaults', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      config('hats: []\n');
      expect(resolveHatRegistry(root)).toEqual(DEFAULT_HATS);
      expect(warn).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // The map form
  // ═══════════════════════════════════════════════════════════

  describe('map form', () => {
    it('resolves hat names from the map keys', () => {
      config('hats:\n  product: {}\n  dev: {}\n');
      expect(resolveHatRegistry(root)).toEqual(['product', 'dev']);
    });

    it('a hat with an empty configuration gets its own default shape', () => {
      config('hats:\n  product: {}\n');
      expect(resolveHatSections(root, 'product')).toEqual(DEFAULT_SECTIONS_BY_HAT.product);
    });

    it('a hat declaring sections gets exactly those', () => {
      config(`hats:
  dev:
    sections:
      - { name: tech-stack, inputs: all }
      - { name: open-loops, inputs: none }
`);
      expect(resolveHatSections(root, 'dev')).toEqual([
        { name: 'tech-stack', inputs: 'all' },
        { name: 'open-loops', inputs: 'none' },
      ]);
    });

    it('declaring sections for one hat does not blank another', () => {
      config(`hats:
  dev:
    sections:
      - { name: tech-stack, inputs: all }
  product: {}
`);
      expect(resolveHatSections(root, 'dev')).toHaveLength(1);
      expect(resolveHatSections(root, 'product')).toEqual(DEFAULT_SECTIONS_BY_HAT.product);
    });

    it('a hat the tool does not know gets the generic shape, not nothing', () => {
      config('hats:\n  dev: {}\n');
      expect(resolveHatSections(root, 'never-declared')).toEqual(GENERIC_SECTIONS);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Malformed input degrades rather than failing
  // ═══════════════════════════════════════════════════════════

  describe('malformed configuration', () => {
    it('a non-array non-map hats value warns and degrades', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      config('hats: product\n');
      expect(resolveHatRegistry(root)).toEqual(DEFAULT_HATS);
      expect(warn.mock.calls.flat().join(' ')).toContain("'hats'");
    });

    it('an unknown input kind degrades that hat and names the offender', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      config(`hats:
  dev:
    sections:
      - { name: bars, inputs: everything }
`);
      expect(resolveHatSections(root, 'dev')).toEqual(DEFAULT_SECTIONS_BY_HAT.dev);
      const said = warn.mock.calls.flat().join(' ');
      expect(said).toContain('dev');
      expect(said).toContain('bars');
      expect(said).toContain('everything');
    });

    it('does not throw on any malformed shape', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      for (const body of ['hats: 7\n', 'hats:\n  dev: 7\n', 'hats:\n  dev:\n    sections: 7\n']) {
        config(body);
        expect(() => resolveHatRegistry(root)).not.toThrow();
        expect(() => resolveHatSections(root, 'dev')).not.toThrow();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Granularity survives a custom section set (DEC-010)
  // ═══════════════════════════════════════════════════════════

  describe('granularity under a custom section set', () => {
    function seal(sections: readonly { name: string; inputs: string }[]) {
      const g = group();
      const entries = [];
      fs.mkdirSync(path.dirname(viewPath(sprint(), 'dev')), { recursive: true });
      fs.writeFileSync(viewPath(sprint(), 'dev'), '# dev\n');
      for (const s of sections) {
        const inputs = resolveSectionInputs('dev', s as never, g);
        entries.push({
          hat: 'dev',
          section: s.name,
          inputs: inputMap(inputs),
          inputHash: sectionInputHash(inputs),
          outputHash: hashContent('# dev\n'),
        });
      }
      writeManifest(sprint(), { version: 1, entries });
    }

    it('a changed ADR restages a decisions section and leaves a driver-specs one fresh', () => {
      config(`hats:
  dev:
    sections:
      - { name: bars, inputs: driver-specs }
      - { name: choices, inputs: decisions }
`);
      spec('DS-A', '[dev]');
      dec('DEC-1', '[dev]');
      const sections = resolveHatSections(root, 'dev');
      seal(sections);

      dec('DEC-1', '[dev]', 'a different question entirely');

      const m = readManifest(sprint());
      const g = group();
      expect(classifySection(sprint(), m, 'dev', sections[1], g).state).toBe('stale');
      expect(classifySection(sprint(), m, 'dev', sections[0], g).state).toBe('fresh');
    });

    it('classifyAll follows each hat\'s own section list', () => {
      config(`hats:
  dev:
    sections:
      - { name: only-one, inputs: all }
  product: {}
`);
      spec('DS-A', '[product]');
      dec('DEC-1', '[dev]');
      const all = classifyAll(sprint(), readManifest(sprint()), resolveHatRegistry(root), group(), (h) =>
        resolveHatSections(root, h)
      );
      expect(all.filter((s) => s.hat === 'dev')).toHaveLength(1);
      expect(all.filter((s) => s.hat === 'product')).toHaveLength(DEFAULT_SECTIONS_BY_HAT.product.length);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Orphaned manifest entries
  // ═══════════════════════════════════════════════════════════

  describe('orphaned manifest entries', () => {
    it('an entry for a section the hat no longer declares is ignored', () => {
      config(`hats:
  dev:
    sections:
      - { name: kept, inputs: all }
`);
      dec('DEC-1', '[dev]');
      fs.mkdirSync(path.dirname(viewPath(sprint(), 'dev')), { recursive: true });
      fs.writeFileSync(viewPath(sprint(), 'dev'), '# dev\n');

      const g = group();
      const kept = resolveHatSections(root, 'dev')[0];
      const inputs = resolveSectionInputs('dev', kept, g);
      writeManifest(sprint(), {
        version: 1,
        entries: [
          { hat: 'dev', section: 'kept', inputs: inputMap(inputs), inputHash: sectionInputHash(inputs), outputHash: hashContent('# dev\n') },
          { hat: 'dev', section: 'removed-long-ago', inputs: {}, inputHash: 'stale', outputHash: 'stale' },
        ],
      });

      const all = classifyAll(sprint(), readManifest(sprint()), ['dev'], g, (h) => resolveHatSections(root, h));
      expect(all).toHaveLength(1);
      expect(all[0].section).toBe('kept');
      expect(all[0].state).toBe('fresh');
    });
  });
});
