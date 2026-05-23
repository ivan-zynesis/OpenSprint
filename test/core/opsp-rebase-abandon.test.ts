import { describe, it, expect } from 'vitest';
import {
  getOpspSkillTemplates,
  getOpspCommandContents,
  OPSP_WORKFLOW_IDS,
} from '../../src/core/shared/index.js';

describe('OPSP rebase and abandon skills', () => {
  describe('registry presence', () => {
    it('should include opsp-rebase and opsp-abandon in OPSP_WORKFLOW_IDS', () => {
      expect(OPSP_WORKFLOW_IDS).toContain('opsp-rebase');
      expect(OPSP_WORKFLOW_IDS).toContain('opsp-abandon');
    });

    it('should include rebase and abandon in skill templates', () => {
      const templates = getOpspSkillTemplates();
      const ids = templates.map(t => t.workflowId);
      expect(ids).toContain('opsp-rebase');
      expect(ids).toContain('opsp-abandon');
    });

    it('should include rebase and abandon in command contents', () => {
      const contents = getOpspCommandContents();
      const ids = contents.map(c => c.id);
      expect(ids).toContain('opsp-rebase');
      expect(ids).toContain('opsp-abandon');
    });
  });

  describe('opensprint-rebase skill', () => {
    it('should have correct name and opensprint- prefix', () => {
      const templates = getOpspSkillTemplates();
      const rebase = templates.find(t => t.workflowId === 'opsp-rebase');
      expect(rebase).toBeDefined();
      expect(rebase!.template.name).toBe('opensprint-rebase');
      expect(rebase!.dirName).toBe('opensprint-rebase');
    });

    it('should carry the operator-only guardrail', () => {
      const templates = getOpspSkillTemplates();
      const rebase = templates.find(t => t.workflowId === 'opsp-rebase');
      expect(rebase!.template.instructions).toContain('OPERATOR-ONLY SKILL');
      expect(rebase!.template.instructions).toContain('MUST NOT be invoked by another agent');
    });

    it('should describe the read-only planning phase', () => {
      const templates = getOpspSkillTemplates();
      const rebase = templates.find(t => t.workflowId === 'opsp-rebase');
      expect(rebase!.template.instructions).toContain('Planning (Read-Only)');
      expect(rebase!.template.instructions).toContain('No files are written during this phase');
      expect(rebase!.template.instructions).toContain('Await operator confirmation');
    });

    it('should describe DFS traversal with citizen classification', () => {
      const templates = getOpspSkillTemplates();
      const rebase = templates.find(t => t.workflowId === 'opsp-rebase');
      expect(rebase!.template.instructions).toContain('MIGRATE HIGH');
      expect(rebase!.template.instructions).toContain('MIGRATE LOW');
      expect(rebase!.template.instructions).toContain('CONFLICT');
      expect(rebase!.template.instructions).toContain('REDUNDANT');
      expect(rebase!.template.instructions).toContain('SUPERSEDED');
    });

    it('should have the bias-toward-escalation guardrail', () => {
      const templates = getOpspSkillTemplates();
      const rebase = templates.find(t => t.workflowId === 'opsp-rebase');
      expect(rebase!.template.instructions).toContain('Bias toward escalation');
      expect(rebase!.template.instructions).toContain('LOW confidence always escalates');
    });

    it('should warn about wrong-command when ADR conflict rate is high', () => {
      const templates = getOpspSkillTemplates();
      const rebase = templates.find(t => t.workflowId === 'opsp-rebase');
      expect(rebase!.template.instructions).toContain('/opsp:abandon');
      expect(rebase!.template.instructions).toContain('50%');
    });

    it('should describe surrogate finalization after DFS', () => {
      const templates = getOpspSkillTemplates();
      const rebase = templates.find(t => t.workflowId === 'opsp-rebase');
      expect(rebase!.template.instructions).toContain('DECISION-MAP.md');
    });
  });

  describe('opensprint-abandon skill', () => {
    it('should have correct name and opensprint- prefix', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon).toBeDefined();
      expect(abandon!.template.name).toBe('opensprint-abandon');
      expect(abandon!.dirName).toBe('opensprint-abandon');
    });

    it('should carry the operator-only guardrail', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('OPERATOR-ONLY SKILL');
      expect(abandon!.template.instructions).toContain('MUST NOT be invoked by another agent');
    });

    it('should describe the read-only planning phase', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('Planning (Read-Only)');
      expect(abandon!.template.instructions).toContain('No files are written during this phase');
      expect(abandon!.template.instructions).toContain('Await operator confirmation');
    });

    it('should describe snapshot-before-migration ordering', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('Write Snapshot (Before Any Migration)');
      expect(abandon!.template.instructions).toContain('before migrating anything');
      expect(abandon!.template.instructions).toContain('opensprint/abandoned/');
    });

    it('should describe DFS traversal with citizen classification', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('MIGRATE HIGH');
      expect(abandon!.template.instructions).toContain('CONFLICT');
      expect(abandon!.template.instructions).toContain('REDUNDANT');
      expect(abandon!.template.instructions).toContain('SUPERSEDED');
    });

    it('should describe migration manifest writing', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('migration-manifest.md');
      expect(abandon!.template.instructions).toContain('operator decision log');
      expect(abandon!.template.instructions).toContain('recovery notes');
    });

    it('should require manifest confirmation before worktree removal', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('Operator Confirms Manifest');
      expect(abandon!.template.instructions).toContain('Only after manifest confirmed');
    });

    it('should describe loser worktree removal as final step', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('git worktree remove');
    });

    it('should have the bias-toward-escalation guardrail', () => {
      const templates = getOpspSkillTemplates();
      const abandon = templates.find(t => t.workflowId === 'opsp-abandon');
      expect(abandon!.template.instructions).toContain('Bias toward escalation');
      expect(abandon!.template.instructions).toContain('LOW confidence always escalates');
    });
  });

  describe('command content', () => {
    it('should have rebase command with correct metadata', () => {
      const contents = getOpspCommandContents();
      const rebase = contents.find(c => c.id === 'opsp-rebase');
      expect(rebase).toBeDefined();
      expect(rebase!.name).toBe('OPSP: Rebase');
      expect(rebase!.tags).toContain('reconciliation');
    });

    it('should have abandon command with correct metadata', () => {
      const contents = getOpspCommandContents();
      const abandon = contents.find(c => c.id === 'opsp-abandon');
      expect(abandon).toBeDefined();
      expect(abandon!.name).toBe('OPSP: Abandon');
      expect(abandon!.tags).toContain('hard-fork');
    });
  });
});
