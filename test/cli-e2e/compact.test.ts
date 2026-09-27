import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { runCLI } from '../helpers/run-cli.js';

describe('opensprint compact (e2e)', () => {
  let projectRoot: string;

  const squadDir = () => path.join(projectRoot, 'opensprint', 'squad');
  const manifest = () => path.join(squadDir(), '.manifest.json');
  const devView = () => path.join(squadDir(), 'dev.md');

  beforeEach(() => {
    projectRoot = path.join(os.tmpdir(), `openspec-compact-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(projectRoot, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'opensprint', 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'opensprint', 'ADRs'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
    fs.writeFileSync(
      path.join(projectRoot, 'opensprint', 'driver-specs', 'DS-A.md'),
      '---\nid: DS-A\ntype: product\nstatus: active\ncreated: 2026-01-01\nhats: [product]\nrole: goal\n---\n\nA constraint.\n'
    );
    fs.writeFileSync(
      path.join(projectRoot, 'opensprint', 'ADRs', 'DEC-001.md'),
      '---\nid: DEC-001\nstatus: accepted\ndepends-on:\n  - DS-A\ncreated: 2026-01-01\ndepth: 0\nhats: [dev]\n---\n\n## Question\n\nA question?\n'
    );
  });

  afterEach(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  it('check exits non-zero when nothing has been sealed', async () => {
    const r = await runCLI(['compact', 'check'], { cwd: projectRoot });
    expect(r.exitCode).toBe(1);
    expect(r.stdout).toContain('unsealed');
  });

  it('check does not write anything', async () => {
    await runCLI(['compact', 'check'], { cwd: projectRoot });
    expect(fs.existsSync(manifest())).toBe(false);
    expect(fs.existsSync(squadDir())).toBe(false);
  });

  it('plan does not write anything', async () => {
    await runCLI(['compact', 'plan'], { cwd: projectRoot });
    expect(fs.existsSync(manifest())).toBe(false);
    expect(fs.existsSync(squadDir())).toBe(false);
  });

  it('plan --json emits only JSON on stdout', async () => {
    const r = await runCLI(['compact', 'plan', '--json'], { cwd: projectRoot });
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(Array.isArray(parsed.sections)).toBe(true);
    expect(parsed.sections.length).toBeGreaterThan(0);
  });

  it('check --json emits only JSON and still exits non-zero', async () => {
    const r = await runCLI(['compact', 'check', '--json'], { cwd: projectRoot });
    expect(r.exitCode).toBe(1);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.ok).toBe(false);
  });

  it('plan names the records feeding each section', async () => {
    const r = await runCLI(['compact', 'plan', '--json'], { cwd: projectRoot });
    const parsed = JSON.parse(r.stdout);
    const devDecisions = parsed.sections.find(
      (s: { hat: string; section: string }) => s.hat === 'dev' && s.section === 'decisions'
    );
    expect(devDecisions.inputs.map((i: { id: string }) => i.id)).toEqual(['DEC-001']);
    expect(devDecisions.inputs[0].path).toBe(path.join('opensprint', 'ADRs', 'DEC-001.md'));
  });

  it('seal writes the manifest', async () => {
    const r = await runCLI(['compact', 'seal'], { cwd: projectRoot });
    expect(r.exitCode).toBe(0);
    expect(fs.existsSync(manifest())).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(manifest(), 'utf-8'));
    expect(parsed.version).toBe(1);
    expect(parsed.entries.length).toBe(16); // 4 hats x 4 sections
  });

  it('seal reports a hat that has records but no view', async () => {
    const r = await runCLI(['compact', 'seal'], { cwd: projectRoot });
    expect(r.stdout).toContain('dev');
    expect(r.stdout).toContain('no view');
  });

  it('check passes once views are rendered and sealed', async () => {
    fs.mkdirSync(squadDir(), { recursive: true });
    for (const hat of ['product', 'maintainer', 'dev', 'devops']) {
      fs.writeFileSync(path.join(squadDir(), `${hat}.md`), `# ${hat}\n`);
    }
    await runCLI(['compact', 'seal'], { cwd: projectRoot });
    const r = await runCLI(['compact', 'check'], { cwd: projectRoot });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('fresh');
  });

  it('check fails and names the tampered section after a hand edit', async () => {
    fs.mkdirSync(squadDir(), { recursive: true });
    for (const hat of ['product', 'maintainer', 'dev', 'devops']) {
      fs.writeFileSync(path.join(squadDir(), `${hat}.md`), `# ${hat}\n`);
    }
    await runCLI(['compact', 'seal'], { cwd: projectRoot });
    fs.writeFileSync(devView(), '# dev\n\nedited by hand\n');

    const r = await runCLI(['compact', 'check'], { cwd: projectRoot });
    expect(r.exitCode).toBe(1);
    expect(r.stdout).toContain('tampered');
    expect(r.stdout).toContain('/opsp:explore');
  });

  it('check fails after a record changes, and plan names it', async () => {
    fs.mkdirSync(squadDir(), { recursive: true });
    for (const hat of ['product', 'maintainer', 'dev', 'devops']) {
      fs.writeFileSync(path.join(squadDir(), `${hat}.md`), `# ${hat}\n`);
    }
    await runCLI(['compact', 'seal'], { cwd: projectRoot });
    fs.writeFileSync(
      path.join(projectRoot, 'opensprint', 'ADRs', 'DEC-001.md'),
      '---\nid: DEC-001\nstatus: accepted\ndepends-on:\n  - DS-A\ncreated: 2026-01-01\ndepth: 0\nhats: [dev]\n---\n\n## Question\n\nA different question?\n'
    );

    const check = await runCLI(['compact', 'check'], { cwd: projectRoot });
    expect(check.exitCode).toBe(1);
    expect(check.stdout).toContain('stale');

    const plan = await runCLI(['compact', 'plan', '--json'], { cwd: projectRoot });
    const parsed = JSON.parse(plan.stdout);
    const stale = parsed.sections.filter((s: { state: string }) => s.state === 'stale');
    expect(stale.some((s: { modified: string[] }) => s.modified.includes('DEC-001'))).toBe(true);
  });

  it('reports an unassigned record rather than dropping it', async () => {
    fs.writeFileSync(
      path.join(projectRoot, 'opensprint', 'driver-specs', 'DS-ORPHAN.md'),
      '---\nid: DS-ORPHAN\ntype: product\nstatus: active\ncreated: 2026-01-01\n---\n\nNo hat.\n'
    );
    const r = await runCLI(['compact', 'plan', '--json'], { cwd: projectRoot });
    expect(JSON.parse(r.stdout).unassigned).toContain('DS-ORPHAN');
  });

  it('fails clearly outside a project with a surrogate', async () => {
    const empty = path.join(os.tmpdir(), `openspec-compact-empty-${Date.now()}`);
    fs.mkdirSync(empty, { recursive: true });
    try {
      const r = await runCLI(['compact', 'check'], { cwd: empty });
      expect(r.exitCode).toBe(1);
      expect(`${r.stdout}${r.stderr}`).toContain('opensprint');
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe('opensprint compact loops (e2e)', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = path.join(os.tmpdir(), `openspec-loops-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(path.join(projectRoot, 'openspec'), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'opensprint', 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'opensprint', 'ADRs'), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'src'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
    fs.writeFileSync(
      path.join(projectRoot, 'opensprint', 'driver-specs', 'DS-A.md'),
      '---\nid: DS-A\ntype: product\nstatus: active\ncreated: 2026-01-01\nhats: [product]\nrole: goal\n---\n\nA constraint.\n'
    );
    fs.writeFileSync(
      path.join(projectRoot, 'opensprint', 'ADRs', 'DEC-001.md'),
      '---\nid: DEC-001\nstatus: accepted\ndepends-on:\n  - DS-A\ncreated: 2026-01-01\ndepth: 0\nhats: [dev]\n---\n\n## Question\n\nQ\n'
    );
  });

  afterEach(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  it('reports an unguarded decision and exits zero', async () => {
    const r = await runCLI(['compact', 'loops'], { cwd: projectRoot });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('decision-unguarded');
    expect(r.stdout).toContain('DEC-001');
  });

  it('exits zero when there are no loops', async () => {
    fs.writeFileSync(path.join(projectRoot, 'src', 'a.test.ts'), '// guards DEC-001\n');
    const r = await runCLI(['compact', 'loops'], { cwd: projectRoot });
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain('No open loops');
  });

  it('names both triage workflows when loops exist', async () => {
    const r = await runCLI(['compact', 'loops'], { cwd: projectRoot });
    expect(r.stdout).toContain('/opsp:explore');
    expect(r.stdout).toContain('/opsp:propose');
    expect(r.stdout).toMatch(/no separate[\s\S]*remediation workflow/);
  });

  it('does not print the triage line when there are no loops', async () => {
    fs.writeFileSync(path.join(projectRoot, 'src', 'a.test.ts'), '// guards DEC-001\n');
    const r = await runCLI(['compact', 'loops'], { cwd: projectRoot });
    expect(r.stdout).toContain('No open loops');
    expect(r.stdout).not.toContain('/opsp:propose');
  });

  it('--json carries the loops', async () => {
    const r = await runCLI(['compact', 'loops', '--json'], { cwd: projectRoot });
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.openLoops.some((l: { kind: string }) => l.kind === 'decision-unguarded')).toBe(true);
  });

  it('plan --json carries the loops for the renderer', async () => {
    const r = await runCLI(['compact', 'plan', '--json'], { cwd: projectRoot });
    const parsed = JSON.parse(r.stdout);
    expect(Array.isArray(parsed.openLoops)).toBe(true);
    expect(parsed.openLoops.length).toBeGreaterThan(0);
  });

  it('check ignores open loops and exits zero once views are sealed', async () => {
    const squad = path.join(projectRoot, 'opensprint', 'squad');
    fs.mkdirSync(squad, { recursive: true });
    for (const hat of ['product', 'maintainer', 'dev', 'devops']) {
      fs.writeFileSync(path.join(squad, `${hat}.md`), `# ${hat}\n`);
    }
    await runCLI(['compact', 'seal'], { cwd: projectRoot });

    // an unguarded decision is still outstanding
    const loops = await runCLI(['compact', 'loops', '--json'], { cwd: projectRoot });
    expect(JSON.parse(loops.stdout).openLoops.length).toBeGreaterThan(0);

    // ...and check does not care: a gap is backlog, not a contradiction
    const check = await runCLI(['compact', 'check'], { cwd: projectRoot });
    expect(check.exitCode).toBe(0);
  });
});
