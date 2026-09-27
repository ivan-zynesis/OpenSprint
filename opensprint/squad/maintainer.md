# maintainer — what must be true of it while it does that?

## Bars

Each bar is a **position on a spectrum**, not a number. What this hat controls is always a trade:
moving along one axis costs something on another.

### Who may run a reconciliation

| | |
|---|---|
| **dimension** | automation ←→ human confirmation, on operations that mutate the canonical surrogate |
| **chosen** | fully manual. `/opsp:rebase` and `/opsp:abandon` are operator-invocable only — never by a pipeline, a sub-agent, or another skill (`DS-HIGH-IMPACT-OPS`) |
| **traded for** | every scrap of automation on these two operations, permanently |
| **neighbour** | **unrecorded.** Nothing says what a partially-automated reconciliation would look like or cost |

Stated as absolute rather than as a preference. The reasoning is blast radius: a corrupted
surrogate degrades every downstream agent operation, and the damage is unbounded — so a false
escalation costs one prompt and a false auto-accept costs the surrogate (`DEC-002`).

Worth noting what the bar does **not** cover. `DEC-006` releases compaction from it: because
compact never writes a record and every view regenerates, it cannot corrupt the surrogate, so it
carries no operator-only guardrail.

### How far back compatibility reaches

| | |
|---|---|
| **dimension** | guaranteed compatibility ←→ speed of evolution |
| **chosen** | best-effort, scoped to one surface: **a new release meeting a project whose directories were written by an older version** (`DS-BACKWARD-COMPAT`) |
| **traded for** | the ability to move quickly, which `DS-SELF-USE-SCOPE` says is the point |
| **neighbour** | **unrecorded.** Nothing says what a guarantee would cost, or over what window |

A published package is static, so nothing can break retroactively. What follows mechanically: a
new field on a record is optional; removing or renaming one is a breaking change under semver;
migrations run forward rather than requiring a re-init.

## Posture

**Self-use, and what that buys.**

Tech giants and LLM providers could ship something that does this better. We do not intend to
compete: OpenSprint exists to be evolved quickly for our own use, kept well documented, and to
give stakeholders maximum visibility into a well-organised agentic SDLC (`DS-SELF-USE-SCOPE`).

This is where we actually sit, and it is deliberately below what a product sold to strangers
would have to hold:

| Below bar | Accepted because | Expires when |
|---|---|---|
| the `devops` hat is empty — no infrastructure, no deploys | we orchestrate work in repositories that already have both (`DEC-017`) | this repository acquires infrastructure of its own |
| no GUI; the surface is a CLI plus generated agent files | the agent *is* the interface, and those files are text because the consumer is a language model (`DEC-017`) | — |
| discoverability is poor | accepted explicitly rather than dismissed, which is why the documentation burden is a requirement (`DS-SELF-USE-SCOPE`) | adoption by people we do not talk to (`DEC-017`) |

Competing on feature parity with a provider that owns the model would set the roadmap by someone
else's release schedule. Optimising instead for speed of evolution keeps the tool useful on the
day we need it — and that is the whole trade.

## Evidence

**Thin, and the shape of what is missing is clear.**

Nothing is classified `evidence`. What exists is indirect: `compact check` fails the build when a
view disagrees with its records (`DEC-010`), and the rule harvest reports which decisions nothing
cites (`DEC-013`). Both are real, and neither is recorded as this hat's evidence for a bar.

Neither bar above has evidence at all. Nothing asserts that reconciliation stays
operator-invocable — the guardrail is instruction text in a skill, which no rule reads. Nothing
asserts that a record written by an older release still parses, which is the entire compatibility
bar.

## Exposure

**Unrecorded.** Nothing states what a breach of either bar would cost or who it would reach.

The blast-radius reasoning exists inside `DS-HIGH-IMPACT-OPS` — a corrupted surrogate degrades
every downstream agent operation, unbounded — but it is stated as justification for the bar rather
than as a description of exposure, and nothing similar exists for compatibility.

## Open Loops

**Harvested** (`DEC-013`):

- `constraint-unmeasurable` **DS-HIGH-IMPACT-OPS**, **DS-BACKWARD-COMPAT** — both bars, neither
  with a `## Measures` section.
- `constraint-unanswered` **DS-BACKWARD-COMPAT** — no decision answers it; every mechanism it
  implies is convention.
- `constraint-unasserted` **DS-SELF-USE-SCOPE** — answered by `DEC-017`, which no rule cites.

**Structural:**

- **Neither bar states its neighbour.** Both say where we sit and roughly what it bought, but
  nothing records what the next position along would cost — which is the number that makes a
  future trade arguable rather than re-litigated from scratch.
- **Two of four sections are empty.** `evidence` and `exposure` have no records. For a tool with
  no runtime that is partly proportionate, but the compatibility bar in particular is asserted by
  nothing at all.
