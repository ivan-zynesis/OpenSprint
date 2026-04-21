import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  readDriverSpecs,
  readDecisionRecords,
  buildTree,
  renderTree,
  renderImpactTable,
  generateDecisionMap,
  regenerateDecisionMap,
} from '../../src/core/decision-map.js';

describe('decision-map', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `openspec-decision-map-test-${Date.now()}`);
    fs.mkdirSync(path.join(tempDir, 'driver-specs'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'ADRs'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function writeDriverSpec(id: string, type: string, status = 'active') {
    fs.writeFileSync(
      path.join(tempDir, 'driver-specs', `${id}.md`),
      `---\nid: ${id}\ntype: ${type}\nstatus: ${status}\ncreated: 2026-01-01\n---\n\nSpec content for ${id}\n`
    );
  }

  function writeDecision(
    id: string,
    dependsOn: string[],
    depth: number,
    status = 'accepted',
    question = 'What architecture should we use?'
  ) {
    const depsYaml = dependsOn.map(d => `  - ${d}`).join('\n');
    fs.writeFileSync(
      path.join(tempDir, 'ADRs', `${id}.md`),
      `---\nid: ${id}\nstatus: ${status}\ndepends-on:\n${depsYaml}\ncreated: 2026-01-01\ndepth: ${depth}\n---\n\n## Question\n\n${question}\n\n## Operator Decision\n\nSome decision\n`
    );
  }

  describe('readDriverSpecs', () => {
    it('should read active driver specs', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDriverSpec('DS-COMPLIANCE', 'legal');

      const specs = readDriverSpecs(tempDir);
      expect(specs).toHaveLength(2);
      expect(specs[0].id).toBe('DS-COMPLIANCE');
      expect(specs[1].id).toBe('DS-PRICING');
    });

    it('should return empty array if directory does not exist', () => {
      const specs = readDriverSpecs(path.join(tempDir, 'nonexistent'));
      expect(specs).toEqual([]);
    });
  });

  describe('readDecisionRecords', () => {
    it('should read decision records with depends-on', () => {
      writeDecision('DEC-001', ['DS-PRICING'], 0);
      writeDecision('DEC-002', ['DEC-001'], 1);

      const decisions = readDecisionRecords(tempDir);
      expect(decisions).toHaveLength(2);
      expect(decisions[0].id).toBe('DEC-001');
      expect(decisions[0].dependsOn).toEqual(['DS-PRICING']);
      expect(decisions[0].depth).toBe(0);
      expect(decisions[1].id).toBe('DEC-002');
      expect(decisions[1].dependsOn).toEqual(['DEC-001']);
      expect(decisions[1].depth).toBe(1);
    });

    it('should extract question summary', () => {
      writeDecision('DEC-001', ['DS-PRICING'], 0, 'accepted', 'Should we use serverless or containers?');

      const decisions = readDecisionRecords(tempDir);
      expect(decisions[0].summary).toBe('Should we use serverless or containers?');
    });
  });

  describe('buildTree', () => {
    it('should build tree with driver specs as roots', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      const root = tree.get('DS-PRICING');
      expect(root).toBeDefined();
      expect(root!.children).toContain('DEC-001');
      expect(root!.isDriverSpec).toBe(true);
    });

    it('should exclude superseded decisions', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0, 'superseded');
      writeDecision('DEC-002', ['DS-PRICING'], 0, 'accepted');

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      expect(tree.has('DEC-001')).toBe(false);
      expect(tree.has('DEC-002')).toBe(true);
    });

    it('should exclude deprecated decisions', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0, 'deprecated');

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      expect(tree.has('DEC-001')).toBe(false);
    });
  });

  describe('blast radius', () => {
    it('should calculate 0 for leaf decisions', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      expect(tree.get('DEC-001')!.blastRadius).toBe(0);
    });

    it('should calculate transitive downstream count', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);
      writeDecision('DEC-002', ['DEC-001'], 1);
      writeDecision('DEC-003', ['DEC-002'], 2);

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      expect(tree.get('DEC-001')!.blastRadius).toBe(2); // DEC-002 + DEC-003
      expect(tree.get('DEC-002')!.blastRadius).toBe(1); // DEC-003
      expect(tree.get('DEC-003')!.blastRadius).toBe(0); // leaf
    });

    it('should calculate blast radius for branching tree', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);
      writeDecision('DEC-002', ['DEC-001'], 1);
      writeDecision('DEC-003', ['DEC-001'], 1);
      writeDecision('DEC-004', ['DEC-002'], 2);

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      expect(tree.get('DEC-001')!.blastRadius).toBe(3); // DEC-002 + DEC-003 + DEC-004
      expect(tree.get('DEC-002')!.blastRadius).toBe(1); // DEC-004
      expect(tree.get('DEC-003')!.blastRadius).toBe(0); // leaf
      expect(tree.get('DEC-004')!.blastRadius).toBe(0); // leaf
    });

    it('should not count superseded decisions in blast radius', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);
      writeDecision('DEC-002', ['DEC-001'], 1, 'superseded');
      writeDecision('DEC-003', ['DEC-001'], 1, 'accepted');

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      // DEC-002 is superseded, so only DEC-003 counts
      expect(tree.get('DEC-001')!.blastRadius).toBe(1);
    });

    it('should calculate driver spec blast radius', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);
      writeDecision('DEC-002', ['DEC-001'], 1);

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);

      expect(tree.get('DS-PRICING')!.blastRadius).toBe(2); // DEC-001 + DEC-002
    });
  });

  describe('renderTree', () => {
    it('should render empty tree', () => {
      const tree = new Map();
      const result = renderTree(tree, [], []);
      expect(result).toContain('(empty)');
    });

    it('should render tree with structure', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0, 'accepted', 'serverless or containers?');

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);
      const result = renderTree(tree, specs, decisions);

      expect(result).toContain('DS-PRICING (product)');
      expect(result).toContain('DEC-001');
      expect(result).toContain('[blast: 0]');
    });
  });

  describe('renderImpactTable', () => {
    it('should render table sorted by depth then ID', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-002', ['DEC-001'], 1);
      writeDecision('DEC-001', ['DS-PRICING'], 0);

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);
      const result = renderImpactTable(tree, decisions);

      const lines = result.split('\n');
      // Header + separator + 2 data rows
      expect(lines.length).toBe(4);
      // DEC-001 should come before DEC-002 (depth 0 < depth 1)
      expect(lines[2]).toContain('DEC-001');
      expect(lines[3]).toContain('DEC-002');
    });

    it('should show correct downstream dependencies', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);
      writeDecision('DEC-002', ['DEC-001'], 1);

      const specs = readDriverSpecs(tempDir);
      const decisions = readDecisionRecords(tempDir);
      const tree = buildTree(specs, decisions);
      const result = renderImpactTable(tree, decisions);

      expect(result).toContain('DEC-002'); // downstream of DEC-001
    });
  });

  describe('generateDecisionMap', () => {
    it('should generate complete DECISION-MAP.md content', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);

      const content = generateDecisionMap(tempDir);
      expect(content).toContain('# Decision Map');
      expect(content).toContain('## Decision Tree');
      expect(content).toContain('## Impact Summary');
      expect(content).toContain('DS-PRICING');
      expect(content).toContain('DEC-001');
    });

    it('should generate empty map when no decisions exist', () => {
      const content = generateDecisionMap(tempDir);
      expect(content).toContain('# Decision Map');
      expect(content).toContain('(empty)');
    });
  });

  describe('regenerateDecisionMap', () => {
    it('should write DECISION-MAP.md to disk', () => {
      writeDriverSpec('DS-PRICING', 'product');
      writeDecision('DEC-001', ['DS-PRICING'], 0);

      regenerateDecisionMap(tempDir);

      const mapPath = path.join(tempDir, 'DECISION-MAP.md');
      expect(fs.existsSync(mapPath)).toBe(true);

      const content = fs.readFileSync(mapPath, 'utf-8');
      expect(content).toContain('# Decision Map');
      expect(content).toContain('DEC-001');
    });
  });
});
