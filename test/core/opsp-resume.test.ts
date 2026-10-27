import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { getOpspSkillTemplates } from '../../src/core/shared/index.js';
import { parseInitiative } from '../../src/core/initiatives.js';

/**
 * DEC-CONTINUE-FORWARD-ESCALATE-BACK's invalidation trigger: if a workflow
 * cannot resume from where it paused, "continue" is a restart wearing a
 * different name. A board button starts a fresh session
 * (DEC-BOARD-BUTTON-LAUNCHES-SESSION), so triage, propose and attest must
 * resume from what is on disk.
 */
const text = (dir: string) => getOpspSkillTemplates().find((t) => t.dirName === dir)!.template.instructions;

describe('triage resumes', () => {
  const triage = () => text('opensprint-triage');

  it('reads the initiative first, and stops where triage is over', () => {
    expect(triage()).toContain('**Read the initiative before doing anything else.**');
    expect(triage()).toMatch(/It is past `exploring`\*\* — triage is over\./);
  });

  it('writes its thinking to ## Triage before it stops, and resumes from it', () => {
    expect(triage()).toMatch(/Write the thinking down, in the initiative, before you stop for any reason/);
    expect(triage()).toMatch(/- \*\*Weighed\*\*:[\s\S]*- \*\*Leaning\*\*:[\s\S]*- \*\*Open\*\*:/);
    expect(triage()).toMatch(/It already has a `## Triage` section\*\* — you are resuming/);
  });

  it('still formalizes nothing: the notes are not records', () => {
    expect(triage()).toContain('**Never formalize here.** No driver-specs, no ADRs, no milestones');
    expect(triage()).toMatch(/These are notes, not records/);
  });

  it('hands propose its leaning through the file', () => {
    expect(triage()).toMatch(/make it the\s+\*\*Leaning\*\* in `## Triage`, commit, and hand to `\/opsp:propose`/);
  });
});

describe('propose resumes', () => {
  const propose = () => text('opensprint-propose');

  it('stops where it is already proposed', () => {
    expect(propose()).toMatch(/It is `proposed` or later\*\* — propose is done/);
  });

  it('takes triage’s strategy from ## Triage, not a conversation', () => {
    expect(propose()).toMatch(/It has a `## Triage` section\*\*[\s\S]*Read it where you would otherwise read the conversation/);
  });

  it('treats records already written as confirmed, and writes only what is missing', () => {
    expect(propose()).toMatch(/They are confirmed\. \*\*Never recreate or rewrite\s+them\.\*\*/);
    expect(propose()).toMatch(/classify only what is still missing, and write only that/);
  });
});

describe('attest resumes', () => {
  const attest = () => text('opensprint-attest');

  it('stops where it is already attested, or not handed over', () => {
    expect(attest()).toMatch(/\*\*`attested`\*\* — the judgement is recorded\. Say so, name `\/opsp:archive`, and stop\./);
    expect(attest()).toMatch(/\*\*`building`\*\* — a change was requested/);
  });

  it('confirms the frame in every session, and skips only bars', () => {
    expect(attest()).toMatch(/The frame is confirmed again\s+in every session/);
    expect(attest()).toMatch(/was judged in this pass\*\*\. Present it as done, and judge\s+the rest/);
  });

  describe('finding the handoff, in a real repository', () => {
    let root: string;
    const git = (...args: string[]) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const F = path.join('opensprint', 'initiatives', '20261001-a.md');
    const state = (s: string) => {
      fs.mkdirSync(path.join(root, 'opensprint', 'initiatives'), { recursive: true });
      fs.writeFileSync(path.join(root, F), `---\nid: a\nstatus: active\nstate: ${s}\n---\n`);
      git('add', '.');
      git('commit', '-q', '-m', `a → ${s}`);
      return git('rev-parse', 'HEAD');
    };

    beforeEach(() => {
      root = fs.mkdtempSync(path.join(os.tmpdir(), 'opensprint-resume-'));
      git('init', '-q', '-b', 'main');
      git('config', 'user.email', 'test@example.com');
      git('config', 'user.name', 'Test');
    });
    afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

    it('finds the latest handoff, after a change request and a second handoff', () => {
      state('building');
      state('ready-for-attestation');
      state('building'); // a change was requested
      fs.writeFileSync(path.join(root, 'code.ts'), 'fixed\n');
      git('add', '.');
      git('commit', '-q', '-m', 'the requested change');
      const second = state('ready-for-attestation');

      // The command exactly as the skill ships it, with the file filled in.
      const line = attest().split('\n').find((l) => l.includes("-S'state: ready-for-attestation'"))!;
      const command = line.replace(/\s+#.*$/, '');
      const h = execFileSync('sh', ['-c', `F=${F}; ${command}; echo "$H"`], { cwd: root, encoding: 'utf-8' }).trim();
      expect(h).toBe(second);
    });
  });
});

describe('## Triage in an initiative', () => {
  it('changes nothing a parser reads: no milestones, no summary', () => {
    const content =
      '---\nid: a\nstatus: active\nstate: exploring\n---\n\n## Description\n\nThe objective.\n\n' +
      '## Triage\n\n- **Weighed**: one — cheap; two — slow\n- **Leaning**: one\n- **Open**: who pays\n';
    const entry = parseInitiative(content, 'a.md', 'a')!;
    expect(entry.summary).toBe('The objective.');
    expect(entry.milestones).toEqual([]);
    expect(entry.orphanedMilestones).toEqual([]);
  });
});
