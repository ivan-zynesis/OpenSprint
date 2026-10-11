import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { readInitiativeGitState, initiativeBranch } from '../../src/core/initiative-git.js';

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
});
