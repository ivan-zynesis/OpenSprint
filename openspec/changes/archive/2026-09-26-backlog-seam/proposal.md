## Why

Milestone 4 of `compact-surrogate`, and the last.

`opensprint compact loops` now reports what does not line up: constraints nobody decided, decisions nobody guarded, rules guarding records that are no longer the answer. Nothing reads that report. A backlog nobody triages is a list, and `DS-LOOP-CLOSURE` is explicit that a process which produces documents has not closed its loop.

`DEC-007` already settled the mechanism: open loops are the backlog, and `/opsp:explore` → `/opsp:propose` is the triage. It also settled what *not* to build — no fifth workflow, no auto-filing. Only the noticing can be encoded; deciding which gap matters is judgement.

So this change is a seam, not a machine. It makes explore see the backlog and propose record what it closed.

## What Changes

- `/opsp:explore` loads open loops as part of its surrogate entry and presents them as triage input
- `/opsp:propose` records which open loops an initiative addresses, in the initiative descriptor
- `opensprint compact loops` tells the reader where triage happens
- The initiative descriptor gains an optional `Addresses` section

**The archive and knockdown half of this milestone already landed** with `DEC-014` in `compact-skill`: archive, knockdown, rebase and abandon all call compact for their compile step.

## Capabilities

### New Capabilities
- `opsp-backlog-seam`: how open loops reach triage and how closing one is recorded

### Modified Capabilities
- `opsp-propose-workflow`: the initiative descriptor records the loops an initiative addresses

## Impact

- **Modified**: `src/core/templates/workflows/opsp-explore.ts`, `opsp-propose.ts`, `src/commands/compact.ts`
- **No new workflow.** `DEC-007` rules that out, and the point of the seam is that the existing two suffice.
- **No schema change.** `Addresses` is a section of the descriptor body, not frontmatter.
