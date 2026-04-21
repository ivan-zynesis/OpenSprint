## Why

The v0.0.1 OPSP release shipped 4 utility commands (`/opsp:driver`, `/opsp:decide`, `/opsp:tree`, `/opsp:rebuild-assess`) — artifact management tools for CRUD operations on driver specs and ADRs. What's missing is the actual **orchestration lifecycle** that mirrors how human engineering teams work: think at initiative level → plan → execute multiple squad-level cycles → compile architectural state.

The utility commands are the toolbox. This change adds the workflow that uses them — the 4 lifecycle commands (`/opsp:explore`, `/opsp:propose`, `/opsp:apply`, `/opsp:archive`) plus the supporting artifact structures (initiatives, `architecture.md`) and the directory rename from `decisions/` to `ADRs/` to reflect the two-tier decision model.

Together, these lifecycle commands create an **operator surrogate** — a persistent knowledge base (driver-specs + ADRs + architecture.md) that allows the architect-level agent to auto-resolve questions on behalf of the operator. Each operator answer trains the surrogate, reducing interruptions over time.

## What Changes

- Add 4 OPSP lifecycle skill templates: `explore`, `propose`, `apply`, `archive`
- Introduce `opensprint/architecture.md` — compiled architectural state, rewritten on each `/opsp:archive`
- Introduce `opensprint/initiatives/<name>.md` — lightweight initiative descriptors linking driver-specs, ADRs, and opsx changes
- Rename `opensprint/decisions/` → `opensprint/ADRs/` to distinguish architect-level decisions from squad-level implementation choices
- Update the sprint-driven schema to include `architecture` and `initiative` artifact types
- Update `init.ts` to create `ADRs/` and `initiatives/` directories (instead of `decisions/`)
- Update the decision-map generator to read from `ADRs/` instead of `decisions/`
- Register the 4 new lifecycle workflows in the command-generation pipeline (alongside existing 4 utilities, total: 8 OPSP commands)
- Update the existing `/opsp:decide` skill template to reference `ADRs/` path

## Capabilities

### New Capabilities
- `opsp-explore-workflow`: Initiative-level thinking partner — brainstorm at architect level, no artifacts created, everything stays in conversation memory
- `opsp-propose-workflow`: Create initiative from explore conversation — auto-classify operator inputs into driver-specs and ADRs, produce initiative descriptor with high-level milestone plan
- `opsp-apply-workflow`: Orchestrate multiple opsx cycles — plan and run opsx explore→propose→apply→archive for each milestone, auto-resolve opsx questions via surrogate (driver-specs + ADRs + architecture.md), escalate to operator only when surrogate cannot answer, encode operator answers back into surrogate
- `opsp-archive-workflow`: Compile initiative into architecture.md — synthesize all active driver-specs, ADRs, and current architectural state into a single rewritable document
- `opsp-initiative-artifact`: Initiative descriptor artifact — lightweight markdown linking driver-specs, ADRs, and opsx changes for a coordinated effort
- `opsp-architecture-artifact`: architecture.md artifact — the compiled single-file architectural state of the solution

### Modified Capabilities
- `opsp-decision-records`: Rename `decisions/` → `ADRs/`, update all path references
- `opsp-decision-map`: Update to read from `ADRs/` instead of `decisions/`
- `cli-init`: Update init to create `ADRs/` and `initiatives/` directories instead of `decisions/`

## Impact

- New skill template files in `src/core/templates/workflows/` for the 4 lifecycle commands
- Updated `skill-generation.ts` and `skill-templates.ts` to register 8 total OPSP workflows
- Updated sprint-driven schema with `initiative` and `architecture` artifact types
- New templates: `initiative.md`, `architecture.md` in `schemas/sprint-driven/templates/`
- Modified `decision-map.ts` to use `ADRs/` path
- Modified `init.ts` to create `ADRs/` and `initiatives/` directories
- Updated existing skill templates (`decide.ts`, `driver.ts`, `tree.ts`, `rebuild-assess.ts`) to reference `ADRs/` path
- All existing tests for `decisions/` path need updating to `ADRs/`
