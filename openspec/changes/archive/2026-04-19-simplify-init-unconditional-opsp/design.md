## Context

The init command currently has conditional logic: it reads `openspec/config.yaml` to check if `schema: sprint-driven` is set, and only then creates the `opensprint/` directory and generates OPSP skills. This was built on the wrong assumption that OPSP is an alternative mode. In reality, the CLI is `opensprint` — both layers are always present.

## Goals / Non-Goals

**Goals:**
- Remove all conditional OPSP generation logic from init
- Always create both `openspec/` and `opensprint/` directories
- Always generate both OPSX (4 core) and OPSP (8) skills/commands
- Simplify the init code by removing `readConfiguredSchema()` and schema gating

**Non-Goals:**
- Removing the `sprint-driven` schema file (keep as reference)
- Removing the `extends` mechanism (keep as infrastructure, harmless)
- Changing any skill template content

## Decisions

### Decision: Remove --schema flag entirely
**Choice:** Remove the `--schema` CLI option and `schemaOverride` from `InitCommand`.

**Rationale:** The CLI name IS the schema choice. `opensprint` = sprint-driven. No flag needed.

### Decision: Merge createOpenSprintStructure into createDirectoryStructure
**Choice:** Instead of a separate conditional method, create both `openspec/` and `opensprint/` directories in the main `createDirectoryStructure` method.

**Rationale:** Removes the need for `readConfiguredSchema()`. Both directory trees are created unconditionally.

### Decision: Generate OPSP skills alongside OPSX skills unconditionally
**Choice:** In `generateSkillsAndCommands`, always include both `getSkillTemplates()` and `getOpspSkillTemplates()` — no schema check.

**Rationale:** Both command sets coexist. The operator picks their entry point (`/opsx:*` or `/opsp:*`).

## Risks / Trade-offs

- **[Breaking for spec-driven-only users]** → If someone uses `opensprint` but only wants OPSX, they now get OPSP files too. Mitigation: the files are harmless if unused, and the CLI is named `opensprint` so the expectation is sprint-driven.
