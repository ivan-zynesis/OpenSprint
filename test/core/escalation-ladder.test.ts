import { describe, it, expect } from 'vitest';
import { getOpspSkillTemplates, OPSP_WORKFLOW_IDS } from '../../src/core/shared/index.js';
import { TRANSITIONS, checkTransition, transitionFor } from '../../src/core/initiative-transitions.js';

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
      expect(text).toMatch(/the GOAL moved/);
      expect(text).toMatch(/the STRATEGY moved/);
      expect(text).toMatch(/the work is MISSING/);
      expect(text).toMatch(/YOU ARE HERE/);
    });

    it('tests the Statement, not the whole driver-spec', () => {
      const text = instructions('opsp-repropose');
      expect(text).toMatch(/The test is a driver-spec's Statement/);
      expect(text).toContain('/opsp:reexplore');
    });

    it('may amend Measures, bounded the way attest is', () => {
      const text = instructions('opsp-repropose');
      expect(text).toMatch(/MAY CHANGE/);
      expect(text).toMatch(/MUST NOT CHANGE/);
      expect(text).toContain('## Measures');
      expect(text).toContain('DEC-027');
    });

    it('routes a lowered bar to the goal rung', () => {
      const text = instructions('opsp-repropose');
      expect(text).toMatch(/Lowering the bar to fit what was built is not amending a measure/);
      expect(text).toMatch(/easier rather than different/);
    });

    it('makes the Statement its invariant and stops where one must move', () => {
      const text = instructions('opsp-repropose');
      expect(text).toMatch(/Statement is the invariant/);
      expect(text).toMatch(/this is the goal moving, not the strategy/i);
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

    it('build and handoff can both fall back to the goal rung', () => {
      expect(find('building', 'exploring', '/opsp:reexplore')).toBeDefined();
      expect(find('ready-for-attestation', 'exploring', '/opsp:reexplore')).toBeDefined();
    });

    it('attestation can fall back to the strategy rung', () => {
      expect(find('ready-for-attestation', 'proposed', '/opsp:repropose')).toBeDefined();
    });

    it('attestation can request a change without superseding anything', () => {
      const t = find('ready-for-attestation', 'building', '/opsp:attest');
      expect(t).toBeDefined();
      expect(t!.when).toMatch(/the work was not finished/);
    });

    it('a change request is the only way back to building from the handoff', () => {
      const back = TRANSITIONS.filter(
        (t) => t.from === 'ready-for-attestation' && t.to === 'building'
      );
      expect(back.map((t) => t.by)).toEqual(['/opsp:attest']);
      expect(back[0].when).toMatch(/the work was not finished/);
    });

    it('a refusal from the handoff names every way back', () => {
      const r = checkTransition('ready-for-attestation', 'completed');
      expect(r).not.toBeNull();
      const tos = r!.legal.map((t) => t.to).sort();
      expect(tos).toEqual(['attested', 'building', 'exploring', 'proposed']);
      expect(r!.legal.map((t) => t.by)).toContain('/opsp:repropose');
      expect(r!.legal.map((t) => t.by)).toContain('/opsp:reexplore');
    });

    it('building can go forward to the handoff or back to either rung', () => {
      expect(checkTransition('building', 'ready-for-attestation')).toBeNull();
      expect(checkTransition('building', 'proposed')).toBeNull();
      expect(checkTransition('building', 'exploring')).toBeNull();
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
      expect(text()).toMatch(/Does a driver-spec's STATEMENT have to change\?/);
      expect(text()).toMatch(/the GOAL moved/);
      expect(text()).toMatch(/the STRATEGY moved/);
      expect(text()).toMatch(/nothing moved/);
    });

    it('does not guess which rung it is', () => {
      expect(text()).toMatch(/Do not guess which/);
    });

    it('says both rungs stop apply, and that both are hat changes', () => {
      expect(text()).toMatch(/Both rungs stop apply, and both are hat changes/);
      expect(text()).toContain('/opsp:repropose');
      expect(text()).toContain('/opsp:reexplore');
      expect(text()).toContain('DEC-HAT-HANDOFFS');
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

    it('says the hat change already happened at the handoff', () => {
      expect(text()).toMatch(/already wearing the right hat for all three/);
      expect(text()).toMatch(/That is what the handoff was for/);
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

  describe('reexplore is explore, later', () => {
    const text = () => instructions('opsp-reexplore');

    it('keeps its long-standing name (DEC-REEXPLORE-NAME)', () => {
      expect([...OPSP_WORKFLOW_IDS]).toContain('opsp-reexplore');
      expect([...OPSP_WORKFLOW_IDS]).not.toContain('opsp-reideate');
    });

    it('declares itself the goal rung', () => {
      expect(text()).toMatch(/Which rung is this\?/);
      expect(text()).toMatch(/YOU ARE HERE/);
      expect(text()).toMatch(/the GOAL moved/);
    });

    it('writes nothing, and says that is the symmetry with explore', () => {
      expect(text()).toMatch(/\*\*writes\s+nothing\*\*/);
      expect(text()).toMatch(/Writes nothing\./);
      expect(text()).toMatch(/would not be re-exploring/);
    });

    it('rejoins the forward road rather than inventing a path', () => {
      expect(text()).toContain('/opsp:backlog');
      expect(text()).toContain('/opsp:triage');
      expect(text()).toContain('/opsp:propose');
      expect(text()).toMatch(/the same road, rejoined/);
    });

    it('tests the Statement, handing Measures-only changes to repropose', () => {
      expect(text()).toMatch(/does a driver-spec's \*\*Statement\*\* have to change/i);
      expect(text()).toContain('/opsp:repropose');
    });

    it('states the hat change before thinking', () => {
      expect(text()).toMatch(/HAT CHANGE/);
      expect(text()).toMatch(/setting down:\s+dev, devops/);
      expect(text()).toMatch(/picking up:\s+product, maintainer/);
    });

    it('refuses to load the implementation', () => {
      expect(text()).toMatch(/DO NOT LOAD/);
      expect(text()).toMatch(/becomes a rationalisation of that\s+implementation/);
    });

    it('supersedes the milestones that served the old goal', () => {
      expect(text()).toMatch(/served the old goal as superseded/);
    });

    it('treats no-change as a result', () => {
      expect(text()).toMatch(/is a \*\*successful\*\* re-ideation/);
    });

    it('advances with the hat named', () => {
      expect(text()).toContain('--to exploring --hat product');
    });
  });

  describe('every transition declares its hat', () => {
    it('each names at least one accountable hat', () => {
      for (const t of TRANSITIONS) {
        expect(t.hat.length, `${t.from} → ${t.to}`).toBeGreaterThan(0);
        for (const h of t.hat) expect(['product', 'maintainer', 'dev', 'devops']).toContain(h);
      }
    });

    it('marks the handoffs and only the handoffs', () => {
      const handoffs = TRANSITIONS.filter((t) => t.handoff).map((t) => `${t.from}→${t.to}`);
      expect(handoffs.sort()).toEqual([
        'attested→completed',
        'building→exploring',
        'building→proposed',
        'building→ready-for-attestation',
        'proposed→building',
      ]);
    });

    it('no exit from the handoff state is itself a handoff', () => {
      const fromHandoff = TRANSITIONS.filter((t) => t.from === 'ready-for-attestation');
      expect(fromHandoff.every((t) => !t.handoff)).toBe(true);
      expect(fromHandoff.every((t) => t.hat.includes('product'))).toBe(true);
    });

    it('build is dev and devops work; the rungs out of it are not', () => {
      expect(transitionFor('proposed', 'building')!.hat).toEqual(['dev', 'devops']);
      expect(transitionFor('building', 'proposed')!.hat).toEqual(['product', 'maintainer']);
      expect(transitionFor('building', 'exploring')!.hat).toEqual(['product', 'maintainer']);
    });

    it('resolves a transition by workflow where two share from and to', () => {
      expect(transitionFor('building', 'ready-for-attestation', '/opsp:apply')!.by).toBe('/opsp:apply');
      expect(transitionFor('building', 'nowhere')).toBeNull();
    });
  });
});
