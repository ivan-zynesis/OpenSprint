import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  readInitiativeGitState,
  initiativeBranch,
  gitUserName,
  readBranchInitiatives,
} from '../../src/core/initiative-git.js';

/**
 * DEC-024 — git is the third input to the state check. Reading the surrogate
 * must still work where git cannot answer, so this returns undefined rather
 * than guessing.
 */
describe('initiative git state', () => {
  let root: string;
  const run = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-git-'));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  const repo = () => {
    run('init', '-q', '-b', 'main');
    run('config', 'user.email', 'test@example.com');
    run('config', 'user.name', 'Test');
    fs.writeFileSync(path.join(root, 'a.txt'), 'a\n');
    run('add', '.');
    run('commit', '-q', '-m', 'first');
  };

  it('names the branch by convention', () => {
    expect(initiativeBranch('my-thing')).toBe('opsp/my-thing');
  });

  it('is undefined where git cannot answer', () => {
    expect(readInitiativeGitState(root, 'anything')).toBeUndefined();
  });

  it('reports a branch that does not exist', () => {
    repo();
    expect(readInitiativeGitState(root, 'nope')).toEqual({ branchExists: false, merged: false });
  });

  it('reports an unmerged branch', () => {
    repo();
    run('checkout', '-q', '-b', 'opsp/thing');
    fs.writeFileSync(path.join(root, 'b.txt'), 'b\n');
    run('add', '.');
    run('commit', '-q', '-m', 'work');
    run('checkout', '-q', 'main');
    expect(readInitiativeGitState(root, 'thing')).toEqual({ branchExists: true, merged: false });
  });

  it('reports a merged branch', () => {
    repo();
    run('checkout', '-q', '-b', 'opsp/thing');
    fs.writeFileSync(path.join(root, 'b.txt'), 'b\n');
    run('add', '.');
    run('commit', '-q', '-m', 'work');
    run('checkout', '-q', 'main');
    run('merge', '-q', '--no-edit', 'opsp/thing');
    expect(readInitiativeGitState(root, 'thing')).toEqual({ branchExists: true, merged: true });
  });

  it('finds the trunk when it is called master', () => {
    run('init', '-q', '-b', 'master');
    run('config', 'user.email', 'test@example.com');
    run('config', 'user.name', 'Test');
    fs.writeFileSync(path.join(root, 'a.txt'), 'a\n');
    run('add', '.');
    run('commit', '-q', '-m', 'first');
    expect(readInitiativeGitState(root, 'nope')).toEqual({ branchExists: false, merged: false });
  });

  describe('gitUserName', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('reads user.name, which claim names by default', () => {
      repo();
      run('config', 'user.name', 'Nhat Cao');
      expect(gitUserName(root)).toBe('Nhat Cao');
    });

    it('is undefined where git has no name configured', () => {
      vi.stubEnv('GIT_CONFIG_GLOBAL', path.join(root, 'no-global-config'));
      vi.stubEnv('GIT_CONFIG_NOSYSTEM', '1');
      run('init', '-q', '-b', 'main');
      expect(gitUserName(root)).toBeUndefined();
    });
  });

  describe('readBranchInitiatives', () => {
    const initiative = (id: string, extra = '') =>
      `---\nid: ${id}\nstatus: active\nstate: exploring\n${extra}---\n\n## Description\n\nd\n`;
    const dir = () => path.join(root, 'opensprint', 'initiatives');
    const put = (file: string, content: string) => {
      fs.mkdirSync(dir(), { recursive: true });
      fs.writeFileSync(path.join(dir(), file), content);
    };
    /** Commits `files` on a fresh `opsp/<id>` branch off main, then returns to main. */
    const branchWith = (branch: string, files: Record<string, string>) => {
      run('checkout', '-q', '-b', branch, 'main');
      for (const [file, content] of Object.entries(files)) put(file, content);
      run('add', '.');
      run('commit', '-q', '--allow-empty', '-m', `work on ${branch}`);
      run('checkout', '-q', 'main');
    };
    const read = () =>
      readBranchInitiatives(root).map((b) => ({ id: b.entry.id, branch: b.branch, owner: b.entry.owner }));

    it('reads nothing where git cannot answer', () => {
      expect(readBranchInitiatives(root)).toEqual([]);
    });

    it('reads nothing from a repository with no opsp branches', () => {
      repo();
      expect(readBranchInitiatives(root)).toEqual([]);
    });

    it('reads the card a local opsp branch carries, without checking it out', () => {
      repo();
      branchWith('opsp/refunds', { '20261015-refunds.md': initiative('refunds', 'owner: ivan\n') });
      expect(read()).toEqual([{ id: 'refunds', branch: 'opsp/refunds', owner: 'ivan' }]);
      // Still on main, with nothing of the branch in the working tree.
      expect(fs.existsSync(path.join(dir(), '20261015-refunds.md'))).toBe(false);
    });

    it('reads a remote-tracking branch, naming the remote', () => {
      repo();
      branchWith('opsp/ledger', { '20261015-ledger.md': initiative('ledger') });
      run('update-ref', 'refs/remotes/origin/opsp/ledger', 'opsp/ledger');
      run('branch', '-q', '-D', 'opsp/ledger');
      expect(read()).toEqual([{ id: 'ledger', branch: 'origin/opsp/ledger', owner: undefined }]);
    });

    it('takes only the card whose id the branch is named after', () => {
      repo();
      branchWith('opsp/refunds', {
        '20261001-older.md': initiative('older', 'owner: stale-copy\n'),
        '20261015-refunds.md': initiative('refunds'),
      });
      expect(read().map((r) => r.id)).toEqual(['refunds']);
    });

    it('skips a branch carrying no initiative of its own name', () => {
      repo();
      branchWith('opsp/renamed', { '20261015-something-else.md': initiative('something-else') });
      branchWith('opsp/empty', {});
      expect(read()).toEqual([]);
    });

    it('ignores branches outside the opsp/<id> shape', () => {
      repo();
      branchWith('opspx', { '20261015-opspx.md': initiative('opspx') });
      branchWith('opsp/a/b', { '20261015-b.md': initiative('b') });
      run('update-ref', 'refs/remotes/origin/feature', 'main');
      expect(read()).toEqual([]);
    });

    it('lists local branches before remote-tracking ones, in name order', () => {
      repo();
      branchWith('opsp/b', { '20261015-b.md': initiative('b') });
      branchWith('opsp/a', { '20261015-a.md': initiative('a') });
      run('update-ref', 'refs/remotes/upstream/opsp/c', 'opsp/a');
      branchWith('opsp/c', { '20261015-c.md': initiative('c') });
      run('update-ref', 'refs/remotes/origin/opsp/c', 'opsp/c');
      run('update-ref', 'refs/remotes/upstream/opsp/c', 'opsp/c');
      expect(read().map((r) => r.branch)).toEqual([
        'opsp/a',
        'opsp/b',
        'opsp/c',
        'origin/opsp/c',
        'upstream/opsp/c',
      ]);
    });

    it('cuts blobs by bytes, so multi-byte text survives several files in one read', () => {
      repo();
      branchWith('opsp/cafe', {
        '20261001-a.md': initiative('a', 'owner: Zoë Ñúñez — 東京\n'),
        '20261015-cafe.md': initiative('cafe', 'owner: Zoë Ñúñez — 東京\n'),
      });
      expect(read()).toEqual([{ id: 'cafe', branch: 'opsp/cafe', owner: 'Zoë Ñúñez — 東京' }]);
    });

    it('names each card by branch and tree path, which is never a file in this checkout', () => {
      repo();
      branchWith('opsp/refunds', { '20261015-refunds.md': initiative('refunds') });
      const [card] = readBranchInitiatives(root);
      expect(card.entry.path).toBe('opsp/refunds:opensprint/initiatives/20261015-refunds.md');
      expect(card.entry.stem).toBe('20261015-refunds');
    });
  });
});
