import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { runCLI } from '../helpers/run-cli.js';

/**
 * `opensprint frame` — the orientation step DEC-ATTEST-CHANGE-FRAME adds to
 * /opsp:attest. Run against real repositories: the command's whole job is
 * reporting what git says.
 */
describe('opensprint frame (e2e)', () => {
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
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-frame-e2e-'));
    git('init', '--initial-branch=main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    git('config', 'commit.gpgsign', 'false');
    commit('README.md', 'base\n', 'chore: base');
    git('checkout', '-q', '-b', 'opsp/thing');
    commit('src/a.ts', 'export const a = 1;\n', 'feat(a): add a');
    commit(
      'opensprint/initiatives/20261011-thing.md',
      '---\nid: thing\nstatus: active\nstate: building\n---\n\n## Description\n\nd\n',
      'feat: plan thing'
    );
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('reports source, base and the reason for the base', async () => {
    const r = await runCLI(['frame'], { cwd: root });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('opsp/thing');
    expect(r.stdout).toContain('main');
    expect(r.stdout).toMatch(/candidates|default branch/);
  });

  it('names the initiatives in the range', async () => {
    const r = await runCLI(['frame'], { cwd: root });
    expect(r.stdout).toContain('Initiatives touched');
    expect(r.stdout).toContain('thing');
  });

  it('lists commit subjects', async () => {
    const r = await runCLI(['frame'], { cwd: root });
    expect(r.stdout).toContain('feat(a): add a');
    expect(r.stdout).toContain('feat: plan thing');
  });

  it('never prints a patch', async () => {
    const r = await runCLI(['frame'], { cwd: root });
    expect(r.stdout).not.toContain('export const a');
    expect(r.stdout).toMatch(/never a patch/);
  });

  it('--json carries the frame for the renderer', async () => {
    const r = await runCLI(['frame', '--json'], { cwd: root });
    const { frame } = JSON.parse(r.stdout);
    expect(frame.source).toBe('opsp/thing');
    expect(frame.base).toBe('main');
    expect(frame.initiatives).toEqual(['thing']);
    expect(frame.commits).toHaveLength(2);
  });

  it('honours --base', async () => {
    const r = await runCLI(['frame', '--json', '--base', 'main'], { cwd: root });
    expect(JSON.parse(r.stdout).frame.baseFrom).toBe('explicit');
  });

  it('says so rather than inventing a frame when git cannot answer', async () => {
    const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-frame-norepo-'));
    try {
      const r = await runCLI(['frame'], { cwd: bare });
      expect(r.exitCode).toBe(1);
      expect(r.stderr + r.stdout).toMatch(/Could not resolve a change frame/);
    } finally {
      fs.rmSync(bare, { recursive: true, force: true });
    }
  });

  it('reports an empty range rather than failing', async () => {
    git('checkout', '-q', 'main');
    const r = await runCLI(['frame'], { cwd: root });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/nothing to review/i);
  });
});
