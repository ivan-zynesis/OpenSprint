# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenSprint (package: `@ivan-zynesis/opensprint`) is an AI-native engineering harness for sprint and milestone orchestration, forked from Fission AI's OpenSpec. It's a TypeScript/Node.js CLI tool.

## Common Commands

```bash
pnpm install                  # Install dependencies
pnpm run build                # Clean dist/ and compile TypeScript
pnpm run dev                  # Watch mode compilation
pnpm run dev:cli -- --help    # Build + run CLI locally

pnpm test                     # Run all tests (Vitest, single run)
pnpm test test/core/init      # Run tests in a specific directory
pnpm test -- --testNamePattern "pattern"  # Run tests matching a name pattern
pnpm test:watch               # Watch mode
pnpm test:coverage            # With coverage report

pnpm lint                     # ESLint on src/
pnpm exec tsc --noEmit        # Type check without emitting
```

## Architecture

**Entry point**: `bin/openspec.js` → `dist/cli/index.js` (Commander.js CLI setup). CLI binary is `opensprint`.

**Source layout** (`src/`):
- `cli/index.ts` — CLI entry point, registers all commands
- `commands/` — CLI command implementations (change, config, schema, show, spec, validate, workflow/)
- `core/` — Core logic: init, archive, update, list, view, config, profiles, available-tools
  - `parsers/` — Markdown and spec parsing (change-parser, spec-structure, markdown-parser, requirement-blocks)
  - `artifact-graph/` — Artifact dependency resolution (graph, resolver, instruction-loader)
  - `completions/` — Shell completion generation
  - `command-generation/` — Generates tool-specific skill/command files (22 tool adapters)
  - `templates/` — Template resolution and workflow instruction content
  - `validation/` — Spec/change validation
- `utils/` — File system ops, change utils, item discovery, matching, shell detection, progress tracking
- `telemetry/` — PostHog usage telemetry (command names + version only)

**Test layout** (`test/`):
- `cli-e2e/` — End-to-end CLI tests
- `core/`, `commands/`, `utils/` — Unit tests mirroring src/ structure
- `helpers/run-cli.ts` — Ensures CLI is built before test execution
- `fixtures/` — Test fixture data

## How `init` Works — Output in a Downstream Project

When a user runs `opensprint init` in their project, the CLI creates:

```
project-root/
├── openspec/
│   ├── config.yaml                          # Schema, tech stack context, rules
│   ├── specs/                               # Source-of-truth specifications
│   ├── changes/                             # Active change proposals
│   │   ├── <change-name>/
│   │   │   ├── .openspec.yaml               # Change metadata (schema, created date)
│   │   │   ├── proposal.md
│   │   │   ├── design.md
│   │   │   ├── tasks.md
│   │   │   └── specs/<capability>/spec.md
│   │   └── archive/                         # Completed changes
│   └── explorations/                        # Optional exploration docs
│
│   # --- Agent skills (per selected tool, delivery=skills|both) ---
├── .claude/skills/openspec-explore/SKILL.md
├── .claude/skills/openspec-propose/SKILL.md
├── .claude/skills/openspec-apply-change/SKILL.md
├── .claude/skills/openspec-new-change/SKILL.md
├── .claude/skills/openspec-archive-change/SKILL.md
│   ... (11 workflows total)
│
│   # --- Slash commands (per selected tool, delivery=commands|both) ---
├── .claude/commands/opsx/explore.md
├── .claude/commands/opsx/apply.md
│   ... (one per workflow)
│
│   # --- Other tools get their own directories ---
├── .cursor/commands/opsx-explore.md          # Cursor format
├── .windsurf/commands/opsx-explore.md        # Windsurf format
│   ... etc.
```

## Where Agent Skills and Templates Live (in this repo)

**Agent skill content** (the markdown instructions for each workflow) is defined as TypeScript template functions:
- `src/core/templates/workflows/*.ts` — One file per workflow (11 total: propose, explore, apply-change, new-change, continue-change, ff-change, sync-specs, archive-change, bulk-archive-change, verify-change, onboard)
- Each exports `get<Workflow>SkillTemplate()` and `getOpsx<Workflow>CommandTemplate()`
- Re-exported via `src/core/templates/skill-templates.ts`

**Artifact templates** (proposal.md, spec.md, design.md, tasks.md structure) are in:
- `schemas/spec-driven/templates/` — Built-in templates shipped with the package
- Resolution order: project-local (`openspec/schemas/`) → user override (`~/.local/share/openspec/schemas/`) → package built-in

**Schema definition** that ties artifacts together:
- `schemas/spec-driven/schema.yaml` — Defines artifacts (proposal → specs → design → tasks), their dependencies, templates, and embedded instructions

**Command adapters** (how skills/commands are formatted per tool):
- `src/core/command-generation/adapters/` — 22 adapters (claude, cursor, windsurf, cline, amazon-q, github-copilot, codex, continue, etc.)
- `src/core/command-generation/registry.ts` — Adapter lookup by tool ID

## Key Processing Flows

**Init flow**: Detect tools → resolve profile (core: 4 workflows / custom: user-configured) → resolve delivery mode (skills/commands/both) → for each tool+workflow, generate files via adapter

**Instruction serving** (`opensprint instructions <artifact>`): Load schema → build artifact dependency graph → detect completed artifacts → enrich with context/rules/template from config → output to agent

**Profiles** (`src/core/profiles.ts`):
- `core` — propose, explore, apply, archive (streamlined for new users)
- `custom` — User-defined workflow list from global config

**Delivery modes** (global config `~/.config/openspec/config.json`):
- `skills` — SKILL.md files in `<toolDir>/skills/`
- `commands` — Command .md files in `<toolDir>/commands/`
- `both` — Generate both

**Tool registry** (`src/core/config.ts` AI_TOOLS array): 26 tools, each with `value` (ID), `skillsDir` (output directory), and optional `detectionPaths` for auto-detection.

## Key Conventions

**Cross-platform paths**: This tool runs on macOS, Linux, and Windows. Always use `path.join()` or `path.resolve()` — never hardcode path separators. Tests must also use `path.join()` for expected path values.

**@inquirer imports**: Never use static imports for `@inquirer/*` modules — use dynamic `import()` instead. Static imports cause pre-commit hook hangs due to event loop side effects. Exception: `src/core/init.ts` is itself dynamically imported, so static @inquirer imports are safe there.

**Explicit lookups over pattern matching**: Prefer explicit list lookups over regex/pattern matching. If we generate artifacts, track them by name in a constant.

**Testing**: Vitest with `pool: 'forks'` for process isolation. Max 4 workers. Timeouts: 10s test/hook, 3s teardown. Override workers with `VITEST_MAX_WORKERS` env var.

**Dependencies**: Commander.js (CLI), Zod (validation), chalk (colors), ora (spinners), fast-glob (file matching), yaml (YAML parsing).

## CI

Tests run on ubuntu, macOS, and Windows (PowerShell). The CI pipeline runs: `pnpm install --frozen-lockfile` → `pnpm run build` → `pnpm test` → type check → lint. Changeset validation is enforced on PRs.
