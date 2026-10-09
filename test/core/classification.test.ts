import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  DEFAULT_ROLES,
  resolveHatRoles,
  validateRoles,
  normalizeRole,
  resolveHatObjectives,
  validateObjectives,
} from '../../src/core/hats.js';
import {
  MAINTAINER_OBJECTIVES,
  groupRecordsByHat,
  resolveSectionInputs,
  headingOf,
  DEFAULT_SECTIONS_BY_HAT,
} from '../../src/core/compact/sections.js';
import {
  validateDriverSpecEdges,
  EDGE_PROBLEM_KINDS,
} from '../../src/core/compact/edges.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../../src/core/compact/records.js';
import { OPEN_LOOP_KINDS, deriveOpenLoops } from '../../src/core/compact/loops.js';
import { inputMap } from '../../src/core/compact/manifest.js';
import { buildRuleIndex } from '../../src/core/compact/rules.js';

describe('per-hat classification', () => {
  let root: string;
  const sprint = () => path.join(root, 'opensprint');

  beforeEach(() => {
    root = path.join(os.tmpdir(), `openspec-class-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'ADRs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  const config = (body: string) =>
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), `schema: spec-driven\n${body}`);

  const spec = (
    id: string,
    opts: { hats?: string; role?: string; deps?: string[]; objective?: string; body?: string } = {}
  ) => {
    const { hats = '[product]', role, deps, objective, body } = opts;
    fs.writeFileSync(
      path.join(sprint(), 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: product\nstatus: active\ncreated: 2026-01-01\nhats: ${hats}` +
        (role ? `\nrole: ${role}` : '') +
        (objective ? `\nobjective: ${objective}` : '') +
        (deps ? `\ndepends-on:\n${deps.map((d) => `  - ${d}`).join('\n')}` : '') +
        `\n---\n\nBody ${id}\n` +
        (body ? `\n${body}\n` : '')
    );
  };
  const dec = (id: string, hats = '[dev]', role?: string) =>
    fs.writeFileSync(
      path.join(sprint(), 'ADRs', `${id}.md`),
      `---\nid: ${id}\nstatus: accepted\ndepends-on: []\ncreated: 2026-01-01\ndepth: 0\nhats: ${hats}` +
        (role ? `\nrole: ${role}` : '') +
        `\n---\n\n## Question\n\nQ\n`
    );
  const specs = () => readSourcedDriverSpecs(sprint());
  const decs = () => readSourcedDecisions(sprint());

  // ═══════════════════════════════════════════════════════════
  // Roles
  // ═══════════════════════════════════════════════════════════

  describe('default roles', () => {
    it('gives product the three OGSM node kinds, by explicit list', () => {
      expect([...DEFAULT_ROLES.product]).toEqual(['objective', 'goal', 'strategy']);
    });

    it('does not make measure a role — it is a property of a goal', () => {
      expect([...DEFAULT_ROLES.product]).not.toContain('measure');
    });

    it('gives maintainer goal, strategy and posture — its objectives being sections not records', () => {
      expect([...DEFAULT_ROLES.maintainer]).toEqual(['goal', 'strategy', 'posture']);
      // No `objective` role: the seven are the hat's shape, so nothing is
      // ever filed as one (DEC-018).
      expect([...DEFAULT_ROLES.maintainer]).not.toContain('objective');
      // `posture` is the hat-level statement rendered above the grid, not
      // the per-measure sub-block of the same name.
      expect([...DEFAULT_ROLES.maintainer]).toContain('posture');
    });

    it('gives dev and devops no roles — they run no framework to classify against', () => {
      for (const hat of ['dev', 'devops']) {
        expect([...(DEFAULT_ROLES[hat] ?? [])]).toEqual([]);
      }
    });

    it('resolves the defaults when nothing is declared', () => {
      expect([...resolveHatRoles(root, 'product')]).toEqual(['objective', 'goal', 'strategy']);
      expect([...resolveHatRoles(root, 'dev')]).toEqual([]);
      expect([...resolveHatRoles(root, 'unknown-hat')]).toEqual([]);
    });
  });

  describe('declared roles', () => {
    it('a hat may declare its own, needing no code', () => {
      config('hats:\n  maintainer:\n    roles: [bar, posture, evidence]\n');
      expect([...resolveHatRoles(root, 'maintainer')]).toEqual(['bar', 'posture', 'evidence']);
    });

    it('the list form leaves roles at their defaults', () => {
      config('hats:\n  - product\n  - dev\n');
      expect([...resolveHatRoles(root, 'product')]).toEqual(['objective', 'goal', 'strategy']);
    });

    it('a malformed roles value warns and degrades', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      config('hats:\n  product:\n    roles: nonsense\n');
      expect([...resolveHatRoles(root, 'product')]).toEqual(['objective', 'goal', 'strategy']);
      expect(warn.mock.calls.flat().join(' ')).toContain('product');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Role as a list (DEC-018)
  // ═══════════════════════════════════════════════════════════

  describe('normalizeRole', () => {
    it('accepts both spellings', () => {
      expect(normalizeRole('strategy')).toEqual(['strategy']);
      expect(normalizeRole(['goal', 'strategy'])).toEqual(['goal', 'strategy']);
    });

    it('removes duplicates and preserves order', () => {
      expect(normalizeRole(['strategy', 'goal', 'strategy'])).toEqual(['strategy', 'goal']);
    });

    it('returns null for a malformed value, including an empty list', () => {
      for (const bad of [undefined, null, [], '', ['goal', ''], ['goal', 3], {}, 7]) {
        expect(normalizeRole(bad)).toBeNull();
      }
    });

    it('a record written with a string role still parses', () => {
      spec('DS-OLD', { role: 'strategy' });
      expect(specs()[0].role).toEqual(['strategy']);
    });

    it('a record may declare a goal and its strategy together', () => {
      spec('DS-BOTH', { role: '[goal, strategy]' });
      expect(specs()[0].role).toEqual(['goal', 'strategy']);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Objective as a second selector (DEC-018)
  // ═══════════════════════════════════════════════════════════

  describe('objective selection', () => {
    const grouped = () => groupRecordsByHat(specs(), decs(), ['product', 'maintainer', 'dev', 'devops']);
    const sectionFor = (name: string) =>
      DEFAULT_SECTIONS_BY_HAT.maintainer.find((s) => s.name === name)!;

    it('a section takes only records declaring its objective', () => {
      spec('DS-SEC', { hats: '[maintainer]', role: 'goal', objective: 'security-access' });
      spec('DS-COST', { hats: '[maintainer]', role: 'goal', objective: 'cost-budget' });
      const ids = resolveSectionInputs('maintainer', sectionFor('security-access'), grouped()).map((r) => r.id);
      expect(ids).toEqual(['DS-SEC']);
    });

    it('objective and roles filter independently', () => {
      spec('DS-GOAL', { hats: '[maintainer]', role: 'goal', objective: 'change-quality' });
      spec('DS-OTHER', { hats: '[maintainer]', role: 'posture', objective: 'change-quality' });
      const ids = resolveSectionInputs('maintainer', sectionFor('change-quality'), grouped()).map((r) => r.id);
      expect(ids).toEqual(['DS-GOAL']);
    });

    it('a record with no objective is excluded from an objective-filtered section', () => {
      spec('DS-NONE', { hats: '[maintainer]', role: 'goal' });
      const ids = resolveSectionInputs('maintainer', sectionFor('security-access'), grouped()).map((r) => r.id);
      expect(ids).toEqual([]);
    });

    it('an objective with no records resolves to an empty section rather than vanishing', () => {
      spec('DS-SEC', { hats: '[maintainer]', role: 'goal', objective: 'security-access' });
      const g = grouped();
      for (const objective of MAINTAINER_OBJECTIVES) {
        expect(() => resolveSectionInputs('maintainer', sectionFor(objective.name), g)).not.toThrow();
      }
      expect(resolveSectionInputs('maintainer', sectionFor('cost-budget'), g)).toEqual([]);
    });

    it('changing a record\'s objective moves it between sections and restages both', () => {
      spec('DS-M', { hats: '[maintainer]', role: 'goal', objective: 'security-access' });
      const before = specs()[0];
      expect(resolveSectionInputs('maintainer', sectionFor('security-access'), grouped()).map((r) => r.id))
        .toEqual(['DS-M']);

      spec('DS-M', { hats: '[maintainer]', role: 'goal', objective: 'cost-budget' });
      const after = specs()[0];
      const g = grouped();
      expect(resolveSectionInputs('maintainer', sectionFor('security-access'), g)).toEqual([]);
      expect(resolveSectionInputs('maintainer', sectionFor('cost-budget'), g).map((r) => r.id))
        .toEqual(['DS-M']);

      // Objective lives in frontmatter, so it is inside the hashed content:
      // the section input hash changes without objective needing its own term.
      expect(inputMap([{ id: before.id, path: before.path, content: before.content }])[before.id])
        .not.toBe(inputMap([{ id: after.id, path: after.path, content: after.content }])[after.id]);
    });

    it('a record declaring several roles lands in a section accepting either', () => {
      spec('DS-BOTH', { hats: '[maintainer]', role: '[goal, strategy]', objective: 'integrity-correctness' });
      const ids = resolveSectionInputs('maintainer', sectionFor('integrity-correctness'), grouped()).map((r) => r.id);
      expect(ids).toEqual(['DS-BOTH']);
    });
  });

  describe('validateObjectives', () => {
    const objectivesFor = (h: string) =>
      h === 'maintainer' ? MAINTAINER_OBJECTIVES.map((o) => o.name) : [];

    it('accepts an objective the hat offers', () => {
      expect(
        validateObjectives([{ id: 'DS-A', objective: 'cost-budget', hats: ['maintainer'] }], objectivesFor)
      ).toEqual([]);
    });

    it('reports an objective no hat of the record offers', () => {
      const [p] = validateObjectives(
        [{ id: 'DS-A', objective: 'made-up', hats: ['maintainer'] }],
        objectivesFor
      );
      expect(p.objective).toBe('made-up');
      expect(p.accepted).toContain('security-access');
    });

    it('ignores a record declaring no objective', () => {
      expect(validateObjectives([{ id: 'DS-A', hats: ['maintainer'] }], objectivesFor)).toEqual([]);
    });

    it('reads a project\'s own eighth objective from its resolved sections', () => {
      config(
        'hats:\n  maintainer:\n    sections:\n' +
          '      - name: accessibility\n        inputs: driver-specs\n        objective: accessibility\n'
      );
      expect([...resolveHatObjectives(root, 'maintainer')]).toEqual(['accessibility']);
    });

    it('resolves the shipped seven when nothing is declared', () => {
      expect([...resolveHatObjectives(root, 'maintainer')]).toEqual(
        MAINTAINER_OBJECTIVES.map((o) => o.name)
      );
    });
  });

  describe('section headings', () => {
    it('a declared heading wins over one derived from the name', () => {
      expect(headingOf({ name: 'privacy-retention-legal', heading: 'Privacy, Retention & Legal', inputs: 'driver-specs' }))
        .toBe('Privacy, Retention & Legal');
    });

    it('absence derives from the name, as before', () => {
      expect(headingOf({ name: 'open-loops', inputs: 'none' })).toBe('Open Loops');
    });
  });

  describe('validateRoles', () => {
    const rolesFor = (h: string) => (h === 'product' ? ['objective', 'goal', 'strategy'] : []);

    it('accepts a role the hat declares', () => {
      expect(validateRoles([{ id: 'DS-A', role: ['goal'], hats: ['product'] }], rolesFor)).toEqual([]);
    });

    it('reports a role the hat does not declare', () => {
      const [p] = validateRoles([{ id: 'DS-A', role: ['measure'], hats: ['product'] }], rolesFor);
      expect(p.reason).toBe('not-accepted');
      expect(p.accepted).toEqual(['goal', 'objective', 'strategy']);
    });

    it('is case-sensitive', () => {
      const [p] = validateRoles([{ id: 'DS-A', role: ['Objective'], hats: ['product'] }], rolesFor);
      expect(p.reason).toBe('not-accepted');
    });

    it('reports a role on a record whose hats declare none', () => {
      const [p] = validateRoles([{ id: 'DEC-1', role: ['goal'], hats: ['dev'] }], rolesFor);
      expect(p.reason).toBe('hat-declares-none');
    });

    it('accepts a multi-hat record when either hat accepts the role', () => {
      expect(validateRoles([{ id: 'DS-A', role: ['goal'], hats: ['dev', 'product'] }], rolesFor)).toEqual([]);
    });

    it('ignores a record with no role', () => {
      expect(validateRoles([{ id: 'DS-A', hats: ['product'] }], rolesFor)).toEqual([]);
      expect(validateRoles([{ id: 'DS-A', role: [], hats: ['product'] }], rolesFor)).toEqual([]);
    });

    it('accepts a record declaring several roles the hat allows', () => {
      expect(
        validateRoles([{ id: 'DS-A', role: ['goal', 'strategy'], hats: ['product'] }], rolesFor)
      ).toEqual([]);
    });

    it('reports each offending role of a multi-role record', () => {
      const problems = validateRoles(
        [{ id: 'DS-A', role: ['goal', 'measure', 'bar'], hats: ['product'] }],
        rolesFor
      );
      expect(problems.map((p) => p.role)).toEqual(['measure', 'bar']);
    });

    it('reports hat-declares-none once, not once per role', () => {
      const problems = validateRoles(
        [{ id: 'DEC-1', role: ['goal', 'strategy'], hats: ['dev'] }],
        rolesFor
      );
      expect(problems).toHaveLength(1);
      expect(problems[0].reason).toBe('hat-declares-none');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Driver-spec edges
  // ═══════════════════════════════════════════════════════════

  describe('driver-spec edges', () => {
    it('defines exactly three problem kinds, by explicit list', () => {
      expect([...EDGE_PROBLEM_KINDS]).toEqual(['dangling', 'points-at-decision', 'cycle']);
    });

    it('a spec without depends-on has no edges', () => {
      spec('DS-A');
      expect(specs()[0].dependsOn).toEqual([]);
      expect(validateDriverSpecEdges(specs(), decs()).problems).toEqual([]);
    });

    it('parses and keeps a valid edge', () => {
      spec('DS-OBJ');
      spec('DS-GOAL', { deps: ['DS-OBJ'] });
      const v = validateDriverSpecEdges(specs(), decs());
      expect(v.problems).toEqual([]);
      expect(v.edges.get('DS-GOAL')).toEqual(['DS-OBJ']);
    });

    it('reports a dangling reference, naming both records', () => {
      spec('DS-A', { deps: ['DS-GHOST'] });
      const [p] = validateDriverSpecEdges(specs(), decs()).problems;
      expect(p.kind).toBe('dangling');
      expect(p.record).toBe('DS-A');
      expect(p.target).toBe('DS-GHOST');
    });

    it('reports an edge pointing at a decision record', () => {
      spec('DS-A', { deps: ['DEC-001'] });
      dec('DEC-001');
      const [p] = validateDriverSpecEdges(specs(), decs()).problems;
      expect(p.kind).toBe('points-at-decision');
      expect(p.detail).toMatch(/the dependency runs the other way/);
    });

    it('reports a cycle, drops its edges, and leaves other records intact', () => {
      spec('DS-A', { deps: ['DS-B'] });
      spec('DS-B', { deps: ['DS-A'] });
      spec('DS-C');
      spec('DS-D', { deps: ['DS-C'] });
      const v = validateDriverSpecEdges(specs(), decs());
      const cycle = v.problems.find((p) => p.kind === 'cycle');
      expect(cycle).toBeDefined();
      expect(cycle!.cycle!.sort()).toEqual(['DS-A', 'DS-B']);
      expect(v.edges.get('DS-A')).toEqual([]);
      expect(v.edges.get('DS-B')).toEqual([]);
      // an unrelated chain still resolves
      expect(v.edges.get('DS-D')).toEqual(['DS-C']);
    });

    it('detects a longer cycle', () => {
      spec('DS-A', { deps: ['DS-B'] });
      spec('DS-B', { deps: ['DS-C'] });
      spec('DS-C', { deps: ['DS-A'] });
      const cycle = validateDriverSpecEdges(specs(), decs()).problems.find((p) => p.kind === 'cycle');
      expect(cycle!.cycle!.sort()).toEqual(['DS-A', 'DS-B', 'DS-C']);
    });

    it('does not enforce causal ordering', () => {
      // a strategy depending straight on an objective, skipping the goal
      spec('DS-OBJ', { role: 'objective' });
      spec('DS-STRAT', { role: 'strategy', deps: ['DS-OBJ'] });
      expect(validateDriverSpecEdges(specs(), decs()).problems).toEqual([]);
    });

    it('does not throw on a self-edge', () => {
      spec('DS-A', { deps: ['DS-A'] });
      expect(() => validateDriverSpecEdges(specs(), decs())).not.toThrow();
      expect(validateDriverSpecEdges(specs(), decs()).edges.get('DS-A')).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // The open loop
  // ═══════════════════════════════════════════════════════════

  describe('record-unclassified', () => {
    const rolesFor = (h: string) => (h === 'product' ? ['objective', 'goal', 'strategy'] : []);
    const loops = (rf = rolesFor) =>
      deriveOpenLoops(specs(), decs(), buildRuleIndex(root, [...specs(), ...decs()].map((r) => r.id)), rf);

    it('is among the loop kinds', () => {
      expect([...OPEN_LOOP_KINDS]).toContain('record-unclassified');
    });

    it('fires for a roleless record in a role-declaring hat', () => {
      spec('DS-A');
      const found = loops().filter((l) => l.kind === 'record-unclassified');
      expect(found.map((l) => l.record)).toEqual(['DS-A']);
      expect(found[0].detail).toContain('objective');
    });

    it('does not fire for a classified record', () => {
      spec('DS-A', { role: 'goal' });
      expect(loops().filter((l) => l.kind === 'record-unclassified')).toEqual([]);
    });

    it('does not fire where the hat declares no roles', () => {
      dec('DEC-001');
      expect(loops().filter((l) => l.kind === 'record-unclassified')).toEqual([]);
    });

    it('a project using no roles at all sees none of its surrogate reported', () => {
      spec('DS-A');
      dec('DEC-001');
      expect(loops(() => []).filter((l) => l.kind === 'record-unclassified')).toEqual([]);
    });

    it('attributes the loop to every hat the record declares', () => {
      spec('DS-A', { hats: '[product, dev]' });
      const [l] = loops().filter((x) => x.kind === 'record-unclassified');
      expect(l.hats).toEqual(['product', 'dev']);
    });

    it('ignores superseded records', () => {
      fs.writeFileSync(
        path.join(sprint(), 'driver-specs', 'DS-OLD.md'),
        '---\nid: DS-OLD\ntype: product\nstatus: superseded\ncreated: 2026-01-01\nhats: [product]\n---\n\nB\n'
      );
      expect(loops().filter((l) => l.kind === 'record-unclassified')).toEqual([]);
    });

    // DEC-028: role classification is a driver-spec concept. dev and devops
    // run no framework to classify against, so a decision has nothing to be
    // classified as — whichever hats it cc's.
    it('never fires for a decision, even in a role-declaring hat', () => {
      const withRoles = (h: string) =>
        h === 'maintainer' ? ['goal', 'strategy'] : h === 'product' ? ['objective', 'goal'] : [];
      dec('DEC-001', '[dev, maintainer]');
      dec('DEC-002', '[maintainer]');
      dec('DEC-003', '[dev, product]');
      expect(loops(withRoles).filter((l) => l.kind === 'record-unclassified')).toEqual([]);
    });

    it('still fires for a driver-spec beside an exempt decision', () => {
      const withRoles = (h: string) => (h === 'maintainer' ? ['goal', 'strategy'] : []);
      spec('DS-A', { hats: '[maintainer]' });
      dec('DEC-001', '[maintainer]');
      const found = loops(withRoles).filter((l) => l.kind === 'record-unclassified');
      expect(found.map((l) => l.record)).toEqual(['DS-A']);
    });

    it('does not fire for a record whose role list is present', () => {
      spec('DS-A', { role: '[goal, strategy]' });
      expect(loops().filter((l) => l.kind === 'record-unclassified')).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // The ex-post half of a measure (DS-MEASURE-ANATOMY)
  // ═══════════════════════════════════════════════════════════

  describe('measure anatomy loops', () => {
    const rolesFor = () => ['goal', 'strategy'];
    const loops = () =>
      deriveOpenLoops(specs(), decs(), buildRuleIndex(root, [...specs(), ...decs()].map((r) => r.id)), rolesFor);
    const kinds = (kind: string) => loops().filter((l) => l.kind === kind).map((l) => l.record);

    it('the three kinds are registered', () => {
      for (const kind of ['measure-unasserted', 'measure-unexposed', 'bar-without-neighbour']) {
        expect([...OPEN_LOOP_KINDS]).toContain(kind);
      }
    });

    it('measure-unasserted fires on measures with no evidence', () => {
      spec('DS-A', { role: 'goal', body: '## Measures\n\n- **Primary**: a target' });
      expect(kinds('measure-unasserted')).toEqual(['DS-A']);
    });

    it('measure-unasserted does not fire when evidence is present', () => {
      spec('DS-A', { role: 'goal', body: '## Measures\n\n- x\n\n### Evidence\n\na coverage report' });
      expect(kinds('measure-unasserted')).toEqual([]);
    });

    it('measure-unasserted does not inspect whether the evidence is adequate', () => {
      spec('DS-A', { role: 'goal', body: '## Measures\n\n- x\n\n### Evidence\n\nvibes' });
      expect(kinds('measure-unasserted')).toEqual([]);
    });

    it('neither fires for a record with no measures at all', () => {
      spec('DS-A', { role: 'goal' });
      expect(kinds('measure-unasserted')).toEqual([]);
      expect(kinds('measure-unexposed')).toEqual([]);
      // constraint-unmeasurable is the loop that covers that case
      expect(kinds('constraint-unmeasurable')).toEqual(['DS-A']);
    });

    it('measure-unexposed fires on measures with no exposure', () => {
      spec('DS-A', { role: 'goal', body: '## Measures\n\n- x\n\n### Evidence\n\ne' });
      expect(kinds('measure-unexposed')).toEqual(['DS-A']);
    });

    it('measure-unexposed does not fire when exposure is present', () => {
      spec('DS-A', { role: 'goal', body: '## Measures\n\n- x\n\n### Exposure\n\nunbounded' });
      expect(kinds('measure-unexposed')).toEqual([]);
    });

    it('bar-without-neighbour fires on a bar that omits the label', () => {
      spec('DS-A', {
        role: 'goal',
        body: '## Measures\n\n- x\n\n### Bar\n\n- **chosen**: fully manual',
      });
      expect(kinds('bar-without-neighbour')).toEqual(['DS-A']);
    });

    it('a neighbour stated as unrecorded satisfies the rule', () => {
      spec('DS-A', {
        role: 'goal',
        body: '## Measures\n\n- x\n\n### Bar\n\n- **chosen**: fully manual\n- **neighbour**: unrecorded',
      });
      expect(kinds('bar-without-neighbour')).toEqual([]);
    });

    it('bar-without-neighbour does not fire for a record with no bar', () => {
      spec('DS-A', { role: 'goal', body: '## Measures\n\n- **Primary**: a target' });
      expect(kinds('bar-without-neighbour')).toEqual([]);
    });

    it('a record with measures and no sub-blocks behaves as before, plus the two new gaps', () => {
      spec('DS-A', { role: 'goal', body: '## Measures\n\n- **Primary**: a target' });
      expect(kinds('constraint-unmeasurable')).toEqual([]);
      expect(kinds('measure-unasserted')).toEqual(['DS-A']);
      expect(kinds('measure-unexposed')).toEqual(['DS-A']);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // strategy-unimplemented (DS-STRATEGY-ALTITUDE, DEC-020)
  // ═══════════════════════════════════════════════════════════

  describe('strategy-unimplemented', () => {
    const rolesFor = () => ['goal', 'strategy'];
    const loops = () =>
      deriveOpenLoops(specs(), decs(), buildRuleIndex(root, [...specs(), ...decs()].map((r) => r.id)), rolesFor);
    const found = () => loops().filter((l) => l.kind === 'strategy-unimplemented').map((l) => l.record);

    const decWithDeps = (id: string, deps: string[], hats = '[dev]') =>
      fs.writeFileSync(
        path.join(sprint(), 'ADRs', `${id}.md`),
        `---\nid: ${id}\nstatus: accepted\ncreated: 2026-01-01\ndepth: 0\nhats: ${hats}\n` +
          `depends-on:\n${deps.map((d) => `  - ${d}`).join('\n')}\n---\n\n## Question\n\nQ\n`
      );

    it('is among the loop kinds', () => {
      expect([...OPEN_LOOP_KINDS]).toContain('strategy-unimplemented');
    });

    it('fires for a strategy with nothing descending from it', () => {
      spec('DS-S', { role: 'strategy' });
      expect(found()).toEqual(['DS-S']);
    });

    it('does not fire when a decision names it directly', () => {
      spec('DS-S', { role: 'strategy' });
      decWithDeps('DEC-001', ['DS-S']);
      expect(found()).toEqual([]);
    });

    it('does not fire when a decision reaches it transitively', () => {
      spec('DS-S', { role: 'strategy' });
      decWithDeps('DEC-001', ['DS-S']);
      decWithDeps('DEC-002', ['DEC-001']);
      expect(found()).toEqual([]);
    });

    it('does not fire for a record that is not a strategy', () => {
      spec('DS-G', { role: 'goal' });
      expect(found()).toEqual([]);
    });

    it('fires once for a record declaring strategy among several roles', () => {
      spec('DS-S', { role: '[goal, strategy]' });
      expect(found()).toEqual(['DS-S']);
    });

    it('ignores superseded strategies', () => {
      fs.writeFileSync(
        path.join(sprint(), 'driver-specs', 'DS-OLD.md'),
        '---\nid: DS-OLD\ntype: product\nstatus: superseded\ncreated: 2026-01-01\nhats: [product]\nrole: strategy\n---\n\nB\n'
      );
      expect(found()).toEqual([]);
    });

    it('does not count a superseded decision as an implementation', () => {
      spec('DS-S', { role: 'strategy' });
      fs.writeFileSync(
        path.join(sprint(), 'ADRs', 'DEC-001.md'),
        '---\nid: DEC-001\nstatus: superseded\ncreated: 2026-01-01\ndepth: 0\nhats: [dev]\ndepends-on:\n  - DS-S\n---\n\n## Question\n\nQ\n'
      );
      expect(found()).toEqual(['DS-S']);
    });

    it('terminates on a depends-on cycle', () => {
      spec('DS-S', { role: 'strategy' });
      decWithDeps('DEC-001', ['DEC-002']);
      decWithDeps('DEC-002', ['DEC-001']);
      expect(() => found()).not.toThrow();
      expect(found()).toEqual(['DS-S']);
    });

    it('survives a dangling depends-on reference', () => {
      spec('DS-S', { role: 'strategy' });
      decWithDeps('DEC-001', ['DEC-NOPE', 'DS-S']);
      expect(found()).toEqual([]);
    });

    it('names no hat — a strategy in any hat is checked', () => {
      spec('DS-A', { role: 'strategy', hats: '[product]' });
      spec('DS-B', { role: 'strategy', hats: '[maintainer]' });
      spec('DS-C', { role: 'strategy', hats: '[devops]' });
      expect(found().sort()).toEqual(['DS-A', 'DS-B', 'DS-C']);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // record-without-objective
  // ═══════════════════════════════════════════════════════════

  describe('record-without-objective', () => {
    const rolesFor = () => ['goal', 'strategy', 'posture'];
    const loops = (sectionsFor: (h: string) => any[]) =>
      deriveOpenLoops(
        specs(),
        decs(),
        buildRuleIndex(root, [...specs(), ...decs()].map((r) => r.id)),
        rolesFor,
        sectionsFor as never
      );
    const kinds = (sectionsFor: (h: string) => any[]) =>
      loops(sectionsFor).filter((l) => l.kind === 'record-without-objective').map((l) => l.record);

    const objectiveOnly = (h: string) =>
      h === 'product'
        ? [{ name: 'security-access', inputs: 'driver-specs', roles: ['goal'], objective: 'security-access' }]
        : [];
    const withGeneralSection = (h: string) =>
      h === 'product'
        ? [
            { name: 'posture', inputs: 'driver-specs', roles: ['posture'] },
            { name: 'security-access', inputs: 'driver-specs', roles: ['goal'], objective: 'security-access' },
          ]
        : [];

    it('fires when every section of the hat filters on objective', () => {
      spec('DS-A', { role: 'goal' });
      expect(kinds(objectiveOnly)).toEqual(['DS-A']);
    });

    it('does not fire when the record declares an objective', () => {
      spec('DS-A', { role: 'goal', objective: 'security-access' });
      expect(kinds(objectiveOnly)).toEqual([]);
    });

    it('does not fire when an unfiltered section can take the record', () => {
      spec('DS-A', { role: 'posture' });
      expect(kinds(withGeneralSection)).toEqual([]);
    });

    it('still fires when the unfiltered section\'s roles do not accept the record', () => {
      spec('DS-A', { role: 'goal' });
      expect(kinds(withGeneralSection)).toEqual(['DS-A']);
    });

    it('does not fire when the caller supplies no sections', () => {
      spec('DS-A', { role: 'goal' });
      expect(kinds(() => [])).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // constraint-unmeasurable with role lists
  // ═══════════════════════════════════════════════════════════

  describe('constraint-unmeasurable over role lists', () => {
    const rolesFor = (h: string) => (h === 'product' ? ['objective', 'goal', 'strategy'] : []);
    const loops = () =>
      deriveOpenLoops(specs(), decs(), buildRuleIndex(root, [...specs(), ...decs()].map((r) => r.id)), rolesFor);

    it('fires when any role of the record is measurable', () => {
      spec('DS-A', { role: '[strategy, goal]' });
      const found = loops().filter((l) => l.kind === 'constraint-unmeasurable');
      expect(found.map((l) => l.record)).toEqual(['DS-A']);
    });

    it('reports once per record, not once per measurable role', () => {
      spec('DS-A', { role: '[goal, objective]' });
      const found = loops().filter((l) => l.kind === 'constraint-unmeasurable');
      expect(found).toHaveLength(1);
    });
  });
});

describe('a bad roles value degrades only its own hat', () => {
  let root: string;
  beforeEach(() => {
    root = path.join(os.tmpdir(), `openspec-isolate-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('leaves another hat\'s sections and roles intact', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    fs.writeFileSync(
      path.join(root, 'openspec', 'config.yaml'),
      `schema: spec-driven
hats:
  product:
    roles: nonsense
  maintainer:
    roles: [bar, posture]
    sections:
      - { name: bars, inputs: driver-specs }
`
    );
    const { resolveHatSections } = await import('../../src/core/hats.js');
    // the bad hat falls back...
    expect([...resolveHatRoles(root, 'product')]).toEqual(['objective', 'goal', 'strategy']);
    // ...and the good one is untouched
    expect([...resolveHatRoles(root, 'maintainer')]).toEqual(['bar', 'posture']);
    expect(resolveHatSections(root, 'maintainer')).toEqual([
      { name: 'bars', inputs: 'driver-specs' },
    ]);
  });
});
