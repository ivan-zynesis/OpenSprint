import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  resolveSchema,
  listSchemas,
  SchemaLoadError,
} from '../../../src/core/artifact-graph/resolver.js';
import { loadTemplate } from '../../../src/core/artifact-graph/instruction-loader.js';

describe('schema extends', () => {
  let tempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `openspec-extends-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should resolve built-in sprint-driven schema with extends', () => {
    const schema = resolveSchema('sprint-driven');

    expect(schema.name).toBe('sprint-driven');
    expect(schema.extends).toBe('spec-driven');
    // Should contain both parent (spec-driven) and child (sprint-driven) artifacts
    const artifactIds = schema.artifacts.map(a => a.id);
    // Parent artifacts
    expect(artifactIds).toContain('proposal');
    expect(artifactIds).toContain('specs');
    expect(artifactIds).toContain('design');
    expect(artifactIds).toContain('tasks');
    // Child artifacts
    expect(artifactIds).toContain('driver-spec');
    expect(artifactIds).toContain('decision-record');
    expect(artifactIds).toContain('decision-map');
  });

  it('should allow child artifacts to require parent artifact IDs', () => {
    const schema = resolveSchema('sprint-driven');
    const decisionRecord = schema.artifacts.find(a => a.id === 'decision-record');

    expect(decisionRecord).toBeDefined();
    expect(decisionRecord!.requires).toContain('driver-spec');
  });

  it('should preserve child apply phase over parent', () => {
    const schema = resolveSchema('sprint-driven');

    expect(schema.apply).toBeDefined();
    expect(schema.apply!.requires).toContain('tasks');
  });

  it('should list sprint-driven in available schemas', () => {
    const schemas = listSchemas();
    expect(schemas).toContain('sprint-driven');
    expect(schemas).toContain('spec-driven');
  });

  it('should merge parent and child artifacts with child winning on ID collision', () => {
    // Create a child schema that overrides a parent artifact
    const projectRoot = path.join(tempDir, 'project');
    const childSchemaDir = path.join(projectRoot, 'openspec', 'schemas', 'override-test');
    fs.mkdirSync(path.join(childSchemaDir, 'templates'), { recursive: true });

    const childSchema = `
name: override-test
version: 1
extends: spec-driven
artifacts:
  - id: proposal
    generates: proposal.md
    description: Overridden proposal
    template: proposal.md
  - id: extra
    generates: extra.md
    description: Extra artifact
    template: extra.md
    requires:
      - proposal
`;
    fs.writeFileSync(path.join(childSchemaDir, 'schema.yaml'), childSchema);

    const schema = resolveSchema('override-test', projectRoot);
    const proposal = schema.artifacts.find(a => a.id === 'proposal');

    expect(proposal).toBeDefined();
    expect(proposal!.description).toBe('Overridden proposal'); // child wins
  });

  it('should reject deep inheritance chains (multi-level extends)', () => {
    const projectRoot = path.join(tempDir, 'project');

    // Create a schema that extends sprint-driven (which extends spec-driven)
    const deepSchemaDir = path.join(projectRoot, 'openspec', 'schemas', 'deep-child');
    fs.mkdirSync(path.join(deepSchemaDir, 'templates'), { recursive: true });

    const deepSchema = `
name: deep-child
version: 1
extends: sprint-driven
artifacts:
  - id: deep-artifact
    generates: deep.md
    description: Deep artifact
    template: deep.md
`;
    fs.writeFileSync(path.join(deepSchemaDir, 'schema.yaml'), deepSchema);

    expect(() => resolveSchema('deep-child', projectRoot)).toThrow(
      /Only single-level extends is supported/
    );
  });

  describe('template fallback', () => {
    it('should load child-specific template from child schema dir', () => {
      // sprint-driven has its own templates for driver-spec, decision-record, etc.
      const template = loadTemplate('sprint-driven', 'driver-spec.md');
      expect(template).toContain('DS-<KEBAB-NAME>');
    });

    it('should fall back to parent template for inherited artifacts', () => {
      // sprint-driven inherits proposal from spec-driven
      // sprint-driven does NOT have its own proposal.md template
      // It should fall back to spec-driven's proposal.md
      const template = loadTemplate('sprint-driven', 'proposal.md');
      expect(template).toContain('Why');
      expect(template).toContain('Capabilities');
    });
  });
});
