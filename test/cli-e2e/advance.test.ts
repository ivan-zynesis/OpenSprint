import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { runCLI } from '../helpers/run-cli.js';

/** `opensprint advance` — the command that makes a transition a side effect. */
describe('opensprint advance (e2e)', () => {
  let root: string;
  const dir = () => path.join(root, 'opensprint', 'initiatives');

  const initiative = (id: string, frontmatter: string, milestones: string[] = ['- [x] m1: d']) => {
    fs.mkdirSync(dir(), { recursive: true });
    fs.writeFileSync(
      path.join(dir(), `20261011-${id}.md`),
      `---\nid: ${id}\nstatus: active\n${frontmatter}---\n\n## Description\n\nd\n\n## Milestones\n\n${milestones.join('\n')}\n`
    );
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-advance-'));
    fs.mkdirSync(path.join(root, 'openspec'), { recursive: true });
    fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('refuses a handoff until the hat is named', async () => {
    initiative('a', 'state: proposed\n', ['- [ ] m1: d']);
    const r = await runCLI(['advance', 'a', '--to', 'building'], { cwd: root });
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain('is a handoff');
    expect(r.stderr + r.stdout).toContain('--hat <dev|devops>');
  });

  it('refuses a handoff made in the wrong hat', async () => {
    initiative('a', 'state: proposed\n', ['- [ ] m1: d']);
    const r = await runCLI(['advance', 'a', '--to', 'building', '--hat', 'product'], { cwd: root });
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain("not product's");
  });

  it('performs a handoff when the hat is named', async () => {
    initiative('a', 'state: proposed\n', ['- [ ] m1: d']);
    const r = await runCLI(['advance', 'a', '--to', 'building', '--hat', 'dev'], { cwd: root });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('hat change');
  });

  it('does not require a hat where the move is not a handoff', async () => {
    initiative('a', 'state: ready-for-attestation\n');
    const r = await runCLI(['advance', 'a', '--to', 'attested'], { cwd: root });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('product · maintainer work');
    expect(r.stdout).not.toContain('hat change');
  });

  it('--json carries the hat and whether it is a handoff', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance', 'a', '--to', 'ready-for-attestation', '--hat', 'dev', '--json'], {
      cwd: root,
    });
    const out = JSON.parse(r.stdout);
    expect(out.hat).toEqual(['dev', 'devops']);
    expect(out.handoff).toBe(true);
  });

  it('performs a legal move and says what it did', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance', 'a', '--to', 'ready-for-attestation', '--hat', 'dev'], { cwd: root });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('building → ready-for-attestation');
    expect(fs.readFileSync(path.join(dir(), '20261011-a.md'), 'utf-8')).toContain(
      'state: ready-for-attestation'
    );
  });

  it('regenerates the board, so the card actually moves', async () => {
    initiative('a', 'state: building\n');
    await runCLI(['advance', 'a', '--to', 'ready-for-attestation', '--hat', 'dev'], { cwd: root });
    const board = fs.readFileSync(path.join(root, 'opensprint', 'BOARD.md'), 'utf-8');
    expect(board).toContain('## Handoff');
    expect(board.slice(board.indexOf('## Handoff'), board.indexOf('## Done'))).toContain('a');
  });

  it('refuses an illegal move and names the legal ones', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance', 'a', '--to', 'completed'], { cwd: root });
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain("does not move to 'completed'");
    expect(r.stderr + r.stdout).toContain('ready-for-attestation');
  });

  it('refuses skipping the handoff', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance', 'a', '--to', 'attested'], { cwd: root });
    expect(r.exitCode).toBe(1);
  });

  it('resolves by frontmatter id, not by the dated filename', async () => {
    initiative('a', 'state: proposed\n');
    const r = await runCLI(['advance', 'a', '--to', 'building', '--hat', 'dev'], { cwd: root });
    expect(r.exitCode).toBe(0);
  });

  it('repairs an initiative written without the field — the propose bug', async () => {
    initiative('a', '');
    const r = await runCLI(['advance', 'a', '--to', 'proposed'], { cwd: root });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('(no state) → proposed');
    expect(fs.readFileSync(path.join(dir(), '20261011-a.md'), 'utf-8')).toContain('state: proposed');
  });

  it('records a contradicted state and reports it rather than refusing', async () => {
    initiative('a', 'state: proposed\n', ['- [ ] m1: d', '- [ ] m2: d']);
    const r = await runCLI(['advance', 'a', '--to', 'building', '--hat', 'dev'], { cwd: root });
    expect(r.exitCode).toBe(0);
    const r2 = await runCLI(['advance', 'a', '--to', 'ready-for-attestation', '--hat', 'devops'], { cwd: root });
    expect(r2.exitCode).toBe(0);
    expect(r2.stdout).toContain('disagrees with');
    expect(r2.stdout).toContain('outstanding');
  });

  it('--dry-run writes nothing', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance', 'a', '--to', 'ready-for-attestation', '--hat', 'dev', '--dry-run'], { cwd: root });
    expect(r.stdout).toContain('dry run');
    expect(fs.readFileSync(path.join(dir(), '20261011-a.md'), 'utf-8')).toContain('state: building');
  });

  it('--json carries the move and the problems', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance', 'a', '--to', 'ready-for-attestation', '--hat', 'dev', '--json'], { cwd: root });
    const out = JSON.parse(r.stdout);
    expect(out).toMatchObject({ initiative: 'a', from: 'building', to: 'ready-for-attestation' });
  });

  it('lists the open initiatives when none is named', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance'], { cwd: root });
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain('a (building)');
  });

  it('names where it could go when --to is missing', async () => {
    initiative('a', 'state: building\n');
    const r = await runCLI(['advance', 'a'], { cwd: root });
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain('ready-for-attestation');
    expect(r.stderr + r.stdout).toContain('/opsp:apply');
  });

  it('says so when the initiative does not exist', async () => {
    const r = await runCLI(['advance', 'nope', '--to', 'building'], { cwd: root });
    expect(r.exitCode).toBe(1);
    expect(r.stderr + r.stdout).toContain("No initiative 'nope'");
  });
});
