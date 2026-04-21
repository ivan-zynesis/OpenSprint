## Why

The CLI is called `opensprint`. It's sprint-driven by definition. OPSP and OPSX are two coexisting layers — OPSP orchestrates OPSX, it doesn't replace it. Yet the current init flow treats OPSP as a conditional "schema variant" gated behind `--schema sprint-driven`, which is architecturally wrong and creates unnecessary friction for operators.

This happened because we initially modeled OPSP artifacts as an extension of the OPSX schema system (`sprint-driven extends spec-driven`). In reality, OPSP is a separate orchestration layer that always coexists alongside OPSX. There should be no flag, no schema selection, no conditional — `opensprint init` always sets up both layers.

## What Changes

- Remove `--schema` flag from the init command
- Remove all schema-gating logic for OPSP skill/command generation — always generate both OPSX and OPSP skills
- Remove `readConfiguredSchema()` helper and all conditional branches that check for `sprint-driven`
- Always create `opensprint/` directory structure during init (alongside `openspec/`)
- Always generate all 8 OPSP skills and commands for every tool
- Keep `openspec/config.yaml` as `schema: spec-driven` (OPSX is still spec-driven internally)
- Keep `sprint-driven` schema file as reference documentation but don't use it as a mode switch
- Remove `schemaOverride` from `InitCommand` constructor
- Update tests to reflect unconditional generation

## Capabilities

### Modified Capabilities
- `cli-init`: Remove schema flag and conditional OPSP generation — always create both layers unconditionally

## Impact

- `src/core/init.ts` — significant simplification: remove `readConfiguredSchema()`, `schemaOverride`, conditional branches for OPSP
- `src/cli/index.ts` — remove `--schema` option from init command
- `test/core/init-opensprint.test.ts` — simplify: remove "should NOT create opensprint/ for spec-driven" test, all init tests assume both layers
- `test/core/opsp-skill-generation.test.ts` — simplify: remove sprint-driven gating tests
- No changes to skill templates, schema files, or decision-map code
