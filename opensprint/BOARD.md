# Board

Compiled by `/opsp:compact` from `opensprint/initiatives/`. **Derived — do not edit.**

**Moving a card means changing a record's state**, not editing this file. A peer of
`DECISION-MAP.md`: cross-cutting rather than hat-scoped, so it is not a squad view (`DEC-026`).

## Backlog

Ideas captured, not yet triaged.

_Empty._

## Next

Proposed — a bar is set, no work started.

| Initiative | State | Milestones | Next |
|---|---|---|---|
| [sdlc-operating-contract](initiatives/sdlc-operating-contract.md) | proposed | 0/6 | backlog-and-triage |

## Doing

In flight.

| Initiative | State | Milestones | Next |
|---|---|---|---|
| [lifecycle-beyond-build](initiatives/lifecycle-beyond-build.md) | building | 11/11 _(+1 superseded)_ | — |

## Done

Closed.

| Initiative | State | Milestones | Next |
|---|---|---|---|
| [compact-surrogate](initiatives/compact-surrogate.md) | _(none — status: completed)_ | 8/8 | — |
| [parallel-universe-reconciliation](initiatives/parallel-universe-reconciliation.md) | _(none — status: completed)_ | 4/4 | — |

## Declined

Considered and dropped. Kept because why it was declined is worth more than the idea.

_Empty._

## Roadmap

Every open exposure beside the state of the work planned to close it (`DS-FORWARD-CLOSURE`).
An exposure pointing at nothing is a confession; one pointing at an initiative is a managed
risk, and **that initiative's state is the assurance level**.

| Record | Exposure | Mitigated by | Assurance |
|---|---|---|---|
| `DS-ATTEST-AS-REVIEW` | Reading tests reintroduces some of the self-assessment risk the narrow context removed, because the agent that wrote … | [lifecycle-beyond-build](initiatives/lifecycle-beyond-build.md) | in flight |
| `DS-DOCUMENTATION-REVIEWED` | The documentation directory is prose for humans, so nothing compiles or checks it. | [lifecycle-beyond-build](initiatives/lifecycle-beyond-build.md) | in flight |
| `DS-HIGH-IMPACT-OPS` | A corrupted surrogate degrades every downstream agent operation, and the damage is unbounded. | **nothing** | a confession |

## Problems

Ways this board would otherwise be quietly wrong.

- `milestone-outside-section` **compact-surrogate** — `documentation-rewrite` lives under "Added at re-exploration, 2026-09-27", so it is not counted in this initiative's progress.
