# product — what must it do?

**Nothing below is attested** (`DS-ATTESTED-TRUTH`). Every claim rests on a decision, not on
evidence that it holds. `/opsp:attest` shipped with `lifecycle-beyond-build` and has not been run.

## Objective

**Power an entire engineering team, human or agent.**

Software development becomes real engineering only when the detail across **dev, sec and ops** is
all taken care of. OpenSprint exists to hold a team to that standard regardless of whether the
participants are people or agents, at a scale beyond what a single change workflow addresses
(`DS-AGENTIC-SDLC`).

The premise has not changed since the project began: **code became cheap.** Connecting context and
building the knowledge base are the load-bearing activities now. Where every detail of the context
is recorded, rebuilding a whole application from it is easy — generating the code was never the hard
part. What was always thrown away is why it was built this way.

What this deliberately does *not* reach is in the strategies below (`DS-SURROGATE-SCOPE`).

## Goals

### Cover all four accountabilities

Specification covers **functional** intent (product) and **non-functional** intent (maintainer);
results cover **application** (dev) and **infrastructure** (devops). A practice covering only some of
those is not engineering (`DS-FULL-COVERAGE`).

Spec-driven development as commonly practised covers product and dev — half a system. What must
remain true while it runs, and how it is stood up, are left to convention. That gap is why an
implementation can satisfy every stated requirement and still be unfit.

### Documentation is compiled, never a second effort

The compacted surrogate **is** the documentation, compiled from work already done rather than
authored alongside it (`DS-DOCUMENTATION-AS-OUTPUT`).

Documentation fails structurally rather than through indiscipline: written after the fact, by someone
with no remaining incentive, about reasoning that has already faded. Compiling removes the second
effort, and makes the artifact honest — a compiled document cannot drift without the compile
reporting it.

### Nothing is documented as true until it is attested

A compiled claim may be stated as present-tense fact only where a human asserted it with evidence
(`DS-ATTESTED-TRUTH`).

The newest goal, and the one that corrects the previous two. Compiling guarantees a document cannot
drift *from its records*; it says nothing about drift between the records and reality. A decision
that binds may simply not be true yet — which is what a third citation authority exists to say.

### Loading the surrogate must not consume the session budget

Measured across projects in production use: **93–157K tokens**, of which ADRs are 61–74%
(`DS-SURROGATE-BUDGET`). An agent works from the compacted surrogate; one that *acts* on a decision
still reads its full record. The budget is saved on orientation, not on judgement.

## Strategies

Fourteen, and they fall into four groups.

**How knowledge is shaped.** Four hats, and the accountabilities do not move (`DS-SQUAD-HATS`) — a
hat is a context boundary, and in practice **what you load** rather than who you are
(`DS-HATS-AS-CONTEXT`), because most hats are worn by the same engineer. One human owner per hat
(`DS-SME-OWNERSHIP`). A view is a big picture, not an index (`DS-BIG-PICTURE`). The maintainer hat
is the technical product manager, running the same OGSM with **inherited rather than discovered**
objectives (`DS-MAINTAINER-INHERITED`), stating positions and never mechanisms
(`DS-STRATEGY-ALTITUDE`).

**How a commitment is made and checked.** A measure has four parts — a bar written when work is
proposed, and posture, evidence and exposure written when it is attested (`DS-MEASURE-ANATOMY`).
Evidence is a CI artifact, which is a bet: the tool creates the incentive to invest in CI rather
than accommodating its absence (`DS-CI-ATTESTATION`).

**How the loop closes.** Mechanically, backward: `driver-spec → ADR → implementation → rule`, and
back when a rule fails (`DS-LOOP-CLOSURE`). And forward: every exposure carries the work planned to
close it, because an exposure found at attestation has no backward target
(`DS-FORWARD-CLOSURE`).

**How work moves.** An initiative is a container, not a record — born at intake and filling as the
work crystallizes (`DS-PROGRESSIVE-CRYSTALLIZATION`). It lives in its own worktree from first
thought to merge, attested before it merges, with `main` production grade by definition
(`DS-SURROGATE-GIT-CONTRACT`). Initiatives run concurrently in independent universes
(`DS-PARALLEL-EXEC`). And compaction stops at the surrogate: certification, change management and
release management are out of scope, so compaction renders and reports rather than approving,
gating or promoting (`DS-SURROGATE-SCOPE`).

## Measures

What each goal says it is measured by, and what actually asserts it.

| Goal | Measured by | Asserted by |
|---|---|---|
| `DS-FULL-COVERAGE` | every hat has records, or a decision explaining why not | **nothing** |
| `DS-DOCUMENTATION-AS-OUTPUT` | no artifact hand-authored where a compiled one would serve; a compiled artifact disagreeing with its sources fails the build (`DEC-010`) | **nothing cites it** — the guardrail half is implemented, the goal is not asserted |
| `DS-ATTESTED-TRUTH` | no compiled claim stated in the present tense without an attestation behind it | **nothing** |
| `DS-SURROGATE-BUDGET` | **not stated** | — |

**Every goal in this hat is unasserted.** `DS-SURROGATE-BUDGET` remains the sharpest case: the most
quantified record in the project — 93–157K measured across four codebases — carries no `## Measures`
section at all. Numbers in a rationale are not a stated measure.

`DS-ATTESTED-TRUTH` is the second-sharpest, and self-referential: the goal demanding that nothing be
called true without evidence has no evidence of its own.

## Open Loops

**Harvested:**

- `constraint-unmeasurable` — **DS-SURROGATE-BUDGET**, a goal with no `## Measures`.
- `constraint-unanswered` — **DS-AGENTIC-SDLC**, **DS-BIG-PICTURE**, **DS-DOCUMENTATION-AS-OUTPUT**,
  **DS-FULL-COVERAGE**. The objective and two goals have no decision behind them.
- `constraint-unasserted` — **DS-SURROGATE-GIT-CONTRACT**, answered by `DEC-029` and `DEC-030`, but
  no rule cites either.
- `strategy-unimplemented` — **DS-BIG-PICTURE**. Fourteen strategies, one with nothing descending
  from it.
- `measure-unasserted` / `measure-unexposed` — eleven records each. Nothing in this hat has been
  attested.

**Structural:**

- **Fourteen strategies, four goals, one objective, and no decisions in this hat at all.** Every ADR
  routes to `dev` or `devops`. That is the intended topology (`DS-SQUAD-HATS`, `DEC-028`) and it
  means this hat states intent while another answers it.
- **The strategy count grew by eight in one initiative.** Worth watching: a hat whose strategies
  outnumber its goals three to one is accumulating approaches faster than outcomes to reach.
- **No goal is asserted by anything.** Four goals, four empty cells in the right-hand column.
