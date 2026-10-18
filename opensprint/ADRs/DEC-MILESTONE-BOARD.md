---
id: DEC-MILESTONE-BOARD
type: adr
status: active
created: 2026-10-18
depth: 5
depends-on:
  - DEC-CONTINUE-FORWARD-ESCALATE-BACK
  - DEC-CARD-WRITES-THROUGH-CLI
hats: [dev]
---

# DEC-MILESTONE-BOARD: An Initiative Opens Onto Its Milestones, in Columns That Follow the opsx Cycle

## Question

[[DS-LIVE-BOARD]] wants clicking into an initiative to show the same kind of board one level down:
its milestones as tickets. `/opsp:apply` runs one opsx cycle per milestone. How many columns does
that board have, what puts a ticket in each, and how does a ticket move?

## Decision

**Five columns, one per stage of the opsx cycle `/opsp:apply` runs for a milestone:**

| Column | A milestone is here when | Continue → | ← Back |
|---|---|---|---|
| To do | open (`[ ]`), with no opsx change yet | apply — only on the next open milestone | — |
| Specifying | its opsx change exists; proposal, specs, design and tasks are being written | apply | — |
| Building | its change worktree exists and tasks are open | apply | — |
| Review | tasks are done, archived and merged into the initiative branch, awaiting the checkpoint | apply — approve and continue | raise a change request |
| Done | checked (`[x]`); a superseded milestone (`[~]`) shows here struck through | — | — |

**Forward is "continue: apply" on every ticket**, because `/opsp:apply` orchestrates the whole cycle
and resumes the milestone where it paused ([[DEC-CONTINUE-FORWARD-ESCALATE-BACK]]). Milestones are
sequential, so only the next open milestone offers it; later ones in To do offer nothing.

**Back is a change request**, from Review: a corrective opsx change, which puts the ticket back in
Specifying — directly, or after exploring first, as apply's change-request flow already runs.

**Escalation is not on tickets.** When the surrogate cannot answer, the escalation moves the
*initiative* — repropose or reexplore on its card — not a milestone.

**Where the stages come from**: the card on `origin/kanban` carries the initiative's milestones and
the stage each is at, written by the same command that moves the card
([[DEC-CARD-WRITES-THROUGH-CLI]]) when apply moves a milestone. The initiative file stays the source of
truth for which milestones are done; the card mirrors it so the board needs no initiative branch to
render.

## Consideration Factors

| Factor | Weight | Five opsx-cycle columns | Open / done only | One column per opsx artifact |
|---|---|---|---|---|
| Shows where a milestone is stuck | HIGH | ✓ | ✗ | ✓ |
| Matches what apply actually runs | HIGH | ✓ | ✓ | Splits one step into four ✗ |
| Renders without the initiative's branch | HIGH | Stage on the card ✓ | ✓ | Needs each change's files ✗ |
| Moves follow the cycle, not a drag | HIGH | ✓ | ✓ | ✓ |
| Columns to read | LOW | Five ✓ | Two ✓ | Eight ✗ |

## Rationale

The milestone board should read like the initiative board: stages, one way forward, and backward only
where the lifecycle has a backward move. Apply's own phases give the stages — propose the change,
build it in its worktree, archive and merge, then the checkpoint — so a ticket's column is a fact
about apply's progress, not a judgement. Apply's sequential guardrail is why only one ticket moves at
a time.

Putting the stage on the card keeps the board readable from `origin/kanban` alone; deriving it from
each change's artifacts would mean fetching every initiative branch to render.

## Invalidation Trigger

If apply runs milestones in parallel, more than one ticket can be in flight and "only the next open
milestone" no longer holds. If the stage on the card drifts from the initiative file, the mirror needs
to be checked, or the board needs to read the file itself.
