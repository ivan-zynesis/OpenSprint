import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  DEFAULT_ROLES,
  resolveHatRoles,
  validateRoles,
} from '../../src/core/hats.js';
import {
  validateDriverSpecEdges,
  EDGE_PROBLEM_KINDS,
} from '../../src/core/compact/edges.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../../src/core/compact/records.js';
import { OPEN_LOOP_KINDS, deriveOpenLoops } from '../../src/core/compact/loops.js';
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

  const spec = (id: string, opts: { hats?: string; role?: string; deps?: string[] } = {}) => {
    const { hats = '[product]', role, deps } = opts;
    fs.writeFileSync(
      path.join(sprint(), 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: product\nstatus: active\ncreated: 2026-01-01\nhats: ${hats}` +
        (role ? `\nrole: ${role}` : '') +
        (deps ? `\ndepends-on:\n${deps.map((d) => `  - ${d}`).join('\n')}` : '') +
        `\n---\n\nBody ${id}\n`
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

    it('gives every other default hat no roles', () => {
      for (const hat of ['maintainer', 'dev', 'devops']) {
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

  describe('validateRoles', () => {
    const rolesFor = (h: string) => (h === 'product' ? ['objective', 'goal', 'strategy'] : []);

    it('accepts a role the hat declares', () => {
      expect(validateRoles([{ id: 'DS-A', role: 'goal', hats: ['product'] }], rolesFor)).toEqual([]);
    });

    it('reports a role the hat does not declare', () => {
      const [p] = validateRoles([{ id: 'DS-A', role: 'measure', hats: ['product'] }], rolesFor);
      expect(p.reason).toBe('not-accepted');
      expect(p.accepted).toEqual(['goal', 'objective', 'strategy']);
    });

    it('is case-sensitive', () => {
      const [p] = validateRoles([{ id: 'DS-A', role: 'Objective', hats: ['product'] }], rolesFor);
      expect(p.reason).toBe('not-accepted');
    });

    it('reports a role on a record whose hats declare none', () => {
      const [p] = validateRoles([{ id: 'DEC-1', role: 'goal', hats: ['dev'] }], rolesFor);
      expect(p.reason).toBe('hat-declares-none');
    });

    it('accepts a multi-hat record when either hat accepts the role', () => {
      expect(validateRoles([{ id: 'DS-A', role: 'goal', hats: ['dev', 'product'] }], rolesFor)).toEqual([]);
    });

    it('ignores a record with no role', () => {
      expect(validateRoles([{ id: 'DS-A', hats: ['product'] }], rolesFor)).toEqual([]);
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
