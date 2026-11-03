import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { MILESTONE_STAGES, MILESTONE_STAGE_MOVES, checkStageMove, readBoard, renderCard } from '../../src/core/kanban.js';
import { MILESTONE_COLUMNS, boardConfig, changeRequestMove, renderBoardTemplate } from '../../src/core/kanban-board.js';
import { kanbanInitCommand, kanbanStageCommand } from '../../src/commands/kanban.js';
import { getOpspSkillTemplates, kanbanAgent } from '../../src/core/shared/index.js';
import { fillBoardTemplate, renderBoardPage, type FakeElement } from '../helpers/board-dom.js';

/**
 * DEC-MILESTONE-BOARD: an initiative opens onto its milestones, in five
 * columns that follow the opsx cycle. Forward is apply, back is a change
 * request from Review, and the stage lives on the card, written by the
 * command apply calls as it reaches each step.
 */

describe('the stage table', () => {
  it('declares the opsx cycle forward, and one way back from Review', () => {
    expect(MILESTONE_STAGE_MOVES.map((m) => `${m.from} → ${m.to}`)).toEqual([
      'todo → specifying',
      'specifying → building',
      'building → review',
      'review → done',
      'review → specifying',
    ]);
    expect(changeRequestMove()).toMatchObject({ from: 'review', to: 'specifying' });
  });

  it('refuses every other move, naming the legal ones', () => {
    for (const from of MILESTONE_STAGES) {
      for (const to of MILESTONE_STAGES) {
        const legal = MILESTONE_STAGE_MOVES.some((m) => m.from === from && m.to === to);
        expect(checkStageMove(from, to) === null, `${from} → ${to}`).toBe(legal);
      }
    }
    expect(checkStageMove('todo', 'building')).toContain("From 'todo': specifying");
    expect(checkStageMove('done', 'review')).toContain("Nothing moves from 'done'");
  });

  it('never reaches superseded: that is a repropose, through the file', () => {
    expect(MILESTONE_STAGE_MOVES.some((m) => m.to === 'superseded')).toBe(false);
  });

  it('gives every stage a column, and the page its columns and change request', () => {
    for (const stage of MILESTONE_STAGES) {
      expect(MILESTONE_COLUMNS.filter((c) => c.stages.includes(stage)), stage).toHaveLength(1);
    }
    expect(MILESTONE_COLUMNS.map((c) => c.title)).toEqual(['To do', 'Specifying', 'Building', 'Review', 'Done']);
    expect(boardConfig()).toMatchObject({ milestoneColumns: MILESTONE_COLUMNS, changeRequest: changeRequestMove() });
  });
});

describe('opensprint kanban stage, against a remote', () => {
  let base: string;
  let remote: string;
  let root: string;
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const file = () => path.join(root, 'opensprint', 'initiatives', '20261001-alpha.md');
  const put = (milestones: string) => {
    fs.mkdirSync(path.dirname(file()), { recursive: true });
    fs.writeFileSync(file(), `---\nid: alpha\nstatus: active\nstate: building\n---\n\n## Description\n\nAbout alpha.\n\n## Milestones\n\n${milestones}`);
  };
  const stages = () =>
    readBoard(root, 'origin').cards.find((c) => c.id === 'alpha')!.milestones.map((m) => `${m.name}:${m.stage}`);
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
  const stage = (m: string, s: string) => run(() => kanbanStageCommand('alpha', m, s));

  beforeEach(() => {
    base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-kanban-stage-')));
    remote = path.join(base, 'remote.git');
    git(base, 'init', '-q', '--bare', '--initial-branch=main', remote);
    root = path.join(base, 'work');
    git(base, 'clone', '-q', remote, root);
    git(root, 'config', 'user.email', 'test@example.com');
    git(root, 'config', 'user.name', 'Ivan');
    git(root, 'symbolic-ref', 'HEAD', 'refs/heads/main');
    put('- [ ] m1: first\n- [ ] m2: second\n');
    git(root, 'add', '.');
    git(root, 'commit', '-q', '-m', 'alpha');
    git(root, 'push', '-q', 'origin', 'main');
  });
  afterEach(() => fs.rmSync(base, { recursive: true, force: true }));

  it('walks a milestone through the cycle, one history line per step', async () => {
    await run(() => kanbanInitCommand());
    await stage('m1', 'specifying');
    await stage('m1', 'building');
    const out = await stage('m1', 'review');
    expect(out).toContain('origin/kanban · m1 building → review');
    put('- [x] m1: first\n- [ ] m2: second\n');
    await stage('m1', 'done');
    expect(stages()).toEqual(['m1:done', 'm2:todo']);
    const history = readBoard(root, 'origin').cards.find((c) => c.id === 'alpha')!.history;
    // Imported by init, then one line per write — done included, though the file is what moved it.
    expect(history.slice(1)).toEqual([
      expect.stringMatching(/ {2}milestone m1: todo → specifying {2}by Ivan$/),
      expect.stringMatching(/ {2}milestone m1: specifying → building {2}by Ivan$/),
      expect.stringMatching(/ {2}milestone m1: building → review {2}by Ivan$/),
      expect.stringMatching(/ {2}milestone m1: review → done {2}by Ivan$/),
    ]);
  });

  it('sends a ticket back from Review on a change request', async () => {
    await run(() => kanbanInitCommand());
    await stage('m1', 'specifying');
    await stage('m1', 'building');
    await stage('m1', 'review');
    await stage('m1', 'specifying');
    expect(stages()).toEqual(['m1:specifying', 'm2:todo']);
  });

  it('refuses a milestone out of order, naming the one that comes first', async () => {
    await run(() => kanbanInitCommand());
    await expect(stage('m2', 'specifying')).rejects.toThrow(/'m1' comes first/);
    expect(stages()).toEqual(['m1:todo', 'm2:todo']);
  });

  it('refuses done where the initiative has not checked it off', async () => {
    await run(() => kanbanInitCommand());
    await stage('m1', 'specifying');
    await stage('m1', 'building');
    await stage('m1', 'review');
    await expect(stage('m1', 'done')).rejects.toThrow(/not checked off in the initiative/);
  });

  it('refuses a move the table does not have, and a milestone that does not exist', async () => {
    await run(() => kanbanInitCommand());
    await expect(stage('m1', 'building')).rejects.toThrow(/'todo' does not move to 'building'/);
    await expect(stage('m9', 'specifying')).rejects.toThrow(/no milestone 'm9'.*m1, m2/);
    await expect(stage('m1', 'later')).rejects.toThrow(/'later' is not a stage/);
  });

  it('brings the card’s milestones into line with the file before writing', async () => {
    await run(() => kanbanInitCommand());
    put('- [ ] m1: first\n- [~] m2: second\n- [ ] m3: third\n');
    await stage('m1', 'specifying');
    expect(stages()).toEqual(['m1:specifying', 'm2:superseded', 'm3:todo']);
  });

  it('is a note, not a failure, where origin has no board', async () => {
    const out = await stage('m1', 'specifying');
    expect(out).toContain("origin has no live board — 'opensprint kanban init' creates one");
  });
});

/**
 * DS-LIVE-BOARD's drill-down, at the page: opening an initiative shows its
 * milestones as tickets in the opsx-cycle columns. Runs the page's own
 * script against a DOM stand-in and clicks the card's title.
 */
describe('opening an initiative on the page (DEC-MILESTONE-BOARD)', () => {
  const claude = { value: 'claude', skillsDir: '.claude' };
  const card = renderCard({
    id: 'alpha',
    title: 'alpha',
    state: 'building',
    owner: 'Ivan',
    created: '2026-10-01',
    updated: '2026-10-27T00:00:00Z',
    branch: 'opsp/alpha',
    summary: 'About alpha.',
    milestones: [
      { name: 'm0', description: 'the old plan', stage: 'superseded' },
      { name: 'm1', description: 'first', stage: 'done' },
      { name: 'm2', description: 'second', stage: 'review' },
      { name: 'm3', description: 'third', stage: 'todo' },
    ],
    history: [],
  });
  const page = () => renderBoardPage(fillBoardTemplate(renderBoardTemplate(boardConfig(kanbanAgent(claude, true))), [card]));
  const columns = (overlay: FakeElement) =>
    overlay
      .findAll((e) => e.tagName === 'section')
      .map((s) => [
        s.getAttribute('data-column'),
        s.findAll((e) => e.tagName === 'article').map((t) => t.getAttribute('data-milestone')),
      ]);

  it('opens its milestones in the five columns when the title is clicked', async () => {
    const rendered = page();
    const overlay = rendered.byId('overlay');
    expect(overlay.hidden).toBe(true);

    const [title] = rendered.byId('board').findAll((e) => e.tagName === 'button' && e.has('open'));
    expect(title.textContent).toBe('alpha');
    await title.click();

    expect(overlay.hidden).toBe(false);
    expect(columns(overlay)).toEqual([
      ['todo', ['m3']],
      ['specifying', []],
      ['building', []],
      ['review', ['m2']],
      ['done', ['m0', 'm1']],
    ]);
    expect(MILESTONE_COLUMNS.map((c) => c.key)).toEqual(columns(overlay).map(([key]) => key));
  });

  it('offers continue on the next milestone only, and a change request from Review', async () => {
    const rendered = page();
    await rendered.byId('board').findAll((e) => e.tagName === 'button' && e.has('open'))[0].click();
    const ticket = (name: string) => rendered.byId('overlay').findAll((e) => e.getAttribute('data-milestone') === name)[0];
    const buttons = (name: string) => ticket(name).findAll((e) => e.tagName === 'button').map((b) => b.textContent);

    expect(ticket('m2').has('next')).toBe(true);
    expect(buttons('m2')).toEqual(['← Change request', 'Continue: apply →']);
    expect(buttons('m3')).toEqual([]);
    expect(buttons('m1')).toEqual([]);

    await ticket('m2').findAll((e) => e.tagName === 'button' && e.textContent === 'Continue: apply →')[0].click();
    expect(rendered.copied.at(-1)).toContain("'/opsp:opsp-apply alpha'");
  });

  it('shows no way in for an initiative with no milestones on its card', () => {
    const bare = card.replace(/## Milestones\n\n[\s\S]*?\n\n/, '');
    const rendered = renderBoardPage(fillBoardTemplate(renderBoardTemplate(boardConfig(kanbanAgent(claude, true))), [bare]));
    expect(rendered.byId('board').findAll((e) => e.tagName === 'button' && e.has('open'))).toEqual([]);
  });
});

describe('apply moves its milestone on the board', () => {
  it('names every stage at its step, in the order the cycle runs', () => {
    const apply = getOpspSkillTemplates().find((t) => t.dirName === 'opensprint-apply')!.template.instructions;
    const at = (s: string, from = 0) => apply.indexOf(`opensprint kanban stage <initiative-name> <milestone-name> ${s}`, from);
    const specifying = at('specifying');
    const building = at('building');
    const review = at('review');
    const done = at('done');
    const changeRequest = at('specifying', done);
    expect(apply.lastIndexOf('### Step 2b', specifying)).toBeGreaterThan(-1);
    expect([specifying, building, review, done, changeRequest].every((i) => i > -1)).toBe(true);
    expect(specifying < building && building < review && review < done && done < changeRequest).toBe(true);
    expect(apply.slice(apply.lastIndexOf('###', changeRequest), changeRequest)).toContain('Path A');
  });
});
