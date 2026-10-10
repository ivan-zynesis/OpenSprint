import { describe, it, expect } from 'vitest';
import { getOpspKnockdownSkillTemplate } from '../../src/core/templates/skill-templates.js';

/**
 * DEC-KNOCKDOWN-ALL-VIEWS — knockdown produces all five views, and the empty
 * ones are the finding rather than an incomplete result.
 */
describe('/opsp:knockdown produces all five views', () => {
  const skill = getOpspKnockdownSkillTemplate();
  const text = skill.instructions;

  describe('what is produced', () => {
    it('says all five, not just architecture.md', () => {
      expect(text).toMatch(/All\s+five\s+views\s+are\s+produced/i);
    });

    it('still delegates the compile rather than writing views itself', () => {
      expect(text).toMatch(/invoking\s+the\s+compact\s+workflow/i);
      expect(text).toMatch(/DEC-014/);
    });

    it('says which two will be populated and which two empty', () => {
      expect(text).toMatch(/observed\s+from\s+the\s+code/i);
      expect(text).toMatch(/seven\s+objectives,\s+nothing\s+recorded/i);
    });

    it('no longer describes itself as producing only three things', () => {
      expect(skill.description).toMatch(/all\s+five\s+compiled\s+views/i);
      expect(skill.description).toMatch(/empty\s+views\s+are\s+the\s+finding/i);
    });
  });

  describe('intent is not inferred', () => {
    it('forbids assigning a role or an objective', () => {
      expect(text).toMatch(/Do\s+not\s+assign\s+a\s+role\s+or\s+an\s+objective/i);
    });

    it('says why — intent is not readable from source', () => {
      expect(text).toMatch(/no\s+amount\s+of\s+reading\s+source\s+reveals\s+that/i);
    });

    it('says a guessed role is worse than an empty view', () => {
      expect(text).toMatch(/is\s+fiction/i);
      expect(text).toMatch(/reads\s+as\s+decided\s+when\s+nothing\s+was\s+decided/i);
    });
  });

  describe('the empty views are framed as a finding', () => {
    it('states the finding in the words that make it one', () => {
      expect(text).toMatch(/empty\s+views\s+are\s+the\s+finding/i);
      expect(text).toMatch(/Nobody\s+has\s+stated\s+what\s+it\s+must\s+do/i);
    });

    it('contrasts it with the framing that reads as a half-working tool', () => {
      expect(text).toMatch(/describes\s+a\s+tool\s+that\s+half-worked/i);
    });

    it('calls it a better onboarding document than prose', () => {
      expect(text).toMatch(/better\s+onboarding\s+document/i);
      expect(text).toMatch(/questions\s+nobody\s+has\s+answered/i);
    });
  });

  describe('the completion summary', () => {
    it('reports views alongside records', () => {
      expect(text).toMatch(/squad\/product\.md/);
      expect(text).toMatch(/squad\/maintainer\.md/);
      expect(text).toMatch(/architecture\.md\s+✓\s+compiled/);
    });

    it('states the whole surrogate is observed, not decided or attested', () => {
      expect(text).toMatch(/Everything\s+here\s+is\s+OBSERVED/);
      expect(text).toMatch(/Nothing\s+is\s*\n?\s*decided,\s+and\s+nothing\s+is\s+attested/i);
    });

    it('names the seven objectives with nothing recorded', () => {
      for (const objective of [
        'security & access',
        'isolation & confidentiality',
        'integrity & correctness',
        'change & quality',
        'cost & budget',
      ]) {
        expect(text).toContain(objective);
      }
    });

    it('presents them as the starting backlog', () => {
      expect(text).toMatch(/That\s+is\s+your\s+starting\s+backlog/i);
    });
  });
});
