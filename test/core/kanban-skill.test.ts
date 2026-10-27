import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { INITIATIVE_STATES, OWNED_STATES, parseInitiative } from '../../src/core/initiatives.js';
import {
  BOARD_CARDS_MARKER,
  BOARD_CONFIG_MARKER,
  KANBAN_COLUMNS,
  boardConfig,
  columnOf,
  renderBoardTemplate,
} from '../../src/core/kanban-board.js';
import { planSeed, transact } from '../../src/core/kanban.js';
import {
  KANBAN_SKILL_DIR,
  OPSP_WORKFLOW_IDS,
  getOpspCommandTemplates,
  getOpspSkillTemplates,
  kanbanTemplatePath,
  writeOpspLayer,
} from '../../src/core/shared/index.js';
import { KANBAN_TEMPLATE_PLACEHOLDER } from '../../src/core/templates/workflows/opsp-kanban.js';
import { UpdateCommand } from '../../src/core/update.js';
import type { GlobalConfig } from '../../src/core/global-config.js';

/**
 * DEC-BOARD-READ-BY-GIT: the board is listed with git playbooks and rendered
 * by filling a static template. DS-RUNTIME-LESS-BOARD: git, the installed
 * skill and a browser are all it needs. These run the playbooks exactly as
 * they ship, against a real remote.
 */

const mockState = { config: { featureFlags: {}, profile: 'core', delivery: 'both' } as GlobalConfig };
vi.mock('../../src/core/global-config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/core/global-config.js')>();
  return { ...actual, getGlobalConfig: () => ({ ...mockState.config }), saveGlobalConfig: vi.fn() };
});

const claude = { value: 'claude', skillsDir: '.claude' };

describe('the board columns (DEC-CONTINUE-FORWARD-ESCALATE-BACK)', () => {
  it('put every state in exactly one column, held or not', () => {
    for (const state of INITIATIVE_STATES) {
      for (const held of [false, true]) {
        const matching = KANBAN_COLUMNS.filter(
          (c) => c.states.includes(state) && (c.held === undefined || c.held === held)
        );
        expect(matching.map((c) => c.key), `${state}, held: ${held}`).toHaveLength(1);
      }
    }
  });

  it('split exploring into Backlog and Planning by whether anyone holds the card', () => {
    expect(columnOf('exploring', false)?.title).toBe('Backlog');
    expect(columnOf('exploring', true)?.title).toBe('Planning');
    expect(columnOf('building', false)?.title).toBe('Dev');
    expect(columnOf('ready-for-attestation', true)?.title).toBe('Attestation');
    expect(columnOf('declined', false)?.title).toBe('Done');
    expect(columnOf('not-a-state', false)).toBeUndefined();
  });
});

describe('the board template', () => {
  const page = () => renderBoardTemplate();
  const mainScript = (html: string) => {
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    return scripts[scripts.length - 1][1];
  };

  it('carries the columns and owned states as configuration, and keeps the cards marker for render', () => {
    const html = page();
    expect(html).not.toContain(BOARD_CONFIG_MARKER);
    expect(html).toContain(BOARD_CARDS_MARKER);
    const json = html.match(/<script type="application\/json" id="board-config">([\s\S]*?)<\/script>/)![1];
    expect(JSON.parse(json)).toEqual({ columns: KANBAN_COLUMNS, owned: OWNED_STATES });
  });

  it('cannot be broken by a configuration value', () => {
    const html = renderBoardTemplate({ ...boardConfig(), columns: [{ key: 'x', title: '</script><b>$&', states: [] }] });
    expect(html).not.toContain('</script><b>');
    expect(html).toContain('\\u003c/script>\\u003cb>$&');
  });

  it('has a script that parses', () => {
    expect(() => new Function(mainScript(page()))).not.toThrow();
  });

  it('loads nothing from the network (DS-RUNTIME-LESS-BOARD)', () => {
    const html = page();
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/<link\b|<img\b|<iframe\b|\bsrc=/i);
    expect(mainScript(html)).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket|EventSource|import\(/);
  });

  it('never reads card text as HTML', () => {
    expect(mainScript(page())).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
  });
});

describe('the workflow', () => {
  it('is registered as /opsp:kanban, with a skill and a command', () => {
    expect(OPSP_WORKFLOW_IDS).toContain('kanban');
    expect(getOpspSkillTemplates().find((t) => t.workflowId === 'kanban')?.dirName).toBe(KANBAN_SKILL_DIR);
    expect(getOpspCommandTemplates().some((t) => t.id === 'kanban')).toBe(true);
  });

  it('never writes the board', () => {
    const instructions = getOpspSkillTemplates().find((t) => t.workflowId === 'kanban')!.template.instructions;
    expect(instructions).not.toMatch(/git (push|commit|checkout|switch|reset|merge|rebase)\b/);
  });
});

describe('shipping', () => {
  let project: string;
  beforeEach(() => {
    project = fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-kanban-ship-'));
    mockState.config = { featureFlags: {}, profile: 'core', delivery: 'both' } as GlobalConfig;
  });
  afterEach(() => fs.rmSync(project, { recursive: true, force: true }));
  const read = (...parts: string[]) => fs.readFileSync(path.join(project, ...parts), 'utf-8');
  const exists = (...parts: string[]) => fs.existsSync(path.join(project, ...parts));

  it('writes every opsp skill, the kanban command and the template, naming the template’s path', async () => {
    await writeOpspLayer(project, claude, { skills: true, commands: true, version: 'test' });
    for (const { dirName } of getOpspSkillTemplates()) {
      expect(exists('.claude', 'skills', dirName, 'SKILL.md'), dirName).toBe(true);
    }
    expect(exists('.claude', 'skills', KANBAN_SKILL_DIR, 'board.html')).toBe(true);

    const skill = read('.claude', 'skills', KANBAN_SKILL_DIR, 'SKILL.md');
    const command = read('.claude', 'commands', 'opsp', 'kanban.md');
    for (const text of [skill, command]) {
      expect(text).toContain('$(git rev-parse --show-toplevel)/.claude/skills/opensprint-kanban/board.html');
      expect(text).not.toContain(KANBAN_TEMPLATE_PLACEHOLDER);
    }
  });

  it('names the path for the tool it was generated for', async () => {
    const cursor = { value: 'cursor', skillsDir: '.cursor' };
    expect(kanbanTemplatePath(cursor)).toBe('.cursor/skills/opensprint-kanban/board.html');
    await writeOpspLayer(project, cursor, { skills: true, commands: false, version: 'test' });
    expect(read('.cursor', 'skills', KANBAN_SKILL_DIR, 'SKILL.md')).toContain('.cursor/skills/opensprint-kanban/board.html');
  });

  it('writes the template with commands-only delivery, and no skill beside it', async () => {
    await writeOpspLayer(project, claude, { skills: false, commands: true, version: 'test' });
    expect(exists('.claude', 'skills', KANBAN_SKILL_DIR, 'board.html')).toBe(true);
    expect(exists('.claude', 'skills', KANBAN_SKILL_DIR, 'SKILL.md')).toBe(false);
    expect(exists('.claude', 'commands', 'opsp', 'kanban.md')).toBe(true);
  });

  it('reaches a project through opensprint update, which never wrote the opsp layer before', async () => {
    fs.mkdirSync(path.join(project, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(project, '.claude', 'skills', 'openspec-explore'), { recursive: true });
    fs.writeFileSync(
      path.join(project, '.claude', 'skills', 'openspec-explore', 'SKILL.md'),
      '---\nname: openspec-explore\nmetadata:\n  generatedBy: "0.0.1"\n---\n\nold\n'
    );
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await new UpdateCommand().execute(project);
    vi.restoreAllMocks();

    expect(exists('.claude', 'skills', KANBAN_SKILL_DIR, 'SKILL.md')).toBe(true);
    expect(exists('.claude', 'skills', KANBAN_SKILL_DIR, 'board.html')).toBe(true);
    expect(exists('.claude', 'commands', 'opsp', 'kanban.md')).toBe(true);
    expect(exists('.claude', 'skills', 'opensprint-apply', 'SKILL.md')).toBe(true);
  });
});

/** The bash block that follows a heading in the shipped skill. */
function playbook(skill: string, heading: string): string {
  const after = skill.slice(skill.indexOf(heading));
  return after.match(/```bash\n([\s\S]*?)```/)![1];
}

describe.skipIf(process.platform === 'win32')('the shipped playbooks, against a remote', () => {
  let base: string;
  let remote: string;
  let root: string;
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const sh = (script: string) =>
    execFileSync('sh', ['-c', script], { cwd: root, encoding: 'utf-8', env: { ...process.env, TMPDIR: base } });
  const skill = () => fs.readFileSync(path.join(root, '.claude', 'skills', KANBAN_SKILL_DIR, 'SKILL.md'), 'utf-8');

  beforeEach(async () => {
    base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-kanban-playbook-')));
    remote = path.join(base, 'remote.git');
    git(base, 'init', '-q', '--bare', '--initial-branch=main', remote);
    root = path.join(base, 'work');
    git(base, 'clone', '-q', remote, root);
    git(root, 'config', 'user.email', 'test@example.com');
    git(root, 'config', 'user.name', 'Tester');
    git(root, 'symbolic-ref', 'HEAD', 'refs/heads/main');
    await writeOpspLayer(root, claude, { skills: true, commands: false, version: 'test' });
    git(root, 'add', '.');
    git(root, 'commit', '-q', '-m', 'skills');
    git(root, 'push', '-q', 'origin', 'main');
  });
  afterEach(() => fs.rmSync(base, { recursive: true, force: true }));

  const seed = () => {
    const entry = (id: string, front: string) => ({
      entry: parseInitiative(`---\nid: ${id}\nstatus: active\n${front}---\n\n## Description\n\nAbout ${id}.\n`, id, id)!,
      source: `${id}.md`,
    });
    transact(root, 'origin', (board) =>
      planSeed(board, [entry('alpha', 'state: building\nowner: Nhat Tran\n'), entry('beta', 'state: exploring\n')], {
        mode: 'init',
        stamp: { at: '2026-10-27T00:00:00Z', by: 'Tester' },
      })
    );
    git(root, 'update-ref', '-d', 'refs/remotes/origin/kanban');
  };

  it('lists id, state and owner for every card', () => {
    seed();
    const lines = sh(playbook(skill(), '## Playbook 1')).trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^alpha\s+building\s+Nhat Tran$/);
    expect(lines[1]).toMatch(/^beta\s+exploring\s+-$/);
  });

  it('renders one page holding every card and the metadata, as base64', () => {
    seed();
    const head = git(root, 'rev-parse', 'HEAD');
    const out = sh(playbook(skill(), '## Playbook 2')).trim();
    expect(out).toBe(path.join(base, 'opensprint-kanban.html'));

    const html = fs.readFileSync(out, 'utf-8');
    expect(html).toContain('id="board-config"');
    expect(html).not.toContain(BOARD_CARDS_MARKER);
    const decode = (b64: string) => Buffer.from(b64, 'base64').toString('utf-8');
    const cards = [...html.matchAll(/<script type="text\/plain" class="card">([^<]*)<\/script>/g)].map((m) => decode(m[1]));
    // Byte for byte, trailing newline included: the playbook pipes `git show` straight into base64.
    expect(cards).toEqual([
      `${git(root, 'show', 'origin/kanban:cards/alpha.md')}\n`,
      `${git(root, 'show', 'origin/kanban:cards/beta.md')}\n`,
    ]);
    const meta = decode(html.match(/id="board-meta">([^<]*)</)![1]);
    expect(meta).toContain('ref=origin/kanban\n');
    expect(meta).toContain(`main=${root}\n`);
    // Read-only: the checkout is where it was.
    expect(git(root, 'rev-parse', 'HEAD')).toBe(head);
    expect(git(root, 'status', '--porcelain')).toBe('');
  });

  it('says how to create the board where there is none', () => {
    expect(sh(playbook(skill(), '## Playbook 1'))).toContain('opensprint kanban init');
    expect(sh(playbook(skill(), '## Playbook 2'))).toContain('opensprint kanban init');
  });
});
