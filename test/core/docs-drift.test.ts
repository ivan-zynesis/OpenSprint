import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { OPSP_WORKFLOW_IDS } from '../../src/core/shared/index.js';
import { TRANSITIONS } from '../../src/core/initiative-transitions.js';
import { INITIATIVE_STATES } from '../../src/core/initiatives.js';

/**
 * The published documentation against what the code actually ships.
 *
 * DS-DOCUMENTATION-REVIEWED records that `docs/` is prose for humans and
 * nothing compiles it. This does not compile it — it checks the one thing
 * that rots silently and is purely mechanical: whether every workflow, state
 * and transition the code declares is named somewhere in the docs.
 *
 * It exists because the lifecycle diagram was found four workflows and an
 * entire stage out of date, with no signal that it had drifted.
 */
describe('documentation drift', () => {
  const read = (name: string) =>
    fs.readFileSync(path.join(process.cwd(), 'docs', name), 'utf-8');

  const slash = (id: string) => (id.startsWith('opsp-') ? `/opsp:${id.slice(5)}` : `/opsp:${id}`);

  describe('workflows.md', () => {
    const doc = () => read('workflows.md');

    it('names every workflow the code ships', () => {
      const missing = OPSP_WORKFLOW_IDS.filter((id) => !doc().includes(slash(id)));
      expect(missing).toEqual([]);
    });

    it('states the workflow count correctly', () => {
      const match = doc().match(/OpenSprint ships (\w+) agent workflows/);
      expect(match).not.toBeNull();
      const words: Record<string, number> = {
        fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
        nineteen: 19, twenty: 20, 'twenty-one': 21, 'twenty-two': 22,
      };
      expect(words[match![1]]).toBe(OPSP_WORKFLOW_IDS.length);
    });

    it('names every lifecycle state in the spine', () => {
      const spine = doc().slice(doc().indexOf('## The spine'), doc().indexOf('## When it is not'));
      for (const state of INITIATIVE_STATES) {
        if (state === 'declined') continue; // not on the forward spine
        expect(spine, `state '${state}' missing from the spine`).toContain(state);
      }
    });

    it('documents that the lifecycle runs backwards too', () => {
      expect(doc()).toContain('## When it is not the happy path');
      expect(doc()).toMatch(/forward-only SDLC describes a project that never existed/);
    });

    it('names every workflow that performs a backwards transition', () => {
      const backwards = TRANSITIONS.filter(
        (t) => INITIATIVE_STATES.indexOf(t.to as never) < INITIATIVE_STATES.indexOf(t.from as never)
      );
      expect(backwards.length).toBeGreaterThan(0);
      const fallback = doc().slice(doc().indexOf('## When it is not the happy path'));
      for (const t of backwards) {
        expect(fallback, `${t.from} → ${t.to} (${t.by}) not documented`).toContain(t.by);
      }
    });

    it('names the three rungs by what moves', () => {
      const fallback = doc().slice(doc().indexOf('## When it is not the happy path'));
      expect(fallback).toMatch(/the PLAN moved/);
      expect(fallback).toMatch(/the STRATEGY moved/);
      expect(fallback).toMatch(/the GOAL moved/);
    });

    it('gives the handoff its own stage', () => {
      const spine = doc().slice(doc().indexOf('## The spine'), doc().indexOf('## When it is not'));
      expect(spine).toMatch(/HAND OVER/);
      expect(doc()).toMatch(/\| \*\*hand over\*\* \|/);
    });
  });

  describe('concepts.md', () => {
    const doc = () => read('concepts.md');

    it('names every state', () => {
      for (const state of INITIATIVE_STATES) {
        expect(doc(), `state '${state}' undocumented`).toContain(state);
      }
    });

    it('carries the full transition table', () => {
      for (const t of TRANSITIONS) {
        expect(doc(), `${t.from} → ${t.to} (${t.by}) undocumented`).toContain(t.by);
      }
    });
  });
});
