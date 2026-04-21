/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxProposeCommandTemplate,
  getDriverSkillTemplate,
  getDecideSkillTemplate,
  getTreeSkillTemplate,
  getRebuildAssessSkillTemplate,
  getOpspDriverCommandTemplate,
  getOpspDecideCommandTemplate,
  getOpspTreeCommandTemplate,
  getOpspRebuildAssessCommandTemplate,
  getOpspExploreSkillTemplate,
  getOpspProposeSkillTemplate,
  getOpspApplySkillTemplate,
  getOpspArchiveSkillTemplate,
  getOpspReviewSkillTemplate,
  getOpspReexploreSkillTemplate,
  getOpspExploreCommandTemplate,
  getOpspProposeCommandTemplate,
  getOpspApplyCommandTemplate,
  getOpspArchiveCommandTemplate,
  getOpspReviewCommandTemplate,
  getOpspReexploreCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

/**
 * Skill template with directory name and workflow ID mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpsxExploreCommandTemplate>;
  id: string;
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 */
export function getSkillTemplates(workflowFilter?: readonly string[]): SkillTemplateEntry[] {
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'openspec-explore', workflowId: 'explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'openspec-new-change', workflowId: 'new' },
    { template: getContinueChangeSkillTemplate(), dirName: 'openspec-continue-change', workflowId: 'continue' },
    { template: getApplyChangeSkillTemplate(), dirName: 'openspec-apply-change', workflowId: 'apply' },
    { template: getFfChangeSkillTemplate(), dirName: 'openspec-ff-change', workflowId: 'ff' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'openspec-sync-specs', workflowId: 'sync' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'openspec-archive-change', workflowId: 'archive' },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'openspec-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'openspec-verify-change', workflowId: 'verify' },
    { template: getOnboardSkillTemplate(), dirName: 'openspec-onboard', workflowId: 'onboard' },
    { template: getOpsxProposeSkillTemplate(), dirName: 'openspec-propose', workflowId: 'propose' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.workflowId));
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 */
export function getCommandTemplates(workflowFilter?: readonly string[]): CommandTemplateEntry[] {
  const all: CommandTemplateEntry[] = [
    { template: getOpsxExploreCommandTemplate(), id: 'explore' },
    { template: getOpsxNewCommandTemplate(), id: 'new' },
    { template: getOpsxContinueCommandTemplate(), id: 'continue' },
    { template: getOpsxApplyCommandTemplate(), id: 'apply' },
    { template: getOpsxFfCommandTemplate(), id: 'ff' },
    { template: getOpsxSyncCommandTemplate(), id: 'sync' },
    { template: getOpsxArchiveCommandTemplate(), id: 'archive' },
    { template: getOpsxBulkArchiveCommandTemplate(), id: 'bulk-archive' },
    { template: getOpsxVerifyCommandTemplate(), id: 'verify' },
    { template: getOpsxOnboardCommandTemplate(), id: 'onboard' },
    { template: getOpsxProposeCommandTemplate(), id: 'propose' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 */
export function getCommandContents(workflowFilter?: readonly string[]): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

// ═══════════════════════════════════════════════════════════
// OPSP (sprint-driven) skill and command templates
// ═══════════════════════════════════════════════════════════

/**
 * OPSP workflow IDs for the sprint-driven schema.
 */
export const OPSP_WORKFLOW_IDS = [
  // Utility commands
  'driver', 'decide', 'tree', 'rebuild-assess',
  // Lifecycle commands
  'opsp-explore', 'opsp-propose', 'opsp-apply', 'opsp-archive', 'opsp-review', 'opsp-reexplore',
] as const;

/**
 * Gets OPSP skill templates (sprint-driven schema only).
 */
export function getOpspSkillTemplates(): SkillTemplateEntry[] {
  return [
    // Utility skills
    { template: getDriverSkillTemplate(), dirName: 'opensprint-driver', workflowId: 'driver' },
    { template: getDecideSkillTemplate(), dirName: 'opensprint-decide', workflowId: 'decide' },
    { template: getTreeSkillTemplate(), dirName: 'opensprint-tree', workflowId: 'tree' },
    { template: getRebuildAssessSkillTemplate(), dirName: 'opensprint-rebuild-assess', workflowId: 'rebuild-assess' },
    // Lifecycle skills
    { template: getOpspExploreSkillTemplate(), dirName: 'opensprint-explore', workflowId: 'opsp-explore' },
    { template: getOpspProposeSkillTemplate(), dirName: 'opensprint-propose', workflowId: 'opsp-propose' },
    { template: getOpspApplySkillTemplate(), dirName: 'opensprint-apply', workflowId: 'opsp-apply' },
    { template: getOpspArchiveSkillTemplate(), dirName: 'opensprint-archive', workflowId: 'opsp-archive' },
    { template: getOpspReviewSkillTemplate(), dirName: 'opensprint-review', workflowId: 'opsp-review' },
    { template: getOpspReexploreSkillTemplate(), dirName: 'opensprint-reexplore', workflowId: 'opsp-reexplore' },
  ];
}

/**
 * Gets OPSP command templates (sprint-driven schema only).
 */
export function getOpspCommandTemplates(): CommandTemplateEntry[] {
  return [
    // Utility commands
    { template: getOpspDriverCommandTemplate(), id: 'driver' },
    { template: getOpspDecideCommandTemplate(), id: 'decide' },
    { template: getOpspTreeCommandTemplate(), id: 'tree' },
    { template: getOpspRebuildAssessCommandTemplate(), id: 'rebuild-assess' },
    // Lifecycle commands
    { template: getOpspExploreCommandTemplate(), id: 'opsp-explore' },
    { template: getOpspProposeCommandTemplate(), id: 'opsp-propose' },
    { template: getOpspApplyCommandTemplate(), id: 'opsp-apply' },
    { template: getOpspArchiveCommandTemplate(), id: 'opsp-archive' },
    { template: getOpspReviewCommandTemplate(), id: 'opsp-review' },
    { template: getOpspReexploreCommandTemplate(), id: 'opsp-reexplore' },
  ];
}

/**
 * Converts OPSP command templates to CommandContent array (sprint-driven schema only).
 */
export function getOpspCommandContents(): CommandContent[] {
  const commandTemplates = getOpspCommandTemplates();
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The OpenSpec version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author || 'openspec'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
