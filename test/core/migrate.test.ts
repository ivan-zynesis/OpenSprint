import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { findMigrations, MIGRATION_KINDS } from '../../src/core/migrate.js';
import {
  getOpspMigrateSkillTemplate,
  getOpspMigrateCommandTemplate,
} from '../../src/core/templates/skill-templates.js';
import {
  OPSP_WORKFLOW_IDS,
  getOpspSkillTemplates,
  getOpspCommandTemplates,
} from '../../src/core/shared/skill-generation.js';

/**
 * DEC-MIGRATE-SEPARATE-TOOL — the schema moved underneath records that were
 * correct when written. Not /opsp:rebuild-assess, which is the world moving.
 */
describe('migration detection', () => {
  let root: string;
  const sprint = () => path.join(root, 'opensprint');

  beforeEach(() => {
    root = path.join(os.tmpdir(), `opensprint-migrate-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(sprint(), 'ADRs'), { recursive: true });
    config('');
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  const config = (body: string) =>
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), `schema: spec-driven\n${body}`);

  const spec = (
    id: string,
    opts: { hats?: string; role?: string; objective?: string; body?: string } = {}
  ) => {
    const { hats = '[maintainer]', role, objective, body = '' } = opts;
    fs.writeFileSync(
      path.join(sprint(), 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: reliability\nstatus: active\ncreated: 2026-01-01\nhats: ${hats}` +
        (role ? `\nrole: ${role}` : '') +
        (objective ? `\nobjective: ${objective}` : '') +
        `\n---\n\n# ${id}\n\n## Statement\n\nA claim.\n${body}`
    );
  };

  const kinds = () => findMigrations(root, sprint()).map((m) => m.kind);
  const find = (kind: string) => findMigrations(root, sprint()).filter((m) => m.kind === kind);

  it('names four kinds, by explicit list', () => {
    expect([...MIGRATION_KINDS]).toEqual([
      'role-not-accepted',
      'objective-missing',
      'bar-not-in-anatomy',
      'hat-entirely-empty',
    ]);
  });

  it('reports nothing when every record is selectable', () => {
    spec('DS-OK', { role: 'goal', objective: 'integrity-correctness' });
    expect(findMigrations(root, sprint())).toEqual([]);
  });

  // ── The case this tool exists for, reconstructed.
  //
  // lifecycle-beyond-build milestone 1: maintainer records carried role: bar
  // while the new seven objectives select on goal/strategy. Every maintainer
  // section would have compiled empty. It was pinned, then hand-migrated.
  describe('the historical case, reconstructed', () => {
    beforeEach(() => {
      spec('DS-HIGH-IMPACT-OPS', { role: 'bar' });
      spec('DS-BACKWARD-COMPAT', { role: 'bar' });
    });

    it('reports the roles the hat no longer accepts', () => {
      const found = find('role-not-accepted');
      expect(found.map((m) => m.subject).sort()).toEqual(['DS-BACKWARD-COMPAT', 'DS-HIGH-IMPACT-OPS']);
      expect(found[0].detail).toContain("role 'bar'");
    });

    it('offers the roles the hat does accept', () => {
      expect(find('role-not-accepted')[0].candidates).toEqual(['goal', 'posture', 'strategy']);
    });

    it('reports the bars as predating the measure anatomy', () => {
      expect(find('bar-not-in-anatomy').map((m) => m.subject).sort()).toEqual([
        'DS-BACKWARD-COMPAT',
        'DS-HIGH-IMPACT-OPS',
      ]);
    });

    it('reports the hat as selecting nothing — the finding that catches the shape change', () => {
      const found = find('hat-entirely-empty');
      expect(found).toHaveLength(1);
      expect(found[0].subject).toBe('maintainer');
      expect(found[0].detail).toMatch(/every section selects none of them/i);
    });

    it('is silent once migrated the way it was migrated by hand', () => {
      spec('DS-HIGH-IMPACT-OPS', {
        role: 'strategy',
        objective: 'integrity-correctness',
        body: '\n## Measures\n\n### Bar\n\n- **neighbour**: unrecorded\n',
      });
      spec('DS-BACKWARD-COMPAT', {
        role: 'strategy',
        objective: 'change-quality',
        body: '\n## Measures\n\n### Bar\n\n- **neighbour**: unrecorded\n',
      });
      expect(findMigrations(root, sprint())).toEqual([]);
    });
  });

  describe('objective-missing', () => {
    it('fires where every section that could take it filters on objective', () => {
      spec('DS-A', { role: 'goal' });
      const found = find('objective-missing');
      expect(found.map((m) => m.subject)).toEqual(['DS-A']);
      expect(found[0].candidates).toContain('security-access');
    });

    it('does not fire when the record declares one', () => {
      spec('DS-A', { role: 'goal', objective: 'cost-budget' });
      expect(kinds()).not.toContain('objective-missing');
    });

    it('does not fire where an unfiltered section can take it', () => {
      spec('DS-A', { role: 'posture' });
      expect(kinds()).not.toContain('objective-missing');
    });
  });

  describe('bar-not-in-anatomy', () => {
    it('does not fire when the bar is already a sub-block', () => {
      spec('DS-A', { role: 'bar', body: '\n## Measures\n\n### Bar\n\n- **chosen**: x\n' });
      expect(kinds()).not.toContain('bar-not-in-anatomy');
    });

    it('does not fire for a record that is not a bar', () => {
      spec('DS-A', { role: 'goal', objective: 'cost-budget' });
      expect(kinds()).not.toContain('bar-not-in-anatomy');
    });
  });

  describe('hat-entirely-empty', () => {
    it('does not fire for a hat holding no records', () => {
      spec('DS-A', { hats: '[product]', role: 'goal' });
      expect(find('hat-entirely-empty').map((m) => m.subject)).not.toContain('maintainer');
    });

    it('does not fire when at least one section selects something', () => {
      spec('DS-A', { role: 'goal', objective: 'cost-budget' });
      expect(kinds()).not.toContain('hat-entirely-empty');
    });
  });

  it('ignores superseded records', () => {
    fs.writeFileSync(
      path.join(sprint(), 'driver-specs', 'DS-OLD.md'),
      '---\nid: DS-OLD\ntype: reliability\nstatus: superseded\nhats: [maintainer]\nrole: bar\n---\n\nB\n'
    );
    expect(findMigrations(root, sprint())).toEqual([]);
  });
});

describe('/opsp:migrate is registered', () => {
  it('appears in the workflow ids', () => {
    expect([...OPSP_WORKFLOW_IDS]).toContain('migrate');
  });

  it('is among the skill and command templates', () => {
    expect(getOpspSkillTemplates().map((e) => e.workflowId)).toContain('migrate');
    expect(getOpspCommandTemplates().map((e) => e.id)).toContain('migrate');
  });

  it('carries the same instructions in both forms', () => {
    expect(getOpspMigrateCommandTemplate().content).toBe(
      getOpspMigrateSkillTemplate().instructions
    );
  });

  describe('the instructions', () => {
    const text = getOpspMigrateSkillTemplate().instructions;

    it('distinguishes itself from rebuild-assess', () => {
      expect(text).toMatch(/rebuild-assess/);
      expect(text).toMatch(/the\s+\*\*world\*\*\s+moved|the\s+\*\*schema\*\*\s+moved/);
    });

    it('says a misfiled record is not a wrong one', () => {
      expect(text).toMatch(/do\s+not\s+become\s+wrong/i);
      expect(text).toMatch(/invisible\s+rather\s+than\s+broken/i);
      expect(text).toMatch(/Never\s+re-decide/i);
    });

    it('tells the reader to read hat-entirely-empty first, and why', () => {
      expect(text).toMatch(/is\s+the\s+one\s+to\s+read\s+first/i);
      expect(text).toMatch(/property\s+of\s+the\s*\n?\s*\*?view\*?/i);
    });

    it('admits it can be a false positive', () => {
      expect(text).toMatch(/false\s+positive/i);
      expect(text).toMatch(/genuinely\s+records\s+nothing/i);
    });

    it('reuses the established question form rather than inventing one', () => {
      expect(text).toMatch(/DEC-CLASSIFY-IN-QUESTION/);
      expect(text).toMatch(/second\s+convention/i);
      expect(text).toMatch(/Correct\s+the\s+classification/);
    });

    it('forbids batching', () => {
      expect(text).toMatch(/Batch-approving\s+defeats\s+the\s+point/i);
      expect(text).toMatch(/Never\s+batch/i);
    });

    it('bounds what may be written', () => {
      expect(text).toMatch(/Never\s+touch\s+content/i);
      expect(text).toMatch(/\/opsp:decide/);
    });
  });
});
