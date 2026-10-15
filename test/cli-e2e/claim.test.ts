import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { runCLI } from '../helpers/run-cli.js';

/** `opensprint claim` — the command that names who holds a card. */
describe('opensprint claim (e2e)', () => {
  let root: string;
  const dir = () => path.join(root, 'opensprint', 'initiatives');
  const file = (id: string) => path.join(dir(), `20261015-${id}.md`);
  const board = () => fs.readFileSync(path.join(root, 'opensprint', 'BOARD.md'), 'utf-8');
  // No global or system git config leaks in: the only name git knows is the
  // one a test sets on the repository.
  const env = () => ({
    GIT_CONFIG_GLOBAL: path.join(root, 'no-global-config'),
    GIT_CONFIG_NOSYSTEM: '1',
  });
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, ...env() } });
  const claim = (...args: string[]) => runCLI(['claim', ...args], { cwd: root, env: env() });

  const initiative = (id: string, frontmatter: string) => {
    fs.mkdirSync(dir(), { recursive: true });
    fs.writeFileSync(
      file(id),
      `---\nid: ${id}\nstatus: active\n${frontmatter}---\n\n## Description\n\nd\n\n## Milestones\n\n- [ ] m1: d\n`
    );
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-claim-'));
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
    git('init', '-q', '-b', 'main');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("names git's user.name by default", async () => {
    git('config', 'user.name', 'Nhat Cao');
    initiative('a', 'state: building\n');
    const r = await claim('a');
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('owner: unowned → Nhat Cao');
    expect(fs.readFileSync(file('a'), 'utf-8')).toContain('state: building\nowner: Nhat Cao\n');
  });

  it('names whoever --owner says', async () => {
    initiative('a', 'state: proposed\n');
    const r = await claim('a', '--owner', 'ivan');
    expect(r.exitCode).toBe(0);
    expect(fs.readFileSync(file('a'), 'utf-8')).toContain('owner: ivan\n');
  });

  it('refuses, asking for --owner, where git has no name', async () => {
    initiative('a', 'state: building\n');
    const r = await claim('a');
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain('git has no user.name here. Re-run with --owner <name>.');
    expect(fs.readFileSync(file('a'), 'utf-8')).not.toContain('owner:');
  });

  it('regenerates the board, so the card shows its owner and the problem clears', async () => {
    initiative('a', 'state: building\n');
    await runCLI(['compact', 'board'], { cwd: root, env: env() });
    expect(board()).toContain('`owner-undeclared` **a**');
    await claim('a', '--owner', 'ivan');
    expect(board()).toContain('| [a](initiatives/20261015-a.md) | building | ivan | 0/1 | m1 |');
    expect(board()).not.toContain('owner-undeclared');
  });

  it('reports a reassignment as one', async () => {
    initiative('a', 'state: building\nowner: ivan\n');
    const r = await claim('a', '--owner', 'nhat');
    expect(r.stdout).toContain('owner: ivan → nhat');
    expect(r.stdout).toContain('reassigned from ivan');
  });

  it('puts the card down with --release', async () => {
    initiative('a', 'state: exploring\nowner: ivan\n');
    const r = await claim('a', '--release');
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('owner: ivan → unowned');
    expect(fs.readFileSync(file('a'), 'utf-8')).not.toContain('owner:');
  });

  it('refuses --owner and --release together', async () => {
    initiative('a', 'state: exploring\n');
    const r = await claim('a', '--owner', 'ivan', '--release');
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain('not both');
  });

  it('changes nothing when the owner is already the one named', async () => {
    initiative('a', 'state: building\nowner: ivan\n');
    const before = fs.readFileSync(file('a'), 'utf-8');
    const r = await claim('a', '--owner', 'ivan');
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('already ivan');
    expect(fs.readFileSync(file('a'), 'utf-8')).toBe(before);
  });

  it('moves nothing — the state is advance\'s', async () => {
    initiative('a', 'state: proposed\n');
    const r = await claim('a', '--owner', 'ivan');
    expect(r.exitCode).toBe(0);
    expect(fs.readFileSync(file('a'), 'utf-8')).toContain('state: proposed\nowner: ivan\n');
  });

  for (const state of ['completed', 'declined']) {
    it(`refuses a ${state} initiative — there is no work left to hold`, async () => {
      initiative('a', `state: ${state}\n`);
      const r = await claim('a', '--owner', 'ivan');
      expect(r.exitCode).toBe(1);
      expect(r.stderr + r.stdout).toContain(`is ${state}. There is no work left to hold.`);
    });
  }

  it('--dry-run writes nothing', async () => {
    initiative('a', 'state: building\n');
    const before = fs.readFileSync(file('a'), 'utf-8');
    const r = await claim('a', '--owner', 'ivan', '--dry-run');
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('(dry run)');
    expect(fs.readFileSync(file('a'), 'utf-8')).toBe(before);
    expect(fs.existsSync(path.join(root, 'opensprint', 'BOARD.md'))).toBe(false);
  });

  it('--json carries the change', async () => {
    initiative('a', 'state: building\nowner: ivan\n');
    const r = await claim('a', '--owner', 'nhat', '--json');
    expect(JSON.parse(r.stdout)).toEqual({ initiative: 'a', from: 'ivan', to: 'nhat', changed: true, dryRun: false });
  });

  it('resolves by frontmatter id, not by the dated filename', async () => {
    initiative('a', 'state: building\n');
    const r = await claim('a', '--owner', 'ivan');
    expect(r.exitCode).toBe(0);
    expect(path.basename(file('a'))).toBe('20261015-a.md');
  });

  it('points at the cross-branch board when the initiative is not in this checkout', async () => {
    initiative('a', 'state: building\n');
    const r = await claim('elsewhere', '--owner', 'ivan');
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain("No initiative 'elsewhere' in this checkout.");
    expect(r.stderr + r.stdout).toContain('opensprint compact board --all-branches');
  });

  it('lists the open initiatives and their owners when none is named', async () => {
    initiative('a', 'state: building\nowner: ivan\n');
    initiative('b', 'state: exploring\n');
    initiative('c', 'state: completed\n');
    const r = await claim();
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain('Open: a (ivan), b (unowned).');
  });
});
