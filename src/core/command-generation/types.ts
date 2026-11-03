/**
 * Command Generation Types
 *
 * Tool-agnostic interfaces for command generation.
 * These types separate "what to generate" from "how to format it".
 */

/**
 * Tool-agnostic command data.
 * Represents the content of a command without any tool-specific formatting.
 */
export interface CommandContent {
  /** Command identifier (e.g., 'explore', 'apply', 'new') */
  id: string;
  /** Human-readable name (e.g., 'OpenSpec Explore') */
  name: string;
  /** Brief description of command purpose */
  description: string;
  /** Grouping category (e.g., 'Workflow') */
  category: string;
  /** Array of tag strings */
  tags: string[];
  /** The command instruction content (body text) */
  body: string;
}

/**
 * Per-tool formatting strategy.
 * Each AI tool implements this interface to handle its specific file path
 * and frontmatter format requirements.
 */
export interface ToolCommandAdapter {
  /** Tool identifier matching AIToolOption.value (e.g., 'claude', 'cursor') */
  toolId: string;
  /**
   * Returns the file path for a command.
   * @param commandId - The command identifier (e.g., 'explore')
   * @returns Path from project root (e.g., '.claude/commands/opsx/explore.md').
   *          May be absolute for tools with global-scoped prompts (e.g., Codex).
   */
  getFilePath(commandId: string): string;
  /**
   * Formats the complete file content including frontmatter.
   * @param content - The tool-agnostic command content
   * @returns Complete file content ready to write
   */
  formatFile(content: CommandContent): string;
  /**
   * How a person invokes a generated command in this tool, e.g. `/opsx:explore`.
   * Absent where the adapter does not know; the live board then names the
   * skill instead of guessing a syntax.
   */
  commandReference?(commandId: string): string;
  /**
   * The shell words that start an interactive session of this tool with a
   * prompt as the next argument, e.g. `['claude']`. Absent where the tool
   * documents no such way; the live board then copies the prompt alone
   * (DEC-BOARD-BUTTON-LAUNCHES-SESSION).
   */
  sessionLauncher?: readonly string[];
}

/**
 * Result of generating a command file.
 */
export interface GeneratedCommand {
  /** File path from project root, or absolute for global-scoped tools */
  path: string;
  /** Complete file content (frontmatter + body) */
  fileContent: string;
}
