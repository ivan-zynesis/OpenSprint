/**
 * Decision Map Generator
 *
 * Programmatic generation of DECISION-MAP.md by reading all decision records
 * and driver specs from the opensprint/ directory.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface DriverSpecEntry {
  id: string;
  type: string;
  status: string;
}

export interface DecisionEntry {
  id: string;
  status: string;
  dependsOn: string[];
  depth: number;
  /** First line of the Question section, for summary display */
  summary: string;
}

export interface TreeNode {
  id: string;
  isDriverSpec: boolean;
  children: string[];
  blastRadius: number;
  depth: number;
}

// ═══════════════════════════════════════════════════════════
// Parsing
// ═══════════════════════════════════════════════════════════

/**
 * Parses YAML frontmatter from a markdown file.
 * Returns null if no valid frontmatter is found.
 */
function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  try {
    return parseYaml(match[1]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extracts the first meaningful line from the ## Question section.
 */
function extractQuestionSummary(content: string): string {
  const questionMatch = content.match(/## Question\s*\n+(.+)/);
  if (questionMatch) {
    return questionMatch[1].replace(/<!--.*?-->/g, '').trim().slice(0, 80);
  }
  return '';
}

/**
 * Reads all driver spec entries from opensprint/driver-specs/.
 */
export function readDriverSpecs(opensprintDir: string): DriverSpecEntry[] {
  const dir = path.join(opensprintDir, 'driver-specs');
  if (!fs.existsSync(dir)) return [];

  const entries: DriverSpecEntry[] = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.md')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm || !fm.id) continue;

    entries.push({
      id: fm.id as string,
      type: (fm.type as string) || 'unknown',
      status: (fm.status as string) || 'active',
    });
  }
  return entries;
}

/**
 * Reads all decision record entries from opensprint/ADRs/.
 */
export function readDecisionRecords(opensprintDir: string): DecisionEntry[] {
  const dir = path.join(opensprintDir, 'ADRs');
  if (!fs.existsSync(dir)) return [];

  const entries: DecisionEntry[] = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.md')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm || !fm.id) continue;

    const dependsOn = Array.isArray(fm['depends-on'])
      ? (fm['depends-on'] as string[])
      : [];

    entries.push({
      id: fm.id as string,
      status: (fm.status as string) || 'accepted',
      dependsOn,
      depth: typeof fm.depth === 'number' ? fm.depth : 0,
      summary: extractQuestionSummary(content),
    });
  }
  return entries;
}

// ═══════════════════════════════════════════════════════════
// Tree Construction
// ═══════════════════════════════════════════════════════════

/**
 * Builds the decision tree from driver specs and decision records.
 * Only includes active/accepted entries.
 */
export function buildTree(
  driverSpecs: DriverSpecEntry[],
  decisions: DecisionEntry[]
): Map<string, TreeNode> {
  const nodes = new Map<string, TreeNode>();

  // Add active driver specs as root nodes
  for (const ds of driverSpecs) {
    if (ds.status !== 'active') continue;
    nodes.set(ds.id, {
      id: ds.id,
      isDriverSpec: true,
      children: [],
      blastRadius: 0,
      depth: -1, // driver specs sit above depth 0
    });
  }

  // Add active/accepted decisions
  const activeDecisions = decisions.filter(
    d => d.status === 'active' || d.status === 'accepted'
  );

  for (const dec of activeDecisions) {
    nodes.set(dec.id, {
      id: dec.id,
      isDriverSpec: false,
      children: [],
      blastRadius: 0,
      depth: dec.depth,
    });
  }

  // Build parent → child edges
  for (const dec of activeDecisions) {
    for (const parentId of dec.dependsOn) {
      const parent = nodes.get(parentId);
      if (parent) {
        parent.children.push(dec.id);
      }
    }
  }

  // Calculate blast radii
  calculateBlastRadii(nodes);

  return nodes;
}

/**
 * Calculates blast radius for each node — the count of all transitive
 * downstream decisions.
 */
function calculateBlastRadii(nodes: Map<string, TreeNode>): void {
  // For each node, count all transitive descendants
  for (const node of nodes.values()) {
    node.blastRadius = countDescendants(node.id, nodes);
  }
}

/**
 * Counts all transitive descendants of a node (excluding the node itself).
 * Only counts decision nodes (not driver specs).
 */
function countDescendants(nodeId: string, nodes: Map<string, TreeNode>): number {
  const visited = new Set<string>();

  function walk(id: string): void {
    const node = nodes.get(id);
    if (!node) return;
    for (const childId of node.children) {
      if (!visited.has(childId)) {
        const child = nodes.get(childId);
        if (child && !child.isDriverSpec) {
          visited.add(childId);
        }
        walk(childId);
      }
    }
  }

  walk(nodeId);
  return visited.size;
}

// ═══════════════════════════════════════════════════════════
// Rendering
// ═══════════════════════════════════════════════════════════

/**
 * Renders the decision tree as ASCII art.
 */
export function renderTree(
  nodes: Map<string, TreeNode>,
  driverSpecs: DriverSpecEntry[],
  decisions: DecisionEntry[]
): string {
  if (nodes.size === 0) {
    return '```\n(empty)\n```';
  }

  // Find root driver specs (those that have children)
  const activeSpecs = driverSpecs.filter(ds => ds.status === 'active');
  const rootIds = activeSpecs
    .filter(ds => {
      const node = nodes.get(ds.id);
      return node && node.children.length > 0;
    })
    .map(ds => ds.id);

  // Also find orphan decisions (depth 0 with no parent in tree)
  if (rootIds.length === 0 && decisions.length > 0) {
    return '```\n(no active decisions linked to driver specs)\n```';
  }

  const lines: string[] = ['```'];

  // Render each root
  for (let i = 0; i < rootIds.length; i++) {
    const rootId = rootIds[i];
    const spec = activeSpecs.find(ds => ds.id === rootId);
    const node = nodes.get(rootId)!;

    lines.push(`${rootId} (${spec?.type || 'unknown'})`);
    renderChildren(node, nodes, decisions, lines, '');

    if (i < rootIds.length - 1) {
      lines.push('');
    }
  }

  lines.push('```');
  return lines.join('\n');
}

function renderChildren(
  parent: TreeNode,
  nodes: Map<string, TreeNode>,
  decisions: DecisionEntry[],
  lines: string[],
  prefix: string
): void {
  const children = parent.children
    .map(id => nodes.get(id))
    .filter((n): n is TreeNode => n !== undefined)
    .sort((a, b) => a.id.localeCompare(b.id));

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const isLast = i === children.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';

    const dec = decisions.find(d => d.id === child.id);
    const summary = dec?.summary ? `: ${dec.summary}` : '';
    const depthLabel = child.depth === 0 ? 'root' : child.children.length > 0 ? 'branch' : 'leaf';

    lines.push(`${prefix}${connector}${child.id}${summary}`);
    lines.push(`${prefix}${childPrefix}[${depthLabel}] [blast: ${child.blastRadius}]`);

    if (child.children.length > 0) {
      renderChildren(child, nodes, decisions, lines, prefix + childPrefix);
    }
  }
}

/**
 * Renders the impact summary table.
 */
export function renderImpactTable(
  nodes: Map<string, TreeNode>,
  decisions: DecisionEntry[]
): string {
  const activeDecisions = decisions
    .filter(d => d.status === 'active' || d.status === 'accepted')
    .sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.id.localeCompare(b.id);
    });

  if (activeDecisions.length === 0) {
    return '| Decision | Depth | Depends On | Downstream | Blast |\n|----------|-------|------------|------------|-------|';
  }

  const header = '| Decision | Depth | Depends On | Downstream | Blast |\n|----------|-------|------------|------------|-------|';
  const rows = activeDecisions.map(dec => {
    const node = nodes.get(dec.id);
    const downstream = node
      ? node.children.filter(id => {
          const child = nodes.get(id);
          return child && !child.isDriverSpec;
        }).join(', ') || '—'
      : '—';
    const blast = node?.blastRadius ?? 0;
    const dependsOn = dec.dependsOn.join(', ') || '—';

    return `| ${dec.id} | ${dec.depth} | ${dependsOn} | ${downstream} | ${blast} |`;
  });

  return [header, ...rows].join('\n');
}

// ═══════════════════════════════════════════════════════════
// Generation
// ═══════════════════════════════════════════════════════════

/**
 * Generates the full DECISION-MAP.md content from the opensprint/ directory.
 */
export function generateDecisionMap(opensprintDir: string): string {
  const driverSpecs = readDriverSpecs(opensprintDir);
  const decisions = readDecisionRecords(opensprintDir);
  const tree = buildTree(driverSpecs, decisions);

  const treeContent = renderTree(tree, driverSpecs, decisions);
  const tableContent = renderImpactTable(tree, decisions);

  return `# Decision Map

## Decision Tree

${treeContent}

## Impact Summary

${tableContent}
`;
}

/**
 * Regenerates DECISION-MAP.md in the given opensprint directory.
 * Reads all decision records and driver specs, then writes the updated map.
 */
export function regenerateDecisionMap(opensprintDir: string): void {
  const content = generateDecisionMap(opensprintDir);
  const mapPath = path.join(opensprintDir, 'DECISION-MAP.md');
  fs.writeFileSync(mapPath, content, 'utf-8');
}
