## Why

When opsp-apply executes a multi-milestone initiative, all opsx changes run back-to-back without pause, producing a single unbroken stream of commits. This makes human code review unmanageable — the operator cannot review changes in digestible chunks, and there is no branch structure to navigate. We need milestone-boundary pauses, a git branching strategy aligned to initiatives and changes, and operator controls for review granularity.

## What Changes

- **Milestone pause**: After each milestone's opsx cycle completes, opsp-apply pauses and presents a review checkpoint. The operator chooses to review now, continue to the next milestone, or auto-run to the end.
- **Git branch management**: opsp-apply creates an initiative branch and per-change sub-branches. Each opsx change is implemented on its own branch, merged into the initiative branch on archive.
- **Review navigation skill**: A new agent skill (`/opsp:review`) that shows the commit graph for an initiative, lists branches per milestone/change, and assists with branch-level review.
- **Operator review mode selection**: At initiative start and at each pause, the operator can choose review granularity — per-change (pause after each opsx archive), per-milestone (current pause behavior), or continuous (no pause, run to completion).

## Capabilities

### New Capabilities
- `opsp-git-branching`: Git branch lifecycle management for initiatives and changes — creating initiative branches, per-change branches, merging on archive, and cleanup.
- `opsp-milestone-pause`: Milestone boundary pause behavior — checkpoint presentation, operator mode selection (per-change / per-milestone / continuous), and resume logic.
- `opsp-review-navigation`: Agent skill for navigating initiative commit history — show branch graph, list changes per milestone, assist operator in reviewing specific branches.

### Modified Capabilities
- `opsp-apply-workflow`: Integrate milestone pause checkpoints and git branch creation into the opsx cycle orchestration. Branch creation before each opsx-apply step, merge on archive, pause after milestone completion.

## Impact

- `src/core/templates/workflows/opsp-apply.ts` — Major update to skill instructions: add branch management steps, pause logic, review mode selection
- `src/core/templates/workflows/` — New template files for review navigation skill
- `src/core/templates/skill-templates.ts` — Export new skill templates
- `src/core/shared/skill-generation.ts` — Register new workflow in generation pipeline
- `src/core/init.ts` — Add new skill directory mappings
- Git operations — The agent will run `git checkout -b`, `git merge`, `git log --graph` commands; no new library dependencies needed
- Operator interaction — New AskUserQuestion prompts at milestone boundaries
