---
id: DEC-KNOCKDOWN-ALL-VIEWS
type: adr
status: active
created: 2026-10-10
depth: 0
depends-on:
  - DS-VIEW-AUTHORSHIP
  - DS-FULL-COVERAGE
hats: [dev]
---

# DEC-KNOCKDOWN-ALL-VIEWS: Knockdown Produces All Five Views, and the Empty Ones Are the Finding

## Question

`/opsp:knockdown` reverse-engineers `architecture.md`, ADRs and driver-specs from a brownfield
codebase. It produces **no squad views** — a surrogate missing four of its five compiled artifacts.
Should it produce them, given that most will be empty?

## Decision

**Yes, all five.** The expected result on a brownfield project is:

| View | After knockdown |
|---|---|
| `dev` | **populated** — observed from the code, which is what knockdown has |
| `devops` | **populated** — observed from pipelines and infrastructure |
| `product` | **empty** — nothing has been classified as an objective, goal or strategy |
| `maintainer` | **empty** — seven objectives, nothing recorded against any |
| `architecture.md` | populated, as today |

The empty views are **rendered, not omitted**, and say plainly that nothing has been stated.

## Consideration Factors

| Factor | Weight | All five | dev/devops only | None (today) |
|---|---|---|---|---|
| The gap is visible | HIGH | Five empty objectives on day one ✓ | Partly ✓ | **Invisible** ✗ |
| Matches `DS-FULL-COVERAGE` | HIGH | Every hat has a view ✓ | Two hats absent ✗ | ✗ |
| A complete surrogate | HIGH | Yes ✓ | No ✗ | No ✗ |
| Honest about what was inferred | HIGH | Everything `observed` ✓ | ✓ | ✓ |
| Render cost | LOW | Two mostly-empty views ✗ | ✓ | ✓ |

## Rationale

An empty `maintainer` view on a brownfield project is **the most useful thing a reverse-engineered
surrogate can say**:

> We worked out how this is built. Nobody has stated what it must do, or what must stay true of it
> while it does.

Seven empty objectives — security, isolation, privacy, integrity, change, availability, cost — is a
better onboarding document than any prose summary, because it is a list of questions nobody has
answered rather than a description of what exists.

This is also exactly what [[DS-FULL-COVERAGE]] is about: spec-driven practice covers product and dev
and leaves the rest to convention. Knockdown currently reproduces that gap by producing the
system-describing half and silently skipping the intent-describing half.

[[DS-VIEW-AUTHORSHIP]] permits it: knockdown is a full compile with every hat in scope, the operator
present throughout.

Everything produced remains `observed` rather than `decided` or `attested` — an account of what the
code does, not of what anyone chose. That distinction does not weaken with more views; it is stated
in each.

## Invalidation Trigger

If operators routinely delete the empty views after knockdown, they are noise rather than a finding
and should be omitted until a record exists. If an empty view is mistaken for "this project has no
security requirements" rather than "nobody wrote them down", the rendering is at fault, not the
decision.
