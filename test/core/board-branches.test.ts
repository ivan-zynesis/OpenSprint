import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  collectAllBranches,
  renderAllBranchesBoard,
  regenerateBoard,
  BOARD_FILENAME,
  CHECKOUT_SOURCE,
} from '../../src/core/board.js';

/**
 * DEC-029 puts every initiative on its own branch from its first persisted
 * thought, so no single checkout sees them all. The cross-branch board reads
 * each branch's own card and prints it; the committed board stays what the
 * checkout says, byte for byte.
 */
describe('the cross-branch board', () => {
  let root: string;
  const opensprint = () => path.join(root, 'opensprint');
  const initiativesDir = () => path.join(opensprint(), 'initiatives');
  const run = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });

  const initiative = (id: string, state: string, extra = '') =>
    `---\nid: ${id}\nstatus: active\nstate: ${state}\n${extra}---\n\n## Description\n\nd\n\n## Milestones\n\n- [ ] m1: first\n`;
  const put = (file: string, content: string) => {
    fs.mkdirSync(initiativesDir(), { recursive: true });
    fs.writeFileSync(path.join(initiativesDir(), file), content);
  };
  const branchWith = (branch: string, files: Record<string, string>) => {
    run('checkout', '-q', '-b', branch, 'main');
    for (const [file, content] of Object.entries(files)) put(file, content);
    run('add', '.');
    run('commit', '-q', '--allow-empty', '-m', `work on ${branch}`);
    run('checkout', '-q', 'main');
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-board-branches-'));
    run('init', '-q', '-b', 'main');
    run('config', 'user.email', 'test@example.com');
    run('config', 'user.name', 'Test');
    // The checkout's own card, committed on main.
    put('20261001-checkout.md', initiative('checkout', 'building', 'owner: ivan\n'));
    run('add', '.');
    run('commit', '-q', '-m', 'first');
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  /** A backlog item filed by someone else, a remote-only one, and two contested ids. */
  const scenario = () => {
    branchWith('opsp/local-only', {
      '20261003-local-only.md': initiative('local-only', 'exploring', 'owner: nhat\n'),
    });
    branchWith('opsp/remote-only', { '20261002-remote-only.md': initiative('remote-only', 'proposed') });
    run('update-ref', 'refs/remotes/origin/opsp/remote-only', 'opsp/remote-only');
    run('branch', '-q', '-D', 'opsp/remote-only');
    // Both a local and a remote copy, and they disagree.
    branchWith('opsp/contested', { '20261004-contested.md': initiative('contested', 'building', 'owner: local-copy\n') });
    run('checkout', '-q', '-b', 'tmp', 'main');
    put('20261004-contested.md', initiative('contested', 'proposed', 'owner: remote-copy\n'));
    run('add', '.');
    run('commit', '-q', '-m', 'remote copy');
    run('update-ref', 'refs/remotes/origin/opsp/contested', 'tmp');
    run('checkout', '-q', 'main');
    run('branch', '-q', '-D', 'tmp');
    // The checkout's card also has a branch, carrying an older copy.
    branchWith('opsp/checkout', { '20261001-checkout.md': initiative('checkout', 'proposed', 'owner: branch-copy\n') });
  };

  it('collects the checkout, local branches and remote-tracking branches', () => {
    scenario();
    const { initiatives, sources } = collectAllBranches(opensprint());
    const where = Object.fromEntries(initiatives.map((i) => [i.id, sources.get(i.path)]));
    expect(where).toEqual({
      checkout: CHECKOUT_SOURCE,
      'remote-only': 'origin/opsp/remote-only',
      'local-only': 'opsp/local-only',
      contested: 'opsp/contested',
    });
  });

  it('prefers the checkout, then a local branch, over anything fetched', () => {
    scenario();
    const { initiatives } = collectAllBranches(opensprint());
    const owner = (id: string) => initiatives.find((i) => i.id === id)?.owner;
    expect(owner('checkout')).toBe('ivan');
    expect(owner('contested')).toBe('local-copy');
  });

  describe('two copies of one card', () => {
    /** Commits a new version of the card on top of `branch`, leaving it checked out on main. */
    const advanceCard = (branch: string, owner: string) => {
      run('checkout', '-q', branch);
      put('20261006-shared.md', initiative('shared', 'exploring', `owner: ${owner}\n`));
      run('add', '.');
      run('commit', '-q', '-m', `claim by ${owner}`);
      run('checkout', '-q', 'main');
    };
    const shown = () => {
      const { initiatives, sources } = collectAllBranches(opensprint());
      const card = initiatives.find((i) => i.id === 'shared');
      return { owner: card?.owner, branch: card === undefined ? undefined : sources.get(card.path) };
    };

    beforeEach(() => {
      // Bob files it; origin has the same commit.
      branchWith('opsp/shared', { '20261006-shared.md': initiative('shared', 'exploring') });
      run('update-ref', 'refs/remotes/origin/opsp/shared', 'opsp/shared');
    });

    it('shows the local branch where both copies are the same commit', () => {
      expect(shown()).toEqual({ owner: undefined, branch: 'opsp/shared' });
    });

    it('shows the fetched copy where it is ahead — someone claimed it and pushed', () => {
      run('branch', '-q', 'alice', 'opsp/shared');
      advanceCard('alice', 'Alice');
      run('update-ref', 'refs/remotes/origin/opsp/shared', 'alice');
      expect(shown()).toEqual({ owner: 'Alice', branch: 'origin/opsp/shared' });
    });

    it('shows the local copy where it is ahead — work not pushed yet', () => {
      advanceCard('opsp/shared', 'Bob');
      expect(shown()).toEqual({ owner: 'Bob', branch: 'opsp/shared' });
    });

    it('keeps the local copy where the two diverged', () => {
      run('branch', '-q', 'alice', 'opsp/shared');
      advanceCard('alice', 'Alice');
      run('update-ref', 'refs/remotes/origin/opsp/shared', 'alice');
      advanceCard('opsp/shared', 'Bob');
      expect(shown()).toEqual({ owner: 'Bob', branch: 'opsp/shared' });
    });

    it('picks the remote that is ahead, where there is no local branch', () => {
      run('branch', '-q', 'alice', 'opsp/shared');
      advanceCard('alice', 'Alice');
      run('update-ref', 'refs/remotes/upstream/opsp/shared', 'alice');
      run('branch', '-q', '-D', 'opsp/shared');
      expect(shown()).toEqual({ owner: 'Alice', branch: 'upstream/opsp/shared' });
    });
  });

  it('orders cards by filename, as the checkout does — creation date first', () => {
    scenario();
    expect(collectAllBranches(opensprint()).initiatives.map((i) => i.id)).toEqual([
      'checkout',
      'remote-only',
      'local-only',
      'contested',
    ]);
  });

  it('prints a board naming each card\'s branch, linking only what this checkout holds', () => {
    scenario();
    const b = renderAllBranchesBoard(opensprint());
    expect(b).toContain('# Board — every branch');
    expect(b).toContain('**Printed, never written**');
    expect(b).toContain('| Initiative | Branch | State | Owner | Milestones | Next |');
    expect(b).toContain('| [checkout](initiatives/20261001-checkout.md) | this checkout | building | ivan | 0/1 | m1 |');
    expect(b).toContain('| local-only | opsp/local-only | exploring | nhat | 0/1 | m1 |');
    expect(b).toContain('| remote-only | origin/opsp/remote-only | proposed | — | 0/1 | m1 |');
  });

  it('places branch cards in their kanban columns', () => {
    scenario();
    const b = renderAllBranchesBoard(opensprint());
    const sectionOf = (id: string) => {
      let section = '';
      for (const line of b.split('\n')) {
        const h = line.match(/^## (.+)$/);
        if (h) section = h[1];
        if (line.startsWith(`| ${id} |`) || line.startsWith(`| [${id}]`)) return section;
      }
      return null;
    };
    expect(sectionOf('local-only')).toBe('Backlog');
    expect(sectionOf('remote-only')).toBe('Next');
    expect(sectionOf('contested')).toBe('Doing');
    expect(sectionOf('checkout')).toBe('Doing');
  });

  it('is deterministic for the same refs', () => {
    scenario();
    expect(renderAllBranchesBoard(opensprint())).toBe(renderAllBranchesBoard(opensprint()));
  });

  it('never touches BOARD.md, which still shows the checkout alone', () => {
    scenario();
    regenerateBoard(opensprint());
    const file = path.join(opensprint(), BOARD_FILENAME);
    const before = fs.readFileSync(file, 'utf-8');
    renderAllBranchesBoard(opensprint());
    collectAllBranches(opensprint());
    expect(fs.readFileSync(file, 'utf-8')).toBe(before);
    expect(before).toContain('[checkout]');
    expect(before).not.toContain('local-only');
    expect(before).not.toContain('remote-only');
    expect(before).not.toContain('| Branch |');
  });

  it('shows the checkout alone where git cannot answer', () => {
    fs.rmSync(path.join(root, '.git'), { recursive: true, force: true });
    const { initiatives, sources } = collectAllBranches(opensprint());
    expect(initiatives.map((i) => i.id)).toEqual(['checkout']);
    expect(sources.get(initiatives[0].path)).toBe(CHECKOUT_SOURCE);
  });

  it('reports an unowned card in flight on another branch', () => {
    branchWith('opsp/orphan', { '20261005-orphan.md': initiative('orphan', 'building') });
    expect(renderAllBranchesBoard(opensprint())).toContain('`owner-undeclared` **orphan**');
  });
});
