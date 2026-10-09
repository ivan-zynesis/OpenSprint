import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  readInitiatives,
  resolveInitiative,
  parseMilestones,
  parseOrphanedMilestones,
  sectionBody,
  INITIATIVE_STATES,
  isTerminalState,
  stateIndex,
  checkInitiativeState,
  type InitiativeEntry,
} from '../../src/core/initiatives.js';

/**
 * DS-PROGRESSIVE-CRYSTALLIZATION — an initiative is a container, not a
 * record. DEC-024 needs it readable by code before it can have a state
 * machine; DEC-036 needs it resolvable by id before filenames can carry a
 * date prefix.
 */
describe('initiatives', () => {
  let root: string;
  const dir = () => path.join(root, 'initiatives');

  beforeEach(() => {
    root = path.join(os.tmpdir(), `opensprint-init-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(dir(), { recursive: true });
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  const write = (file: string, body: string) =>
    fs.writeFileSync(path.join(dir(), file), body);

  const initiative = (
    id: string,
    opts: { state?: string; status?: string; deps?: string[]; body?: string; file?: string } = {}
  ) => {
    const { state, status = 'active', deps, body = '', file = `${id}.md` } = opts;
    write(
      file,
      `---\nid: ${id}\nstatus: ${status}\ncreated: 2026-01-01` +
        (state ? `\nstate: ${state}` : '') +
        (deps ? `\ndepends-on:\n${deps.map((d) => `  - ${d}`).join('\n')}` : '') +
        `\n---\n\n## Description\n\nd\n${body}`
    );
  };

  describe('reading', () => {
    it('returns one entry per file carrying an id', () => {
      initiative('alpha');
      initiative('beta');
      expect(readInitiatives(root).map((i) => i.id)).toEqual(['alpha', 'beta']);
    });

    it('skips a file with no id rather than failing the read', () => {
      initiative('alpha');
      write('notes.md', '# just a note\n');
      expect(readInitiatives(root).map((i) => i.id)).toEqual(['alpha']);
    });

    it('returns an empty list when the directory does not exist', () => {
      expect(readInitiatives(path.join(root, 'nowhere'))).toEqual([]);
    });

    it('carries the frontmatter fields', () => {
      initiative('alpha', { state: 'building', deps: ['beta'] });
      const [i] = readInitiatives(root);
      expect(i.status).toBe('active');
      expect(i.state).toBe('building');
      expect(i.created).toBe('2026-01-01');
      expect(i.dependsOn).toEqual(['beta']);
    });

    it('leaves an absent field undefined rather than guessing', () => {
      initiative('alpha');
      const [i] = readInitiatives(root);
      expect(i.state).toBeUndefined();
      expect(i.completed).toBeUndefined();
      expect(i.dependsOn).toEqual([]);
    });

    it('parses an initiative written by an older release, with no state', () => {
      write('old.md', '---\nid: old\nstatus: completed\ncreated: 2026-05-22\ncompleted: 2026-05-22\n---\n\n## Description\n\nd\n');
      const [i] = readInitiatives(root);
      expect(i.state).toBeUndefined();
      expect(i.status).toBe('completed');
      expect(i.completed).toBe('2026-05-22');
    });

    it('defaults status to active when absent', () => {
      write('a.md', '---\nid: a\n---\n\n## Description\n\nd\n');
      expect(readInitiatives(root)[0].status).toBe('active');
    });
  });

  describe('sectionBody', () => {
    it('ends at the next second-level heading', () => {
      const body = sectionBody('## A\n\nmine\n\n## B\n\ntheirs', 'A');
      expect(body).toContain('mine');
      expect(body).not.toContain('theirs');
    });

    it('returns null for an absent section', () => {
      expect(sectionBody('## A\n\nx', 'Milestones')).toBeNull();
    });
  });

  describe('milestones', () => {
    const withMilestones = (lines: string) => `## Milestones\n\n${lines}\n`;

    it('reads name, description and completion', () => {
      const m = parseMilestones(withMilestones('- [ ] alpha: do the thing\n- [x] beta: done already'));
      expect(m).toEqual([
        { name: 'alpha', description: 'do the thing', done: false },
        { name: 'beta', description: 'done already', done: true },
      ]);
    });

    it('accepts an uppercase completion marker', () => {
      expect(parseMilestones(withMilestones('- [X] a: x'))[0].done).toBe(true);
    });

    it('keeps a milestone with no colon rather than dropping it', () => {
      const [m] = parseMilestones(withMilestones('- [ ] no colon here'));
      expect(m.name).toBe('');
      expect(m.description).toBe('no colon here');
    });

    it('does not read a checkbox outside the section', () => {
      expect(parseMilestones('## Description\n\n- [ ] a: not a milestone\n')).toEqual([]);
    });

    it('returns an empty list when there is no section', () => {
      expect(parseMilestones('## Description\n\nd')).toEqual([]);
    });

    it('reports a checkbox outside the section as orphaned, with its heading', () => {
      const content = '## Milestones\n\n- [x] a: real\n\n## Added at re-exploration\n\n- [x] b: added later\n';
      expect(parseMilestones(content).map((m) => m.name)).toEqual(['a']);
      const orphans = parseOrphanedMilestones(content);
      expect(orphans).toHaveLength(1);
      expect(orphans[0].name).toBe('b');
      expect(orphans[0].section).toBe('Added at re-exploration');
    });
  });

  describe('membership', () => {
    it('reads bare ids', () => {
      initiative('a', { body: '\n## Driver Specs\n\n- DS-ONE\n- DS-TWO\n' });
      expect(readInitiatives(root)[0].driverSpecs).toEqual(['DS-ONE', 'DS-TWO']);
    });

    it('discards the summary suffix the newer initiatives carry', () => {
      initiative('a', { body: '\n## ADRs\n\n- DEC-018 — the six are the shipped section list\n- DEC-019\n' });
      expect(readInitiatives(root)[0].decisions).toEqual(['DEC-018', 'DEC-019']);
    });

    it('does not read list items outside those sections', () => {
      initiative('a', { body: '\n## Open Questions\n\n- DS-NOPE is not membership\n' });
      const [i] = readInitiatives(root);
      expect(i.driverSpecs).toEqual([]);
      expect(i.decisions).toEqual([]);
    });

    it('does not mistake a milestone checkbox for membership', () => {
      initiative('a', { body: '\n## ADRs\n\n- [ ] not-an-adr: x\n- DEC-001\n' });
      expect(readInitiatives(root)[0].decisions).toEqual(['DEC-001']);
    });
  });

  describe('resolution', () => {
    it('resolves by frontmatter id over a date-prefixed filename', () => {
      initiative('lifecycle-beyond-build', { file: '20261009-lifecycle-beyond-build.md' });
      const found = resolveInitiative(root, 'lifecycle-beyond-build');
      expect(found?.id).toBe('lifecycle-beyond-build');
      expect(found?.stem).toBe('20261009-lifecycle-beyond-build');
    });

    it('falls back to the filename stem', () => {
      write('legacy-name.md', '---\nid: different-id\n---\n\n## Description\n\nd\n');
      expect(resolveInitiative(root, 'legacy-name')?.id).toBe('different-id');
    });

    it('returns null rather than guessing', () => {
      initiative('alpha');
      expect(resolveInitiative(root, 'nothing-like-this')).toBeNull();
    });

    it('returns the first of a duplicated id and warns', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      initiative('dup', { file: 'a-dup.md' });
      initiative('dup', { file: 'b-dup.md' });
      expect(resolveInitiative(root, 'dup')?.stem).toBe('a-dup');
      expect(warn.mock.calls.flat().join(' ')).toContain('dup');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // State (DEC-024) — declared by the tool, checked by code
  // ═══════════════════════════════════════════════════════════

  describe('state vocabulary', () => {
    it('is an explicit ordered list', () => {
      expect([...INITIATIVE_STATES]).toEqual([
        'exploring',
        'proposed',
        'building',
        'attested',
        'completed',
        'declined',
      ]);
    });

    it('marks completed and declined terminal', () => {
      expect(isTerminalState('completed')).toBe(true);
      expect(isTerminalState('declined')).toBe(true);
      expect(isTerminalState('building')).toBe(false);
    });

    it('orders the lifecycle but not declined', () => {
      expect(stateIndex('exploring')).toBeLessThan(stateIndex('proposed'));
      expect(stateIndex('proposed')).toBeLessThan(stateIndex('building'));
      expect(stateIndex('declined')).toBe(-1);
      expect(stateIndex('nonsense')).toBe(-1);
    });
  });

  describe('checkInitiativeState', () => {
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
    const ms = (done: number, total: number) =>
      Array.from({ length: total }, (_, k) => ({
        name: `m${k}`,
        description: 'd',
        done: k < done,
      }));
    const kinds = (e: InitiativeEntry) => checkInitiativeState(e).map((p) => p.kind);

    it('reports a state outside the vocabulary, naming the accepted values', () => {
      const [p] = checkInitiativeState(entry({ state: 'halfway' }));
      expect(p.kind).toBe('state-unknown');
      expect(p.detail).toContain('exploring');
    });

    it('reports exploring with work already done', () => {
      expect(kinds(entry({ state: 'exploring', milestones: ms(1, 3) }))).toEqual(['state-contradicted']);
    });

    it('allows exploring with nothing done', () => {
      expect(kinds(entry({ state: 'exploring', milestones: ms(0, 3) }))).toEqual([]);
    });

    it('reports completed with work outstanding', () => {
      expect(kinds(entry({ state: 'completed', milestones: ms(2, 3) }))).toEqual(['state-contradicted']);
    });

    it('reports attested with work outstanding', () => {
      expect(kinds(entry({ state: 'attested', milestones: ms(2, 3) }))).toEqual(['state-contradicted']);
    });

    it('does not distinguish attested from completed when all milestones are done', () => {
      expect(kinds(entry({ state: 'attested', milestones: ms(3, 3) }))).toEqual([]);
      expect(kinds(entry({ state: 'completed', milestones: ms(3, 3) }))).toEqual([]);
    });

    it('reports proposed with nothing proposed', () => {
      expect(kinds(entry({ state: 'proposed' }))).toEqual(['state-contradicted']);
    });

    it('allows proposed when it claims driver-specs only', () => {
      expect(kinds(entry({ state: 'proposed', driverSpecs: ['DS-A'] }))).toEqual([]);
    });

    it('reports building with no milestones', () => {
      expect(kinds(entry({ state: 'building', decisions: ['DEC-1'] }))).toEqual(['state-contradicted']);
    });

    it('allows building part-way through', () => {
      expect(kinds(entry({ state: 'building', milestones: ms(1, 3) }))).toEqual([]);
    });

    it('never contradicts declined, whatever the content says', () => {
      expect(kinds(entry({ state: 'declined', milestones: ms(2, 3) }))).toEqual([]);
      expect(kinds(entry({ state: 'declined' }))).toEqual([]);
    });

    it('reports an active initiative declaring no state', () => {
      expect(kinds(entry({}))).toEqual(['state-undeclared']);
    });

    it('stays silent about a completed initiative declaring no state', () => {
      expect(kinds(entry({ status: 'completed' }))).toEqual([]);
    });

    it('reads state from a real file', () => {
      write('a.md', '---\nid: a\nstatus: active\nstate: exploring\n---\n\n## Milestones\n\n- [x] m: done\n');
      const [i] = readInitiatives(root);
      expect(checkInitiativeState(i).map((p) => p.kind)).toEqual(['state-contradicted']);
    });
  });
});