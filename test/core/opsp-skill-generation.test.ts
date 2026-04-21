import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';
import { InitCommand } from '../../src/core/init.js';
import {
  getOpspSkillTemplates,
  getOpspCommandContents,
  OPSP_WORKFLOW_IDS,
} from '../../src/core/shared/index.js';

const { confirmMock, showWelcomeScreenMock, searchableMultiSelectMock } = vi.hoisted(() => ({
  confirmMock: vi.fn(),
  showWelcomeScreenMock: vi.fn().mockResolvedValue(undefined),
  searchableMultiSelectMock: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({
  confirm: confirmMock,
}));

vi.mock('../../src/ui/welcome-screen.js', () => ({
  showWelcomeScreen: showWelcomeScreenMock,
}));

vi.mock('../../src/prompts/searchable-multi-select.js', () => ({
  searchableMultiSelect: searchableMultiSelectMock,
}));

describe('OPSP skill generation', () => {
  describe('template functions', () => {
    it('should return 10 OPSP skill templates (4 utility + 6 lifecycle)', () => {
      const templates = getOpspSkillTemplates();
      expect(templates).toHaveLength(10);
      expect(templates.map(t => t.workflowId)).toEqual([
        'driver', 'decide', 'tree', 'rebuild-assess',
        'opsp-explore', 'opsp-propose', 'opsp-apply', 'opsp-archive', 'opsp-review', 'opsp-reexplore',
      ]);
    });

    it('should use opensprint- prefix for skill directory names', () => {
      const templates = getOpspSkillTemplates();
      for (const t of templates) {
        expect(t.dirName).toMatch(/^opensprint-/);
      }
    });

    it('should return 10 OPSP command contents', () => {
      const contents = getOpspCommandContents();
      expect(contents).toHaveLength(10);
      expect(contents.map(c => c.id)).toEqual([
        'driver', 'decide', 'tree', 'rebuild-assess',
        'opsp-explore', 'opsp-propose', 'opsp-apply', 'opsp-archive', 'opsp-review', 'opsp-reexplore',
      ]);
    });

    it('should have correct OPSP workflow IDs (10 total)', () => {
      expect(OPSP_WORKFLOW_IDS).toEqual([
        'driver', 'decide', 'tree', 'rebuild-assess',
        'opsp-explore', 'opsp-propose', 'opsp-apply', 'opsp-archive', 'opsp-review', 'opsp-reexplore',
      ]);
    });

    it('should have non-empty instructions for all OPSP skills', () => {
      const templates = getOpspSkillTemplates();
      for (const t of templates) {
        expect(t.template.instructions.length).toBeGreaterThan(100);
        expect(t.template.name).toMatch(/^opensprint-/);
      }
    });

    it('should have lifecycle skill templates with correct names', () => {
      const templates = getOpspSkillTemplates();
      const lifecycleNames = templates
        .filter(t => ['opsp-explore', 'opsp-propose', 'opsp-apply', 'opsp-archive', 'opsp-review', 'opsp-reexplore'].includes(t.workflowId))
        .map(t => t.template.name);
      expect(lifecycleNames).toEqual([
        'opensprint-explore', 'opensprint-propose', 'opensprint-apply', 'opensprint-archive', 'opensprint-review', 'opensprint-reexplore',
      ]);
    });

    it('should have opsp-review skill template with review-specific instructions', () => {
      const templates = getOpspSkillTemplates();
      const review = templates.find(t => t.workflowId === 'opsp-review');
      expect(review).toBeDefined();
      expect(review!.template.name).toBe('opensprint-review');
      expect(review!.dirName).toBe('opensprint-review');
      expect(review!.template.instructions).toContain('git log --graph');
      expect(review!.template.instructions).toContain('git diff');
    });

    it('should have opsp-apply instructions with branch management and pause checkpoints', () => {
      const templates = getOpspSkillTemplates();
      const apply = templates.find(t => t.workflowId === 'opsp-apply');
      expect(apply).toBeDefined();
      expect(apply!.template.instructions).toContain('git checkout -b opsp/');
      expect(apply!.template.instructions).toContain('git checkout -b opsx/');
      expect(apply!.template.instructions).toContain('git merge opsx/');
      expect(apply!.template.instructions).toContain('review mode');
      expect(apply!.template.instructions).toContain('Per-milestone');
      expect(apply!.template.instructions).toContain('Per-change');
      expect(apply!.template.instructions).toContain('Continuous');
    });

    it('should have opsp-apply instructions with approve and change request checkpoint actions', () => {
      const templates = getOpspSkillTemplates();
      const apply = templates.find(t => t.workflowId === 'opsp-apply');
      expect(apply).toBeDefined();
      // Checkpoint options
      expect(apply!.template.instructions).toContain('Approve and continue');
      expect(apply!.template.instructions).toContain('Raise change request');
      // Change request sub-paths
      expect(apply!.template.instructions).toContain('I know what needs to change');
      expect(apply!.template.instructions).toContain('I need to explore this first');
      // Surrogate reload after correction
      expect(apply!.template.instructions).toContain('Reload the full surrogate');
      expect(apply!.template.instructions).toContain('Return to the same checkpoint');
      // References to existing opsx workflows
      expect(apply!.template.instructions).toContain('/opsx:propose');
      expect(apply!.template.instructions).toContain('/opsx:explore');
    });

    it('should have opsp-reexplore skill template with initiative-scoped instructions', () => {
      const templates = getOpspSkillTemplates();
      const reexplore = templates.find(t => t.workflowId === 'opsp-reexplore');
      expect(reexplore).toBeDefined();
      expect(reexplore!.template.name).toBe('opensprint-reexplore');
      expect(reexplore!.dirName).toBe('opensprint-reexplore');
      // Initiative context loading
      expect(reexplore!.template.instructions).toContain('opensprint/initiatives/');
      expect(reexplore!.template.instructions).toContain('Completed');
      expect(reexplore!.template.instructions).toContain('Pending');
      // Plan revision mechanics
      expect(reexplore!.template.instructions).toContain('/opsx:propose');
      expect(reexplore!.template.instructions).toContain('/opsx:explore');
      expect(reexplore!.template.instructions).toContain('corrective');
      expect(reexplore!.template.instructions).toContain('superseded');
      // Guardrails
      expect(reexplore!.template.instructions).toContain('Stop at propose');
    });
  });

  describe('init with sprint-driven schema', () => {
    let testDir: string;
    let configTempDir: string;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(async () => {
      testDir = path.join(os.tmpdir(), `openspec-opsp-skill-test-${Date.now()}`);
      await fs.mkdir(testDir, { recursive: true });
      originalEnv = { ...process.env };
      configTempDir = path.join(os.tmpdir(), `openspec-config-opsp-skill-${Date.now()}`);
      await fs.mkdir(configTempDir, { recursive: true });
      process.env.XDG_CONFIG_HOME = configTempDir;

      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      confirmMock.mockReset();
      confirmMock.mockResolvedValue(true);
      showWelcomeScreenMock.mockClear();
      searchableMultiSelectMock.mockReset();
    });

    afterEach(async () => {
      process.env = originalEnv;
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.rm(configTempDir, { recursive: true, force: true });
      vi.restoreAllMocks();
    });

    it('should always generate OPSP skills (no schema flag needed)', async () => {
      // Plain init — OPSP skills are always generated
      const cmd = new InitCommand({ tools: 'claude', force: true });
      await cmd.execute(testDir);

      const skillsDir = path.join(testDir, '.claude', 'skills');
      // OPSP utility skills
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-driver', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-decide', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-tree', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-rebuild-assess', 'SKILL.md'))).toBe(true);
      // OPSP lifecycle skills
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-explore', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-propose', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-apply', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-archive', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-review', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-reexplore', 'SKILL.md'))).toBe(true);
    });

    it('should always generate OPSP slash commands (no schema flag needed)', async () => {
      const cmd = new InitCommand({ tools: 'claude', force: true });
      await cmd.execute(testDir);

      const commandsDir = path.join(testDir, '.claude', 'commands', 'opsp');
      expect(fsSync.existsSync(path.join(commandsDir, 'driver.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(commandsDir, 'decide.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(commandsDir, 'tree.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(commandsDir, 'rebuild-assess.md'))).toBe(true);
    });

    it('should generate both OPSX and OPSP skills unconditionally', async () => {
      const cmd = new InitCommand({ tools: 'claude', force: true });
      await cmd.execute(testDir);

      const skillsDir = path.join(testDir, '.claude', 'skills');
      // OPSX
      expect(fsSync.existsSync(path.join(skillsDir, 'openspec-explore', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'openspec-apply-change', 'SKILL.md'))).toBe(true);
      // OPSP
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-driver', 'SKILL.md'))).toBe(true);
      expect(fsSync.existsSync(path.join(skillsDir, 'opensprint-explore', 'SKILL.md'))).toBe(true);
    });
  });
});
