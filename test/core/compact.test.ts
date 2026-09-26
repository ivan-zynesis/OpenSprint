import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  SECTION_NAMES,
  groupRecordsByHat,
  resolveSectionInputs,
  type RecordRef,
} from '../../src/core/compact/sections.js';
import {
  hashContent,
  sectionInputHash,
  inputMap,
  readManifest,
  writeManifest,
  manifestPath,
  viewPath,
  type Manifest,
} from '../../src/core/compact/manifest.js';
import { classifySection, classifyAll, allFresh } from '../../src/core/compact/status.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../../src/core/compact/records.js';

const REGISTRY = ['product', 'maintainer', 'dev', 'devops'] as const;

describe('compact', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `openspec-compact-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(tempDir, 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'ADRs'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function writeSpec(id: string, hats: string, opts: { status?: string; body?: string } = {}) {
    const { status = 'active', body = `Body for ${id}` } = opts;
    fs.writeFileSync(
      path.join(tempDir, 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: product\nstatus: ${status}\ncreated: 2026-01-01\nhats: ${hats}\n---\n\n${body}\n`
    );
  }

  function writeDecision(id: string, hats: string, opts: { status?: string; body?: string } = {}) {
    const { status = 'accepted', body = `Body for ${id}` } = opts;
    fs.writeFileSync(
      path.join(tempDir, 'ADRs', `${id}.md`),
      `---\nid: ${id}\nstatus: ${status}\ndepends-on:\n  - DS-A\ncreated: 2026-01-01\ndepth: 0\nhats: ${hats}\n---\n\n## Question\n\n${body}\n`
    );
  }

  const group = () =>
    groupRecordsByHat(readSourcedDriverSpecs(tempDir), readSourcedDecisions(tempDir), REGISTRY);

  // ═══════════════════════════════════════════════════════════
  // Grouping
  // ═══════════════════════════════════════════════════════════

  describe('groupRecordsByHat', () => {
    it('assigns a record to the hat it declares', () => {
      writeSpec('DS-A', '[product]');
      const g = group();
      expect(g.driverSpecsByHat.get('product')!.map((r) => r.id)).toEqual(['DS-A']);
      expect(g.driverSpecsByHat.get('dev')).toEqual([]);
    });

    it('assigns a multi-hat record to every hat it declares', () => {
      writeSpec('DS-A', '[product, maintainer]');
      const g = group();
      expect(g.driverSpecsByHat.get('product')!.map((r) => r.id)).toEqual(['DS-A']);
      expect(g.driverSpecsByHat.get('maintainer')!.map((r) => r.id)).toEqual(['DS-A']);
    });

    it('reports a record declaring no hats as unassigned', () => {
      fs.writeFileSync(
        path.join(tempDir, 'driver-specs', 'DS-B.md'),
        '---\nid: DS-B\ntype: product\nstatus: active\ncreated: 2026-01-01\n---\n\nBody\n'
      );
      const g = group();
      expect(g.unassigned).toEqual(['DS-B']);
      expect(g.driverSpecsByHat.get('product')).toEqual([]);
    });

    it('reports an unknown hat and does not invent a view for it', () => {
      writeSpec('DS-C', '[designer]');
      const g = group();
      expect(g.unknownHats).toEqual([['DS-C', 'designer']]);
      expect(g.driverSpecsByHat.has('designer')).toBe(false);
      expect(g.unassigned).toEqual(['DS-C']);
    });

    it('keeps a record that declares one known and one unknown hat', () => {
      writeSpec('DS-D', '[product, designer]');
      const g = group();
      expect(g.driverSpecsByHat.get('product')!.map((r) => r.id)).toEqual(['DS-D']);
      expect(g.unknownHats).toEqual([['DS-D', 'designer']]);
      expect(g.unassigned).toEqual([]);
    });

    it('excludes superseded and deprecated records', () => {
      writeSpec('DS-OLD', '[product]', { status: 'superseded' });
      writeSpec('DS-GONE', '[product]', { status: 'deprecated' });
      writeSpec('DS-NOW', '[product]');
      writeDecision('DEC-OLD', '[dev]', { status: 'superseded' });
      writeDecision('DEC-NOW', '[dev]');
      const g = group();
      expect(g.driverSpecsByHat.get('product')!.map((r) => r.id)).toEqual(['DS-NOW']);
      expect(g.decisionsByHat.get('dev')!.map((r) => r.id)).toEqual(['DEC-NOW']);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Section inputs
  // ═══════════════════════════════════════════════════════════

  describe('resolveSectionInputs', () => {
    it('defines exactly four sections, by explicit list', () => {
      expect([...SECTION_NAMES]).toEqual(['charter', 'constraints', 'decisions', 'open-loops']);
    });

    it('routes each section to its documented input set', () => {
      writeSpec('DS-A', '[dev]');
      writeDecision('DEC-1', '[dev]');
      const g = group();
      expect(resolveSectionInputs('dev', 'charter', g).map((r) => r.id)).toEqual(['DS-A', 'DEC-1']);
      expect(resolveSectionInputs('dev', 'constraints', g).map((r) => r.id)).toEqual(['DS-A']);
      expect(resolveSectionInputs('dev', 'decisions', g).map((r) => r.id)).toEqual(['DEC-1']);
      expect(resolveSectionInputs('dev', 'open-loops', g)).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Hashing
  // ═══════════════════════════════════════════════════════════

  describe('hashing', () => {
    const ref = (id: string, content: string): RecordRef => ({ id, path: `${id}.md`, content });

    it('is independent of input order', () => {
      const a = [ref('B', 'two'), ref('A', 'one')];
      const b = [ref('A', 'one'), ref('B', 'two')];
      expect(sectionInputHash(a)).toBe(sectionInputHash(b));
    });

    it('is independent of line endings', () => {
      expect(hashContent('a\r\nb\r\n')).toBe(hashContent('a\nb\n'));
      expect(sectionInputHash([ref('A', 'x\r\ny')])).toBe(sectionInputHash([ref('A', 'x\ny')]));
    });

    it('changes when content changes', () => {
      expect(sectionInputHash([ref('A', 'one')])).not.toBe(sectionInputHash([ref('A', 'two')]));
    });

    it('changes when a record is added', () => {
      expect(sectionInputHash([ref('A', 'one')])).not.toBe(
        sectionInputHash([ref('A', 'one'), ref('B', 'two')])
      );
    });

    it('maps record ids to content hashes', () => {
      expect(inputMap([ref('A', 'one')])).toEqual({ A: hashContent('one') });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Manifest
  // ═══════════════════════════════════════════════════════════

  describe('manifest', () => {
    it('reads as empty when absent', () => {
      expect(readManifest(tempDir)).toEqual({ version: 1, entries: [] });
    });

    it('round-trips', () => {
      const m: Manifest = {
        version: 1,
        entries: [{ hat: 'dev', section: 'decisions', inputs: { 'DEC-1': 'abc' }, inputHash: 'h', outputHash: 'o' }],
      };
      writeManifest(tempDir, m);
      expect(readManifest(tempDir)).toEqual(m);
    });

    it('reads as empty when malformed, without throwing', () => {
      fs.mkdirSync(path.dirname(manifestPath(tempDir)), { recursive: true });
      fs.writeFileSync(manifestPath(tempDir), '{ not json');
      expect(readManifest(tempDir)).toEqual({ version: 1, entries: [] });
    });

    it('reads as empty when the shape is wrong', () => {
      fs.mkdirSync(path.dirname(manifestPath(tempDir)), { recursive: true });
      fs.writeFileSync(manifestPath(tempDir), '{"version":1}');
      expect(readManifest(tempDir)).toEqual({ version: 1, entries: [] });
    });

    it('builds paths with path.join', () => {
      expect(manifestPath(tempDir)).toBe(path.join(tempDir, 'squad', '.manifest.json'));
      expect(viewPath(tempDir, 'dev')).toBe(path.join(tempDir, 'squad', 'dev.md'));
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Classification
  // ═══════════════════════════════════════════════════════════

  describe('classifySection', () => {
    /** Seal the current state the way `compact seal` would. */
    function seal(renderedPerHat: Record<string, string> = {}) {
      const g = group();
      const entries = [];
      for (const hat of REGISTRY) {
        const view = renderedPerHat[hat];
        if (view !== undefined) {
          fs.mkdirSync(path.dirname(viewPath(tempDir, hat)), { recursive: true });
          fs.writeFileSync(viewPath(tempDir, hat), view);
        }
        const out = view === undefined ? null : hashContent(view);
        for (const section of SECTION_NAMES) {
          const inputs = resolveSectionInputs(hat, section, g);
          entries.push({ hat, section, inputs: inputMap(inputs), inputHash: sectionInputHash(inputs), outputHash: out });
        }
      }
      writeManifest(tempDir, { version: 1, entries });
    }

    it('reports unsealed when no manifest exists', () => {
      writeSpec('DS-A', '[product]');
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('unsealed');
    });

    it('reports unsealed, never stale, for a section with no manifest entry', () => {
      writeSpec('DS-A', '[product]');
      writeManifest(tempDir, { version: 1, entries: [] });
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('unsealed');
      expect(s.state).not.toBe('stale');
    });

    it('reports fresh when inputs and output both match', () => {
      writeSpec('DS-A', '[product]');
      seal({ product: '# product view' });
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('fresh');
    });

    it('reports stale with the modified record named', () => {
      writeSpec('DS-A', '[product]');
      seal({ product: '# product view' });
      writeSpec('DS-A', '[product]', { body: 'changed body' });
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('stale');
      expect(s.modified).toEqual(['DS-A']);
      expect(s.added).toEqual([]);
      expect(s.removed).toEqual([]);
    });

    it('reports stale with an added record named', () => {
      writeSpec('DS-A', '[product]');
      seal({ product: '# product view' });
      writeSpec('DS-B', '[product]');
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('stale');
      expect(s.added).toEqual(['DS-B']);
    });

    it('reports stale with a removed record named', () => {
      writeSpec('DS-A', '[product]');
      writeSpec('DS-B', '[product]');
      seal({ product: '# product view' });
      fs.rmSync(path.join(tempDir, 'driver-specs', 'DS-B.md'));
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('stale');
      expect(s.removed).toEqual(['DS-B']);
    });

    it('reports tampered when the view changed but the records did not', () => {
      writeSpec('DS-A', '[product]');
      seal({ product: '# product view' });
      fs.writeFileSync(viewPath(tempDir, 'product'), '# edited by hand');
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('tampered');
    });

    it('prefers stale over tampered when both the records and the view changed', () => {
      writeSpec('DS-A', '[product]');
      seal({ product: '# product view' });
      writeSpec('DS-A', '[product]', { body: 'changed' });
      fs.writeFileSync(viewPath(tempDir, 'product'), '# also edited');
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('stale');
    });

    it('a changed ADR restages decisions but leaves constraints fresh', () => {
      writeSpec('DS-A', '[dev]');
      writeDecision('DEC-1', '[dev]');
      seal({ dev: '# dev view' });
      writeDecision('DEC-1', '[dev]', { body: 'a different decision' });
      const m = readManifest(tempDir);
      const g = group();
      expect(classifySection(tempDir, m, 'dev', 'decisions', g).state).toBe('stale');
      expect(classifySection(tempDir, m, 'dev', 'constraints', g).state).toBe('fresh');
    });

    it('a changed superseded record restages nothing', () => {
      writeSpec('DS-A', '[product]');
      writeSpec('DS-OLD', '[product]', { status: 'superseded' });
      seal({ product: '# product view' });
      writeSpec('DS-OLD', '[product]', { status: 'superseded', body: 'rewritten history' });
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.state).toBe('fresh');
    });

    it('carries the section inputs so a renderer can read them (DEC-011)', () => {
      writeSpec('DS-A', '[product]');
      const s = classifySection(tempDir, readManifest(tempDir), 'product', 'constraints', group());
      expect(s.inputs.map((r) => r.id)).toEqual(['DS-A']);
      expect(s.inputs[0].path).toBe(path.join(tempDir, 'driver-specs', 'DS-A.md'));
    });
  });

  describe('classifyAll', () => {
    it('covers every section of every hat in the registry', () => {
      writeSpec('DS-A', '[product]');
      const all = classifyAll(tempDir, readManifest(tempDir), REGISTRY, group());
      expect(all).toHaveLength(REGISTRY.length * SECTION_NAMES.length);
      expect(allFresh(all)).toBe(false);
    });

    it('allFresh is true only when nothing is outstanding', () => {
      expect(allFresh([])).toBe(true);
      expect(
        allFresh([
          { hat: 'dev', section: 'charter', state: 'fresh', inputs: [], added: [], removed: [], modified: [] },
        ])
      ).toBe(true);
    });
  });
});
