# maintainer — what must be true of it while it does that?

The technical product manager. The same OGSM as `product`, with one difference that carries
everything: **its objectives are inherited, not discovered** (`DS-MAINTAINER-INHERITED`). Seven of
them, present in substantially every software project — which is why this accountability was split
off from product and given to a specialist.

**Nothing below is attested.** Every claim here rests on a *decision*, not on evidence that it holds
(`DS-ATTESTED-TRUTH`). `/opsp:attest` exists and has not been run against these bars, so each row
states what was decided rather than what is true of the running system.

## Posture

**Self-use, and what that buys.**

Tech giants and LLM providers could ship something that does this better. We do not intend to
compete: OpenSprint exists to be evolved quickly for our own use, kept well documented, and to give
stakeholders maximum visibility into a well-organised agentic SDLC (`DS-SELF-USE-SCOPE`).

This is the standard the whole hat is held to, and it sits deliberately below what a product sold to
strangers would hold. Every objective below deviates from it, or does not.

| Below bar | Accepted because | Expires when |
|---|---|---|
| the `devops` hat is empty — no infrastructure, no deploys | we orchestrate work in repositories that already have both (`DEC-017`) | this repository acquires infrastructure of its own |
| no GUI; the surface is a CLI plus generated agent files | the agent *is* the interface, and those files are text because the consumer is a language model (`DEC-017`) | — |
| discoverability is poor | accepted explicitly rather than dismissed, which is why the documentation burden is a requirement (`DS-SELF-USE-SCOPE`) | adoption by people we do not talk to (`DEC-017`) |

Competing on feature parity with a provider that owns the model would set the roadmap by someone
else's release schedule. Optimising instead for speed of evolution keeps the tool useful on the day
we need it — and that is the whole trade.

## Security & Access

**Nothing recorded.**

No goal, no strategy, no measure. For a tool that ships no service and holds no credentials this may
be proportionate — but it is unstated rather than reasoned, and the distinction matters: `DEC-017`
argues the empty `devops` hat is deliberate, and nothing makes that argument here.

## Isolation & Confidentiality

**Nothing recorded.**

Worth noting what is adjacent and unclaimed: `DS-PARALLEL-EXEC` gives each initiative its own
worktree and surrogate, which is an isolation property of the design. No record states it as a bar,
so nothing says what it guarantees or what would breach it.

## Privacy, Retention & Legal

**Nothing recorded.**

The tool collects command names and a version string (`src/telemetry/`). Nothing states what that is
for, how long it is kept, or who can see it.

## Integrity & Correctness

**Goal** — nothing is documented as true until it has been attested. A compiled claim may be stated
as present-tense fact only where a human asserted it with evidence (`DS-ATTESTED-TRUTH`).

**Strategy** — mutating the canonical surrogate stays manual. `/opsp:rebase` and `/opsp:abandon` are
operator-invocable only, never reachable from a pipeline, a sub-agent or another skill
(`DS-HIGH-IMPACT-OPS`). The mechanism lives in `dev` — `DEC-002`, `DEC-004` and `DEC-006` are what
implement it.

**Measure** — *the surrogate is never corrupted by an automated operation.*

| | |
|---|---|
| **dimension** | automation ←→ human confirmation, on operations that mutate the canonical surrogate |
| **chosen** | fully manual, permanently |
| **traded for** | every scrap of automation on these two operations |
| **neighbour** | **unrecorded** — nothing says what a partially-automated reconciliation would cost |
| **posture** | stated as absolute rather than as a preference. `DEC-006` releases compaction from this bar: compact never writes a record and every view regenerates, so it cannot corrupt the surrogate |
| **evidence** | **none.** The guardrail is instruction text in a skill, which no rule reads |
| **exposure** | a corrupted surrogate degrades every downstream agent operation, unboundedly. A false escalation costs one prompt; a false auto-accept costs the surrogate (`DEC-002`). **No work is planned against it** |

`DS-ATTESTED-TRUTH` carries no measure at all — the goal that demands evidence has none of its own.

## Change & Quality

The most populated row, and the only one with five records behind it.

**Goal** — *not stated.* Five strategies sit here with no goal above them saying what outcome they
reach.

**Strategies**

- **Evidence is a CI artifact.** A coverage report, a recorded end-to-end run, a plan output, a cost
  diff — something the pipeline produced. Testing belongs in CI, not CD (`DS-CI-ATTESTATION`).
  Implemented by `DEC-032`, `DEC-033`.
- **One pull request per initiative, attested before it merges.** Planning lives in the initiative's
  worktree; `main` is production grade by definition (`DS-SURROGATE-GIT-CONTRACT`). Implemented by
  `DEC-029`, `DEC-030`.
- **A measure has four parts** — bar ex ante, posture, evidence and exposure ex post
  (`DS-MEASURE-ANATOMY`). Implemented by `DEC-019`, `DEC-038`.
- **Compatibility is best-effort, scoped to one surface** — a new release meeting a project written
  by an older version (`DS-BACKWARD-COMPAT`).
- **A strategy states a position, never a mechanism.** Domain know-how belongs to `dev` and
  `devops`; the audience for this view is senior management (`DS-STRATEGY-ALTITUDE`). Implemented by
  `DEC-020`, `DEC-037`.

**Measure** — only `DS-BACKWARD-COMPAT` states one: *a project whose directories were written by an
earlier release still parses under the current one.*

| | |
|---|---|
| **dimension** | guaranteed compatibility ←→ speed of evolution |
| **chosen** | best-effort, scoped to that one surface |
| **traded for** | the ability to move quickly, which `DS-SELF-USE-SCOPE` says is the point |
| **neighbour** | **unrecorded** — nothing says what a guarantee would cost, or over what window |
| **posture** | below what a product sold to strangers would hold, deliberately. A published package is static, so nothing can break retroactively |
| **evidence** | **none.** Nothing asserts that a record written by an older release still parses |
| **exposure** | **unrecorded** |

The other four strategies carry no measure, so four of the five things this objective commits to
have no way of being known.

## Availability & Continuity

**Nothing recorded.**

Added to the objective list on review, after being declined twice — the check being that a system
can be correct, secure, isolated, compliant, well-tested and cheap, and still be down. For a CLI
with no runtime there may be nothing to say; nothing says that either.

## Cost & Budget

**Nothing recorded.**

What this costs to run and maintain. The business model belongs to `product`.

## Open Loops

**Harvested:**

- `measure-unasserted` — **DS-ATTESTED-TRUTH**, **DS-BACKWARD-COMPAT**, **DS-CI-ATTESTATION**,
  **DS-HIGH-IMPACT-OPS**, **DS-MEASURE-ANATOMY**, **DS-STRATEGY-ALTITUDE**,
  **DS-SURROGATE-GIT-CONTRACT**. Seven of eight records state a measure that nothing asserts.
- `measure-unexposed` — the same records bar `DS-HIGH-IMPACT-OPS`. Nothing records what a breach
  would cost or who it would reach.
- `exposure-unmitigated` — **DS-HIGH-IMPACT-OPS**. The one exposure this hat records points at no
  planned work.
- `constraint-unasserted` — **DS-SELF-USE-SCOPE** (answered by `DEC-017`), **DS-SURROGATE-GIT-CONTRACT**
  (answered by `DEC-029`, `DEC-030`). Answered, but no rule cites the answering decisions.

**Structural:**

- **Five of seven objectives are empty.** `security & access`, `isolation & confidentiality`,
  `privacy, retention & legal`, `availability & continuity` and `cost & budget` have nothing
  recorded. That is the finding this shape exists to produce — and for a self-use CLI some of it is
  proportionate, which is precisely the argument nobody has written down.
- **`change & quality` has five strategies and no goal.** The approaches are recorded; the outcome
  they are meant to reach is not.
- **Neither bar states its neighbour.** Both say where we sit and roughly what it bought; neither
  records what the next position along would cost, which is the number that makes a future trade
  arguable rather than re-litigated.
- **Nothing in this hat is attested.** `/opsp:attest` shipped with this initiative and has not been
  run. Until it is, every claim above is a decision, not a fact.
