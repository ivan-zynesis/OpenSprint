import { describe, it, expect } from 'vitest';
import { getOpspSkillTemplates } from '../../src/core/shared/index.js';

const workflow = (id: string) =>
  getOpspSkillTemplates().find((t) => t.workflowId === id)!.template.instructions;

describe('backlog seam', () => {
  describe('explore loads the backlog', () => {
    const i = () => workflow('opsp-explore');

    it('runs the harvest as part of surrogate entry', () => {
      expect(i()).toContain('opensprint compact loops --json');
    });

    it('names all five loop kinds', () => {
      const t = i();
      for (const kind of [
        'constraint-unanswered',
        'constraint-unasserted',
        'decision-unguarded',
        'rule-guards-dead-record',
        'decision-on-superseded',
      ]) {
        expect(t).toContain(kind);
      }
    });

    it('groups by the accountable hat', () => {
      expect(i()).toMatch(/grouped by the hat\s+accountable for each/);
    });

    it('forbids ranking or recommending', () => {
      const t = i();
      expect(t).toMatch(/Do not rank them, score them, or recommend one over another/);
      expect(t).toMatch(/an agent nudging the backlog is an agent setting the roadmap/i);
    });

    it('treats a deliberate absence as settled rather than missing', () => {
      const t = i();
      expect(t).toMatch(/Some absences are decisions/i);
      expect(t).toMatch(/cite the record that settles it/i);
    });

    it('degrades rather than failing when the command is unavailable', () => {
      const t = i();
      expect(t).toMatch(/continue without the backlog/i);
      expect(t).toMatch(/context,\s*not a precondition/);
    });
  });

  describe('propose records what the initiative addresses', () => {
    const i = () => workflow('opsp-propose');

    it('documents the Addresses section', () => {
      expect(i()).toContain('## Addresses');
    });

    it('states it is omitted when the initiative did not arise from a loop', () => {
      expect(i()).toMatch(/Omit the section\s+entirely when the initiative did not arise from a loop/);
    });

    it('states it is prose rather than frontmatter', () => {
      expect(i()).toMatch(/prose, not frontmatter/i);
    });

    it('states that nothing marks a loop resolved', () => {
      const t = i();
      expect(t).toMatch(/\*\*Nothing marks a loop resolved\.\*\*/);
      expect(t).toMatch(/the backlog cannot\s+drift from reality/);
    });
  });

  describe('DEC-007 — no separate remediation workflow', () => {
    it('explore and propose remain the only triage route', () => {
      const t = workflow('opsp-propose');
      expect(t).toContain('opensprint compact loops');
      // no fifth workflow was introduced
      const ids = getOpspSkillTemplates().map((s) => s.workflowId);
      expect(ids).not.toContain('opsp-remediate');
      expect(ids).not.toContain('opsp-triage');
    });
  });
});
