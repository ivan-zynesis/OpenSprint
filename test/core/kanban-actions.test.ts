import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { INITIATIVE_STATES } from '../../src/core/initiatives.js';
import { checkTransition } from '../../src/core/initiative-transitions.js';
import {
  TRIAGE_PICKUP,
  boardMoves,
  continueMove,
  escalationMoves,
  type KanbanMove,
} from '../../src/core/kanban-board.js';
import { CommandAdapterRegistry } from '../../src/core/command-generation/index.js';
import { KANBAN_SKILL_DIR, kanbanAgent, writeOpspLayer } from '../../src/core/shared/index.js';

/**
 * DEC-CONTINUE-FORWARD-ESCALATE-BACK: each column is a stage with one
 * workflow; forward continues it, backward escalates up a rung, and the board
 * offers no move the state machine does not allow. DEC-BOARD-BUTTON-LAUNCHES-SESSION:
 * a button copies the command that starts the workflow in a fresh session,
 * built from the tool's command adapter.
 */

const brief = (m: KanbanMove | undefined) => (m === undefined ? null : `${m.workflow} → ${m.to}`);

describe('the moves, derived from TRANSITIONS', () => {
  it('continue with the stage’s one workflow, as the ADR’s table says', () => {
    expect(brief(continueMove('exploring', false))).toBe('triage → exploring');
    expect(brief(continueMove('exploring', true))).toBe('propose → proposed');
    expect(brief(continueMove('proposed', true))).toBe('apply → building');
    expect(brief(continueMove('building', true))).toBe('apply → ready-for-attestation');
    expect(brief(continueMove('ready-for-attestation', true))).toBe('attest → attested');
    expect(brief(continueMove('attested', true))).toBe('archive → completed');
    expect(continueMove('completed', true)).toBeUndefined();
    expect(continueMove('declined', false)).toBeUndefined();
  });

  it('escalate up a rung, labelled by the rung', () => {
    const labels = (state: string) => escalationMoves(state).map((m) => `${m.label}: ${m.workflow} → ${m.to}`);
    expect(labels('building')).toEqual(['Repropose: repropose → proposed', 'Reexplore: reexplore → exploring']);
    expect(labels('ready-for-attestation')).toEqual([
      'Request a change: attest → building',
      'Repropose: repropose → proposed',
      'Reexplore: reexplore → exploring',
    ]);
    expect(labels('declined')).toEqual(['Revive: triage → exploring']);
    for (const state of ['exploring', 'proposed', 'attested', 'completed']) {
      expect(labels(state), state).toEqual([]);
    }
  });

  it('offer only legal transitions, never into declined, and triage’s pick-up as the one exception', () => {
    const { continue: forward, escalate } = boardMoves();
    const all = [
      ...Object.values(forward).flatMap((c) => [c.unheld, c.held]).filter((m): m is KanbanMove => m !== undefined),
      ...Object.values(escalate).flat(),
    ];
    expect(all.length).toBeGreaterThan(0);
    for (const move of all) {
      expect(move.to, move.label).not.toBe('declined');
      if (move === TRIAGE_PICKUP) continue;
      expect(checkTransition(move.from, move.to), `${move.from} → ${move.to}`).toBeNull();
    }
  });

  it('carry the hat and when, from the transition', () => {
    const apply = continueMove('proposed', true)!;
    expect(apply.hat).toEqual(['dev', 'devops']);
    expect(apply.when).toBe('the first milestone starts');
    expect(TRIAGE_PICKUP.claims).toBe(true);
    expect(TRIAGE_PICKUP.hat).toEqual(['product', 'maintainer']);
  });

  it('cover every state the vocabulary has, so a new state cannot go unconsidered', () => {
    const { continue: forward, escalate } = boardMoves();
    const considered = new Set([...Object.keys(forward), ...Object.keys(escalate), 'completed']);
    expect([...considered].sort()).toEqual([...INITIATIVE_STATES].sort());
  });
});

describe('the agent table, from the command adapters', () => {
  const claude = { value: 'claude', skillsDir: '.claude' };

  it('Claude Code launches with claude and invokes the generated opsp commands', () => {
    const agent = kanbanAgent(claude, true);
    expect(agent.name).toBe('Claude Code');
    expect(agent.launcher).toEqual(['claude']);
    expect(agent.workflows.apply).toEqual({ command: '/opsp:opsp-apply' });
    expect(agent.workflows.triage).toEqual({ command: '/opsp:opsp-triage' });
    expect(agent.workflows.kanban).toEqual({ command: '/opsp:kanban' });
  });

  it('names the skill where commands are not delivered', () => {
    expect(kanbanAgent(claude, false).workflows.apply).toEqual({ skill: 'opensprint-apply' });
  });

  it('copies the prompt alone, naming the skill, for a tool whose adapter knows neither', () => {
    const cursor = CommandAdapterRegistry.get('cursor')!;
    expect(cursor.sessionLauncher).toBeUndefined();
    expect(cursor.commandReference).toBeUndefined();
    const agent = kanbanAgent({ value: 'cursor', skillsDir: '.cursor' }, true);
    expect(agent.launcher).toBeNull();
    expect(agent.workflows.attest).toEqual({ skill: 'opensprint-attest' });
  });

  describe('in the generated page', () => {
    let project: string;
    beforeEach(() => {
      project = fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-kanban-actions-'));
    });
    afterEach(() => fs.rmSync(project, { recursive: true, force: true }));

    it('writes the tool’s agent and the moves into its template', async () => {
      await writeOpspLayer(project, claude, { skills: true, commands: true, version: 'test' });
      const html = fs.readFileSync(path.join(project, '.claude', 'skills', KANBAN_SKILL_DIR, 'board.html'), 'utf-8');
      const config = JSON.parse(html.match(/id="board-config">([\s\S]*?)<\/script>/)![1]);
      expect(config.agent).toEqual(kanbanAgent(claude, true));
      expect(config.moves).toEqual(JSON.parse(JSON.stringify(boardMoves())));
    });
  });
});
