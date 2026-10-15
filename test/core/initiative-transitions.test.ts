import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  TRANSITIONS,
  READY_FOR_ATTESTATION,
  checkTransition,
  nextStates,
  writeState,
  writeOwner,
  writeFrontmatterField,
} from '../../src/core/initiative-transitions.js';
import { INITIATIVE_STATES, checkInitiativeState, readInitiatives } from '../../src/core/initiatives.js';

/**
 * DEC-STATE-MACHINE — every transition is a tool's side effect, and the
 * handoff is a state of its own.
 */
describe('initiative transitions', () => {
  describe('the vocabulary', () => {
    it('places the handoff between building and attested', () => {
      expect([...INITIATIVE_STATES]).toEqual([
        'exploring',
        'proposed',
        'building',
        'ready-for-attestation',
        'attested',
        'completed',
        'declined',
      ]);
    });

    it('names the handoff state in one place', () => {
      expect(READY_FOR_ATTESTATION).toBe('ready-for-attestation');
      expect([...INITIATIVE_STATES]).toContain(READY_FOR_ATTESTATION);
    });

    it('declares exactly twelve transitions, each owned by a workflow', () => {
      expect(TRANSITIONS).toHaveLength(12);
      for (const t of TRANSITIONS) {
        expect(t.by).toMatch(/^\/opsp:/);
        expect(t.when.length).toBeGreaterThan(0);
      }
    });

    it('every endpoint is a real state', () => {
      for (const t of TRANSITIONS) {
        expect([...INITIATIVE_STATES]).toContain(t.from);
        expect([...INITIATIVE_STATES]).toContain(t.to);
      }
    });

    it('the lifecycle transitions are owned by the workflow that performs them', () => {
      const by = (from: string, to: string) =>
        TRANSITIONS.find((t) => t.from === from && t.to === to)?.by;
      expect(by('exploring', 'proposed')).toBe('/opsp:propose');
      expect(by('proposed', 'building')).toBe('/opsp:apply');
      expect(by('building', 'ready-for-attestation')).toBe('/opsp:apply');
      expect(by('ready-for-attestation', 'attested')).toBe('/opsp:attest');
      expect(by('attested', 'completed')).toBe('/opsp:archive');
    });

    it('the handoff falls back to building only by a change request', () => {
      const backwards = TRANSITIONS.filter(
        (t) => t.from === 'ready-for-attestation' && t.to === 'building'
      );
      expect(backwards.map((t) => t.by)).toEqual(['/opsp:attest']);
    });

    it('the goal rung is reachable from both build and handoff', () => {
      const reexplore = TRANSITIONS.filter((t) => t.by === '/opsp:reexplore');
      expect(reexplore.map((t) => t.from).sort()).toEqual(['building', 'ready-for-attestation']);
      expect(reexplore.every((t) => t.to === 'exploring')).toBe(true);
    });

    it('the strategy rung is reachable from both build and handoff', () => {
      const repropose = TRANSITIONS.filter((t) => t.by === '/opsp:repropose');
      expect(repropose.map((t) => t.from).sort()).toEqual(['building', 'ready-for-attestation']);
      expect(repropose.every((t) => t.to === 'proposed')).toBe(true);
    });

    it('declining is reversible, keeping history', () => {
      expect(TRANSITIONS.find((t) => t.from === 'declined' && t.to === 'exploring')).toBeDefined();
    });
  });

  describe('checkTransition', () => {
    it('allows a move the table declares', () => {
      expect(checkTransition('building', 'ready-for-attestation')).toBeNull();
    });

    it('refuses a move the table does not declare, naming the legal ones', () => {
      const r = checkTransition('building', 'completed');
      expect(r).not.toBeNull();
      expect(r!.reason).toContain("'building' does not move to 'completed'");
      expect(r!.legal.map((t) => t.to).sort()).toEqual([
        'exploring',
        'proposed',
        'ready-for-attestation',
      ]);
    });

    it('refuses skipping the handoff', () => {
      expect(checkTransition('building', 'attested')).not.toBeNull();
    });

    it('refuses a state that does not exist, listing the vocabulary', () => {
      const r = checkTransition('building', 'ready');
      expect(r!.reason).toContain('is not a state');
      expect(r!.reason).toContain('ready-for-attestation');
    });

    it('refuses a move to where it already is', () => {
      expect(checkTransition('building', 'building')!.reason).toBe("Already 'building'.");
    });

    it('allows any state from no state, because that is a repair', () => {
      expect(checkTransition(undefined, 'building')).toBeNull();
      expect(checkTransition(undefined, 'completed')).toBeNull();
    });

    it('still refuses a non-state from no state', () => {
      expect(checkTransition(undefined, 'nonsense')).not.toBeNull();
    });

    it('offers nothing onward from a terminal close', () => {
      expect(nextStates('completed')).toEqual([]);
    });

    it('offers nothing from a state outside the vocabulary', () => {
      expect(nextStates('nonsense')).toEqual([]);
      expect(nextStates(undefined)).toEqual([]);
    });
  });

  describe('writeState', () => {
    let dir: string;
    const file = () => path.join(dir, 'i.md');

    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-writestate-'));
    });
    afterEach(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    it('rewrites an existing state line', () => {
      fs.writeFileSync(file(), '---\nid: a\nstatus: active\nstate: building\n---\n\n## Description\n\nd\n');
      writeState(file(), 'ready-for-attestation');
      expect(fs.readFileSync(file(), 'utf-8')).toContain('state: ready-for-attestation');
      expect(fs.readFileSync(file(), 'utf-8')).not.toContain('state: building');
    });

    it('inserts the field after status where it is absent — the propose repair', () => {
      fs.writeFileSync(file(), '---\nid: a\nstatus: active\ncreated: 2026-10-11\n---\n\n## Description\n\nd\n');
      writeState(file(), 'proposed');
      expect(fs.readFileSync(file(), 'utf-8')).toContain('status: active\nstate: proposed\ncreated:');
    });

    it('appends where there is no status either', () => {
      fs.writeFileSync(file(), '---\nid: a\n---\n\nd\n');
      writeState(file(), 'exploring');
      expect(fs.readFileSync(file(), 'utf-8')).toContain('state: exploring');
    });

    it('touches nothing but the frontmatter', () => {
      const body = '\n## Description\n\nstate: building appears in the prose too.\n';
      fs.writeFileSync(file(), `---\nid: a\nstatus: active\nstate: building\n---\n${body}`);
      writeState(file(), 'attested');
      expect(fs.readFileSync(file(), 'utf-8')).toContain(body);
    });

    it('refuses a file with no frontmatter', () => {
      fs.writeFileSync(file(), '# Just a heading\n');
      expect(() => writeState(file(), 'building')).toThrow(/no frontmatter/);
    });

    it('writes every state exactly as before, unquoted', () => {
      for (const state of INITIATIVE_STATES) {
        fs.writeFileSync(file(), '---\nid: a\nstatus: active\nstate: exploring\n---\n\nd\n');
        writeState(file(), state);
        expect(fs.readFileSync(file(), 'utf-8')).toBe(`---\nid: a\nstatus: active\nstate: ${state}\n---\n\nd\n`);
      }
    });
  });

  describe('writeOwner', () => {
    let dir: string;

    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-writeowner-'));
      fs.mkdirSync(path.join(dir, 'initiatives'));
    });
    afterEach(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    const at = () => path.join(dir, 'initiatives', 'i.md');
    const seed = (frontmatter: string, body = '\n## Description\n\nowner: in the prose stays put.\n') =>
      fs.writeFileSync(at(), `---\n${frontmatter}\n---\n${body}`);
    const ownerOf = () => readInitiatives(dir)[0].owner;

    it('inserts the owner after state, so the two fields a board reads sit together', () => {
      seed('id: a\nstatus: active\nstate: building\ncreated: 2026-10-15');
      writeOwner(at(), 'ivan');
      expect(fs.readFileSync(at(), 'utf-8')).toContain('state: building\nowner: ivan\ncreated:');
      expect(ownerOf()).toBe('ivan');
    });

    it('falls back to after status, then to the end', () => {
      seed('id: a\nstatus: active\ncreated: 2026-10-15');
      writeOwner(at(), 'ivan');
      expect(fs.readFileSync(at(), 'utf-8')).toContain('status: active\nowner: ivan\ncreated:');
      seed('id: a');
      writeOwner(at(), 'ivan');
      expect(fs.readFileSync(at(), 'utf-8')).toMatch(/^---\nid: a\nowner: ivan\n---/);
    });

    it('replaces an existing owner in place', () => {
      seed('id: a\nstatus: active\nstate: building\nowner: ivan\ncreated: 2026-10-15');
      writeOwner(at(), 'Nhat Cao');
      expect(fs.readFileSync(at(), 'utf-8')).toContain('state: building\nowner: Nhat Cao\ncreated:');
      const frontmatter = fs.readFileSync(at(), 'utf-8').split('\n---\n')[0];
      expect(frontmatter.match(/^owner:/gm)).toHaveLength(1);
    });

    it('removes the field on release, and only that line', () => {
      seed('id: a\nstatus: active\nstate: building\nowner: ivan\ncreated: 2026-10-15');
      writeOwner(at(), null);
      expect(fs.readFileSync(at(), 'utf-8')).toMatch(/^---\nid: a\nstatus: active\nstate: building\ncreated: 2026-10-15\n---/);
      expect(ownerOf()).toBeUndefined();
    });

    it('releasing an unowned card changes nothing', () => {
      seed('id: a\nstatus: active\nstate: exploring');
      const before = fs.readFileSync(at(), 'utf-8');
      writeOwner(at(), null);
      expect(fs.readFileSync(at(), 'utf-8')).toBe(before);
    });

    it('quotes a name YAML would misread, so it parses back to itself', () => {
      for (const name of ['ops: night shift', '#oncall', 'yes', '1234', "it's me", '- dash', 'a "quoted" name']) {
        seed('id: a\nstatus: active\nstate: building');
        writeOwner(at(), name);
        expect(ownerOf(), name).toBe(name);
      }
    });

    it('never reads a dollar sign in a name as a replacement pattern', () => {
      seed('id: a\nstatus: active\nstate: building');
      writeOwner(at(), "$& and $' and $1");
      expect(ownerOf()).toBe("$& and $' and $1");
    });

    it('keeps a long name on one line', () => {
      const name = 'a'.repeat(30) + ' ' + 'b'.repeat(30) + ' ' + 'c'.repeat(30);
      seed('id: a\nstatus: active\nstate: building');
      writeOwner(at(), name);
      expect(fs.readFileSync(at(), 'utf-8')).toContain(`owner: ${name}\n`);
    });

    it('touches nothing outside the frontmatter', () => {
      seed('id: a\nstatus: active\nstate: building');
      writeOwner(at(), 'ivan');
      expect(fs.readFileSync(at(), 'utf-8')).toContain('\n## Description\n\nowner: in the prose stays put.\n');
    });

    it('writes any field through the same writer', () => {
      seed('id: a\nstatus: active');
      writeFrontmatterField(at(), 'completed', '2026-10-15', ['status']);
      expect(fs.readFileSync(at(), 'utf-8')).toContain('status: active\ncompleted: 2026-10-15');
    });
  });

  describe('the state check knows the new shape', () => {
    const entry = (state: string, done: number, total: number) => ({
      id: 'i',
      stem: 'i',
      path: '/tmp/i.md',
      status: 'active',
      state,
      driverSpecs: [],
      decisions: [],
      milestones: Array.from({ length: total }, (_, n) => ({
        name: `m${n}`,
        description: 'd',
        done: n < done,
        superseded: false,
      })),
      orphanedMilestones: [],
    });

    const kinds = (state: string, done: number, total: number) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      checkInitiativeState(entry(state, done, total) as any).map((p) => p.detail);

    it('reports proposed with work already done — the gap that hid longest', () => {
      const d = kinds('proposed', 2, 3);
      expect(d.join(' ')).toContain("Declares 'proposed' but 2 milestone(s) are already done");
      expect(d.join(' ')).toContain("advances to 'building'");
    });

    it('reports building with every milestone done — the handoff that did not happen', () => {
      const d = kinds('building', 3, 3);
      expect(d.join(' ')).toContain('all 3 milestone(s) are done');
      expect(d.join(' ')).toContain("'ready-for-attestation'");
    });

    it('does not report building with work outstanding', () => {
      expect(kinds('building', 1, 3)).toEqual([]);
    });

    it('reports the handoff state with work outstanding', () => {
      expect(kinds('ready-for-attestation', 1, 3).join(' ')).toContain('2 of 3 milestone(s) are outstanding');
    });

    it('accepts the handoff state with every milestone done', () => {
      expect(kinds('ready-for-attestation', 3, 3)).toEqual([]);
    });

    it('reports the handoff state with no milestones at all', () => {
      expect(kinds('ready-for-attestation', 0, 0).join(' ')).toContain('nothing was built');
    });
  });
});
