import { describe, it, expect } from 'vitest';
import {
  getOpspSkillTemplates,
  getOpspCommandContents,
  OPSP_WORKFLOW_IDS,
} from '../../src/core/shared/index.js';

const skill = () => getOpspSkillTemplates().find((t) => t.workflowId === 'opsp-compact');
const instructions = () => skill()!.template.instructions;
const workflow = (id: string) =>
  getOpspSkillTemplates().find((t) => t.workflowId === id)!.template.instructions;

describe('OPSP compact skill', () => {
  describe('registry presence', () => {
    it('is present in OPSP_WORKFLOW_IDS', () => {
      expect(OPSP_WORKFLOW_IDS).toContain('opsp-compact');
    });

    it('is present in the skill templates', () => {
      expect(getOpspSkillTemplates().map((t) => t.workflowId)).toContain('opsp-compact');
    });

    it('is present in the command contents', () => {
      expect(getOpspCommandContents().map((c) => c.id)).toContain('opsp-compact');
    });

    it('uses the opensprint- prefix for name and directory', () => {
      expect(skill()!.template.name).toBe('opensprint-compact');
      expect(skill()!.dirName).toBe('opensprint-compact');
    });
  });

  describe('the compile loop drives the engine', () => {
    it('starts from the plan and ends at seal', () => {
      const i = instructions();
      expect(i).toContain('opensprint compact plan --json');
      expect(i).toContain('opensprint compact seal');
      expect(i.indexOf('compact plan --json')).toBeLessThan(i.indexOf('compact seal'));
    });

    it('forbids writing the manifest by hand', () => {
      expect(instructions()).toMatch(/Never write the manifest|Never write .*\.manifest\.json/i);
    });

    it('confirms with check after sealing', () => {
      expect(instructions()).toContain('opensprint compact check');
    });
  });

  describe('DEC-011 — rebuild from full inputs', () => {
    it('requires reading the input records in full', () => {
      expect(instructions()).toMatch(/read \*\*every\*\* record the plan names, in full/i);
    });

    it('forbids using the previous rendering as input', () => {
      const i = instructions();
      expect(i).toContain('previous rendering is **output**, never input');
      expect(i).toMatch(/Do not read the existing view and edit it/i);
    });
  });

  describe('DEC-009 — inline citation', () => {
    it('states citation is mandatory, not stylistic', () => {
      expect(instructions()).toContain('Citation is not optional');
    });

    it('requires both records when one amends another', () => {
      expect(instructions()).toMatch(/\*\*cite both\*\*/i);
      expect(instructions()).toMatch(/citing only the superseded record is incomplete/i);
    });

    it('shows the partial-supersession failure as the worked reason', () => {
      const i = instructions();
      expect(i).toContain('DEC-062');
      expect(i).toContain('DEC-064');
    });
  });

  describe('view structure', () => {
    it('names the four sections', () => {
      const i = instructions();
      for (const section of ['Charter', 'Constraints', 'Decisions', 'Open Loops']) {
        expect(i).toContain(section);
      }
    });

    it('requires the charter to be derived, not invented', () => {
      const i = instructions();
      expect(i).toContain('derived, not authored');
      expect(i).toMatch(/Do not invent a charter/i);
    });

    it('forbids inventing open loops', () => {
      const i = instructions();
      expect(i).toMatch(/Do not infer a missing decision or a missing test/i);
      expect(i).toMatch(/An invented gap costs/i);
    });

    it('describes the index as a router rather than a summary', () => {
      expect(instructions()).toContain('A router, not a summary');
    });
  });

  describe('DEC-006 — a tampered view stops the run', () => {
    it('stops rather than overwriting', () => {
      const i = instructions();
      expect(i).toMatch(/Stop\. Do not render over it\./i);
    });

    it('directs the operator to explore', () => {
      const i = instructions();
      expect(i).toContain('/opsp:explore');
      expect(i).toMatch(/If the view is wrong, \*\*the system is wrong\*\*/i);
    });
  });

  describe('compact never writes the record', () => {
    it('forbids touching driver-specs, ADRs and the decision map', () => {
      const i = instructions();
      expect(i).toContain('Never write a record');
      expect(i).toContain('opensprint/driver-specs/');
      expect(i).toContain('opensprint/ADRs/');
      expect(i).toContain('DECISION-MAP.md');
    });

    it('points at the workflows that do change the record', () => {
      const i = instructions();
      expect(i).toContain('/opsp:driver');
      expect(i).toContain('/opsp:decide');
    });
  });

  describe('architecture.md is a sibling output', () => {
    it('is rendered from the records, not from the views', () => {
      const i = instructions();
      expect(i).toContain('opensprint/architecture.md');
      expect(i).toMatch(/from the records\*\*, not from the hat views/i);
      expect(i).toMatch(/Compiling one from the other compounds the loss/i);
    });
  });
});

describe('DEC-014 — one compile engine, called from every skill that needs one', () => {
  it('archive delegates instead of synthesising', () => {
    const i = workflow('opsp-archive');
    expect(i).toContain('/opsp:compact');
    expect(i).toMatch(/Do not synthesise .*architecture\.md.* here/);
    // the old per-section synthesis instructions are gone
    expect(i).not.toContain('#### System Overview');
    expect(i).not.toContain('Synthesize, don\'t copy-paste');
  });

  it('knockdown compiles from the confirmed records', () => {
    const i = workflow('opsp-knockdown');
    expect(i).toContain('/opsp:compact');
    expect(i).toMatch(/compiled from the confirmed records/i);
  });

  it('rebase regenerates rather than merging the views', () => {
    const i = workflow('opsp-rebase');
    expect(i).toContain('/opsp:compact');
    expect(i).toMatch(/regenerated, never merged/i);
  });

  it('abandon regenerates rather than merging the views', () => {
    const i = workflow('opsp-abandon');
    expect(i).toContain('/opsp:compact');
    expect(i).toMatch(/regenerated, never merged/i);
  });
});
