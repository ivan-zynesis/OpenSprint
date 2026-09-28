import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  DEFAULT_SECTIONS_BY_HAT,
  GENERIC_SECTIONS,
  OBSERVES_RULES,
  groupRecordsByHat,
  resolveSectionInputs,
  type SectionDef,
} from '../../src/core/compact/sections.js';
import { resolveObservedFiles } from '../../src/core/compact/rules.js';
import { resolveHatSections, resolveHatRegistry } from '../../src/core/hats.js';
import { classifySection } from '../../src/core/compact/status.js';
import {
  hashContent,
  sectionInputHash,
  inputMap,
  readManifest,
  writeManifest,
  viewPath,
} from '../../src/core/compact/manifest.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../../src/core/compact/records.js';
import { getOpspSkillTemplates } from '../../src/core/shared/index.js';

describe('system as source', () => {
  let root: string;
  const sprint = () => path.join(root, 'opensprint');

  beforeEach(() => {
    root = path.join(os.tmpdir(), `openspec-observe-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'ADRs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  const config = (body: string) =>
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), `schema: spec-driven\n${body}`);
  const file = (rel: string, body: string) => {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
  };
  const dec = (id: string, body = 'Q') =>
    fs.writeFileSync(
      path.join(sprint(), 'ADRs', `${id}.md`),
      `---\nid: ${id}\nstatus: accepted\ndepends-on: []\ncreated: 2026-01-01\ndepth: 0\nhats: [dev]\n---\n\n## Question\n\n${body}\n`
    );
  const group = () =>
    groupRecordsByHat(readSourcedDriverSpecs(sprint()), readSourcedDecisions(sprint()), ['dev']);

  // ═══════════════════════════════════════════════════════════
  // Resolution
  // ═══════════════════════════════════════════════════════════

  describe('resolveObservedFiles', () => {
    it('returns nothing for a section that observes nothing', () => {
      expect(resolveObservedFiles(root, { name: 'x', inputs: 'all' })).toEqual({});
    });

    it('resolves the named rules set through the default rule globs', () => {
      file('src/a.test.ts', '// DEC-001');
      const observed = resolveObservedFiles(root, { name: 'x', inputs: 'none', observes: OBSERVES_RULES });
      expect(Object.keys(observed)).toEqual(['src/a.test.ts']);
    });

    it('follows a project override of ruleGlobs, so the two cannot drift', () => {
      config('ruleGlobs:\n  - "**/*.check.ts"\n');
      file('src/a.test.ts', 'ignored');
      file('src/b.check.ts', 'counted');
      const observed = resolveObservedFiles(root, { name: 'x', inputs: 'none', observes: OBSERVES_RULES });
      expect(Object.keys(observed)).toEqual(['src/b.check.ts']);
    });

    it('resolves explicit globs', () => {
      file('package.json', '{"name":"x"}');
      file('src/thing.ts', 'code');
      const observed = resolveObservedFiles(root, {
        name: 'tech-stack',
        inputs: 'none',
        observes: ['package.json'],
      });
      expect(Object.keys(observed)).toEqual(['package.json']);
    });

    it('applies the standard exclusions, so a view cannot observe the surrogate', () => {
      file('opensprint/notes.test.ts', 'DEC-001');
      file('openspec/x.test.ts', 'DEC-001');
      file('node_modules/pkg/y.test.ts', 'DEC-001');
      file('src/real.test.ts', 'DEC-001');
      const observed = resolveObservedFiles(root, { name: 'x', inputs: 'none', observes: OBSERVES_RULES });
      expect(Object.keys(observed)).toEqual(['src/real.test.ts']);
    });

    it('records paths with forward slashes regardless of platform separator', () => {
      file(path.join('src', 'nested', 'deep.test.ts'), 'x');
      const observed = resolveObservedFiles(root, { name: 'x', inputs: 'none', observes: OBSERVES_RULES });
      expect(Object.keys(observed)).toEqual(['src/nested/deep.test.ts']);
      expect(Object.keys(observed)[0]).not.toContain('\\');
    });

    it('hashes content, so an unchanged file keeps its hash', () => {
      file('src/a.test.ts', 'stable');
      const first = resolveObservedFiles(root, { name: 'x', inputs: 'none', observes: OBSERVES_RULES });
      const second = resolveObservedFiles(root, { name: 'x', inputs: 'none', observes: OBSERVES_RULES });
      expect(first).toEqual(second);
      expect(first['src/a.test.ts']).toBe(hashContent('stable'));
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Hashing
  // ═══════════════════════════════════════════════════════════

  describe('sectionInputHash with observations', () => {
    it('is unchanged when there are no observations', () => {
      const recs = [{ id: 'A', path: 'A.md', content: 'x' }];
      expect(sectionInputHash(recs)).toBe(sectionInputHash(recs, {}));
    });

    it('changes when an observation changes', () => {
      expect(sectionInputHash([], { 'a.ts': 'h1' })).not.toBe(sectionInputHash([], { 'a.ts': 'h2' }));
    });

    it('is independent of observation insertion order', () => {
      expect(sectionInputHash([], { 'b.ts': '2', 'a.ts': '1' })).toBe(
        sectionInputHash([], { 'a.ts': '1', 'b.ts': '2' })
      );
    });

    it('distinguishes a record id from a path that looks like one', () => {
      expect(sectionInputHash([{ id: 'a.ts', path: 'p', content: 'h' }])).not.toBe(
        sectionInputHash([], { 'a.ts': hashContent('h') })
      );
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Classification
  // ═══════════════════════════════════════════════════════════

  describe('classification with observations', () => {
    const section: SectionDef = { name: 'loops', inputs: 'none', observes: OBSERVES_RULES };

    function seal() {
      const observed = resolveObservedFiles(root, section);
      const inputs = resolveSectionInputs('dev', section, group());
      fs.mkdirSync(path.dirname(viewPath(sprint(), 'dev')), { recursive: true });
      fs.writeFileSync(viewPath(sprint(), 'dev'), '# dev\n');
      writeManifest(sprint(), {
        version: 1,
        entries: [
          {
            hat: 'dev',
            section: section.name,
            inputs: inputMap(inputs),
            observed,
            inputHash: sectionInputHash(inputs, observed),
            outputHash: hashContent('# dev\n'),
          },
        ],
      });
    }
    const classify = () =>
      classifySection(sprint(), readManifest(sprint()), 'dev', section, group(), resolveObservedFiles(root, section));

    it('is fresh when nothing moved', () => {
      dec('DEC-001');
      file('src/a.test.ts', '// DEC-001');
      seal();
      expect(classify().state).toBe('fresh');
    });

    it('goes stale when an observed file changes, though no record moved', () => {
      dec('DEC-001');
      file('src/a.test.ts', '// DEC-001');
      seal();
      file('src/a.test.ts', '// DEC-001 with more detail');
      const s = classify();
      expect(s.state).toBe('stale');
      expect(s.observedModified).toEqual(['src/a.test.ts']);
      expect(s.modified).toEqual([]);
    });

    it('closes the milestone-3 gap — a deleted guard restages the report', () => {
      dec('DEC-001');
      file('src/a.test.ts', '// guards DEC-001');
      seal();
      expect(classify().state).toBe('fresh');

      fs.rmSync(path.join(root, 'src', 'a.test.ts'));

      const s = classify();
      expect(s.state).toBe('stale');
      expect(s.observedRemoved).toEqual(['src/a.test.ts']);
    });

    it('names an added observation', () => {
      dec('DEC-001');
      file('src/a.test.ts', '// DEC-001');
      seal();
      file('src/b.test.ts', '// DEC-001 too');
      const s = classify();
      expect(s.state).toBe('stale');
      expect(s.observedAdded).toEqual(['src/b.test.ts']);
    });

    it('keeps observed paths distinct from record ids in the report', () => {
      const withRecords: SectionDef = { name: 'both', inputs: 'decisions', observes: OBSERVES_RULES };
      dec('DEC-001');
      file('src/a.test.ts', '// DEC-001');
      const observed = resolveObservedFiles(root, withRecords);
      const inputs = resolveSectionInputs('dev', withRecords, group());
      fs.mkdirSync(path.dirname(viewPath(sprint(), 'dev')), { recursive: true });
      fs.writeFileSync(viewPath(sprint(), 'dev'), '# dev\n');
      writeManifest(sprint(), {
        version: 1,
        entries: [
          {
            hat: 'dev',
            section: 'both',
            inputs: inputMap(inputs),
            observed,
            inputHash: sectionInputHash(inputs, observed),
            outputHash: hashContent('# dev\n'),
          },
        ],
      });

      dec('DEC-001', 'changed question');
      file('src/a.test.ts', 'changed rule');
      const s = classifySection(
        sprint(),
        readManifest(sprint()),
        'dev',
        withRecords,
        group(),
        resolveObservedFiles(root, withRecords)
      );
      expect(s.modified).toEqual(['DEC-001']);
      expect(s.observedModified).toEqual(['src/a.test.ts']);
    });

    it('a section observing nothing behaves exactly as before', () => {
      const plain: SectionDef = { name: 'decisions', inputs: 'decisions' };
      dec('DEC-001');
      file('src/a.test.ts', '// DEC-001');
      const inputs = resolveSectionInputs('dev', plain, group());
      fs.mkdirSync(path.dirname(viewPath(sprint(), 'dev')), { recursive: true });
      fs.writeFileSync(viewPath(sprint(), 'dev'), '# dev\n');
      writeManifest(sprint(), {
        version: 1,
        entries: [
          {
            hat: 'dev',
            section: 'decisions',
            inputs: inputMap(inputs),
            observed: {},
            inputHash: sectionInputHash(inputs),
            outputHash: hashContent('# dev\n'),
          },
        ],
      });
      // changing a rule file must NOT restage a section that observes nothing
      file('src/a.test.ts', 'totally different');
      const s = classifySection(sprint(), readManifest(sprint()), 'dev', plain, group(), {});
      expect(s.state).toBe('fresh');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Defaults and configuration
  // ═══════════════════════════════════════════════════════════

  describe('defaults and configuration', () => {
    it('every hat shape ends with an open-loops that observes the rules', () => {
      for (const [hat, sections] of Object.entries(DEFAULT_SECTIONS_BY_HAT)) {
        const ol = sections.find((s) => s.name === 'open-loops');
        expect(ol?.observes, hat).toBe(OBSERVES_RULES);
        expect(ol?.inputs, hat).toBe('none');
      }
      const generic = GENERIC_SECTIONS.find((s) => s.name === 'open-loops');
      expect(generic?.observes).toBe(OBSERVES_RULES);
    });

    it('in the generic shape, only open-loops observes anything', () => {
      for (const s of GENERIC_SECTIONS.filter((x) => x.name !== 'open-loops')) {
        expect(s.observes).toBeUndefined();
      }
    });

    it('the dev and devops shapes observe the system, which is the point of them', () => {
      const observing = (hat: string) =>
        DEFAULT_SECTIONS_BY_HAT[hat]!.filter((s) => s.observes !== undefined).map((s) => s.name);
      expect(observing('dev')).toEqual(['tech-stack', 'entity-schema', 'open-loops']);
      expect(observing('devops')).toEqual(['infra-architecture', 'gitops', 'open-loops']);
    });

    it('a declared observes survives resolution', () => {
      config(`hats:
  dev:
    sections:
      - { name: tech-stack, inputs: none, observes: [package.json] }
`);
      expect(resolveHatSections(root, 'dev')).toEqual([
        { name: 'tech-stack', inputs: 'none', observes: ['package.json'] },
      ]);
    });

    it('the named rules set survives resolution', () => {
      config(`hats:
  dev:
    sections:
      - { name: loops, inputs: none, observes: rules }
`);
      expect(resolveHatSections(root, 'dev')[0].observes).toBe(OBSERVES_RULES);
    });

    it('a malformed observes degrades the hat and names the offender', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      config(`hats:
  dev:
    sections:
      - { name: bad, inputs: none, observes: [] }
`);
      expect(resolveHatSections(root, 'dev')).toEqual(DEFAULT_SECTIONS_BY_HAT.dev);
      const said = warn.mock.calls.flat().join(' ');
      expect(said).toContain('dev');
      expect(said).toContain('bad');
    });

    it('does not throw on any malformed observes shape', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      for (const v of ['7', '{}', '[""]']) {
        config(`hats:\n  dev:\n    sections:\n      - { name: x, inputs: none, observes: ${v} }\n`);
        expect(() => resolveHatSections(root, 'dev')).not.toThrow();
        expect(() => resolveHatRegistry(root)).not.toThrow();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  // The rendering contract
  // ═══════════════════════════════════════════════════════════

  describe('the rendering contract', () => {
    const skill = () =>
      getOpspSkillTemplates().find((s) => s.workflowId === 'opsp-compact')!.template.instructions;

    it('states that a decision binds and an observation may be an accident', () => {
      const i = skill();
      expect(i).toMatch(/a decision is binding/i);
      expect(i).toMatch(/an observation is a fact/i);
    });

    it('requires an observation to cite its path', () => {
      expect(skill()).toMatch(/FROM AN OBSERVATION/);
    });

    it('lets an unexplained observation stand without inventing a rationale', () => {
      const i = skill();
      expect(i).toMatch(/An observation no record explains still stands/i);
      expect(i).toMatch(/do not invent a\s+rationale/i);
    });

    it('forbids presenting an observation as a record', () => {
      expect(skill()).toMatch(/Never present an observation as though a record established it/i);
    });

    it('surfaces a record/system contradiction rather than resolving it', () => {
      const i = skill();
      expect(i).toMatch(/surface the disagreement/i);
      expect(i).toMatch(/Resolving it is a rule's job, not compaction's/i);
    });
  });
});
