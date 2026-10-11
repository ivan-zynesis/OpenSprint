import { describe, it, expect } from 'vitest';
import { getOpspSkillTemplates, OPSP_WORKFLOW_IDS } from '../../src/core/shared/index.js';
import { TRANSITIONS, checkTransition } from '../../src/core/initiative-transitions.js';

const instructions = (id: string) =>
  getOpspSkillTemplates().find((t) => t.workflowId === id)!.template.instructions;

/**
 * DEC-ESCALATION-LADDER — three rungs, and they are the OGSM altitudes.
 * What has to move decides which.
 */
describe('the escalation ladder', () => {
  describe('repropose is a workflow', () => {
    it('is registered', () => {
      expect([...OPSP_WORKFLOW_IDS]).toContain('opsp-repropose');
      expect(getOpspSkillTemplates().find((t) => t.workflowId === 'opsp-repropose')).toBeDefined();
    });

    it('names all three rungs and where it sits', () => {
      const text = instructions('opsp-repropose');
      expect(text).toMatch(/the GOAL was wrong/);
      expect(text).toMatch(/the STRATEGY was wrong/);
      expect(text).toMatch(/the PLAN was wrong/);
      expect(text).toMatch(/YOU ARE HERE/);
    });

    it('makes the driver-specs its invariant and stops where one must move', () => {
      const text = instructions('opsp-repropose');
      expect(text).toMatch(/Driver-specs are the invariant/);
      expect(text).toMatch(/this is the goal moving, not the strategy/i);
      expect(text).toContain('/opsp:driver');
    });

    it('refuses to move the bar', () => {
      expect(instructions('opsp-repropose')).toMatch(
        /strategy that\s+cannot meet the bar is a strategy to replace, not a bar to lower/
      );
    });

    it('supersedes rather than rewrites, and says why', () => {
      const text = instructions('opsp-repropose');
      expect(text).toMatch(/Supersede, never rewrite/);
      expect(text).toContain('superseded-by');
      expect(text).toContain('decision-on-superseded');
      expect(text).toMatch(/always looks obvious/);
    });

    it('treats archived work as immutable', () => {
      expect(instructions('opsp-repropose')).toMatch(/Archived work is immutable/);
    });

    it('returns the initiative to proposed, and says why not building', () => {
      const text = instructions('opsp-repropose');
      expect(text).toContain('--to proposed');
      expect(text).toMatch(/Back to\s+\\?`proposed\\?`, not\s+\\?`building\\?`/);
      expect(text).toMatch(/work was already underway/);
    });

    it('names what did not change in the revision log', () => {
      expect(instructions('opsp-repropose')).toMatch(/Name what did not change/);
    });
  });

  describe('the transitions', () => {
    const find = (from: string, to: string, by: string) =>
      TRANSITIONS.find((t) => t.from === from && t.to === to && t.by === by);

    it('escalation during build can fall back to the strategy rung', () => {
      expect(find('building', 'proposed', '/opsp:repropose')).toBeDefined();
    });

    it('attestation can fall back to the strategy rung', () => {
      expect(find('ready-for-attestation', 'proposed', '/opsp:repropose')).toBeDefined();
    });

    it('attestation can request a change without superseding anything', () => {
      const t = find('ready-for-attestation', 'building', '/opsp:attest');
      expect(t).toBeDefined();
      expect(t!.when).toMatch(/the plan holds, the work does not/);
    });

    it('re-planning keeps its own edge, distinct from a change request', () => {
      expect(find('ready-for-attestation', 'building', '/opsp:reexplore')).toBeDefined();
    });

    it('a refusal from the handoff names every way back', () => {
      const r = checkTransition('ready-for-attestation', 'completed');
      expect(r).not.toBeNull();
      const tos = r!.legal.map((t) => t.to).sort();
      expect(tos).toEqual(['attested', 'building', 'building', 'proposed']);
      expect(r!.legal.map((t) => t.by)).toContain('/opsp:repropose');
    });

    it('building can go forward to the handoff or back to the strategy', () => {
      expect(checkTransition('building', 'ready-for-attestation')).toBeNull();
      expect(checkTransition('building', 'proposed')).toBeNull();
    });

    it('still refuses a move no rung declares', () => {
      expect(checkTransition('building', 'completed')).not.toBeNull();
      expect(checkTransition('proposed', 'attested')).not.toBeNull();
    });
  });

  describe('apply routes an oversized escalation', () => {
    const text = () => instructions('opsp-apply');

    it('offers a fourth option', () => {
      expect(text()).toMatch(/\[4\] This is bigger than one record/);
    });

    it('asks what has to move, mechanically', () => {
      expect(text()).toMatch(/Does a driver-spec/);
      expect(text()).toMatch(/the GOAL moved/);
      expect(text()).toMatch(/the STRATEGY moved/);
      expect(text()).toMatch(/the PLAN moved/);
    });

    it('does not guess which rung it is', () => {
      expect(text()).toMatch(/Do not guess which/);
    });

    it('says apply stops either way, and why repropose needs a rerun', () => {
      expect(text()).toMatch(/Apply stops either way/);
      expect(text()).toContain('/opsp:repropose');
      expect(text()).toContain('/opsp:reexplore');
    });
  });

  describe('attest can send work back', () => {
    const text = () => instructions('opsp-attest');

    it('distinguishes a missed bar from a change that should not go forward', () => {
      expect(text()).toMatch(/does \*\*not\*\* by itself stop the close/);
    });

    it('offers all three exits', () => {
      expect(text()).toMatch(/request a change/);
      expect(text()).toContain('/opsp:repropose');
      expect(text()).toContain('/opsp:reexplore');
    });

    it('a change request supersedes nothing', () => {
      expect(text()).toMatch(/nothing is superseded, no ADR moves/);
    });

    it('refuses advancing to attested and then reopening', () => {
      expect(text()).toMatch(/Do not advance to\s+\\?`attested\\?`\s+and then reopen/);
    });

    it('names why attestation sits before the merge', () => {
      expect(text()).toMatch(/before\s+the merge rather than after it/);
    });
  });

  describe('reexplore states its rung', () => {
    const text = () => instructions('opsp-reexplore');

    it('declares itself the plan rung', () => {
      expect(text()).toMatch(/Which rung is this\?/);
      expect(text()).toMatch(/YOU ARE HERE/);
    });

    it('hands to repropose where a decision must be superseded', () => {
      expect(text()).toMatch(/you are on the wrong rung/i);
      expect(text()).toContain('/opsp:repropose');
    });
  });
});
