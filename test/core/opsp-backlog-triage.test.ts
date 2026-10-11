import { describe, it, expect } from 'vitest';
import {
  getOpspBacklogSkillTemplate,
  getOpspBacklogCommandTemplate,
  getOpspTriageSkillTemplate,
  getOpspTriageCommandTemplate,
  getOpspExploreSkillTemplate,
  getOpspProposeSkillTemplate,
} from '../../src/core/templates/skill-templates.js';
import {
  OPSP_WORKFLOW_IDS,
  getOpspSkillTemplates,
  getOpspCommandTemplates,
} from '../../src/core/shared/skill-generation.js';

/**
 * DEC-034 — /opsp:backlog persists; explore writes nothing.
 * DEC-039 — /opsp:triage is its own tool, for explicitness rather than capability.
 * DEC-029 — the planning tools create or switch to the initiative's worktree.
 */
describe('the backlog and triage seam', () => {
  describe('registration', () => {
    it('both appear, in lifecycle order between explore and propose', () => {
      const ids = [...OPSP_WORKFLOW_IDS];
      expect(ids).toContain('opsp-backlog');
      expect(ids).toContain('opsp-triage');
      expect(ids.indexOf('opsp-explore')).toBeLessThan(ids.indexOf('opsp-backlog'));
      expect(ids.indexOf('opsp-backlog')).toBeLessThan(ids.indexOf('opsp-triage'));
      expect(ids.indexOf('opsp-triage')).toBeLessThan(ids.indexOf('opsp-propose'));
    });

    it('both are skill and command templates', () => {
      const skills = getOpspSkillTemplates().map((e) => e.workflowId);
      const commands = getOpspCommandTemplates().map((e) => e.id);
      for (const id of ['opsp-backlog', 'opsp-triage']) {
        expect(skills).toContain(id);
        expect(commands).toContain(id);
      }
    });

    it('carries identical instructions in both forms', () => {
      expect(getOpspBacklogCommandTemplate().content).toBe(getOpspBacklogSkillTemplate().instructions);
      expect(getOpspTriageCommandTemplate().content).toBe(getOpspTriageSkillTemplate().instructions);
    });
  });

  describe('/opsp:backlog', () => {
    const text = getOpspBacklogSkillTemplate().instructions;

    it('is the deliberate flush explore does not do', () => {
      expect(text).toMatch(/deliberate\s+flush/i);
      expect(text).toMatch(/fills\s+the\s+backlog\s+with\s+noise/i);
      expect(text).toMatch(/DEC-034/);
    });

    it('can fire mid-conversation', () => {
      expect(text).toMatch(/fire\s+mid-conversation/i);
    });

    it('creates or switches to the initiative worktree, never main', () => {
      expect(text).toMatch(/Be\s+in\s+the\s+right\s+worktree/i);
      expect(text).toMatch(/DEC-029/);
      expect(text).toMatch(/git worktree add/);
      expect(text).toMatch(/Never\s+on\s+.?main/i);
    });

    it('cites why planning on main failed', () => {
      expect(text).toMatch(/failed\s+within\s+the\s+hour/i);
      expect(text).toMatch(/could\s+not\s+see\s+them/i);
    });

    it('writes the initiative and nothing else', () => {
      expect(text).toMatch(/state:\s*exploring/);
      expect(text).toMatch(/Driver-specs\s+and\s+ADRs\s+are\s+not\s+written\s+here/i);
      expect(text).toMatch(/The\s+initiative,\s+and\s+nothing\s+else/i);
    });

    it('drafts OGSM on the author behalf without interviewing', () => {
      expect(text).toMatch(/never\s+sees\s+OGSM/i);
      expect(text).toMatch(/Never\s+interview/i);
      expect(text).toMatch(/One\s+question\s+at\s+most/i);
    });

    it('stops rather than offering to proceed', () => {
      expect(text).toMatch(/Do\s+not\s+offer\s+to\s+propose/i);
      expect(text).toMatch(/possibly\s+not\s+today/i);
    });

    it('treats dying in the backlog as fine', () => {
      expect(text).toMatch(/Dying\s+here\s+is\s+fine/i);
    });
  });

  describe('/opsp:triage', () => {
    const text = getOpspTriageSkillTemplate().instructions;

    it('states it exists for explicitness rather than capability', () => {
      expect(text).toMatch(/explicitness\s+rather\s+than\s+capability/i);
      expect(text).toMatch(/DEC-039/);
      expect(text).toMatch(/nobody\s+reasons\s+about/i);
    });

    it('shows the two think\/persist pairs', () => {
      expect(text).toMatch(/--think-->/);
      expect(text).toMatch(/--persist-->/);
    });

    it('loads the surrogate before judging', () => {
      expect(text).toMatch(/Load\s+the\s+surrogate\s+first/i);
      expect(text).toMatch(/answered\s+already/i);
    });

    it('brainstorms strategy at architect altitude', () => {
      expect(text).toMatch(/Brainstorm\s+the\s+strategy/i);
      expect(text).toMatch(/gone\s+too\s+deep/i);
    });

    it('offers three outcomes with declining first-class', () => {
      expect(text).toMatch(/declining\s+is\s+first-class/i);
      expect(text).toMatch(/### Decline/);
      expect(text).toMatch(/### Return it/);
    });

    it('requires a recorded reason for declining', () => {
      expect(text).toMatch(/record\*{0,2}\s+why/i);
      expect(text).toMatch(/worth\s+more\s+than\s+the\s+idea/i);
      expect(text).toMatch(/DEC-035/);
    });

    it('never formalizes — that is propose', () => {
      expect(text).toMatch(/Never\s+formalize\s+here/i);
      expect(text).toMatch(/Never\s+advance\s+silently/i);
    });
  });

  describe('the surrounding workflows were updated', () => {
    it('explore offers backlog rather than only propose', () => {
      const text = getOpspExploreSkillTemplate().instructions;
      expect(text).toMatch(/\/opsp:backlog/);
      expect(text).toMatch(/deliberate\s+flush/i);
      expect(text).toMatch(/both\s+stay\s+open/i);
    });

    it('explore still writes nothing', () => {
      const text = getOpspExploreSkillTemplate().instructions;
      expect(text).toMatch(/No\s+artifacts\s+are\s+created/i);
      expect(text).toMatch(/Don't create files/i);
    });

    it('propose reads an existing initiative rather than creating a second', () => {
      const text = getOpspProposeSkillTemplate().instructions;
      expect(text).toMatch(/Where\s+the\s+input\s+comes\s+from/i);
      expect(text).toMatch(/do\s+not\s+create\s+a\s+second\s+one/i);
      expect(text).toMatch(/Never\s+rewrite\s+an\s+Objective\s+or\s+Goal/i);
      expect(text).toMatch(/You\s+are\s+the\s+formalizer/i);
    });
  });
});
