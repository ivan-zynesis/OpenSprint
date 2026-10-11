# Board

Compiled by `/opsp:compact` from `opensprint/initiatives/`. **Derived — do not edit.**

**Moving a card means changing a record's state**, not editing this file. A peer of
`DECISION-MAP.md`: cross-cutting rather than hat-scoped, so it is not a squad view (`DEC-026`).

## Backlog

Ideas captured, not yet triaged.

_Empty._

## Next

Proposed — a bar is set, no work started.

_Empty._

## Doing

In flight.

_Empty._

## Handoff

Every milestone done, nothing judged yet. **Waiting on a person, not on work** — somebody must put the product or maintainer hat on and run `/opsp:attest`.

_Empty._

## Done

Closed.

| Initiative | State | Milestones | Next |
|---|---|---|---|
| [parallel-universe-reconciliation](initiatives/20260522-parallel-universe-reconciliation.md) | _(none — status: completed)_ | 4/4 | — |
| [compact-surrogate](initiatives/20260926-compact-surrogate.md) | _(none — status: completed)_ | 9/9 | — |
| [lifecycle-beyond-build](initiatives/20261001-lifecycle-beyond-build.md) | completed | 11/11 _(+1 superseded)_ | — |
| [sdlc-operating-contract](initiatives/20261009-sdlc-operating-contract.md) | completed | 12/12 | — |
| [surrogate-currency](initiatives/20261010-surrogate-currency.md) | completed | 5/5 | — |

## Declined

Considered and dropped. Kept because why it was declined is worth more than the idea.

_Empty._

## Roadmap

Every open exposure beside the state of the work planned to close it (`DS-FORWARD-CLOSURE`).
An exposure pointing at nothing is a confession; one pointing at an initiative is a managed
risk, and **that initiative's state is the assurance level**.

| Record | Exposure | Mitigated by | Assurance |
|---|---|---|---|
| `DS-ATTEST-AS-REVIEW` | Reading tests reintroduces some of the self-assessment risk the narrow context removed, because the agent that wrote … | **nothing** | a confession |
| `DS-ATTESTED-TRUTH` | A compiled view may state present-tense claims with no attestation behind them, and the decided / observed / attested… | **nothing** | a confession |
| `DS-CI-ATTESTATION` | Evidence citing a `../` path is silently accepted rather than reported, and any file in the tree counts as evidence r… | **nothing** | a confession |
| `DS-DOCUMENTATION-REVIEWED` | The documentation directory is prose for humans, so nothing compiles or checks it. | **nothing** | a confession |
| `DS-ESCALATION-HANDOFF` | Inference can be wrong, and an operator approving quickly may accept a misclassified record. | **nothing** | a confession |
| `DS-FORWARD-CLOSURE` | An exposure with no pointer may go unreported by the harvest, and any string may satisfy it. | **nothing** | a confession |
| `DS-HATS-AS-CONTEXT` | Excluding the implementation from an attest context depends on the agent obeying instructions. | **nothing** | a confession |
| `DS-HIGH-IMPACT-OPS` | A corrupted surrogate degrades every downstream agent operation, and the damage is unbounded. | **nothing** | a confession |
| `DS-MAINTAINER-INHERITED` | A record carrying a misspelled or off-list objective may route nowhere without being reported, and an empty objective… | **nothing** | a confession |
| `DS-MEASURE-ANATOMY` | A compiled view could state a bar with no posture and no test would fail; only the record-level harvest would notice. | **nothing** | a confession |
| `DS-PROGRESSIVE-CRYSTALLIZATION` | The **Primary** bar has drifted from what shipped and needs revising through `/opsp:decide`. | **nothing** | a confession |
| `DS-STRATEGY-ALTITUDE` | A regression in `strategy-unimplemented` would pass the suite. | **nothing** | a confession |
| `DS-SURROGATE-GIT-CONTRACT` | An `opsp/*` branch can merge to `main` unattested, this one included. | **nothing** | a confession |
| `DS-VIEW-AUTHORSHIP` | A hand-edited view can be sealed as if rendered, and which hat compiled a view is not recorded anywhere it could be a… | **nothing** | a confession |

## Problems

Ways this board would otherwise be quietly wrong.

_None._
