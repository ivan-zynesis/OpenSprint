---
id: DEC-BAR-AT-PROPOSE
type: adr
status: accepted
created: 2026-10-11
depth: 2
depends-on:
  - DEC-027
  - DEC-038
  - DEC-019
  - DS-PROGRESSIVE-CRYSTALLIZATION
hats: [dev]
---

# DEC-BAR-AT-PROPOSE: The Bar Is Written Where the Goal Is, by the Hat That Owns It

## Question

Two things were found together, and the second explains the first.

**The bar is nowhere in the tools.** `docs/workflows.md` says *">> the BAR is written here. ex ante. <<"* at the propose stage. `/opsp:triage` tells the operator that `/opsp:propose` "writes the driver-specs, the ADRs, the milestones and the bar". [[DEC-019]] gives a measure a `### Bar` block and [[DEC-038]] says what form it takes. `constraint-unmeasurable` fires on every goal without one.

And `/opsp:propose` never mentions `## Measures`. Neither does `/opsp:driver`. The only workflows that instruct a `### Bar` are `/opsp:apply` — inside an escalation's proposed-record template — and `/opsp:migrate`, which backfills. The primary path creates driver-specs with no hats, no role and no measures, which is three guaranteed loops per record.

**And [[DEC-HAT-HANDOFFS]] misclassified `/opsp:repropose`.** It recorded repropose amending `## Measures` as "[[DEC-027]]'s **amend** mode, now used by a second tool" — treating it as a borrowing from `/opsp:attest` that needed containing. If propose writes the bar as a matter of course, repropose restating it is not a borrowing at all.

## Decision

**`/opsp:propose` and `/opsp:driver` write the hat, the role and the bar when they create a driver-spec.** The template an agent copies carries all three, because that is the template agents follow — the same failure [[DEC-STATE-MACHINE]] found when `/opsp:propose`'s initiative template omitted `state:` while a guardrail below it said to set one.

Where the operator cannot state a bar yet, `- **Primary**: unstated` is recorded and the loop keeps reporting it. An honest gap beats a fabricated target.

**`/opsp:repropose` writes in `create` mode, not `amend`.**

| Mode | Tools | Touches |
|---|---|---|
| create | `/opsp:decide`, `/opsp:driver`, `/opsp:propose`, **`/opsp:repropose`** | a record's own content, at the altitude of the hat writing it |
| derive | `/opsp:compact`, `/opsp:archive` | compiled artifacts only |
| amend | `/opsp:attest` | a named section of a record it does not own |

The distinction is **whose record it is**. `/opsp:attest` writes posture into a record authored by somebody else, at a different altitude, after the fact — that needs bounding, and [[DEC-027]] bounds it. `/opsp:repropose` wears **product and maintainer**, which is the hat that wrote the bar in the first place. It is the propose stage, run again.

The Statement remains out of bounds, and that is unchanged — but it is out of bounds because changing it means the **goal** moved, which is `/opsp:reideate`'s rung, not because repropose is borrowing a write mode it has no claim to.

## Consideration Factors

| | Bar at propose | Bar at apply (status quo) | Bar harvested later |
|---|---|---|---|
| Written by the hat that owns the goal | ✓ | ✗ — dev writes it mid-escalation | ✗ |
| Written ex ante | ✓ | ✗ — after work has started | ✗ — after work has finished |
| The template carries it | ✓ | n/a | n/a |
| Costs the operator a question at intake | ✗ | ✓ | ✓ |

| | repropose as `create` | repropose as `amend` |
|---|---|---|
| Matches whose hat is worn | ✓ — product/maintainer own the bar | ✗ |
| Explains why the Statement is out of bounds | ✓ — a moved goal is another rung | ✗ — "the bound is borrowed" |
| Needs `checkAmendment` run against it | ✗ | ✓ — and nothing did |

## Rationale

**A bar written during implementation is not ex ante.** The whole claim [[DS-PROGRESSIVE-CRYSTALLIZATION]] makes is that an initiative's state is how far down OGSM it has crystallized — Objective and Goal at exploration, Strategy and **the bar** at proposal. A bar first written inside `/opsp:apply` is written by `dev`, after the work began, against an implementation already taking shape. That is the exact failure attestation exists to catch, moved one stage earlier where nothing catches it.

**The documentation was right and the tools were silent.** Three separate places told the operator the bar is written at propose. Nothing told the agent to write it. That asymmetry is invisible until somebody asks why every goal is missing its measures — and by then the answer is a backlog rather than a defect.

**The misclassification mattered because it created a false risk.** Recording repropose as borrowing `amend` produced a "this is a widening, and widenings are how guarantees erode" caveat in the design, and a follow-up to run `checkAmendment` against it. Neither is needed. `checkAmendment` bounds a tool writing into a record it does not own; repropose owns the record. Chasing that bound would have added a check that enforces the wrong thing.

What **is** load-bearing, and survives the reclassification unchanged, is the guard: *a bar that got easier is a goal that moved*. That has nothing to do with write modes. It is the difference between restating a target and lowering one, and it belongs at the goal altitude.

## Invalidation Trigger

If driver-specs continue to be created without measures despite the template carrying the section, the template is not where agents look, and the bar needs a prompt rather than a placeholder.

If `- **Primary**: unstated` becomes the common answer rather than the honest exception, the bar is being asked for too early, and it belongs at triage — where the strategy is brainstormed — rather than at the moment the constraint is recorded.
