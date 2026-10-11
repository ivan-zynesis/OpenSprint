import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  resolveChangeFrame,
  resolveBase,
  BASE_BRANCH_CANDIDATES,
  BASE_ORIGINS,
} from '../../src/core/change-frame.js';

/**
 * DEC-ATTEST-CHANGE-FRAME — attest resolves source → base before it reads a
 * bar. Exercised against real repositories, because the whole value is in
 * what git actually answers.
 */
describe('change frame', () => {
  let root: string;

  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

  const commit = (file: string, body: string, subject: string) => {
    const abs = path.join(root, file);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
    git('add', '-A');
    git('commit', '-m', subject);
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-frame-'));
    git('init', '--initial-branch=main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    git('config', 'commit.gpgsign', 'false');
    commit('README.md', 'base\n', 'chore: base');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  describe('the vocabulary is explicit', () => {
    it('names the base candidates in preference order', () => {
      expect([...BASE_BRANCH_CANDIDATES]).toEqual(['main', 'master', 'develop', 'trunk']);
    });

    it('names how a base can be arrived at', () => {
      expect([...BASE_ORIGINS]).toEqual(['explicit', 'remote-head', 'candidate']);
    });
  });

  describe('resolveBase', () => {
    it('prefers an explicit base', () => {
      expect(resolveBase(root, 'main')).toEqual({ base: 'main', baseFrom: 'explicit' });
    });

    it('refuses an explicit base that does not exist', () => {
      expect(resolveBase(root, 'no-such-branch')).toBeNull();
    });

    it('falls back to a candidate when there is no remote', () => {
      expect(resolveBase(root)).toEqual({ base: 'main', baseFrom: 'candidate' });
    });

    it('finds develop where a team uses it', () => {
      git('branch', '-m', 'main', 'develop');
      expect(resolveBase(root)).toEqual({ base: 'develop', baseFrom: 'candidate' });
    });

    it('returns null where no candidate exists', () => {
      git('branch', '-m', 'main', 'something-else');
      expect(resolveBase(root)).toBeNull();
    });

    it('returns null outside a repository', () => {
      const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-norepo-'));
      try {
        expect(resolveBase(bare)).toBeNull();
      } finally {
        fs.rmSync(bare, { recursive: true, force: true });
      }
    });
  });

  describe('resolveChangeFrame', () => {
    beforeEach(() => {
      git('checkout', '-q', '-b', 'opsx/thing');
      commit('src/a.ts', 'export const a = 1;\n', 'feat(a): add a');
      commit('src/b.ts', 'export const b = 2;\n', 'feat(b): add b');
    });

    it('reports source, base and how the base was chosen', () => {
      const f = resolveChangeFrame(root)!;
      expect(f.source).toBe('opsx/thing');
      expect(f.base).toBe('main');
      expect(f.baseFrom).toBe('candidate');
    });

    it('reports the commits oldest first, subjects only', () => {
      const f = resolveChangeFrame(root)!;
      expect(f.commits.map((c) => c.subject)).toEqual(['feat(a): add a', 'feat(b): add b']);
    });

    it('never carries a commit message body', () => {
      commit('src/c.ts', 'export const c = 3;\n', 'feat(c): add c');
      git('commit', '--amend', '-m', 'feat(c): add c\n\nA long rationale nobody should read here.');
      const f = resolveChangeFrame(root)!;
      const text = JSON.stringify(f);
      expect(text).toContain('feat(c): add c');
      expect(text).not.toContain('nobody should read');
    });

    it('reports a file-level stat and no patch', () => {
      const f = resolveChangeFrame(root)!;
      expect(f.files.map((x) => x.path).sort()).toEqual([
        path.posix.join('src', 'a.ts'),
        path.posix.join('src', 'b.ts'),
      ]);
      expect(f.files[0].added).toBe(1);
      expect(f.files[0].removed).toBe(0);
      expect(JSON.stringify(f)).not.toContain('export const a');
    });

    it('does not count commits the base made after the fork', () => {
      git('checkout', '-q', 'main');
      commit('other.md', 'unrelated\n', 'chore: moved on');
      git('checkout', '-q', 'opsx/thing');
      const f = resolveChangeFrame(root)!;
      expect(f.commits).toHaveLength(2);
      expect(f.files.map((x) => x.path)).not.toContain('other.md');
    });

    it('honours an explicit base', () => {
      const f = resolveChangeFrame(root, 'main')!;
      expect(f.baseFrom).toBe('explicit');
    });

    it('reports an empty range rather than failing', () => {
      git('checkout', '-q', 'main');
      const f = resolveChangeFrame(root)!;
      expect(f.commits).toEqual([]);
      expect(f.files).toEqual([]);
    });

    it('reports a null source in a detached HEAD', () => {
      git('checkout', '-q', '--detach');
      expect(resolveChangeFrame(root)!.source).toBeNull();
    });

    it('returns undefined where git cannot answer', () => {
      const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-norepo-'));
      try {
        expect(resolveChangeFrame(bare)).toBeUndefined();
      } finally {
        fs.rmSync(bare, { recursive: true, force: true });
      }
    });

    it('returns undefined where no base branch exists', () => {
      expect(resolveChangeFrame(root, 'no-such-branch')).toBeUndefined();
    });
  });

  describe('what the range touches', () => {
    beforeEach(() => {
      git('checkout', '-q', '-b', 'opsp/thing');
    });

    it('names initiatives by frontmatter id, not by filename', () => {
      commit(
        'opensprint/initiatives/20261011-a-thing.md',
        '---\nid: a-thing\nstatus: active\nstate: building\n---\n\n## Description\n\nd\n',
        'feat: plan a-thing'
      );
      expect(resolveChangeFrame(root)!.initiatives).toEqual(['a-thing']);
    });

    it('reports several initiatives, sorted', () => {
      commit('opensprint/initiatives/20261011-b.md', '---\nid: b\nstatus: active\n---\n\nx\n', 'feat: b');
      commit('opensprint/initiatives/20261010-a.md', '---\nid: a\nstatus: active\n---\n\nx\n', 'feat: a');
      expect(resolveChangeFrame(root)!.initiatives).toEqual(['a', 'b']);
    });

    it('skips an initiative deleted in the range', () => {
      commit('opensprint/initiatives/20261011-gone.md', '---\nid: gone\nstatus: active\n---\n\nx\n', 'feat: gone');
      fs.rmSync(path.join(root, 'opensprint', 'initiatives', '20261011-gone.md'));
      git('add', '-A');
      git('commit', '-m', 'chore: drop it');
      expect(resolveChangeFrame(root)!.initiatives).toEqual([]);
    });

    it('names the changes archived in the range', () => {
      commit('openspec/changes/archive/2026-10-11-thing/proposal.md', '## Why\n\nx\n', 'chore: archive thing');
      expect(resolveChangeFrame(root)!.archivedChanges).toEqual(['2026-10-11-thing']);
    });

    it('does not mistake an active change for an archived one', () => {
      commit('openspec/changes/thing/proposal.md', '## Why\n\nx\n', 'feat: propose thing');
      expect(resolveChangeFrame(root)!.archivedChanges).toEqual([]);
    });

    it('is empty where the range touches no records', () => {
      commit('src/a.ts', 'export const a = 1;\n', 'feat: a');
      const f = resolveChangeFrame(root)!;
      expect(f.initiatives).toEqual([]);
      expect(f.archivedChanges).toEqual([]);
    });
  });
});
