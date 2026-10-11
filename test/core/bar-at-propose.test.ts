import { describe, it, expect } from 'vitest';
import { getOpspSkillTemplates } from '../../src/core/shared/index.js';
import { BAR_FORMS } from '../../src/core/compact/measures.js';
import { DEFAULT_ROLES } from '../../src/core/hats.js';
import { MEASURABLE_ROLES } from '../../src/core/compact/loops.js';

const instructions = (id: string) =>
  getOpspSkillTemplates().find((t) => t.workflowId === id)!.template.instructions;

/**
 * DEC-BAR-AT-PROPOSE — the bar is written where the goal is.
 *
 * Three places told the operator the bar is written at propose and nothing
 * told the agent to write it. These assert the tools now say what the
 * documentation always claimed.
 */
describe('the bar is written at propose', () => {
  describe('the tools that create a driver-spec', () => {
    for (const id of ['opsp-propose', 'driver']) {
      describe(id, () => {
        const text = () => instructions(id);

        it('carries a Measures section in the template it tells an agent to copy', () => {
          expect(text()).toContain('## Measures');
          expect(text()).toMatch(/\*\*Primary\*\*/);
        });

        it('carries a Bar block', () => {
          expect(text()).toContain('### Bar');
        });

        it('assigns the hat and the role in frontmatter', () => {
          expect(text()).toMatch(/^hats: \[<product\|maintainer>\]$/m);
          expect(text()).toMatch(/^role: <objective\|goal\|strategy>$/m);
        });

        it('carries every label the bar anatomy declares', () => {
          for (const label of ['dimension', 'chosen', 'traded for', 'neighbour']) {
            expect(text(), `bar label '${label}' missing`).toContain(label);
          }
        });

        it('names the BDD form for each hat that declares one', () => {
          for (const [hat, labels] of Object.entries(BAR_FORMS)) {
            expect(text(), `${hat} form missing`).toContain(hat);
            for (const label of labels) {
              expect(text(), `${hat} label '${label}' missing`).toContain(label);
            }
          }
        });

        it('cites the decision that fixes the form', () => {
          expect(text()).toContain('DEC-038');
        });

        it('does not invent a bar the operator cannot state', () => {
          expect(text()).toMatch(/unstated|do not invent|Ask; do not invent/i);
        });
      });
    }
  });

  describe('propose', () => {
    const text = () => instructions('opsp-propose');

    it('says this is where the bar is written, ex ante', () => {
      expect(text()).toMatch(/this is where the bar is written, ex ante/i);
    });

    it('names the loops that fire without the role and the measures', () => {
      expect(text()).toContain('constraint-unmeasurable');
      expect(text()).toContain('record-unclassified');
    });

    it('says an empty Measures heading counts as absent', () => {
      expect(text()).toMatch(/counts as absent/);
      expect(text()).toMatch(/shape of an answer without the answer/);
    });
  });

  describe('driver', () => {
    const text = () => instructions('driver');

    it('asks the operator for the bar rather than inventing one', () => {
      expect(text()).toMatch(/Ask the operator for the bar/);
      expect(text()).toMatch(/Ask; do not invent/);
    });

    it('offers an honest gap where no bar can be stated', () => {
      expect(text()).toMatch(/\*\*Primary\*\*: unstated/);
      expect(text()).toMatch(/honest gap beats a\s+fabricated target/);
    });

    it('keeps the scribe rule it already had', () => {
      expect(text()).toMatch(/You are a scribe for driver specs/);
    });
  });

  describe('the vocabulary the templates offer matches the code', () => {
    it('offers exactly the roles product declares', () => {
      const text = instructions('opsp-propose');
      for (const role of DEFAULT_ROLES.product) {
        expect(text, `role '${role}' not offered`).toContain(role);
      }
    });

    it('offers a bar for every role that owes measures', () => {
      const text = instructions('opsp-propose');
      for (const role of MEASURABLE_ROLES) {
        if (role === 'bar') continue; // maintainer's own role name, not a template field
        expect(text).toContain(role);
      }
    });
  });
});
