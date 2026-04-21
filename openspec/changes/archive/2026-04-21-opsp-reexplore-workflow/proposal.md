## Why

During large-scale initiative execution, operators frequently discover that the plan itself needs refinement — milestones are scoped wrong, new milestones are needed, or learnings from completed work change the architectural approach. Currently, operators work around this by manually running opsx workflows and associating them to the initiative by hand. This breaks the closed-loop: the initiative descriptor drifts from reality, and there's no structured way to re-plan at initiative level while keeping everything properly tracked.

## What Changes

- **New `/opsp:reexplore` skill**: An initiative-scoped brainstorm and plan revision flow that can be invoked anytime between propose and archive. Loads the full initiative context (completed milestones, pending milestones, surrogate, active opsx changes), enters explore mode at initiative level, then revises the plan through existing opsx workflows.
- **Plan revision mechanics**: After exploration concludes, the skill orchestrates milestone plan changes — archive-and-repropose for pending milestones that need revision, add new corrective milestones for completed ones that need fixing. All changes are properly associated to the initiative.
- **Surrogate updates**: When the re-exploration reveals ADR or driver-spec corrections, those updates are included as part of the corrective opsx changes, keeping the surrogate in sync.
- **Initiative descriptor update**: The milestone plan in the initiative descriptor is updated to reflect additions, modifications, and reordering. A re-exploration log entry is added for audit trail.

## Capabilities

### New Capabilities
- `opsp-reexplore-workflow`: The `/opsp:reexplore` skill — loads initiative context, enters initiative-scoped explore mode, orchestrates plan revision through `/opsx:explore` and `/opsx:propose`, updates initiative descriptor with revised milestone plan.

### Modified Capabilities
(none — this is a new standalone skill that delegates to existing opsx workflows)

## Impact

- `src/core/templates/workflows/` — New `opsp-reexplore.ts` template file
- `src/core/templates/skill-templates.ts` — Export new skill template
- `src/core/shared/skill-generation.ts` — Register new workflow in generation pipeline, update `OPSP_WORKFLOW_IDS`
- `src/core/init.ts` — Add new skill directory mapping to `OPSP_WORKFLOW_TO_SKILL_DIR`
- Initiative descriptor format — Re-exploration log entries added alongside milestone entries
