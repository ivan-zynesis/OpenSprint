# product — what must it do?

## Objective

**Power an entire engineering team, human or agent.**

Software development becomes real engineering only when the detail across **dev, sec and ops** is
all taken care of. OpenSprint exists to hold a team to that standard regardless of whether the
participants are people or agents, at a scale beyond what a single change workflow addresses
(`DS-AGENTIC-SDLC`).

The premise has not changed since the project began: **code became cheap.** Connecting context and
building the knowledge base are the load-bearing activities now. Where every detail of the context
is recorded, rebuilding a whole application from it is easy — generating the code was never the
hard part. What was always thrown away is why it was built this way.

This is a different ambition from OpenSpec's, not a correction of it. A quick change against a
brownfield project is well served by OPSX. The move away from vibe coding is deliberate — not
because generating code fast is wrong, but because a system nobody can explain is not engineered,
whoever wrote it (`DS-AGENTIC-SDLC`).

What this deliberately does *not* reach is in the strategies below (`DS-SURROGATE-SCOPE`).

## Goals

### Cover all four accountabilities

Specification covers **functional** intent (product) and **non-functional** intent (maintainer);
results cover **application** (dev) and **infrastructure** (devops). A practice covering only some
of those is not engineering (`DS-FULL-COVERAGE`).

Spec-driven development as commonly practised covers product and dev — half a system. What must
remain true while it runs, and how it is stood up, are left to convention. That gap is why an
implementation can satisfy every stated requirement and still be unfit.

### Documentation is compiled, never a second effort

The compacted surrogate **is** the documentation, compiled from work already done rather than
authored alongside it (`DS-DOCUMENTATION-AS-OUTPUT`).

Documentation fails structurally rather than through indiscipline: written after the fact, by
someone with no remaining incentive, about reasoning that has already faded. Compiling removes the
second effort — the records are made *during* the work, because the work cannot proceed without
them. It also makes the artifact honest: a compiled document cannot drift without the compile
reporting it.

### Loading the surrogate must not consume the session budget

Measured across projects in production use: **93–157K tokens**, of which ADRs are 61–74%
(`DS-SURROGATE-BUDGET`). Progressive discovery must extend one layer further, so an agent works
from the compacted surrogate. One that *acts* on a decision still reads its full record — the
budget is saved on orientation, not on judgement.

## Strategies

**Four hats, and the accountabilities do not move** (`DS-SQUAD-HATS`). A hat is a context
boundary; an agent must be told which one it wears. QA is redistributed — engineers write the
tests, but *what* must be tested is answered upstream, so the bridge lands on product and
maintainer. The hat set is a per-project registry (`DEC-016`).

**The loop closes mechanically** (`DS-LOOP-CLOSURE`). `driver-spec → ADR → implementation → rule`,
and back when a rule fails. The last arrow is the one that matters: without it a process produces
documents; with it, drift becomes a build failure.

**One human owner per hat** (`DS-SME-OWNERSHIP`) — reviewer, escalation target, triage owner, not
author. A condensed view is a surrogate of the person holding that expertise, and one nobody is
accountable for drifts unnoticed.

**A view is a big picture, not an index** (`DS-BIG-PICTURE`). Views select; a record may appear in
no view without that being a defect. The first implementation compiled every record into its hat's
view and measured only 2.9x — selection is the other half of compaction.

**Initiatives run concurrently in independent universes** (`DS-PARALLEL-EXEC`). Each worktree
carries its own surrogate; reconciliation converges them or declares a winner.

**Compaction stops at the surrogate** (`DS-SURROGATE-SCOPE`). Certification, change management and
release management are out of scope — certification alone drags in the other two, so compaction
renders and reports rather than approving, gating or promoting.

## Measures

What each goal says it is measured by, and what actually asserts it.

| Goal | Measured by | Asserted by |
|---|---|---|
| `DS-FULL-COVERAGE` | every hat has records, or a decision explaining why not; no hat accumulates records nothing asserts | **nothing** — no rule cites this goal or anything answering it |
| `DS-DOCUMENTATION-AS-OUTPUT` | no artifact hand-authored where a compiled one would serve; a compiled artifact disagreeing with its sources fails the build (`DEC-010`) | `DEC-010` is cited by the compact engine's tests, so the guardrail half holds |
| `DS-SURROGATE-BUDGET` | **not stated** | — |

**`DS-SURROGATE-BUDGET` is the sharpest finding here.** It is the most quantified record in the
project — 93–157K measured across four codebases — and it carries no `## Measures` section at all.
The numbers live in its rationale, which is not the same as saying what would tell us the goal was
met. A target with figures in its prose still has no stated measure.

## Open Loops

**Harvested** (`DEC-013`):

- `constraint-unmeasurable` **DS-SURROGATE-BUDGET** — a goal with no `## Measures`.
- `constraint-unanswered` **DS-AGENTIC-SDLC**, **DS-FULL-COVERAGE**,
  **DS-DOCUMENTATION-AS-OUTPUT** — the objective and both goals were recorded on 2026-09-27 and
  nothing answers them yet.
- `constraint-unanswered` **DS-BIG-PICTURE**, **DS-SURROGATE-SCOPE** — strategies with no decision
  behind them.

**Structural:**

- **Six strategies, three goals, one objective, and no decisions in this hat at all.** Every ADR
  routes to `dev`. The intended shape (`DS-SQUAD-HATS`), but it means this hat states intent and
  another hat answers it.
- **Only two of three goals carry measures.** The QA bridge that `DS-SQUAD-HATS` assigns to this
  hat is one third unbuilt.
