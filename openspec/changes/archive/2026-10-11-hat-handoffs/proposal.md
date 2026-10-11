## Why

`DEC-ESCALATION-LADDER` put three rungs in place and got two of them wrong.

`/opsp:reexplore` was assigned the plan rung — revise milestones, leave the decision trail alone. But that *is* what `/opsp:repropose` does: superseding a strategy redraws the milestones that rested on it, and there is no interesting case where milestones change and nothing above them did. The name was the giveaway — a tool called *re*-explore that produces artifacts is not re-exploring, because `/opsp:explore` writes nothing.

So the plan rung had a tool it did not need, and the **goal** rung had no tool at all.

Separately, `DEC-STATE-MACHINE` made every transition a command and said nothing about who may run it. `DS-HATS-AS-CONTEXT` says most hats are the same engineer, which makes every handoff invisible unless something declares it.

## What Changes

- `/opsp:reexplore` becomes **`/opsp:reideate`** and moves to the goal rung: `/opsp:explore` with the work in hand, **writing nothing**, returning the initiative to `exploring` so the operator rejoins `backlog → triage → propose`
- `/opsp:repropose` absorbs the plan rung, and its scope gains `## Measures` — a strategy that changed what is observable may amend the bar, never the Statement
- A guard on that: **a bar that got easier is a goal that moved**, and routes to `/opsp:reideate`
- Every transition declares the hat it must be made wearing and whether it is a handoff; `opensprint advance` **refuses a handoff** until `--hat` names an accepted accountability
- Twelve transitions now

## Capabilities

### Modified Capabilities
- `opsp-initiative-artifact`: transitions carry a hat, and a handoff must name it

### Added Capabilities
- `opsp-reideate-workflow`: the goal rung

## Impact

- **`/opsp:reexplore` no longer exists.** Pre-1.0 and self-used; the rename is the point rather than a cost.
- **`--hat` is now required on five transitions.** It cannot verify a context was cleared. It can refuse to move until somebody states which accountability they are exercising, which is what makes the switch deliberate.
- **None of attestation's exits is a handoff** — attestation and all three ways out of it are product and maintainer work. Marking every transition would make the flag meaningless.
- **Letting repropose touch `## Measures` is the risk in this change**, and the bar-lowering guard is what contains it.
