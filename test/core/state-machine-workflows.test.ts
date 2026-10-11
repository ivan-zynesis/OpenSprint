import { describe, it, expect } from 'vitest';
import { getOpspSkillTemplates } from '../../src/core/shared/index.js';
import { TRANSITIONS } from '../../src/core/initiative-transitions.js';

const instructions = (id: string) =>
  getOpspSkillTemplates().find((t) => t.workflowId === id)!.template.instructions;

/**
 * DEC-STATE-MACHINE — every transition the table claims a workflow performs
 * must actually appear in that workflow's instructions. The table and the
 * prose drifting apart is the failure this whole change exists to fix.
 */
describe('workflows perform the transitions the table assigns them', () => {
  it('every transition names a workflow that exists', () => {
    const ids = new Set(getOpspSkillTemplates().map((t) => t.workflowId));
    for (const t of TRANSITIONS) {
      expect(ids).toContain(t.by.replace('/opsp:', 'opsp-'));
    }
  });

  it('every transition appears in its own workflow as an advance call', () => {
    for (const t of TRANSITIONS) {
      // triage writes declined and exploring through its own templates; the
      // rest of the lifecycle runs through the command.
      if (t.by === '/opsp:triage') continue;
      const text = instructions(t.by.replace('/opsp:', 'opsp-'));
      expect(text, `${t.from} → ${t.to} in ${t.by}`).toContain(`--to ${t.to}`);
    }
  });

  it('no workflow is left editing the field by hand', () => {
    for (const id of ['opsp-propose', 'opsp-apply', 'opsp-attest', 'opsp-archive', 'opsp-reexplore', 'opsp-repropose']) {
      expect(instructions(id)).toMatch(/opensprint advance/);
    }
  });

  describe('propose', () => {
    const text = () => instructions('opsp-propose');

    it('writes the state field into the template it tells an agent to copy', () => {
      expect(text()).toContain('state: proposed');
    });

    it('says not to edit the field by hand, and why', () => {
      expect(text()).toMatch(/Do not edit\s+\\?`state:\\?`\s+by hand/i);
      expect(text()).toContain('DEC-STATE-MACHINE');
    });
  });

  describe('apply', () => {
    const text = () => instructions('opsp-apply');

    it('opens the initiative when the first milestone starts', () => {
      expect(text()).toContain('--to building');
    });

    it('hands over when the last milestone closes', () => {
      expect(text()).toContain('--to ready-for-attestation');
      expect(text()).toMatch(/HANDOFF/);
      expect(text()).toMatch(/setting down:/);
      expect(text()).toMatch(/waiting on:/);
    });

    it('distinguishes borrowing a hat from handing it over', () => {
      expect(text()).toMatch(/Escalation \*\*borrows\*\* a hat/);
      expect(text()).toMatch(/does not go back on/);
    });

    it('refuses to attest in the same session', () => {
      expect(text()).toMatch(/Do not run\s+\\?`\/opsp:attest\\?`\s+in this session/i);
      expect(text()).toContain('DEC-043');
    });

    it('says the handoff is reversible but not skippable, naming each way back', () => {
      expect(text()).toMatch(/The handoff is reversible/);
      expect(text()).toMatch(/what it is not is skippable/i);
      expect(text()).toContain('/opsp:repropose');
      expect(text()).toContain('/opsp:reexplore');
    });
  });

  describe('attest', () => {
    const text = () => instructions('opsp-attest');

    it('closes by advancing to attested', () => {
      expect(text()).toContain('--to attested');
    });

    it('says attested records that judgement happened, not that it was favourable', () => {
      expect(text()).toMatch(/does not mean every bar was met/i);
      expect(text()).toContain('DS-SURROGATE-SCOPE');
    });

    it('offers an exit for each rung rather than advancing', () => {
      expect(text()).toContain('/opsp:repropose');
      expect(text()).toContain('/opsp:reexplore');
      expect(text()).toMatch(/request a change/);
    });
  });

  describe('archive', () => {
    const text = () => instructions('opsp-archive');

    it('closes by advancing to completed', () => {
      expect(text()).toContain('--to completed');
    });

    it('says why that guarantees the views were compiled', () => {
      expect(text()).toMatch(/cannot reach\s+\\?`completed\\?`/i);
      expect(text()).toMatch(/compiled and sealed at exactly one point/i);
    });

    it('keeps status and state as separate fields, and says why', () => {
      expect(text()).toMatch(/are different fields and both are kept/);
    });
  });

  describe('reexplore', () => {
    const text = () => instructions('opsp-reexplore');

    it('returns a handed-over initiative to exploring, with the hat named', () => {
      expect(text()).toContain('--to exploring --hat product');
    });

    it('rejoins the forward road rather than inventing one', () => {
      expect(text()).toContain('/opsp:backlog');
      expect(text()).toContain('/opsp:triage');
      expect(text()).toContain('/opsp:propose');
    });

    it('leaves the state alone where the goal holds after all', () => {
      expect(text()).toMatch(/The initiative's state does not change/);
    });
  });

  describe('repropose', () => {
    const text = () => instructions('opsp-repropose');

    it('returns the initiative to proposed', () => {
      expect(text()).toContain('--to proposed');
    });

    it('says why not building', () => {
      expect(text()).toMatch(/Back to\s+\\?`proposed\\?`, not/);
    });
  });
});
