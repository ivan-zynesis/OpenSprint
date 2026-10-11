## Why

`DEC-HAT-HANDOFFS` renamed `/opsp:reexplore` to `/opsp:reideate` when it moved the tool to the goal rung. The rename was wrong on two counts.

**Continuity.** `/opsp:reexplore` has been in the workflow set since the project began. Its *definition* changed — the plan-revision half went to `/opsp:repropose`, the unfinished-work half became a change request — but a name that has been in use that long is a cost to move, and the move bought nothing.

**Meaning.** "Reexplore" says *redo the explore process*, which is exactly what the tool now does: `/opsp:explore` run later, writing nothing, rejoining `backlog → triage → propose`. "Reideate" names the altitude; "reexplore" names the behaviour, and the behaviour is what an operator needs to recall at the moment they reach for it.

The rename also revealed a defect it had caused: `hat-handoffs` created a **new capability** `opsp-reideate-workflow` while `opsp-reexplore-workflow` already existed, leaving two specs for one workflow — one describing behaviour that had moved to `/opsp:repropose`.

## What Changes

- `/opsp:reideate` → `/opsp:reexplore` across code, templates, tests and documentation
- `opsp-reideate-workflow` is folded back into `opsp-reexplore-workflow`; the four stale requirements that described plan revision are removed with their migration notes, and the goal-rung requirement replaces them
- `DEC-REEXPLORE-NAME` records the revert without rewriting `DEC-HAT-HANDOFFS`

## Capabilities

### Modified Capabilities
- `opsp-reexplore-workflow`: the goal rung replaces the plan-revision requirements

## Impact

- **No behaviour changes.** The tool does exactly what `hat-handoffs` made it do; only the name returns.
- **The duplicate capability is the real fix.** Two specs for one workflow, one of them describing another tool's job, is the drift that `compact check` cannot see because specs are not compiled.
- `DEC-HAT-HANDOFFS` is **not** edited. Its naming decision is superseded in the record rather than rewritten, which is the rule `/opsp:repropose` prescribes for a decision that changed.
