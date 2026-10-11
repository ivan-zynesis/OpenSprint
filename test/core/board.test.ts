import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { renderBoard, regenerateBoard, roadmapRows, BOARD_FILENAME } from '../../src/core/board.js';
import { readInitiatives, type InitiativeEntry } from '../../src/core/initiatives.js';

/**
 * DEC-026 — the board is compiled, never edited. Moving a card means changing
 * a record's state.
 */
describe('board', () => {
  let root: string;
  const dir = () => path.join(root, 'initiatives');

  beforeEach(() => {
    root = path.join(os.tmpdir(), `opensprint-board-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(dir(), { recursive: true });
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  const entry = (over: Partial<InitiativeEntry>): InitiativeEntry => ({
    id: 'i',
    status: 'active',
    dependsOn: [],
    milestones: [],
    orphanedMilestones: [],
    driverSpecs: [],
    decisions: [],
    path: '/tmp/i.md',
    stem: 'i',
    ...over,
  });
  const ms = (done: number, total: number, superseded = 0) => [
    ...Array.from({ length: total }, (_, k) => ({
      name: `m${k}`,
      description: 'd',
      done: k < done,
      superseded: false,
    })),
    ...Array.from({ length: superseded }, (_, k) => ({
      name: `s${k}`,
      description: 'dropped',
      done: false,
      superseded: true,
    })),
  ];

  describe('the contract', () => {
    it('states it is derived and must not be edited', () => {
      const b = renderBoard([]);
      expect(b).toContain('Derived — do not edit');
      expect(b).toContain("Moving a card means changing a record's state");
    });

    it('renders even with no initiatives', () => {
      expect(renderBoard([])).toContain('No initiatives yet');
    });

    it('is deterministic', () => {
      const list = [entry({ id: 'a', state: 'building', milestones: ms(1, 2) })];
      expect(renderBoard(list)).toBe(renderBoard(list));
    });
  });

  describe('grouping', () => {
    const boardFor = (...entries: InitiativeEntry[]) => renderBoard(entries);
    const sectionOf = (board: string, id: string) => {
      const lines = board.split('\n');
      let section = '';
      for (const line of lines) {
        const h = line.match(/^## (.+)$/);
        if (h) section = h[1];
        if (line.includes(`[${id}]`)) return section;
      }
      return null;
    };

    it('places each state in its section', () => {
      const b = boardFor(
        entry({ id: 'a', state: 'exploring' }),
        entry({ id: 'b', state: 'proposed', driverSpecs: ['DS-X'] }),
        entry({ id: 'c', state: 'building', milestones: ms(0, 1) }),
        entry({ id: 'd', state: 'attested', milestones: ms(1, 1) }),
        entry({ id: 'e', state: 'completed', milestones: ms(1, 1) }),
        entry({ id: 'f', state: 'declined' })
      );
      expect(sectionOf(b, 'a')).toBe('Backlog');
      expect(sectionOf(b, 'b')).toBe('Next');
      expect(sectionOf(b, 'c')).toBe('Doing');
      expect(sectionOf(b, 'd')).toBe('Doing');
      expect(sectionOf(b, 'e')).toBe('Done');
      expect(sectionOf(b, 'f')).toBe('Declined');
    });

    it('places a stateless initiative by its status', () => {
      const b = boardFor(
        entry({ id: 'old', status: 'completed' }),
        entry({ id: 'live', status: 'active' })
      );
      expect(sectionOf(b, 'old')).toBe('Done');
      expect(sectionOf(b, 'live')).toBe('Backlog');
    });

    it('renders every section even when empty', () => {
      const b = renderBoard([entry({ id: 'a', state: 'exploring' })]);
      for (const section of ['Backlog', 'Next', 'Doing', 'Done', 'Declined']) {
        expect(b).toContain(`## ${section}`);
      }
      expect(b).toContain('_Empty._');
    });
  });

  describe('progress', () => {
    it('shows done over total and names the next milestone', () => {
      const b = renderBoard([entry({ id: 'a', state: 'building', milestones: ms(1, 3) })]);
      expect(b).toContain('1/3');
      expect(b).toContain('m1');
    });

    it('excludes superseded milestones from progress and counts them aside', () => {
      const b = renderBoard([entry({ id: 'a', state: 'building', milestones: ms(2, 2, 1) })]);
      expect(b).toContain('2/2');
      expect(b).toContain('+1 superseded');
    });

    it('does not offer a superseded milestone as next', () => {
      const b = renderBoard([entry({ id: 'a', state: 'building', milestones: ms(1, 1, 1) })]);
      expect(b).not.toContain('| s0 |');
    });

    it('shows a dash for an initiative with no milestones', () => {
      expect(renderBoard([entry({ id: 'a', state: 'exploring' })])).toContain('| — |');
    });
  });

  describe('problems', () => {
    it('says none when nothing is wrong', () => {
      expect(renderBoard([entry({ id: 'a', state: 'exploring' })])).toContain('_None._');
    });

    it('carries a state problem', () => {
      const b = renderBoard([entry({ id: 'a', state: 'exploring', milestones: ms(1, 2) })]);
      expect(b).toContain('state-contradicted');
      expect(b).toContain('**a**');
    });

    it('carries an orphaned milestone with its heading', () => {
      const b = renderBoard([
        entry({
          id: 'a',
          state: 'building',
          milestones: ms(0, 1),
          orphanedMilestones: [
            { name: 'later', description: 'd', done: true, superseded: false, section: 'Added at re-exploration' },
          ],
        }),
      ]);
      expect(b).toContain('milestone-outside-section');
      expect(b).toContain('Added at re-exploration');
    });
  });

  describe('roadmap section', () => {
    it('always renders, naming the assurance gradient', () => {
      const b = renderBoard([]);
      expect(b).toContain('## Roadmap');
      expect(b).toContain('DS-FORWARD-CLOSURE');
      expect(b).toContain('a confession');
      expect(b).toContain("initiative's state is the assurance level");
    });
  });

  describe('regenerateBoard', () => {
    it('writes the file', () => {
      fs.writeFileSync(path.join(dir(), 'a.md'), '---\nid: a\nstatus: active\nstate: exploring\n---\n\n## Description\n\nd\n');
      regenerateBoard(root);
      const board = fs.readFileSync(path.join(root, BOARD_FILENAME), 'utf-8');
      expect(board).toContain('[a](initiatives/a.md)');
    });

    it('produces byte-identical output on a second run', () => {
      fs.writeFileSync(path.join(dir(), 'a.md'), '---\nid: a\nstatus: active\nstate: exploring\n---\n\n## Description\n\nd\n');
      regenerateBoard(root);
      const first = fs.readFileSync(path.join(root, BOARD_FILENAME), 'utf-8');
      regenerateBoard(root);
      expect(fs.readFileSync(path.join(root, BOARD_FILENAME), 'utf-8')).toBe(first);
    });

    it('links by filename stem, so a date prefix still resolves', () => {
      fs.writeFileSync(
        path.join(dir(), '20261009-a.md'),
        '---\nid: a\nstatus: active\nstate: exploring\n---\n\n## Description\n\nd\n'
      );
      regenerateBoard(root);
      expect(fs.readFileSync(path.join(root, BOARD_FILENAME), 'utf-8')).toContain('initiatives/20261009-a.md');
    });
  });

  describe('roadmap (DS-FORWARD-CLOSURE)', () => {
    const specDir = () => path.join(root, 'driver-specs');
    const spec = (id: string, exposure: string) => {
      fs.mkdirSync(specDir(), { recursive: true });
      fs.writeFileSync(
        path.join(specDir(), `${id}.md`),
        `---\nid: ${id}\ntype: product\nstatus: active\nhats: [product]\nrole: goal\n---\n\n` +
          `# ${id}\n\n## Measures\n\n- x\n\n### Exposure\n\n${exposure}\n`
      );
    };
    const initiative = (id: string, state: string) =>
      fs.writeFileSync(
        path.join(dir(), `${id}.md`),
        `---\nid: ${id}\nstatus: active\nstate: ${state}\n---\n\n## Description\n\nd\n`
      );

    it('reports an exposure pointing at nothing as a confession', () => {
      spec('DS-A', 'unbounded, nothing planned');
      const rows = roadmapRows(root, []);
      expect(rows).toHaveLength(1);
      expect(rows[0].mitigatedBy).toBeNull();
      expect(renderBoard([], rows)).toContain('a confession');
    });

    it('resolves the mitigating initiative\'s state as the assurance level', () => {
      spec('DS-A', 'unbounded\nmitigated-by: harden-it');
      initiative('harden-it', 'proposed');
      const rows = roadmapRows(root, readInitiatives(root));
      expect(rows[0].mitigationState).toBe('proposed');
      expect(renderBoard(readInitiatives(root), rows)).toContain('committed, with a bar');
    });

    it('shows the gradient across states', () => {
      spec('DS-A', 'x\nmitigated-by: a');
      initiative('a', 'exploring');
      const board = renderBoard(readInitiatives(root), roadmapRows(root, readInitiatives(root)));
      expect(board).toContain('we know, we are thinking');
    });

    it('does not treat a dangling pointer as mitigated', () => {
      spec('DS-A', 'x\nmitigated-by: no-such-initiative');
      const rows = roadmapRows(root, []);
      expect(rows[0].mitigatedBy).toBe('no-such-initiative');
      expect(rows[0].mitigationState).toBeNull();
      expect(renderBoard([], rows)).toContain('points nowhere real');
    });

    it('says so when a declined initiative was the plan', () => {
      spec('DS-A', 'x\nmitigated-by: dropped');
      initiative('dropped', 'declined');
      const board = renderBoard(readInitiatives(root), roadmapRows(root, readInitiatives(root)));
      expect(board).toContain('the exposure stands');
    });

    it('ignores a superseded record', () => {
      fs.mkdirSync(specDir(), { recursive: true });
      fs.writeFileSync(
        path.join(specDir(), 'DS-OLD.md'),
        '---\nid: DS-OLD\ntype: product\nstatus: superseded\nhats: [product]\n---\n\n## Measures\n\n### Exposure\n\nold\n'
      );
      expect(roadmapRows(root, [])).toEqual([]);
    });

    it('says none when no exposure is recorded', () => {
      expect(renderBoard([], [])).toContain('_No exposures recorded._');
    });

    it('links the mitigating initiative by its filename stem, not its id', () => {
      spec('DS-A', 'x\nmitigated-by: harden-it');
      fs.writeFileSync(
        path.join(dir(), '20261009-harden-it.md'),
        '---\nid: harden-it\nstatus: active\nstate: proposed\n---\n\n## Description\n\nd\n'
      );
      const all = readInitiatives(root);
      const rows = roadmapRows(root, all);
      expect(rows[0].mitigationStem).toBe('20261009-harden-it');
      expect(renderBoard(all, rows)).toContain('[harden-it](initiatives/20261009-harden-it.md)');
    });

    it('omits the mitigated-by line from the rendered exposure text', () => {
      spec('DS-A', 'the real risk here.\nmitigated-by: plan');
      const rows = roadmapRows(root, []);
      expect(rows[0].exposure).toBe('the real risk here.');
    });
  });
});