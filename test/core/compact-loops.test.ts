import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  DEFAULT_RULE_GLOBS,
  EXCLUDED_DIRS,
  resolveRuleGlobs,
  findRuleFiles,
  extractCitations,
  buildRuleIndex,
} from '../../src/core/compact/rules.js';
import {
  OPEN_LOOP_KINDS,
  deriveOpenLoops,
  groupLoopsByHat,
} from '../../src/core/compact/loops.js';
import {
  readSourcedDriverSpecs,
  readSourcedDecisions,
} from '../../src/core/compact/records.js';

const REGISTRY = ['product', 'maintainer', 'dev', 'devops'];

describe('rule harvesting', () => {
  let root: string;

  beforeEach(() => {
    root = path.join(os.tmpdir(), `openspec-rules-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(root, 'opensprint', 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'opensprint', 'ADRs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  const spec = (id: string, hats: string | null, status = 'active') =>
    fs.writeFileSync(
      path.join(root, 'opensprint', 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: product\nstatus: ${status}\ncreated: 2026-01-01${hats ? `\nhats: ${hats}` : ''}\n---\n\nBody\n`
    );

  const dec = (id: string, deps: string[], hats: string | null, status = 'accepted') =>
    fs.writeFileSync(
      path.join(root, 'opensprint', 'ADRs', `${id}.md`),
      `---\nid: ${id}\nstatus: ${status}\ndepends-on:\n${deps.map((d) => `  - ${d}`).join('\n')}\ncreated: 2026-01-01\ndepth: 0${hats ? `\nhats: ${hats}` : ''}\n---\n\n## Question\n\nQ\n`
    );

  const rule = (rel: string, body: string) => {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
  };

  const loops = () => {
    const ds = readSourcedDriverSpecs(path.join(root, 'opensprint'));
    const de = readSourcedDecisions(path.join(root, 'opensprint'));
    const index = buildRuleIndex(root, [...ds.map((r) => r.id), ...de.map((r) => r.id)], resolveRuleGlobs(root));
    return deriveOpenLoops(ds, de, index);
  };
  const kinds = (k: string) => loops().filter((l) => l.kind === k).map((l) => l.record).sort();

  // ═══════════════════════════════════════════════════════════
  // Globs
  // ═══════════════════════════════════════════════════════════

  describe('rule globs', () => {
    it('defaults cover the five suffixes real projects use', () => {
      const joined = DEFAULT_RULE_GLOBS.join(' ');
      for (const suffix of ['.test.', '.spec.', '.i9n.', '.unit.', '.e2e.']) {
        expect(joined).toContain(suffix);
      }
    });

    it('falls back to the default when none is declared', () => {
      expect(resolveRuleGlobs(root)).toEqual(DEFAULT_RULE_GLOBS);
    });

    it('uses the project globs when declared, without merging', () => {
      fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\nruleGlobs:\n  - "**/*.check.ts"\n');
      expect(resolveRuleGlobs(root)).toEqual(['**/*.check.ts']);
    });

    it('falls back and warns on a malformed value', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\nruleGlobs: nope\n');
      expect(resolveRuleGlobs(root)).toEqual(DEFAULT_RULE_GLOBS);
      expect(warn.mock.calls.flat().join(' ')).toContain('ruleGlobs');
    });

    it('matches a project whose only suffix is .unit.ts', () => {
      rule('src/thing.unit.ts', '// guards DEC-001');
      expect(findRuleFiles(root, DEFAULT_RULE_GLOBS)).toEqual([path.join('src', 'thing.unit.ts')]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Exclusions
  // ═══════════════════════════════════════════════════════════

  describe('exclusions', () => {
    it('excludes the surrogate and the usual build output, by explicit list', () => {
      for (const d of ['opensprint', 'openspec', 'node_modules', 'dist', 'build', '.git']) {
        expect(EXCLUDED_DIRS).toContain(d);
      }
    });

    it('does not scan inside opensprint/ or openspec/', () => {
      rule('opensprint/notes.test.md', 'DEC-001');
      rule('openspec/changes/x/spec.test.md', 'DEC-001');
      rule('src/real.test.ts', 'DEC-001');
      expect(findRuleFiles(root, DEFAULT_RULE_GLOBS)).toEqual([path.join('src', 'real.test.ts')]);
    });

    it('a record does not guard itself through its own depends-on', () => {
      spec('DS-A', '[product]');
      dec('DEC-001', ['DS-A'], '[dev]');
      // no rule files at all
      expect(kinds('decision-unguarded')).toEqual(['DEC-001']);
    });

    it('excludes node_modules', () => {
      rule('node_modules/pkg/x.test.js', 'DEC-001');
      expect(findRuleFiles(root, DEFAULT_RULE_GLOBS)).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Citation extraction
  // ═══════════════════════════════════════════════════════════

  describe('extractCitations', () => {
    const known = new Set(['DEC-001', 'DEC-002', 'DS-PRICING']);

    it('finds ids in comments, test names and string literals', () => {
      const r = extractCitations(
        `// guards DEC-001\ndescribe('DEC-002 holds', () => {});\nconst x = "DS-PRICING";`,
        known
      );
      expect(r.cited).toEqual(['DEC-001', 'DEC-002', 'DS-PRICING']);
    });

    it('deduplicates repeated ids', () => {
      expect(extractCitations('DEC-001 DEC-001 DEC-001', known).cited).toEqual(['DEC-001']);
    });

    it('reports ids shaped like records but resolving to none', () => {
      const r = extractCitations('DEC-999 and DS-NOPE and DEC-001', known);
      expect(r.cited).toEqual(['DEC-001']);
      expect(r.unresolved).toEqual(['DEC-999', 'DS-NOPE']);
    });

    it('does not match partial or lowercase lookalikes', () => {
      const r = extractCitations('dec-001 DECISION-001 DSPRICING', known);
      expect(r.cited).toEqual([]);
    });
  });

  describe('buildRuleIndex', () => {
    it('maps records to the rules citing them and back', () => {
      spec('DS-A', '[product]');
      dec('DEC-001', ['DS-A'], '[dev]');
      rule('src/a.test.ts', '// DEC-001');
      const idx = buildRuleIndex(root, ['DS-A', 'DEC-001'], DEFAULT_RULE_GLOBS);
      expect(idx.byRecord.get('DEC-001')).toEqual([path.join('src', 'a.test.ts')]);
      expect(idx.byRecord.get('DS-A')).toEqual([]);
      expect(idx.byRule.get(path.join('src', 'a.test.ts'))).toEqual(['DEC-001']);
    });

    it('records a link for each of several records cited by one rule', () => {
      dec('DEC-001', [], '[dev]');
      dec('DEC-002', [], '[dev]');
      rule('src/a.test.ts', 'DEC-001 and DEC-002');
      const idx = buildRuleIndex(root, ['DEC-001', 'DEC-002'], DEFAULT_RULE_GLOBS);
      expect(idx.byRecord.get('DEC-001')).toHaveLength(1);
      expect(idx.byRecord.get('DEC-002')).toHaveLength(1);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Open loops
  // ═══════════════════════════════════════════════════════════

  describe('deriveOpenLoops', () => {
    it('defines exactly six kinds, by explicit list', () => {
      expect([...OPEN_LOOP_KINDS]).toEqual([
        'constraint-unanswered',
        'constraint-unasserted',
        'decision-unguarded',
        'rule-guards-dead-record',
        'decision-on-superseded',
        'record-unclassified',
      ]);
    });

    it('reports a constraint no decision answers', () => {
      spec('DS-ALONE', '[product]');
      expect(kinds('constraint-unanswered')).toEqual(['DS-ALONE']);
    });

    it('does not report unanswered when a decision depends on it', () => {
      spec('DS-A', '[product]');
      dec('DEC-001', ['DS-A'], '[dev]');
      expect(kinds('constraint-unanswered')).toEqual([]);
    });

    it('reports a constraint whose answering decisions are all uncited', () => {
      spec('DS-A', '[product]');
      dec('DEC-001', ['DS-A'], '[dev]');
      expect(kinds('constraint-unasserted')).toEqual(['DS-A']);
    });

    it('constraint coverage is transitive — a cited decision asserts its constraint', () => {
      spec('DS-A', '[product]');
      dec('DEC-001', ['DS-A'], '[dev]');
      rule('src/a.test.ts', '// DEC-001'); // cites the decision, never the driver-spec
      expect(kinds('constraint-unasserted')).toEqual([]);
      expect(kinds('decision-unguarded')).toEqual([]);
    });

    it('reports a decision no rule cites', () => {
      dec('DEC-001', [], '[dev]');
      dec('DEC-002', [], '[dev]');
      rule('src/a.test.ts', '// DEC-001');
      expect(kinds('decision-unguarded')).toEqual(['DEC-002']);
    });

    it('ignores superseded decisions when looking for unguarded ones', () => {
      dec('DEC-001', [], '[dev]', 'superseded');
      expect(kinds('decision-unguarded')).toEqual([]);
    });

    it('reports a rule guarding a dead record, naming the rule', () => {
      dec('DEC-001', [], '[dev]', 'superseded');
      rule('src/a.test.ts', '// still guards DEC-001');
      const dead = loops().filter((l) => l.kind === 'rule-guards-dead-record');
      expect(dead).toHaveLength(1);
      expect(dead[0].record).toBe('DEC-001');
      expect(dead[0].rule).toBe(path.join('src', 'a.test.ts'));
    });

    it('reports a decision resting on a superseded ancestor, pointing at rebuild-assess', () => {
      dec('DEC-OLD', [], '[dev]', 'superseded');
      dec('DEC-002', ['DEC-OLD'], '[dev]');
      const found = loops().filter((l) => l.kind === 'decision-on-superseded');
      expect(found.map((l) => l.record)).toEqual(['DEC-002']);
      expect(found[0].detail).toContain('/opsp:rebuild-assess');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Hat attribution
  // ═══════════════════════════════════════════════════════════

  describe('groupLoopsByHat', () => {
    it('attributes a loop to every hat its record declares', () => {
      dec('DEC-001', [], '[dev, devops]');
      const g = groupLoopsByHat(loops(), REGISTRY);
      expect(g.get('dev')!.map((l) => l.record)).toContain('DEC-001');
      expect(g.get('devops')!.map((l) => l.record)).toContain('DEC-001');
      expect(g.get('product')).toEqual([]);
    });

    it('collects loops on unassigned records under null', () => {
      dec('DEC-001', [], null);
      const g = groupLoopsByHat(loops(), REGISTRY);
      expect(g.get(null)!.map((l) => l.record)).toEqual(['DEC-001']);
    });

    it('returns an entry for every registry hat even when empty', () => {
      const g = groupLoopsByHat([], REGISTRY);
      for (const hat of REGISTRY) expect(g.get(hat)).toEqual([]);
    });
  });
});
