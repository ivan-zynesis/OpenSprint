## Why

Milestone 1 of `sdlc-operating-contract`. The step function from idea to proposal had no resting point: `/opsp:explore` wrote nothing and `/opsp:propose` did the thinking, the classifying and the writing in one pass. Work that was real but not proposal-ready had nowhere to live, and thinking that survived only in a conversation was lost when the conversation ended.

`DEC-034` and `DEC-039` split it into two think/persist pairs. The tools for the first half did not exist.

## What Changes

- **`/opsp:backlog`** — the deliberate flush. Writes an initiative at `state: exploring` holding an objective and a goal, and nothing else
- **`/opsp:triage`** — picks an item up: advance, decline, or return it. The strategy brainstorming
- Both **create or switch to the initiative's worktree** if not already in one (`DEC-029`)
- `/opsp:explore` now offers backlog rather than only propose, and still writes nothing
- `/opsp:propose` reads an existing initiative rather than creating a second, and does not rewrite an Objective or Goal settled at backlog time

## Capabilities

### Modified Capabilities
- `opsp-backlog-seam`: the seam has tools, and triage is the propose stage rather than a remediation mechanism

## Impact

- **18 OPSP workflows**, up from 16, in lifecycle order between explore and propose.
- **`DEC-007`'s refusal still holds.** It refused a *remediation* workflow; triage is not one. Deciding which open loop is worth work remains a judgement call.
- **New**: `src/core/templates/workflows/opsp-backlog.ts`, `opsp-triage.ts`
