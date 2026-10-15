import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOpspApplySkillTemplate,
  getOpspExploreSkillTemplate,
  getOpspTriageSkillTemplate,
  getOpspProposeSkillTemplate,
  getOpspAttestSkillTemplate,
} from '../../src/core/templates/skill-templates.js';

/**
 * DS-SURROGATE-BUDGET — an agent orients on the compiled per-hat views and
 * opens a full record only for the decision it is about to act on. The views
 * were compiled and sealed, and no workflow read them: every load list said
 * "read ALL".
 */

/** The text between two markers, failing loudly when either is missing. */
function between(text: string, start: string, end: string): string {
  const from = text.indexOf(start);
  expect(from, `missing start marker: ${start}`).toBeGreaterThanOrEqual(0);
  const to = text.indexOf(end, from + start.length);
  expect(to, `missing end marker: ${end}`).toBeGreaterThan(from);
  return text.slice(from, to);
}

/** List items that name a path under opensprint/ — what the step tells the agent to read. */
function readList(step: string): string[] {
  return step
    .split('\n')
    .filter((line) => /^\s*(?:[-*]|\d+\.)\s/.test(line) && line.includes('opensprint/'));
}

const apply = getOpspApplySkillTemplate().instructions;
const explore = getOpspExploreSkillTemplate().instructions;
const triage = getOpspTriageSkillTemplate().instructions;
const propose = getOpspProposeSkillTemplate().instructions;
const attest = getOpspAttestSkillTemplate().instructions;

interface LoadStep {
  text: string;
  start: string;
  end: string;
  reads: string[];
  scoped: string | null;
}

const LOAD_STEPS: Record<string, LoadStep> = {
  apply: {
    text: apply,
    start: '2. **Load the operator surrogate',
    end: '3. **Create initiative worktree**',
    reads: ['opensprint/squad/index.md', 'opensprint/squad/dev.md', 'opensprint/squad/devops.md'],
    scoped: 'compact plan --hat dev --hat devops --json',
  },
  explore: {
    text: explore,
    start: '## On Entry: Load the Surrogate',
    end: 'Then load the **backlog**',
    reads: [
      'opensprint/squad/index.md',
      'opensprint/squad/product.md',
      'opensprint/squad/maintainer.md',
      'opensprint/BOARD.md',
    ],
    scoped: 'compact plan --hat product --hat maintainer --json',
  },
  triage: {
    text: triage,
    start: '## Step 1:',
    end: '## Step 2',
    reads: [
      'opensprint/squad/index.md',
      'opensprint/squad/product.md',
      'opensprint/squad/maintainer.md',
    ],
    scoped: 'compact plan --hat product --hat maintainer --json',
  },
  propose: {
    text: propose,
    start: '### 1. Analyze the Conversation',
    end: '### 2. Present Classification',
    reads: [
      'opensprint/squad/index.md',
      'opensprint/squad/product.md',
      'opensprint/squad/maintainer.md',
      'opensprint/squad/dev.md',
      'opensprint/squad/devops.md',
    ],
    scoped: null,
  },
};

/** A workflow's load step, extracted inside the test so a missing marker fails that test alone. */
const stepOf = (name: string): string => {
  const s = LOAD_STEPS[name];
  return between(s.text, s.start, s.end);
};

describe('workflows load the per-hat views, not every record', () => {
  for (const [name, { reads, scoped }] of Object.entries(LOAD_STEPS)) {
    describe(`/opsp:${name}`, () => {
      let step = '';
      beforeEach(() => {
        step = stepOf(name);
      });

      it('cites the budget it serves', () => {
        expect(step).toContain('DS-SURROGATE-BUDGET');
      });

      it('names the views it reads', () => {
        for (const view of reads) expect(step).toContain(view);
      });

      it('asks the engine whether the views can be trusted', () => {
        expect(step).toContain(scoped ?? 'opensprint compact plan --json');
      });

      it('opens a full record only for the decision being acted on', () => {
        expect(step).toMatch(/Open the full record only for the decision you are about to act\s+on/);
      });

      it('says what to do with each section state that is not fresh', () => {
        expect(step).toContain('`stale`');
        expect(step).toContain('`unsealed`');
        expect(step).toContain('`tampered`');
        expect(step).toContain('`inputs`');
      });

      it('reads records that no view covers, and everything where the records predate hats', () => {
        // Cashier's main branch: 80 records, none declaring a hat — every
        // section unsealed with no inputs, every record unassigned.
        expect(step).toContain('`unassigned`');
        expect(step).toMatch(/predate\s+hats/);
        expect(step).toMatch(/read\s+every\s+record/);
        // The all-unsealed case is tested first, so the two rules do not overlap.
        // open-loops sections never have inputs, so they are left out of the test.
        expect(step).toMatch(/If\s+every\s+section\s+other\s+than\s+`open-loops`\s+is\s+`unsealed`\s+with\s+no\s+`inputs`/);
      });

      it('answers an open-loops section from the plan, whatever its state', () => {
        expect(step).toMatch(/An `open-loops` section, in any state, is answered by the plan's own\s+`openLoops`/);
      });

      it('says a section the plan omits is fresh', () => {
        expect(step).toMatch(/lists\s+only\s+the\s+sections\s+that\s+are\s+not\s+fresh/);
      });

      it('treats index.md as a router compact check does not cover, never as a source', () => {
        expect(step).toMatch(/`index\.md` routes, and `compact check` does not cover it/);
        expect(step).toMatch(/never as the\s+source of a claim/);
      });

      it('says there is nothing to load where there are no records yet, judged by the record directories', () => {
        // A new project. Judged on disk, not from empty inputs: an open-loops
        // section has none even where records exist.
        expect(step).toMatch(/`opensprint\/driver-specs\/` and `opensprint\/ADRs\/`\s+hold no records at all/);
        expect(step).toMatch(/there are no\s+records\s+yet/);
      });

      it('treats a view file that does not exist as unsealed', () => {
        expect(step).toMatch(/does\s+not\s+exist/);
      });

      it('names the moved files as well as the moved records, where it reads a stale view', () => {
        // A section observing rule files goes stale when a test citing a
        // record changes, with no record moving at all.
        if (name === 'propose') return;
        expect(step).toContain('`added`');
        expect(step).toContain('`modified`');
        expect(step).toContain('`observedAdded`');
        expect(step).toContain('`observedModified`');
        // Those files are tests in a rules-observing section; the plan's
        // own open loops are current, so the tests need not be read.
        expect(step).toContain('`openLoops`');
      });

      it('never loads everything', () => {
        expect(step).not.toMatch(/read\s+ALL/i);
        expect(step).not.toMatch(/read all existing/i);
        for (const line of readList(step)) {
          expect(line, `bulk load in: ${line}`).not.toMatch(/driver-specs\/\*\.md|ADRs\/\*\.md/);
          expect(line, `unchecked artifact in: ${line}`).not.toMatch(/architecture\.md|DECISION-MAP\.md/);
          expect(line, `initiatives loaded in: ${line}`).not.toContain('initiatives/*.md');
        }
        // Named at all, the unchecked artifacts are named as not loaded.
        for (const artifact of ['architecture.md', 'DECISION-MAP.md']) {
          let at = step.indexOf(artifact);
          while (at !== -1) {
            expect(step.slice(Math.max(0, at - 120), at + 120), `${artifact} loaded`).toMatch(/not loaded/);
            at = step.indexOf(artifact, at + artifact.length);
          }
        }
      });

      it('mentions every record only as the fallback when the engine cannot run', () => {
        const glob = 'opensprint/driver-specs/*.md';
        let at = step.indexOf(glob);
        expect(at).toBeGreaterThanOrEqual(0);
        while (at !== -1) {
          expect(step.slice(Math.max(0, at - 160), at)).toMatch(/fall\s+back/);
          at = step.indexOf(glob, at + glob.length);
        }
      });

      it('calls the installed binary, never openspec, anywhere in the workflow', () => {
        expect(LOAD_STEPS[name].text).not.toMatch(/\bopenspec (compact|config|new|advance|frame)\b/);
      });
    });
  }

  describe('/opsp:apply', () => {
    const step = () => stepOf('apply');

    it('reads the initiative\'s own records in full', () => {
      expect(step()).toMatch(/## Driver Specs\\?`? and \\?`?## ADRs/);
      expect(step()).toMatch(/\*\*in full\*\*/);
    });

    it('states that architecture.md and DECISION-MAP.md are not loaded, and when the map is opened', () => {
      expect(step()).toMatch(/`architecture\.md` and `DECISION-MAP\.md` are not loaded/);
      expect(step()).toMatch(/only to work out a\s+blast radius/);
      expect(step()).toContain('depends-on');
    });

    it('may compile dev and devops itself, because it wears that hat', () => {
      expect(step()).toMatch(/You are wearing dev and devops/);
    });

    it('checks the views before escalating', () => {
      const check = between(apply, '1. **Check the surrogate first:**', '2. **If YES**');
      expect(check).toMatch(/dev or devops view/);
      expect(check).toContain('squad/product.md');
      expect(check).toContain('squad/maintainer.md');
      expect(check).not.toMatch(/architecture\.md/);
    });

    it('re-reads the views it compiled at the milestone boundary', () => {
      const seal = apply.indexOf('opensprint compact seal --hat dev --hat devops');
      const reread = apply.search(/re-read the sections you just rendered/i);
      expect(seal).toBeGreaterThan(-1);
      expect(reread).toBeGreaterThan(seal);
    });

    it('reloads the views, not every record, after a correction', () => {
      const reload = between(apply, '### Surrogate Reload', '## Phase 4');
      expect(reload).toContain('Reload the surrogate views');
      expect(reload).toContain('opensprint compact plan --hat dev --hat devops --json');
      expect(reload).not.toMatch(/re-read ALL/i);
      expect(reload).not.toContain('architecture.md');
    });

    it('retains the views, not the full surrogate, across milestones', () => {
      const ctx = between(apply, '## Context Management for Long Initiatives', '## Guardrails');
      expect(ctx).toMatch(/retain the loaded views/);
      expect(ctx).not.toMatch(/full surrogate/);
    });

    it('no longer says "full surrogate" or "read ALL" anywhere', () => {
      expect(apply).not.toMatch(/full surrogate/);
      expect(apply).not.toMatch(/read ALL/);
    });

    it('carries the change in its description', () => {
      expect(getOpspApplySkillTemplate().description).toMatch(/dev and devops views/);
    });
  });

  describe('/opsp:explore', () => {
    it('reads the board instead of every initiative file', () => {
      const step = stepOf('explore');
      expect(step).toContain('opensprint/BOARD.md');
      expect(step).not.toContain('opensprint/initiatives/*.md');
    });

    it('never compiles product or maintainer itself, and offers compact for any view not fresh', () => {
      expect(stepOf('explore')).toMatch(/Do not compile product or maintainer here/);
      expect(stepOf('explore')).toMatch(/say which views are not fresh and offer `\/opsp:compact`/);
    });

    it('still loads the open-loop backlog', () => {
      expect(explore).toContain('opensprint compact loops --json');
    });

    it('presents every loop kind the harvest returns, not only the five it names', () => {
      expect(explore).toMatch(/Present\s+every kind it returns/);
    });

    it('carries the change in its description', () => {
      expect(getOpspExploreSkillTemplate().description).toMatch(/product and maintainer views/);
    });
  });

  describe('/opsp:triage', () => {
    it('never compiles product or maintainer itself, and offers compact for any view not fresh', () => {
      expect(stepOf('triage')).toMatch(/Do not compile product or maintainer here/);
      expect(stepOf('triage')).toMatch(/say which views are not fresh and offer `\/opsp:compact`/);
    });
  });

  describe('/opsp:attest', () => {
    const table = () =>
      between(attest, '## What you load, and what you must not', '**Why tests and not source.**');

    it('loads only the owning hat\'s posture and measures sections', () => {
      expect(table()).toMatch(/the owning hat's view, posture/);
      expect(table()).toContain('`## Posture`');
      expect(table()).toContain('`## Measures`');
    });

    it('refuses the strategy blocks, which carry ADR rationale', () => {
      expect(table()).toMatch(/the strategy blocks of any/);
      expect(table()).toMatch(/Consideration Factors/);
      expect(table()).toContain('DEC-040');
    });

    it('says how to read one section of a view and nothing else', () => {
      expect(table()).toMatch(/Find the section's heading and read\s+only to the next `## `/);
    });

    it('still reads the bar in full from the driver-spec', () => {
      expect(table()).toMatch(/The bar itself\s+you still read in full, from the driver-spec/);
    });

    it('calls the installed binary, never openspec', () => {
      expect(attest).not.toMatch(/\bopenspec (compact|config|new|advance|frame)\b/);
    });
  });
});
