## Why

Milestone 2 of `compact-surrogate`, second of two changes.

`compact-engine-core` can say which sections of a view are stale and which records feed them. Nothing renders them. This change adds `/opsp:compact` — the skill that reads the plan, writes the condensed views, and seals the manifest.

It also settles `DEC-014`. `architecture.md` is currently compiled by `/opsp:archive` in its own words. Once compact exists, archive calling it is the difference between one engine with one set of rules and several skills each synthesising their own way.

## What Changes

- A new `/opsp:compact` skill and command, registered in `OPSP_WORKFLOW_IDS`
- The skill drives the loop: `compact plan --json` → read the full input records → render → `compact seal`
- Views rendered to `opensprint/squad/`: an `index.md` router plus one file per hat, each with the four sections the engine defines
- `architecture.md` becomes a sibling output of the same pass, not a separate synthesis
- `/opsp:archive`, `/opsp:knockdown`, `/opsp:rebase` and `/opsp:abandon` call compact for their compile step instead of compiling independently

## Capabilities

### New Capabilities
- `opsp-compact-skill`: the rendering contract — what a view contains, how claims are cited, and what the skill may not do

### Modified Capabilities
- `opsp-archive-workflow`: archive's compile step delegates to compact

## Impact

- **New**: `src/core/templates/workflows/opsp-compact.ts`
- **Modified**: `src/core/templates/skill-templates.ts`, `src/core/shared/skill-generation.ts` (`OPSP_WORKFLOW_IDS` gains `opsp-compact`), and the archive, knockdown, rebase and abandon workflow templates
- **Generated**: one more skill and command per selected tool at `opensprint init`
- **No CLI change.** The engine's surface is unchanged.
