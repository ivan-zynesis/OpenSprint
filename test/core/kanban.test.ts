import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  KANBAN_BRANCH,
  KANBAN_README,
  KANBAN_README_TEXT,
  MILESTONE_STAGES,
  cardDrift,
  cardFromInitiative,
  cardPath,
  parseCard,
  planSeed,
  readBoard,
  renderCard,
  resyncCard,
  transact,
  writeBoard,
  type Card,
  type CardSource,
} from '../../src/core/kanban.js';
import { parseInitiative, type InitiativeEntry } from '../../src/core/initiatives.js';
import { kanbanInitCommand, kanbanSeedCommand } from '../../src/commands/kanban.js';

/**
 * DEC-BOARD-ON-REMOTE-BRANCH puts in-flight state on its own remote branch,
 * one file per card, and DEC-CARD-WRITES-THROUGH-CLI makes every write a
 * fast-forward that re-reads and re-applies when it loses a race. These run
 * against a real bare remote, with a second clone as the other writer.
 */

const initiativeText = (id: string, front: string, milestones = '- [ ] m1: first\n') =>
  `---\nid: ${id}\nstatus: active\n${front}---\n\n## Description\n\n**Objective.** Do ${id}\nwell.\n\nMore prose.\n\n## Milestones\n\n${milestones}`;

const entryOf = (id: string, front: string, milestones?: string): InitiativeEntry =>
  parseInitiative(initiativeText(id, front, milestones), `opensprint/initiatives/${id}.md`, id)!;

const stamp = { at: '2026-10-27T01:02:03Z', by: 'Tester' };

describe('the card', () => {
  const full: Card = {
    id: 'kanban',
    title: 'kanban',
    state: 'building',
    owner: 'Ivan Lee',
    created: '2026-10-18',
    updated: '2026-10-27T01:02:03Z',
    branch: 'opsp/kanban',
    summary: '**Objective.** One live board.',
    milestones: [
      { name: 'board-store', description: 'the layout: one file per card', stage: 'building' },
      { name: 'milestone-board', description: 'tickets', stage: 'todo' },
    ],
    history: ['2026-10-18T06:38:46Z  imported at exploring from x.md  by Ivan Lee'],
  };

  it('round-trips byte for byte', () => {
    const text = renderCard(full);
    expect(parseCard(text)).toEqual(full);
    expect(renderCard(parseCard(text)!)).toBe(text);
  });

  it('writes the sections in order: frontmatter, summary, milestones, history', () => {
    const text = renderCard(full);
    expect(text).toMatch(/^---\nid: kanban\ntitle: kanban\nstate: building\nowner: Ivan Lee\n/);
    expect(text.indexOf('One live board')).toBeLessThan(text.indexOf('## Milestones'));
    expect(text.indexOf('## Milestones')).toBeLessThan(text.indexOf('## History'));
    expect(text).toContain('- [building] board-store: the layout: one file per card\n');
  });

  it('reads a card written before milestones were on cards', () => {
    // The proof of concept's format, exactly as origin/kanban holds it.
    const poc =
      '---\nid: board-owners\ntitle: board-owners\nstate: completed\nowner: Ivan Lee\ncreated: 2026-10-18\n' +
      'updated: 2026-10-18T06:38:46Z\nbranch: opsp/board-owners\n---\n\nInitiatives had no owner.\n\n' +
      '## History\n\n- 2026-10-18T06:38:46Z  imported at completed from opensprint/initiatives/20261018-board-owners.md  by Ivan Lee\n';
    const card = parseCard(poc)!;
    expect(card.milestones).toEqual([]);
    expect(card.summary).toBe('Initiatives had no owner.');
    expect(card.history).toHaveLength(1);
    expect(renderCard(card)).toBe(poc);
  });

  it('omits owner when nobody holds the card', () => {
    const { owner: _unused, ...unowned } = full;
    void _unused;
    expect(renderCard(unowned)).not.toMatch(/^owner:/m);
  });

  it('refuses text with no frontmatter or no id', () => {
    expect(parseCard('just prose')).toBeNull();
    expect(parseCard('---\ntitle: x\n---\n')).toBeNull();
  });

  // The five opsx-cycle columns of DEC-MILESTONE-BOARD, plus superseded, shown struck through under done.
  it('names the stages the milestone board has', () => {
    expect(MILESTONE_STAGES).toEqual(['todo', 'specifying', 'building', 'review', 'done', 'superseded']);
  });

  it('reads an unknown stage as todo rather than dropping the milestone', () => {
    const card = parseCard('---\nid: x\nstate: building\n---\n\n## Milestones\n\n- [waiting] m1: first\n\n## History\n\n')!;
    expect(card.milestones).toEqual([{ name: 'm1', description: 'first', stage: 'todo' }]);
  });
});

describe('a card from its initiative', () => {
  it('carries the state, owner, first paragraph and milestones', () => {
    const entry = entryOf('alpha', 'state: building\nowner: nhat\ncreated: 2026-10-01\n', '- [x] m1: one\n- [~] m2: two\n- [ ] m3: three\n');
    const card = cardFromInitiative({ entry, source: 'opensprint/initiatives/alpha.md' }, stamp);
    expect(card).toMatchObject({
      id: 'alpha',
      title: 'alpha',
      state: 'building',
      owner: 'nhat',
      created: '2026-10-01',
      updated: stamp.at,
      branch: 'opsp/alpha',
      summary: '**Objective.** Do alpha well.',
    });
    expect(card.milestones.map((m) => m.stage)).toEqual(['done', 'superseded', 'todo']);
    expect(card.history).toEqual([
      '2026-10-27T01:02:03Z  imported at building from opensprint/initiatives/alpha.md  by Tester',
    ]);
  });

  it('places a stateless initiative by its status, as BOARD.md does', () => {
    expect(cardFromInitiative({ entry: entryOf('old', ''), source: 's' }, stamp).state).toBe('exploring');
    const completed = parseInitiative('---\nid: old\nstatus: completed\n---\n', 'p', 'old')!;
    expect(cardFromInitiative({ entry: completed, source: 's' }, stamp).state).toBe('completed');
  });
});

describe('drift and resync', () => {
  const source = (entry: InitiativeEntry): CardSource => ({ entry, source: 'opensprint/initiatives/x.md' });

  it('reports nothing when the card agrees', () => {
    const entry = entryOf('x', 'state: proposed\n');
    expect(cardDrift(cardFromInitiative(source(entry), stamp), entry)).toEqual([]);
  });

  it('names each field that differs, with values for state and owner', () => {
    const card = cardFromInitiative(source(entryOf('x', 'state: building\nowner: someone\n')), stamp);
    const now = entryOf('x', 'state: proposed\n', '- [x] m1: first\n');
    expect(cardDrift(card, now)).toEqual([
      { field: 'state', card: 'building', initiative: 'proposed' },
      { field: 'owner', card: 'someone', initiative: 'unowned' },
      { field: 'milestones' },
    ]);
  });

  it('rewrites the card and appends one history line naming what changed', () => {
    const card = cardFromInitiative(source(entryOf('x', 'state: building\nowner: someone\n')), stamp);
    const now = entryOf('x', 'state: proposed\n');
    const later = { at: '2026-10-28T00:00:00Z', by: 'Fixer' };
    const fixed = resyncCard(card, source(now), later)!;
    expect(fixed.state).toBe('proposed');
    expect(fixed.owner).toBeUndefined();
    expect(fixed.updated).toBe(later.at);
    expect(fixed.history).toEqual([
      card.history[0],
      '2026-10-28T00:00:00Z  resynced state building → proposed, owner someone → unowned from opensprint/initiatives/x.md  by Fixer',
    ]);
    expect(resyncCard(fixed, source(now), later)).toBeNull();
  });

  it('keeps an in-progress stage on an open milestone, and nothing else', () => {
    const entry = entryOf('x', 'state: building\n', '- [ ] m1: first\n- [ ] m2: second\n');
    const card = cardFromInitiative(source(entry), stamp);
    card.milestones[0].stage = 'review';
    expect(cardDrift(card, entry)).toEqual([]);

    const m1Done = entryOf('x', 'state: building\n', '- [x] m1: first\n- [ ] m2: second\n');
    const fixed = resyncCard(card, source(m1Done), stamp)!;
    expect(fixed.milestones.map((m) => m.stage)).toEqual(['done', 'todo']);
  });
});

describe('the store, against a remote', () => {
  let base: string;
  let remote: string;
  let root: string;
  let other: string;
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const putInitiative = (file: string, content: string) => {
    const dir = path.join(root, 'opensprint', 'initiatives');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  };
  const clone = (dir: string) => {
    git(base, 'clone', '-q', remote, dir);
    git(dir, 'config', 'user.email', 'test@example.com');
    git(dir, 'config', 'user.name', path.basename(dir));
  };
  const remoteBoard = () => {
    try {
      return git(base, '--git-dir', remote, 'rev-parse', `refs/heads/${KANBAN_BRANCH}`);
    } catch {
      return null;
    }
  };
  const sources = (): CardSource[] =>
    ['alpha', 'beta'].map((id) => ({
      entry: parseInitiative(
        fs.readFileSync(path.join(root, 'opensprint', 'initiatives', `2026100${id === 'alpha' ? 1 : 2}-${id}.md`), 'utf-8'),
        id,
        id
      )!,
      source: `opensprint/initiatives/${id}.md`,
    }));
  const quietly = async (fn: () => Promise<void>) => {
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

  beforeEach(() => {
    base = fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-kanban-'));
    remote = path.join(base, 'remote.git');
    git(base, 'init', '-q', '--bare', '--initial-branch=main', remote);
    root = path.join(base, 'work');
    clone(root);
    git(root, 'symbolic-ref', 'HEAD', 'refs/heads/main');
    putInitiative('20261001-alpha.md', initiativeText('alpha', 'state: building\nowner: nhat\n'));
    putInitiative('20261002-beta.md', initiativeText('beta', 'state: exploring\n'));
    git(root, 'add', '.');
    git(root, 'commit', '-q', '-m', 'initiatives');
    git(root, 'push', '-q', 'origin', 'main');
    other = path.join(base, 'other');
    clone(other);
  });
  afterEach(() => fs.rmSync(base, { recursive: true, force: true }));

  it('init creates an orphan branch holding the README and one card per initiative', async () => {
    const head = git(root, 'rev-parse', 'HEAD');
    await quietly(() => kanbanInitCommand());

    const board = remoteBoard()!;
    expect(board).not.toBeNull();
    // An orphan: the first commit has no parent.
    expect(git(root, 'rev-list', '--parents', '-n', '1', board).split(' ')).toHaveLength(1);
    expect(git(root, 'ls-tree', '-r', '--name-only', board).split('\n')).toEqual([
      KANBAN_README,
      cardPath('alpha'),
      cardPath('beta'),
    ]);
    expect(git(root, 'show', `${board}:${KANBAN_README}`)).toBe(KANBAN_README_TEXT.trimEnd());

    const { cards } = readBoard(other, 'origin');
    expect(cards.map((c) => [c.id, c.state, c.owner])).toEqual([
      ['alpha', 'building', 'nhat'],
      ['beta', 'exploring', undefined],
    ]);
    expect(cards[0].history[0]).toMatch(/imported at building from opensprint\/initiatives\/20261001-alpha\.md {2}by work$/);

    // The operator's checkout is never touched.
    expect(git(root, 'rev-parse', 'HEAD')).toBe(head);
    expect(git(root, 'status', '--porcelain')).toBe('');
  });

  it('init on an existing board changes nothing and points at seed', async () => {
    await quietly(() => kanbanInitCommand());
    const first = remoteBoard();
    const out = await quietly(() => kanbanInitCommand());
    expect(remoteBoard()).toBe(first);
    expect(out).toContain('already exists');
    expect(out).toContain('opensprint kanban seed');
  });

  it('seed refuses where there is no board, naming init', async () => {
    await expect(quietly(() => kanbanSeedCommand())).rejects.toThrow(/kanban init/);
    expect(remoteBoard()).toBeNull();
  });

  it('seed adds what is missing, and reports drift without writing it', async () => {
    await quietly(() => kanbanInitCommand());
    putInitiative('20261003-gamma.md', initiativeText('gamma', 'state: exploring\n'));
    putInitiative('20261001-alpha.md', initiativeText('alpha', 'state: proposed\nowner: nhat\n'));

    const out = await quietly(() => kanbanSeedCommand());
    const { cards } = readBoard(root, 'origin');
    expect(cards.map((c) => c.id)).toEqual(['alpha', 'beta', 'gamma']);
    expect(cards.find((c) => c.id === 'alpha')!.state).toBe('building');
    expect(out).toContain('alpha  differs: state building → proposed');
    expect(out).toContain('--resync');
  });

  it('seed --resync rewrites the card that differs, with a history line', async () => {
    await quietly(() => kanbanInitCommand());
    putInitiative('20261001-alpha.md', initiativeText('alpha', 'state: proposed\nowner: nhat\n'));
    await quietly(() => kanbanSeedCommand(undefined, { resync: true }));

    const alpha = readBoard(root, 'origin').cards.find((c) => c.id === 'alpha')!;
    expect(alpha.state).toBe('proposed');
    expect(alpha.history).toHaveLength(2);
    expect(alpha.history[1]).toMatch(/resynced state building → proposed from opensprint\/initiatives\/20261001-alpha\.md {2}by work$/);
  });

  it('seed pushes nothing when every card agrees', async () => {
    await quietly(() => kanbanInitCommand());
    const before = remoteBoard();
    const out = await quietly(() => kanbanSeedCommand(undefined, { resync: true }));
    expect(remoteBoard()).toBe(before);
    expect(out).toContain('nothing to write');
  });

  it('--dry-run reports and pushes nothing', async () => {
    const out = await quietly(() => kanbanInitCommand({ dryRun: true }));
    expect(remoteBoard()).toBeNull();
    expect(out).toContain('would be created with 2 card(s)');
    expect(out).toContain('would be added at building');

    await quietly(() => kanbanInitCommand());
    putInitiative('20261001-alpha.md', initiativeText('alpha', 'state: proposed\nowner: nhat\n'));
    const before = remoteBoard();
    const resync = await quietly(() => kanbanSeedCommand(undefined, { resync: true, dryRun: true }));
    expect(remoteBoard()).toBe(before);
    expect(resync).toContain('alpha  would be resynced: state building → proposed');
  });

  it('--json reports the commit and what was added', async () => {
    const out = await quietly(() => kanbanInitCommand({ json: true }));
    const report = JSON.parse(out);
    expect(report).toMatchObject({ board: 'origin/kanban', wrote: true, existed: false, commit: remoteBoard() });
    expect(report.added).toEqual([
      { id: 'alpha', state: 'building' },
      { id: 'beta', state: 'exploring' },
    ]);
  });

  it('re-reads and re-applies a write that lost a race, keeping the other writer’s change', () => {
    transact(root, 'origin', (board) => planSeed(board, sources(), { mode: 'init', stamp }));
    const start = remoteBoard()!;

    let calls = 0;
    const result = transact(root, 'origin', (board) => {
      calls += 1;
      if (calls === 1) {
        // Another clone lands a card between this read and this push.
        const theirs = readBoard(other, 'origin');
        writeBoard(other, 'origin', theirs.commit, { [cardPath('theirs')]: '---\nid: theirs\nstate: exploring\n---\n\n## History\n\n' }, 'theirs');
      }
      return { write: { changes: { [cardPath('ours')]: '---\nid: ours\nstate: exploring\n---\n\n## History\n\n' }, message: 'ours' }, value: board.commit };
    });

    expect(result.attempts).toBe(2);
    expect(result.wrote).toBe(true);
    // The retry read the board the other writer left.
    expect(result.value).not.toBe(start);
    const ids = readBoard(root, 'origin').cards.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['alpha', 'beta', 'ours', 'theirs']));
    // Only ever fast-forwarded: the first board is an ancestor of the last.
    expect(() => git(root, 'merge-base', '--is-ancestor', start, remoteBoard()!)).not.toThrow();
  });

  it('gives up on a board that keeps moving, writing nothing', () => {
    transact(root, 'origin', (board) => planSeed(board, sources(), { mode: 'init', stamp }));
    let n = 0;
    expect(() =>
      transact(
        root,
        'origin',
        () => {
          n += 1;
          const theirs = readBoard(other, 'origin');
          writeBoard(other, 'origin', theirs.commit, { [cardPath(`theirs-${n}`)]: `---\nid: theirs-${n}\nstate: exploring\n---\n\n## History\n\n` }, `theirs ${n}`);
          return { write: { changes: { [cardPath('ours')]: '---\nid: ours\nstate: exploring\n---\n\n## History\n\n' }, message: 'ours' }, value: null };
        },
        3
      )
    ).toThrow(/Gave up after 3 attempts.*Nothing was written/);
    expect(readBoard(root, 'origin').cards.map((c) => c.id)).not.toContain('ours');
  });

  it('a remote that cannot be asked fails with git’s reason rather than reading as empty', () => {
    expect(() => readBoard(root, 'nowhere')).toThrow(/git ls-remote failed/);
  });
});
