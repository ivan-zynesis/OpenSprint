import { describe, it, expect } from 'vitest';
import { getOpspApplySkillTemplate } from '../../src/core/templates/skill-templates.js';

/**
 * DS-ESCALATION-HANDOFF — a spec that does not cover everything is the normal
 * case, and an escalation is a hat handoff rather than an interruption.
 *
 * DEC-ESCALATION-IS-A-STAGE · DEC-CLASSIFY-IN-QUESTION · DEC-COMPILE-ON-APPROVAL
 */
describe('/opsp:apply escalation is a hat handoff', () => {
  const text = getOpspApplySkillTemplate().instructions;

  describe('the surrogate is consulted first', () => {
    it('resolves silently where the surrogate answers', () => {
      expect(text).toMatch(/resolve\s+it\s+silently/i);
      expect(text).toMatch(/Resolved\s+via/i);
    });
  });

  describe('the stage boundary', () => {
    it('frames an incomplete spec as normal rather than a defect', () => {
      expect(text).toMatch(/hat\s+handoff,\s+not\s+an\s+interruption/i);
      expect(text).toMatch(/normal\s+case/i);
      expect(text).toMatch(/left\s+something\s+unsaid/i);
    });

    it('announces the pause, the milestone and the hat required', () => {
      expect(text).toMatch(/PAUSED\s+—/);
      expect(text).toMatch(/this\s+question\s+needs:/i);
    });

    it('sets the dev hat down explicitly', () => {
      expect(text).toMatch(/setting\s+down\s+the\s+dev\s+hat/i);
    });

    it('picks it back up as a distinct step', () => {
      expect(text).toMatch(/RESUMING\s+—/);
      expect(text).toMatch(/picking\s+the\s+dev\s+hat\s+back\s+up/i);
    });

    it('says why naming the hat changes the answer', () => {
      expect(text).toMatch(/diff\s+in\s+their\s+head/i);
      expect(text).toMatch(/answer\s+as\s+a\s+developer/i);
    });
  });

  describe('classification in the question', () => {
    it('forbids asking openly and classifying afterwards', () => {
      expect(text).toMatch(/not\*{0,2}\s+ask\s+an\s+open\s+question\s+and\s+classify\s+afterwards/i);
    });

    it('infers the hat and never asks which one', () => {
      expect(text).toMatch(/Infer\s+the\s+hat\s*—?\s*never\s+ask\s+which\s+one/i);
      expect(text).toMatch(/I\s+believe\s+this\s+is/);
      expect(text).toMatch(/inferred\s+from:/);
    });

    it('cites the inference machinery rather than inventing it', () => {
      expect(text).toMatch(/DEC-028/);
      expect(text).toMatch(/type.*maps\s+to\s+its\s+hat/i);
    });

    it('presents a draft record with a BDD bar', () => {
      expect(text).toMatch(/Proposed\s+record:/);
      expect(text).toMatch(/## Measures/);
      expect(text).toMatch(/### Bar/);
      expect(text).toMatch(/neighbour/);
    });

    it('states the blast radius inside the question', () => {
      expect(text).toMatch(/If\s+you\s+confirm,\s+this\s+changes/i);
      expect(text).toMatch(/blast\s+radius\s+is\s+part\s+of\s+the\s+question/i);
      expect(text).toMatch(/rebuild-assess/);
    });

    it('offers correction as an action, not a second prompt', () => {
      expect(text).toMatch(/Correct\s+the\s+classification/);
      expect(text).toMatch(/without\s+a\s+second\s+prompt/i);
    });
  });

  describe('approval and compilation', () => {
    it('compiles only after approval', () => {
      expect(text).toMatch(/On\s+approval/i);
      expect(text).toMatch(/and\s+only\s+then/i);
      expect(text).toMatch(/DEC-COMPILE-ON-APPROVAL/);
    });

    it('scopes the compile to the escalated hat alone', () => {
      expect(text).toMatch(/Only\s+the\s+hat\s+the\s+escalation\s+was\s+classified\s+into/i);
      expect(text).toContain('compact seal --hat product');
    });

    it('writes and compiles nothing on a decline', () => {
      expect(text).toMatch(/declines\s+or\s+answers\s+differently/i);
      expect(text).toMatch(/write\s+nothing\s+and\s+compile\s+nothing/i);
    });

    it('notes the surrogate grew, so the question is not asked twice', () => {
      expect(text).toMatch(/never\s+asked\s+again/i);
    });
  });
});
