import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { readBoard, writeBoard, cardPath, renderCard, parseCard } from '../../src/core/kanban.js';
import { parseInitiative } from '../../src/core/initiatives.js';
import { claimCard, ClaimRefusedError } from '../../src/core/kanban-sync.js';
import { advanceCommand } from '../../src/commands/advance.js';
import { claimCommand } from '../../src/commands/claim.js';
import { kanbanInitCommand, kanbanSeedCommand } from '../../src/commands/kanban.js';
import { getOpspSkillTemplates } from '../../src/core/shared/index.js';

/**
 * DEC-CARD-WRITES-THROUGH-CLI: a workflow moves its initiative's card through
 * the opensprint command that moves the initiative, validated against the
 * same table, pushed as a fast-forward; and `claim` refuses a card someone
 * else holds unless told to take it over. Against a real bare remote, with a
 * second clone as the other person.
 */
describe('workflows move the card', () => {
  let base: string;
  let remote: string;
  let root: string;
  let other: string;
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const file = (id: string) => path.join(root, 'opensprint', 'initiatives', `20261001-${id}.md`);
  const put = (id: string, front: string) => {
    fs.mkdirSync(path.dirname(file(id)), { recursive: true });
    fs.writeFileSync(file(id), `---\nid: ${id}\nstatus: active\n${front}---\n\n## Description\n\nAbout ${id}.\n\n## Milestones\n\n- [ ] m1: first\n`);
  };
  const card = (id: string) => readBoard(root, 'origin').cards.find((c) => c.id === id);
  const remoteBoard = () => {
    try {
      return git(base, '--git-dir', remote, 'rev-parse', 'refs/heads/kanban');
    } catch {
      return null;
    }
  };
  const run = async (fn: () => Promise<void>) => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const cwd = process.cwd();
    process.chdir(root);
    try {
      await fn();
      return log.mock.calls.map((c) => c.join(' ')).join('\n');
    } finally {
      process.chdir(cwd);
      log.mockRestore();
    }
  };
  const clone = (dir: string, name: string) => {
    git(base, 'clone', '-q', remote, dir);
    git(dir, 'config', 'user.email', 'test@example.com');
    git(dir, 'config', 'user.name', name);
  };

  beforeEach(() => {
    base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-kanban-sync-')));
    remote = path.join(base, 'remote.git');
    git(base, 'init', '-q', '--bare', '--initial-branch=main', remote);
    root = path.join(base, 'work');
    clone(root, 'Ivan');
    git(root, 'symbolic-ref', 'HEAD', 'refs/heads/main');
    put('alpha', 'state: proposed\n');
    put('beta', 'state: exploring\n');
    git(root, 'add', '.');
    git(root, 'commit', '-q', '-m', 'initiatives');
    git(root, 'push', '-q', 'origin', 'main');
    other = path.join(base, 'other');
    clone(other, 'Nhat');
  });
  afterEach(() => fs.rmSync(base, { recursive: true, force: true }));

  describe('advance', () => {
    it('moves the card, with a history line naming the move, the person and the workflow', async () => {
      await run(() => kanbanInitCommand());
      const out = await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev' }));
      expect(fs.readFileSync(file('alpha'), 'utf-8')).toContain('state: building');
      const alpha = card('alpha')!;
      expect(alpha.state).toBe('building');
      expect(alpha.history.at(-1)).toMatch(/ {2}proposed → building {2}by Ivan — \/opsp:apply · dev$/);
      expect(out).toContain('origin/kanban · card proposed → building');
    });

    it('creates a card the board lacks, at the state it is leaving, then moves it', async () => {
      await run(() => kanbanInitCommand());
      put('gamma', 'state: exploring\n');
      await run(() => advanceCommand('gamma', { to: 'proposed' }));
      const gamma = card('gamma')!;
      expect(gamma.state).toBe('proposed');
      expect(gamma.history[0]).toMatch(/imported at exploring from opensprint\/initiatives\/20261001-gamma\.md/);
      expect(gamma.history[1]).toMatch(/exploring → proposed/);
    });

    it('leaves a card that drifted, reports it, and still moves the initiative', async () => {
      await run(() => kanbanInitCommand());
      const board = readBoard(root, 'origin');
      const drifted = { ...board.cards.find((c) => c.id === 'alpha')!, state: 'completed' };
      writeBoard(root, 'origin', board.commit, { [cardPath('alpha')]: renderCard(drifted) }, 'drift');

      const out = await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev' }));
      expect(fs.readFileSync(file('alpha'), 'utf-8')).toContain('state: building');
      expect(card('alpha')!.state).toBe('completed');
      expect(out).toContain('completed → building is not a move');
      expect(out).toContain('opensprint kanban seed --resync');
    });

    it('notes that init creates a board where origin has none, and moves the initiative', async () => {
      const out = await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev' }));
      expect(fs.readFileSync(file('alpha'), 'utf-8')).toContain('state: building');
      expect(out).toContain("origin has no live board — 'opensprint kanban init' creates one");
      expect(remoteBoard()).toBeNull();
    });

    it('says nothing about a board where there is no origin', async () => {
      git(root, 'remote', 'remove', 'origin');
      const out = await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev' }));
      expect(fs.readFileSync(file('alpha'), 'utf-8')).toContain('state: building');
      expect(out).not.toMatch(/kanban|live board/);
    });

    it('warns when the board cannot be reached, and moves the initiative', async () => {
      git(root, 'remote', 'set-url', 'origin', path.join(base, 'gone.git'));
      const out = await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev' }));
      expect(fs.readFileSync(file('alpha'), 'utf-8')).toContain('state: building');
      expect(out).toContain('the card was not updated');
    });

    it('asks nothing of the remote with --no-board', async () => {
      await run(() => kanbanInitCommand());
      const before = remoteBoard();
      git(root, 'remote', 'set-url', 'origin', path.join(base, 'gone.git'));
      const out = await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev', board: false }));
      expect(out).not.toMatch(/kanban|live board/);
      expect(remoteBoard()).toBe(before);
    });

    // Repropose redraws milestones by hand and then advances: the move carries the new plan onto the card.
    it('carries milestones edited in the file onto the card with the move (DEC-MILESTONE-BOARD)', async () => {
      await run(() => kanbanInitCommand());
      await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev' }));
      const text = fs.readFileSync(file('alpha'), 'utf-8').replace(
        '- [ ] m1: first\n',
        '- [~] m1: first (superseded by m2)\n- [ ] m2: second\n'
      );
      fs.writeFileSync(file('alpha'), text);

      await run(() => advanceCommand('alpha', { to: 'proposed', hat: 'product' }));
      const alpha = card('alpha')!;
      expect(alpha.state).toBe('proposed');
      expect(alpha.milestones.map((m) => `${m.name}:${m.stage}`)).toEqual(['m1:superseded', 'm2:todo']);
    });

    it('writes only the milestones where the card already shows the state', async () => {
      await run(() => kanbanInitCommand());
      const board = readBoard(root, 'origin');
      const ahead = { ...board.cards.find((c) => c.id === 'alpha')!, state: 'building' };
      writeBoard(root, 'origin', board.commit, { [cardPath('alpha')]: renderCard(ahead) }, 'ahead');
      fs.writeFileSync(file('alpha'), fs.readFileSync(file('alpha'), 'utf-8') + '- [ ] m2: second\n');

      await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev' }));
      const alpha = card('alpha')!;
      expect(alpha.milestones.map((m) => m.name)).toEqual(['m1', 'm2']);
      expect(alpha.history.at(-1)).toMatch(/ {2}milestones follow the initiative {2}by Ivan$/);
    });

    it('reports the card in --json', async () => {
      await run(() => kanbanInitCommand());
      const out = await run(() => advanceCommand('alpha', { to: 'building', hat: 'dev', json: true }));
      expect(JSON.parse(out).board).toMatchObject({ outcome: 'written', detail: 'card proposed → building' });
    });
  });

  describe('claim', () => {
    it('claims the card and the initiative', async () => {
      await run(() => kanbanInitCommand());
      await run(() => claimCommand('beta'));
      expect(card('beta')!.owner).toBe('Ivan');
      expect(fs.readFileSync(file('beta'), 'utf-8')).toContain('owner: Ivan');
      expect(card('beta')!.history.at(-1)).toMatch(/owner unowned → Ivan {2}by Ivan$/);
    });

    it('refuses a card someone else holds, and writes neither the card nor the file', async () => {
      await run(() => kanbanInitCommand());
      // Nhat claims it from the other clone, which has no copy of the file to write.
      const entry = parseInitiative(fs.readFileSync(file('beta'), 'utf-8'), file('beta'), '20261001-beta')!;
      claimCard(other, entry, 'Nhat', { by: 'Nhat' });

      await expect(run(() => claimCommand('beta'))).rejects.toThrow(/held by Nhat.*--take-over/);
      expect(card('beta')!.owner).toBe('Nhat');
      expect(fs.readFileSync(file('beta'), 'utf-8')).not.toContain('owner:');
    });

    it('takes it over with --take-over, saying from whom', async () => {
      await run(() => kanbanInitCommand());
      const entry = parseInitiative(fs.readFileSync(file('beta'), 'utf-8'), file('beta'), '20261001-beta')!;
      claimCard(other, entry, 'Nhat', { by: 'Nhat' });

      await run(() => claimCommand('beta', { takeOver: true }));
      expect(card('beta')!.owner).toBe('Ivan');
      expect(card('beta')!.history.at(-1)).toMatch(/owner Nhat → Ivan {2}by Ivan — taken over from Nhat$/);
      expect(fs.readFileSync(file('beta'), 'utf-8')).toContain('owner: Ivan');
    });

    it('puts the card down with --release', async () => {
      await run(() => kanbanInitCommand());
      await run(() => claimCommand('beta'));
      await run(() => claimCommand('beta', { release: true }));
      expect(card('beta')!.owner).toBeUndefined();
      expect(fs.readFileSync(file('beta'), 'utf-8')).not.toContain('owner:');
    });

    it.skipIf(process.platform === 'win32')(
      'lets one of two simultaneous claims win, and refuses the other rather than overwriting it',
      async () => {
        await run(() => kanbanInitCommand());
        const entry = parseInitiative(fs.readFileSync(file('beta'), 'utf-8'), file('beta'), '20261001-beta')!;

        // Nhat's claim, built on the same board Ivan is about to read, waiting in a side remote.
        const side = path.join(base, 'side.git');
        git(base, 'clone', '-q', '--bare', remote, side);
        const nhat = path.join(base, 'nhat');
        clone(nhat, 'Nhat');
        git(nhat, 'remote', 'set-url', 'origin', side);
        claimCard(nhat, entry, 'Nhat', { by: 'Nhat' });

        // Nhat's push lands between Ivan's read and Ivan's push: a real lost race.
        const marker = path.join(base, 'raced');
        const hook = path.join(root, '.git', 'hooks', 'pre-push');
        fs.writeFileSync(
          hook,
          `#!/bin/sh\n[ -f '${marker}' ] && exit 0\ntouch '${marker}'\n` +
            `git --git-dir='${side}' push -q '${remote}' refs/heads/kanban:refs/heads/kanban\n`
        );
        fs.chmodSync(hook, 0o755);

        // Ivan read beta unheld; his push is rejected, his retry reads Nhat's name and refuses.
        expect(() => claimCard(root, entry, 'Ivan', { by: 'Ivan' })).toThrow(ClaimRefusedError);
        expect(fs.existsSync(marker)).toBe(true);
        expect(card('beta')!.owner).toBe('Nhat');
      }
    );
  });

  describe('seed for one initiative', () => {
    it('adds that one card and nothing else', async () => {
      await run(() => kanbanInitCommand());
      put('gamma', 'state: exploring\n');
      put('delta', 'state: exploring\n');
      await run(() => kanbanSeedCommand('gamma'));
      const ids = readBoard(root, 'origin').cards.map((c) => c.id);
      expect(ids).toContain('gamma');
      expect(ids).not.toContain('delta');
    });

    it('is a note, not an error, where there is no board', async () => {
      const out = await run(() => kanbanSeedCommand('beta'));
      expect(out).toContain("origin has no live board, so there is no card to add. 'opensprint kanban init' creates one.");
      expect(remoteBoard()).toBeNull();
    });

    it('refuses an initiative nobody has', async () => {
      await run(() => kanbanInitCommand());
      await expect(run(() => kanbanSeedCommand('nope'))).rejects.toThrow(/No initiative 'nope'/);
    });
  });
});

describe('every workflow moves state through a command (DEC-STATE-MACHINE)', () => {
  const instructions = () => getOpspSkillTemplates().map((t) => [t.dirName, t.template.instructions] as const);

  it('no workflow tells the agent to write a state into a file to move it', () => {
    for (const [name, text] of instructions()) {
      // A code block holding nothing but a state line is an instruction to edit the field.
      expect(text, name).not.toMatch(/```(?:markdown|yaml)?\n\s*state: [a-z-]+\s*\n```/);
    }
  });

  it('triage declines and revives through advance; backlog seeds its card', () => {
    const triage = instructions().find(([n]) => n === 'opensprint-triage')![1];
    expect(triage).toContain('opensprint advance <initiative-name> --to declined');
    expect(triage).toContain('opensprint advance <initiative-name> --to exploring');
    const backlog = instructions().find(([n]) => n === 'opensprint-backlog')![1];
    expect(backlog).toContain('opensprint kanban seed <initiative-name>');
  });
});

describe('parseCard', () => {
  it('still round-trips a card written by a workflow', () => {
    const text = '---\nid: x\ntitle: x\nstate: building\nowner: Ivan\ncreated: 2026-10-01\nupdated: 2026-10-27T00:00:00Z\nbranch: opsp/x\n---\n\n## History\n\n- 2026-10-27T00:00:00Z  proposed → building  by Ivan — /opsp:apply · dev\n';
    expect(renderCard(parseCard(text)!)).toBe(text);
  });
});
