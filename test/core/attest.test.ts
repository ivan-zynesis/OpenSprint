import { describe, it, expect } from 'vitest';
import { checkAmendment } from '../../src/core/compact/amend.js';
import {
  getOpspAttestSkillTemplate,
  getOpspAttestCommandTemplate,
} from '../../src/core/templates/skill-templates.js';
import {
  OPSP_WORKFLOW_IDS,
  getOpspSkillTemplates,
  getOpspCommandTemplates,
} from '../../src/core/shared/skill-generation.js';

/**
 * DEC-022 — attest is a separate tool, not a phase of compact.
 * DEC-023 — it writes a record and never gates.
 * DEC-027 — amendment is bounded to `## Measures`.
 * DEC-033 — it loads the bar and the evidence, never the diff.
 */
describe('/opsp:attest', () => {
  const record = (measures: string) =>
    `---\nid: DS-X\nstatus: active\n---\n\n# DS-X\n\n## Statement\n\nthe claim\n\n## Measures\n\n${measures}\n\n## Implications\n\n- a thing\n`;

  describe('amendment is bounded to ## Measures (DEC-027)', () => {
    it('accepts an unchanged record', () => {
      const r = record('- **Primary**: a target');
      expect(checkAmendment(r, r).bounded).toBe(true);
    });

    it('accepts adding the three ex-post parts', () => {
      const before = record('- **Primary**: a target');
      const after = record(
        '- **Primary**: a target\n\n### Posture\n\n- **verdict**: met\n\n### Evidence\n\nci run 1\n\n### Exposure\n\nnone'
      );
      expect(checkAmendment(before, after).bounded).toBe(true);
    });

    it('rejects a changed Statement', () => {
      const before = record('- x');
      const after = before.replace('the claim', 'a different claim');
      const result = checkAmendment(before, after);
      expect(result.bounded).toBe(false);
      expect(result.reason).toContain('/opsp:decide');
    });

    it('rejects changed frontmatter', () => {
      const before = record('- x');
      const after = before.replace('status: active', 'status: superseded');
      const result = checkAmendment(before, after);
      expect(result.bounded).toBe(false);
      expect(result.reason).toContain('Frontmatter');
    });

    it('rejects a changed Implications section', () => {
      const before = record('- x');
      const after = before.replace('- a thing', '- a different thing');
      expect(checkAmendment(before, after).bounded).toBe(false);
    });

    it('accepts a record gaining its first Measures section', () => {
      const before = '---\nid: DS-X\n---\n\n# DS-X\n\n## Statement\n\nthe claim\n';
      const after = before + '\n## Measures\n\n### Evidence\n\nci run 1\n';
      expect(checkAmendment(before, after).bounded).toBe(true);
    });
  });

  describe('the skill is registered', () => {
    it('appears in the workflow ids, before archive', () => {
      const ids = [...OPSP_WORKFLOW_IDS];
      expect(ids).toContain('opsp-attest');
      expect(ids.indexOf('opsp-attest')).toBeLessThan(ids.indexOf('opsp-archive'));
    });

    it('is among the skill templates', () => {
      expect(getOpspSkillTemplates().map((e) => e.workflowId)).toContain('opsp-attest');
    });

    it('is among the command templates', () => {
      expect(getOpspCommandTemplates().map((e) => e.id)).toContain('opsp-attest');
    });
  });

  describe('the instructions carry the decisions', () => {
    const text = getOpspAttestSkillTemplate().instructions;

    it('tells the agent to arrive on a narrow context (DEC-033)', () => {
      expect(text).toMatch(/clear your context/i);
      expect(text).toMatch(/DO NOT LOAD/);
      expect(text).toMatch(/the implementation diff/);
      expect(text).toMatch(/the ADR rationales/);
    });

    it('stops rather than self-assessing from the authoring session', () => {
      expect(text).toMatch(/say so and stop/i);
      expect(text).toMatch(/fresh session/i);
    });

    it('forbids reading the code when evidence is inadequate', () => {
      expect(text).toMatch(/cannot assess/);
      expect(text).toMatch(/stop looking/i);
    });

    it('defines evidence as a CI artifact (DS-CI-ATTESTATION)', () => {
      expect(text).toMatch(/Evidence is a CI artifact/);
      expect(text).toMatch(/is not evidence/);
    });

    it('states that it never gates (DEC-023)', () => {
      expect(text).toMatch(/never gates/i);
      expect(text).toMatch(/exits zero/i);
      expect(text).toMatch(/certification/i);
      expect(text).toMatch(/DS-SURROGATE-SCOPE/);
    });

    it('bounds the amendment to Measures (DEC-027)', () => {
      expect(text).toMatch(/DEC-027/);
      expect(text).toMatch(/revert it/i);
      expect(text).toMatch(/\/opsp:decide/);
    });

    it('requires both a date and evidence before a record is attested', () => {
      expect(text).toMatch(/attested-on/);
      expect(text).toMatch(/only \*\*attested\*\* when|attested\*\* when it carries both/i);
    });

    it('hands to archive, which cannot honestly run first', () => {
      expect(text).toMatch(/\/opsp:archive/);
      expect(text).toMatch(/DS-ATTESTED-TRUTH/);
    });
  });

  it('the command template carries the same instructions', () => {
    expect(getOpspAttestCommandTemplate().content).toBe(getOpspAttestSkillTemplate().instructions);
  });
});
