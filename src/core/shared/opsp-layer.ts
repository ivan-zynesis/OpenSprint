/**
 * The opsp layer for one tool — every opsp skill, every opsp command, and the
 * board template the kanban workflow renders.
 *
 * `init` wrote this inline and `update` did not write it at all, so an
 * adopter who upgraded kept whatever opsp workflows their first `init`
 * produced. One writer, called by both, means a workflow added to the
 * registry reaches every project on its next `update`.
 */

import * as path from 'node:path';
import { FileSystemUtils } from '../../utils/file-system.js';
import { transformToHyphenCommands } from '../../utils/command-references.js';
import { generateCommands, CommandAdapterRegistry } from '../command-generation/index.js';
import { BOARD_TEMPLATE_FILE, renderBoardTemplate } from '../kanban-board.js';
import { KANBAN_TEMPLATE_PLACEHOLDER } from '../templates/workflows/opsp-kanban.js';
import { generateSkillContent, getOpspCommandContents, getOpspSkillTemplates } from './skill-generation.js';

/** The kanban skill's directory, which also holds its template in every delivery mode. */
export const KANBAN_SKILL_DIR = 'opensprint-kanban';

export interface OpspLayerTool {
  value: string;
  skillsDir: string;
}

export interface OpspLayerOptions {
  skills: boolean;
  commands: boolean;
  /** Embedded in each skill's `generatedBy`. */
  version: string;
}

/**
 * Where the board template is written for a tool, relative to the project
 * root, with `/` separators — it is printed into a shell playbook.
 */
export function kanbanTemplatePath(tool: OpspLayerTool): string {
  return path.posix.join(tool.skillsDir.split(path.sep).join('/'), 'skills', KANBAN_SKILL_DIR, BOARD_TEMPLATE_FILE);
}

/**
 * Writes the opsp layer for one tool.
 *
 * Skills when skills are delivered, commands when commands are, and the board
 * template whenever either is: the command's render playbook reads it as much
 * as the skill's does. Returns false where commands were wanted and the tool
 * has no command adapter.
 */
export async function writeOpspLayer(
  projectPath: string,
  tool: OpspLayerTool,
  options: OpspLayerOptions
): Promise<{ commandsWritten: boolean }> {
  const templatePath = kanbanTemplatePath(tool);
  const substitute = (text: string) => text.split(KANBAN_TEMPLATE_PLACEHOLDER).join(templatePath);
  const hyphenate = tool.value === 'opencode' || tool.value === 'pi';

  if (options.skills) {
    const skillsDir = path.join(projectPath, tool.skillsDir, 'skills');
    for (const { template, dirName } of getOpspSkillTemplates()) {
      const transform = (instructions: string) =>
        substitute(hyphenate ? transformToHyphenCommands(instructions) : instructions);
      await FileSystemUtils.writeFile(
        path.join(skillsDir, dirName, 'SKILL.md'),
        generateSkillContent(template, options.version, transform)
      );
    }
  }

  let commandsWritten = true;
  if (options.commands) {
    const adapter = CommandAdapterRegistry.get(tool.value);
    if (adapter === undefined) {
      commandsWritten = false;
    } else {
      const contents = getOpspCommandContents().map((content) => ({ ...content, body: substitute(content.body) }));
      for (const cmd of generateCommands(contents, adapter)) {
        // Commands are generated in the opsx layout; the opsp layer lives beside it.
        const opspPath = cmd.path.replace(/opsx/g, 'opsp');
        const commandFile = path.isAbsolute(opspPath) ? opspPath : path.join(projectPath, opspPath);
        await FileSystemUtils.writeFile(commandFile, cmd.fileContent);
      }
    }
  }

  if (options.skills || options.commands) {
    await FileSystemUtils.writeFile(
      path.join(projectPath, tool.skillsDir, 'skills', KANBAN_SKILL_DIR, BOARD_TEMPLATE_FILE),
      renderBoardTemplate()
    );
  }

  return { commandsWritten };
}
