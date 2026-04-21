import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';
import { InitCommand } from '../../src/core/init.js';

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

describe('InitCommand opensprint directory', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `openspec-init-opensprint-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    originalEnv = { ...process.env };
    configTempDir = path.join(os.tmpdir(), `openspec-config-opensprint-${Date.now()}`);
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

  it('should always create opensprint/ directory alongside openspec/', async () => {
    // Plain init — no schema flag needed
    const cmd = new InitCommand({ tools: 'claude', force: true });
    await cmd.execute(testDir);

    // Both directories should exist
    expect(fsSync.existsSync(path.join(testDir, 'openspec'))).toBe(true);
    const opensprintPath = path.join(testDir, 'opensprint');
    expect(fsSync.existsSync(opensprintPath)).toBe(true);
    expect(fsSync.existsSync(path.join(opensprintPath, 'driver-specs'))).toBe(true);
    expect(fsSync.existsSync(path.join(opensprintPath, 'ADRs'))).toBe(true);
    expect(fsSync.existsSync(path.join(opensprintPath, 'initiatives'))).toBe(true);
    expect(fsSync.existsSync(path.join(opensprintPath, 'DECISION-MAP.md'))).toBe(true);
    expect(fsSync.existsSync(path.join(opensprintPath, 'architecture.md'))).toBe(true);

    // Verify DECISION-MAP.md has the empty template
    const mapContent = await fs.readFile(
      path.join(opensprintPath, 'DECISION-MAP.md'),
      'utf-8'
    );
    expect(mapContent).toContain('# Decision Map');
    expect(mapContent).toContain('Decision Tree');
    expect(mapContent).toContain('Impact Summary');

    // Verify architecture.md has section placeholders
    const archContent = await fs.readFile(
      path.join(opensprintPath, 'architecture.md'),
      'utf-8'
    );
    expect(archContent).toContain('# Architecture');
    expect(archContent).toContain('## System Overview');
    expect(archContent).toContain('## Architectural Decisions');
  });

  it('should create opensprint/ at project root, not inside openspec/', async () => {
    const cmd = new InitCommand({ tools: 'claude', force: true });
    await cmd.execute(testDir);

    // opensprint/ should NOT be inside openspec/
    expect(fsSync.existsSync(path.join(testDir, 'openspec', 'opensprint'))).toBe(false);
    // Should be at root level
    expect(fsSync.existsSync(path.join(testDir, 'opensprint'))).toBe(true);
  });

  it('should not overwrite existing DECISION-MAP.md', async () => {
    // Create existing opensprint structure with custom DECISION-MAP.md
    const opensprintPath = path.join(testDir, 'opensprint');
    await fs.mkdir(path.join(opensprintPath, 'driver-specs'), { recursive: true });
    await fs.mkdir(path.join(opensprintPath, 'ADRs'), { recursive: true });
    await fs.writeFile(
      path.join(opensprintPath, 'DECISION-MAP.md'),
      '# Existing Decision Map\nCustom content here'
    );

    const cmd = new InitCommand({ tools: 'claude', force: true });
    await cmd.execute(testDir);

    // Should preserve existing DECISION-MAP.md
    const mapContent = await fs.readFile(
      path.join(opensprintPath, 'DECISION-MAP.md'),
      'utf-8'
    );
    expect(mapContent).toContain('Custom content here');
  });
});
