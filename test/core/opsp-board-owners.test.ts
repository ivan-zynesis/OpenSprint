import { describe, it, expect } from 'vitest';
import {
  getOpspApplySkillTemplate,
  getOpspBacklogSkillTemplate,
  getOpspTriageSkillTemplate,
  getOpspProposeSkillTemplate,
  getOpspReexploreSkillTemplate,
  getOpspReviewSkillTemplate,
} from '../../src/core/templates/skill-templates.js';

/**
 * The board is a kanban: every card names who holds it, and a workflow that
 * looks an initiative up can see the ones on other branches (DEC-029).
 */

/** The text between two markers, failing loudly when either is missing. */
function between(text: string, start: string, end: string): string {
  const from = text.indexOf(start);
  expect(from, `missing start marker: ${start}`).toBeGreaterThanOrEqual(0);
  const to = text.indexOf(end, from + start.length);
  expect(to, `missing end marker: ${end}`).toBeGreaterThan(from);
  return text.slice(from, to);
}

const apply = getOpspApplySkillTemplate().instructions;
const backlog = getOpspBacklogSkillTemplate().instructions;
const triage = getOpspTriageSkillTemplate().instructions;
const propose = getOpspProposeSkillTemplate().instructions;
const reexplore = getOpspReexploreSkillTemplate().instructions;
const review = getOpspReviewSkillTemplate().instructions;

describe('workflows find initiatives on every branch', () => {
  const lookups: Record<string, string> = { apply, triage, propose, reexplore, review };

  for (const [name, text] of Object.entries(lookups)) {
    it(`/opsp:${name} looks initiatives up across branches`, () => {
      expect(text).toContain('opensprint compact board --all-branches');
    });

    it(`/opsp:${name} never claims the checkout's board lists every initiative`, () => {
      // `compact board` alone rewrites BOARD.md from the checkout and prints
      // nothing, so it cannot be how an agent finds an item.
      expect(text).not.toMatch(/`(?:openspec|opensprint) compact board` lists every initiative/);
      expect(text).not.toMatch(/(?:openspec|opensprint) compact board\s+# (?:Backlog column|the Backlog column lists them)/);
    });
  }
});

describe('/opsp:triage picks the item up', () => {
  const step1 = () => between(triage, '## Step 1:', '## Step 2');

  it('fetches first, so items others pushed are on the board', () => {
    expect(step1()).toContain('git fetch --prune');
    expect(step1().indexOf('git fetch --prune')).toBeLessThan(step1().indexOf('--all-branches'));
  });

  it('says the cross-branch board writes nothing', () => {
    expect(step1()).toMatch(/prints and writes nothing/);
  });

  it('creates a worktree from a branch that exists only on the remote', () => {
    expect(step1()).toContain(
      'git worktree add ../<repo>-opsp-<initiative-name> -b opsp/<initiative-name> origin/opsp/<initiative-name>'
    );
  });

  it('claims the item once it is in the item\'s worktree', () => {
    expect(step1()).toContain('opensprint claim <initiative-name>');
    expect(step1().indexOf('opensprint claim')).toBeGreaterThan(step1().indexOf('git worktree add'));
  });

  it('asks before taking a card someone else holds', () => {
    expect(step1()).toMatch(/someone else as its owner, ask the operator before taking it over/);
  });

  it('commits the claim, and offers to push it — nobody else can see it otherwise', () => {
    const claimAt = step1().indexOf('opensprint claim <initiative-name>');
    const commitAt = step1().indexOf('git commit -m "triage: claim <initiative-name>"');
    expect(commitAt).toBeGreaterThan(claimAt);
    expect(step1()).toContain('git add opensprint/initiatives/ opensprint/BOARD.md');
    expect(step1()).toMatch(/A claim others cannot fetch claims nothing/);
    expect(step1()).toMatch(/Offer to push the branch/);
  });

  it('puts the card down when the item is returned, and commits that too', () => {
    const ret = between(triage, '### Return it', '## Step 4');
    expect(ret).toContain('opensprint claim <initiative-name> --release');
    expect(ret).toContain('git commit -m "triage: return <initiative-name>"');
  });
});

describe('/opsp:apply claims the card before building', () => {
  const step4 = () => between(apply, '4. **Claim it, then open it**', '5. **Select review mode**');

  it('claims, then advances', () => {
    expect(step4()).toContain('opensprint claim <initiative-name>');
    expect(step4().indexOf('opensprint claim')).toBeLessThan(step4().indexOf('opensprint advance'));
  });

  it('asks before taking a card someone else holds', () => {
    expect(step4()).toMatch(/someone else as\s+its owner, ask the operator before taking it over/);
  });

  it('commits the claim on the initiative branch', () => {
    expect(step4()).toMatch(/commit them on the initiative branch/);
  });

  it('names the hat on both handoffs it makes, as advance requires', () => {
    expect(apply).toContain('opensprint advance <initiative-name> --to building --hat dev');
    expect(apply).toContain('opensprint advance <initiative-name> --to ready-for-attestation --hat dev');
    expect(apply).not.toMatch(/--to building\n/);
    expect(apply).not.toMatch(/--to ready-for-attestation\n/);
  });
});

describe('/opsp:backlog leaves the card unclaimed', () => {
  it('never claims — filing an idea is not committing to build it', () => {
    expect(backlog).not.toContain('opensprint claim');
    expect(backlog).toMatch(/Leave it unowned/);
  });

  it('commits the item, then puts it on the board — a branch with no commit of its own reads as merged', () => {
    const commit = backlog.indexOf('git commit -m "backlog: <initiative-name>"');
    const board = backlog.indexOf('\nopensprint compact board\n');
    const amend = backlog.indexOf('git commit --amend --no-edit');
    expect(commit).toBeGreaterThan(-1);
    expect(board).toBeGreaterThan(commit);
    expect(amend).toBeGreaterThan(board);
    expect(backlog).toMatch(/Regenerate the board \*\*after\*\* the first commit/);
    expect(backlog).toMatch(/Offer to push the branch/);
  });
});
