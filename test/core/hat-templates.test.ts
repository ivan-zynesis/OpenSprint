import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  DEFAULT_SECTIONS_BY_HAT,
  GENERIC_SECTIONS,
  TECH_STACK_GLOBS,
  ENTITY_SCHEMA_GLOBS,
  INFRA_GLOBS,
  GITOPS_GLOBS,
  groupRecordsByHat,
  resolveSectionInputs,
  type SectionDef,
} from '../../src/core/compact/sections.js';
import { resolveHatSections, resolveHatRegistry } from '../../src/core/hats.js';
import {
  detectDiagramConvention,
  MERMAID_HABIT_THRESHOLD,
  findRuleFiles,
  buildRuleIndex,
} from '../../src/core/compact/rules.js';
import { hasMeasures, MEASURABLE_ROLES, deriveOpenLoops, OPEN_LOOP_KINDS } from '../../src/core/compact/loops.js';
import { readSourcedDriverSpecs, readSourcedDecisions } from '../../src/core/compact/records.js';
import { getOpspSkillTemplates } from '../../src/core/shared/index.js';

describe('hat templates', () => {
  let root: string;
  const sprint = () => path.join(root, 'opensprint');

  beforeEach(() => {
    root = path.join(os.tmpdir(), `openspec-shapes-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'ADRs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  const file = (rel: string, body = 'x') => {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
  };
  const spec = (id: string, role?: string, hats = '[product]', measures = false) =>
    fs.writeFileSync(
      path.join(sprint(), 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: product\nstatus: active\ncreated: 2026-01-01\nhats: ${hats}` +
        (role ? `\nrole: ${role}` : '') +
        `\n---\n\nBody ${id}\n` +
        (measures ? '\n## Measures\n\n- **Primary**: a number\n' : '')
    );

  // ═══════════════════════════════════════════════════════════
  // The four shapes
  // ═══════════════════════════════════════════════════════════

  describe('default shapes', () => {
    const names = (hat: string) => resolveHatSections(root, hat).map((s) => s.name);

    it('product is an OGSM chain', () => {
      expect(names('product')).toEqual(['objective', 'goals', 'strategies', 'measures', 'open-loops']);
    });

    it('maintainer is positions and their evidence', () => {
      expect(names('maintainer')).toEqual(['bars', 'posture', 'evidence', 'exposure', 'open-loops']);
    });

    it('dev describes the system', () => {
      expect(names('dev')).toEqual(['tech-stack', 'runtime-topology', 'entity-schema', 'open-loops']);
    });

    it('devops describes how it runs', () => {
      expect(names('devops')).toEqual(['infra-architecture', 'gitops', 'open-loops']);
    });

    it('a hat the tool does not know gets the generic four, not nothing', () => {
      expect(names('designer')).toEqual(GENERIC_SECTIONS.map((s) => s.name));
      expect(names('designer').length).toBeGreaterThan(0);
    });

    it('every shape ends with open-loops', () => {
      for (const sections of Object.values(DEFAULT_SECTIONS_BY_HAT)) {
        expect(sections[sections.length - 1]!.name).toBe('open-loops');
      }
    });

    it('no shape carries a section that enumerates records for its own sake', () => {
      // charter/constraints/decisions are the generic index shape; none of the
      // four designed hats should still be using them
      for (const [hat, sections] of Object.entries(DEFAULT_SECTIONS_BY_HAT)) {
        for (const generic of ['charter', 'constraints', 'decisions']) {
          expect(sections.map((s) => s.name), hat).not.toContain(generic);
        }
      }
    });

    it('declared sections still win over any default', () => {
      fs.writeFileSync(
        path.join(root, 'openspec', 'config.yaml'),
        'schema: spec-driven\nhats:\n  product:\n    sections:\n      - { name: only, inputs: all }\n'
      );
      expect(names('product')).toEqual(['only']);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Role filtering
  // ═══════════════════════════════════════════════════════════

  describe('role-filtered inputs', () => {
    const group = () =>
      groupRecordsByHat(readSourcedDriverSpecs(sprint()), readSourcedDecisions(sprint()), ['product']);

    it('takes only records of the declared roles', () => {
      spec('DS-O', 'objective');
      spec('DS-G', 'goal');
      spec('DS-S', 'strategy');
      const sections = resolveHatSections(root, 'product');
      const byName = (n: string) => sections.find((s) => s.name === n)!;
      expect(resolveSectionInputs('product', byName('objective'), group()).map((r) => r.id)).toEqual(['DS-O']);
      expect(resolveSectionInputs('product', byName('goals'), group()).map((r) => r.id)).toEqual(['DS-G']);
      expect(resolveSectionInputs('product', byName('strategies'), group()).map((r) => r.id)).toEqual(['DS-S']);
    });

    it('excludes a record with no role from a role-filtered section', () => {
      spec('DS-NONE');
      const objective = resolveHatSections(root, 'product').find((s) => s.name === 'objective')!;
      expect(resolveSectionInputs('product', objective, group())).toEqual([]);
    });

    it('a section without roles takes everything of its kind', () => {
      spec('DS-O', 'objective');
      spec('DS-NONE');
      const unfiltered: SectionDef = { name: 'x', inputs: 'driver-specs' };
      expect(resolveSectionInputs('product', unfiltered, group()).map((r) => r.id)).toEqual(['DS-NONE', 'DS-O']);
    });

    it('granularity: adding a strategy leaves the objective section untouched', () => {
      spec('DS-O', 'objective');
      const sections = resolveHatSections(root, 'product');
      const objective = sections.find((s) => s.name === 'objective')!;
      const strategies = sections.find((s) => s.name === 'strategies')!;
      const before = resolveSectionInputs('product', objective, group()).map((r) => r.id);

      spec('DS-S', 'strategy');
      expect(resolveSectionInputs('product', objective, group()).map((r) => r.id)).toEqual(before);
      expect(resolveSectionInputs('product', strategies, group()).map((r) => r.id)).toEqual(['DS-S']);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Default observation globs
  // ═══════════════════════════════════════════════════════════

  describe('default observation globs', () => {
    it('tech stack matches manifests across ecosystems', () => {
      for (const f of ['package.json', 'go.mod', 'Cargo.toml', 'pyproject.toml', 'pom.xml']) file(f);
      const found = findRuleFiles(root, [...TECH_STACK_GLOBS]);
      for (const f of ['package.json', 'go.mod', 'Cargo.toml', 'pyproject.toml', 'pom.xml']) {
        expect(found).toContain(f);
      }
    });

    it('entity schema matches migrations and schema definitions', () => {
      file(path.join('db', 'migrations', '001_init.sql'));
      file(path.join('prisma', 'schema.prisma'));
      const found = findRuleFiles(root, [...ENTITY_SCHEMA_GLOBS]);
      expect(found).toContain(path.join('db', 'migrations', '001_init.sql'));
      expect(found).toContain(path.join('prisma', 'schema.prisma'));
    });

    it('infra matches terraform, terragrunt and compose', () => {
      file(path.join('infra', 'main.tf'));
      file(path.join('infra', 'terragrunt.hcl'));
      file('docker-compose.yml');
      const found = findRuleFiles(root, [...INFRA_GLOBS]);
      expect(found.length).toBe(3);
    });

    it('excludes nested build output, not only the top-level directory', () => {
      // a monorepo has a dist and a node_modules under every package; excluding
      // only the top-level one let build output be observed as though it were source
      file(path.join('packages', 'db', 'migrations', '001_init.sql'));
      file(path.join('packages', 'db', 'dist', 'migrations', '001_init.sql'));
      file(path.join('apps', 'api', 'node_modules', 'x', 'schema.prisma'));
      const found = findRuleFiles(root, [...ENTITY_SCHEMA_GLOBS]);
      expect(found).toEqual([path.join('packages', 'db', 'migrations', '001_init.sql')]);
    });

    it('gitops matches CI definitions across hosts', () => {
      file(path.join('.github', 'workflows', 'ci.yml'));
      file('bitbucket-pipelines.yml');
      file('.gitlab-ci.yml');
      const found = findRuleFiles(root, [...GITOPS_GLOBS]);
      expect(found.length).toBe(3);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Measures
  // ═══════════════════════════════════════════════════════════

  describe('hasMeasures', () => {
    it('is true for a populated section', () => {
      expect(hasMeasures('# X\n\n## Measures\n\n- **Primary**: a number\n')).toBe(true);
    });

    it('is false for a heading with nothing beneath it', () => {
      expect(hasMeasures('# X\n\n## Measures\n\n## Next\n\nbody\n')).toBe(false);
    });

    it('is false when the section is only a comment', () => {
      expect(hasMeasures('## Measures\n\n<!-- how this is known to be met -->\n')).toBe(false);
    });

    it('is false when there is no section at all', () => {
      expect(hasMeasures('# X\n\nbody\n')).toBe(false);
    });

    it('does not match a mention in prose', () => {
      expect(hasMeasures('# X\n\nWe should add measures later.\n')).toBe(false);
    });
  });

  describe('constraint-unmeasurable', () => {
    const loops = () =>
      deriveOpenLoops(
        readSourcedDriverSpecs(sprint()),
        readSourcedDecisions(sprint()),
        buildRuleIndex(root, []),
        (h) => (h === 'product' ? ['objective', 'goal', 'strategy'] : [])
      ).filter((l) => l.kind === 'constraint-unmeasurable');

    it('is among the loop kinds', () => {
      expect([...OPEN_LOOP_KINDS]).toContain('constraint-unmeasurable');
    });

    it('measurable roles are goal and bar, by explicit list', () => {
      expect([...MEASURABLE_ROLES]).toEqual(['goal', 'bar']);
    });

    it('fires for a goal with no measures', () => {
      spec('DS-G', 'goal');
      expect(loops().map((l) => l.record)).toEqual(['DS-G']);
    });

    it('does not fire for a goal with measures', () => {
      spec('DS-G', 'goal', '[product]', true);
      expect(loops()).toEqual([]);
    });

    it('does not fire for an objective — qualitative by definition', () => {
      spec('DS-O', 'objective');
      expect(loops()).toEqual([]);
    });

    it('does not fire for a strategy — an approach, not a target', () => {
      spec('DS-S', 'strategy');
      expect(loops()).toEqual([]);
    });

    it('does not fire for a record with no role', () => {
      spec('DS-NONE');
      expect(loops()).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Diagram convention
  // ═══════════════════════════════════════════════════════════

  describe('detectDiagramConvention', () => {
    const mermaidDoc = '# Doc\n\n```mermaid\ngraph TD\n  A-->B\n```\n';

    it('reports ascii when no mermaid is present', () => {
      file('README.md', '# R\n\n```\nA --> B\n```\n');
      expect(detectDiagramConvention(root).convention).toBe('ascii');
    });

    it('reports mixed when somebody tried it once or twice', () => {
      file('a.md', mermaidDoc);
      file('b.md', mermaidDoc);
      const d = detectDiagramConvention(root);
      expect(d.convention).toBe('mixed');
      expect(d.mermaidFiles).toEqual(['a.md', 'b.md']);
    });

    it('reports mermaid once it is a habit', () => {
      for (let i = 0; i < MERMAID_HABIT_THRESHOLD; i++) file(`d${i}.md`, mermaidDoc);
      expect(detectDiagramConvention(root).convention).toBe('mermaid');
    });

    it('excludes the usual directories', () => {
      file(path.join('node_modules', 'pkg', 'README.md'), mermaidDoc);
      file(path.join('openspec', 'x.md'), mermaidDoc);
      expect(detectDiagramConvention(root).convention).toBe('ascii');
    });

    it('reports no files when there are none', () => {
      expect(detectDiagramConvention(root)).toEqual({ convention: 'ascii', mermaidFiles: [] });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // The rendering contract
  // ═══════════════════════════════════════════════════════════

  describe('the rendering contract', () => {
    const skill = () =>
      getOpspSkillTemplates().find((s) => s.workflowId === 'opsp-compact')!.template.instructions;

    it('describes product as a causal chain with no charter or constraints', () => {
      const i = skill();
      expect(i).toMatch(/objective · goals · strategies · measures/);
      expect(i).toMatch(/no charter and no constraints section/i);
    });

    it('requires a bar to state its trade', () => {
      const i = skill();
      expect(i).toContain('traded for');
      expect(i).toContain('neighbour');
      expect(i).toMatch(/say the trade is unrecorded/i);
    });

    it('states that cost is an axis rather than a section', () => {
      expect(skill()).toMatch(/Cost is an axis of every bar, not a section/i);
    });

    it('tells dev and devops to describe rather than enumerate', () => {
      const i = skill();
      expect(i).toMatch(/describe \*\*what the system is\*\*/i);
      expect(i).toMatch(/tells a reader nothing about what was built/i);
    });

    it('routes an ambiguous diagram convention to the operator', () => {
      const i = skill();
      expect(i).toMatch(/\*\*Ask the operator\.\*\*/);
      expect(i).toMatch(/that is not a habit/i);
    });

    it('warns that a drifting diagram is confidently wrong', () => {
      expect(skill()).toMatch(/\*\*a drifting diagram is\s+confidently wrong\*\*/i);
    });
  });
});
