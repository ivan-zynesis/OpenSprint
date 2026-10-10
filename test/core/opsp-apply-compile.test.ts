import { describe, it, expect } from 'vitest';
import { getOpspApplySkillTemplate } from '../../src/core/templates/skill-templates.js';

/**
 * DEC-COMPILE-ON-MILESTONE — apply compiles what the hat in the room owns,
 * and offers the rest. DS-VIEW-AUTHORSHIP is why.
 */
describe('/opsp:apply compiles at the milestone boundary', () => {
  const text = getOpspApplySkillTemplate().instructions;

  describe('dev and devops are compiled', () => {
    it('has a compile step at the boundary', () => {
      expect(text).toMatch(/Compile\s+at\s+the\s+boundary/i);
    });

    it('plans and seals scoped to dev and devops', () => {
      expect(text).toContain('compact plan --hat dev --hat devops');
      expect(text).toContain('compact seal --hat dev --hat devops');
    });

    it('renders only what the plan reports stale', () => {
      expect(text).toMatch(/only\s+the\s+sections\s+it\s+reports\s+stale/i);
    });

    it('stays quiet when nothing is stale', () => {
      expect(text).toMatch(/say\s+nothing\s+and\s+move\s+on/i);
      expect(text).toMatch(/renders\s+nothing\s+at\s+all/i);
    });

    it('says these need no asking, because the hat is in the room', () => {
      expect(text).toMatch(/without\s+asking/i);
      expect(text).toMatch(/wearing\s+that\s+hat/i);
    });
  });

  describe('product and maintainer are offered', () => {
    it('never compiles them silently', () => {
      expect(text).toMatch(/never\s+compile\s+them\s+silently/i);
    });

    it('offers, naming the hat that compiling requires', () => {
      expect(text).toMatch(/Compile\s+it\s+now\?/);
      expect(text).toMatch(/putting\s+on\s+the\s+product\s+hat/i);
    });

    it('requires a context switch, not a render', () => {
      expect(text).toMatch(/context\s+switch\s*—?\s*not\s+a\s+render/i);
      expect(text).toMatch(/Set\s+down\s+what\s+you\s+are/i);
      expect(text).toMatch(/pick\s+the\s+dev\s+hat\s+back\s+up/i);
    });

    it('says why compiling while holding the implementation is worse than stale', () => {
      expect(text).toMatch(/worse\s+than\s+leaving\s+the\s+view\s+stale/i);
      expect(text).toMatch(/staleness\s+is\s+reported/i);
    });

    it('accepts a decline as complete', () => {
      expect(text).toMatch(/declines,\s+leave\s+it/i);
      expect(text).toMatch(/archive\s+compiles\s+it/i);
    });

    it('never gates the milestone', () => {
      expect(text).toMatch(/gates\s+the\s+milestone/i);
      expect(text).toMatch(/does\s+not\s+block\s+anything/i);
    });
  });
});
