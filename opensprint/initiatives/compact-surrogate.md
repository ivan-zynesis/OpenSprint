---
id: compact-surrogate
status: active
created: 2026-09-26
---

## Description

Add `/opsp:compact` — a compile step that renders the surrogate (driver-specs and ADRs) into per-hat views, so that engineering accountability becomes assignable and the surrogate becomes affordable to load.

Three things motivate it. Surrogate loading costs 93–157K tokens on mature projects, of which ADRs are 61–74% ([[DS-SURROGATE-BUDGET]]). Engineering accountability partitions into four hats whose files each need one human owner ([[DS-SQUAD-HATS]], [[DS-SME-OWNERSHIP]]). And the loop from constraint to decision to implementation to rule must close mechanically, or the process produces documents instead of working software ([[DS-LOOP-CLOSURE]]).

The views are compiled and read-only ([[DEC-006]]): when a view is wrong, the system is wrong, and the fix path is `/opsp:explore` into `/opsp:propose` ([[DEC-007]]). Open loops detected during compaction are the backlog that feeds that triage.

v1 deliberately stops short of changing what `/opsp:explore` and `/opsp:apply` load ([[DEC-015]]). The views must be proven against real work before anything depends on them.

## Driver Specs

- DS-SQUAD-HATS
- DS-SURROGATE-BUDGET
- DS-SME-OWNERSHIP
- DS-LOOP-CLOSURE
- DS-SELF-USE-SCOPE (raised during hat-registry)
- DS-BACKWARD-COMPAT (raised during hat-registry)
- DS-SURROGATE-SCOPE (raised during reexplore, 2026-09-27)

## ADRs

- DEC-006
- DEC-007
- DEC-008
- DEC-009
- DEC-010
- DEC-011
- DEC-012
- DEC-013
- DEC-014
- DEC-015
- DEC-016 (supersedes DEC-012, raised during hat-registry)
- DEC-017 (raised during hat-registry)

## Milestones

- [x] hat-registry: Define the hat taxonomy and per-project registry, add the primary-hat field to the record schema, and backfill existing driver-specs and ADRs with owner confirmation batched by area.
- [x] compact-engine: Compile hat views and architecture.md from the record with inline citations, write the provenance manifest, and implement `--check`.
- [x] rule-harvesting: Scan the codebase for records cited by tests and checks, build the record-to-rule index, and detect open loops per hat.
- [x] backlog-seam: Hand open loops off to `/opsp:explore`, and make `/opsp:archive` and `/opsp:knockdown` call compact as their compile step.
- [ ] per-hat-sections: Make the view's section set per-hat rather than uniform — section templates in the hat registry, variable section lists in the provenance manifest. The four generic sections become the default for hats that want them, not the shape every hat is forced into.
- [ ] system-as-source: Make code a compile input. A view describes the system, citing records where they explain it and reporting what no record explains. Extends the manifest to hash code inputs, which closes the `open-loops` staleness gap as a side effect.
- [ ] per-hat-classification: Classify records within their hat, and give the driver-spec layer the dependency edges it has never had. Product first, with OGSM — `objective | goal | strategy` as node kinds and `measure` as a section of a goal rather than a node of its own. Backfilled with operator confirmation batched by area, defaulting driver-specs to objective or goal. Uses the `depends-on` the ADR layer already has, and the `revises` / `refines` / `supersedes` vocabulary that emerged organically in overheard and cashier, so "reinforce" and "change" need nothing new. The mechanism is per-hat, not product-specific: maintainer will want a bar dimension, devops a pipeline or environment.
- [ ] hat-templates: The actual shapes. Views are big-picture documentation, not an index of every record — no hat enumerates its records, and a record may legitimately appear in no view.
  - `product` — OGSM: objective · goal · strategy · measure. No charter, no constraints; the objective or goal covers what a constraint would have said, or the strategy says how it is worked around. Restores the `Measures` section to the driver-spec template so `constraint-unmeasurable` is detectable.
  - `maintainer` — bars · posture · evidence · exposure. A bar is a position on a spectrum, not a number: dimension, chosen point with its scope, what was traded to sit there, and what the neighbouring point would cost. Cost is an axis of every bar rather than a section of its own. Posture is where we actually sit versus where we chose to.
  - `dev` — tech stack · runtime topology · entity schema. Describes the system, citing ADRs where they explain a choice; does not enumerate them.
  - `devops` — infra architecture · gitops.
  - Diagram convention detected from the repository's existing habit, ASCII as default, escalating to the operator when ambiguous.
  - Validation needs a project with real operational records. This repository has one maintainer record and no devops records, so cashier is the candidate.

## Re-exploration log

### 2026-09-27 — per-hat view shapes

**Explored:** whether the four uniform sections (`charter · constraints · decisions · open-loops`)
are the right shape for every hat. They are not. Product and maintainer both produce constraints
in one format, which `DS-SQUAD-HATS` says explicitly — but `dev` and `devops` produce a different
*kind* of knowledge, not a different subject, and a list of condensed ADRs does not tell a dev
what the system is.

**Settled during the session:**

- **A view describes the system, not the record.** Where the record is silent, something was never
  made explicit, which is reportable but not wrong. Where the record contradicts the system, that
  is a defect — and `DS-LOOP-CLOSURE` already says how it is caught: a rule fails. So compaction
  describes and reports absence; rules catch contradiction.
- **Sections are per-hat.** No one shape fits domains this different.
- **Diagram format follows the repository's habit**, ASCII as the default, escalating when unsure.
- **Product adopts OGSM** — objective, goal, strategy, measure. Its value is separating four things
  that are currently mixed in prose: `DS-SELF-USE-SCOPE` states an objective and a strategy in one
  paragraph.

**Considered and dropped:**

- **Cross-hat section inputs.** The session initially proposed compiling `product/strategy` from
  dev's decisions. Wrong: an ADR is a technical intermediary created when the surrogate could not
  answer an implementation question, usually tracing to no driver-spec. Product strategy is
  high-level with direct business relevance. Compacting sixteen technical ADRs would produce
  something that reads like strategy and is not. Hat views stay independent partitions.
- **Certification**, and with it any approval or gating mechanism. Recorded as
  [[DS-SURROGATE-SCOPE]] rather than merely declined, because it is a boundary a future
  exploration would otherwise re-argue.
- **Actors** as a product section. Impact Mapping has the slot and OGSM does not; not worth
  forcing.

**Settled after the first pass:**

- **Views are big-picture documentation, not an index.** The four uniform sections forced every
  record into a view; a dev view enumerating sixteen ADRs is an index, not a picture. Selection is
  the other half of compaction — which probably explains why the measured ratio was only 2.9x, as
  that pass condensed prose while preserving full coverage.
- **Product drops `charter` and `constraints`.** The objective or goal covers what a constraint
  would have said, or the strategy says how it is worked around.
- **Maintainer's domain is a spectrum.** What the role controls is always a position on a
  continuum, and moving along one axis costs something on another — an SLA percentage traded
  against infrastructure cost, a compliance commitment traded against engineering cost. Both
  produce the same four-part shape: dimension, chosen point, what was traded, what the neighbour
  costs. `DEC-062` in cashier is that row in a single sentence.

**The structure this settles.** The hat-to-record mapping tracks what a repository has historically
been able to hold: application code gave us `dev`, infrastructure-as-code gave us `devops`, and
spec-driven development gave us `product` and then `maintainer`. The first pair produce ADRs, the
second produce driver-specs — and each layer needs its own map.

```
   ERA                  HAT          RECORD    MAP
   ──────────────────────────────────────────────────────────
   application code     dev          ADR     ─┐ DECISION-MAP
   infrastructure       devops       ADR     ─┘ engineering layer
   spec-driven          product      DS      ─┐ OGSM MAP
   ↳ same move again    maintainer   DS      ─┘ product mgmt layer
```

So the OGSM map is not a competing graph over the same records — it is the structure *above*
`DECISION-MAP`, which today renders driver-specs as independent roots because no project records
relationships between them. Measured across five projects: **72 driver-specs, zero relationship
edges; 64 of 64 cashier ADRs have `depends-on`.** The decision layer is a graph and the
driver-spec layer is a flat pile.

`DS-SQUAD-HATS` records half of this — "two hats produce driver-specs in one format" — but lists
devops as producing only infrastructure-as-code. Cashier disagrees: `DEC-055` through `DEC-064`
are ten devops decisions recorded as ADRs. The driver-spec is worth amending when
`per-hat-classification` is built.

**Plan change:** four milestones added — `per-hat-sections`, `system-as-source`, `hat-templates`.
Ordering is a dependency chain: the mechanism, then the inputs that give `dev` and `devops`
anything to compile from, then the shapes. `system-as-source` is load-bearing — it changes what a
view *is*.

**`DEC-008` stands.** It states that the charter compiles from governance records. Since governance
is itself an objective or a goal, the charter is absorbed into OGSM rather than dropped — the
decision was never wrong, it just describes something that turns out to live in `O`/`G` rather
than in a section of its own.

**Records created:** `DS-SURROGATE-SCOPE`. No opsx changes proposed; execution is left to
`/opsp:apply`.

## Progress

### hat-registry — complete (2026-09-26)

**OPSX change:** `2026-09-26-hat-registry` (archived) · branch `opsx/compact-surrogate/hat-registry`

Delivered `src/core/hats.ts` (registry resolution, explicit list-lookup validation, pure
inference), an optional `hats` array on `ProjectConfigSchema`, normalised `hats` on parsed
records, schema and template documentation, and 48 new tests. All 25 records backfilled:
product 7, maintainer 1, dev 17. `devops` deliberately empty.

**Surrogate enriched rather than consumed.** The single-hat rule failed on contact with real
records — six of twenty-one routed to an `agreements` hat nobody owned. The escalation produced
DEC-016 (one or more hats; `agreements` removed), plus DS-SELF-USE-SCOPE, DS-BACKWARD-COMPAT and
DEC-017, which together record why this tool has no GUI and no CI/CD.

**First actual use of `regenerateDecisionMap()`** — the generator had been tested but never
called by anything.

**Verification:** tsc, eslint and `validate --strict` clean; 1486 tests pass.

### fix-reconciliation-specs — complete (2026-09-26)

**OPSX change:** `2026-09-26-fix-reconciliation-specs` (archived)

`main` had been red since 35a3a21 — an entire initiative — because two source specs from
parallel-universe-reconciliation shipped without a `## Requirements` section. Promoted their
normative prose into 13 Requirement/Scenario blocks, preserving `## Purpose` verbatim and
restoring the `DEC-004` citation. No behaviour change. `source-specs-normalization` passes.

### compact-engine — complete (2026-09-26)

**OPSX changes:** `2026-09-26-compact-engine-core`, `2026-09-26-compact-skill` (both archived)

Split in two so the CI gate could be tested without a model in the loop.

**The engine** (`src/core/compact/`, `opensprint compact plan|seal|check`) groups records by hat,
resolves four sections with distinct input sets, hashes them order- and line-ending independently,
and classifies each as fresh, stale, tampered or unsealed. `unsealed` is separated from `stale`
deliberately — every project is unsealed before its first seal, and calling that drift would
report a change that never happened. Only `seal` writes.

**The skill** (`/opsp:compact`) drives the engine rather than reimplementing it, and DEC-014 is
settled: archive, knockdown, rebase and abandon all call it now, and archive's own architecture.md
section list is gone.

**Measured compaction: 15,347 tokens of record → 5,328 tokens of views, 2.9x.** Below the 4–5x
estimated during explore. This repository's records are terse relative to cashier's, so there is
less redundancy to squeeze. The ratio on a mature surrogate is the open question, and it is
exactly what DEC-015 defers the loading switch until we can answer.

**The gate was exercised, not only unit-tested.** Editing `DEC-009` moved two `dev` sections to
stale; hand-editing `dev.md` moved every `dev` section to tampered with the `/opsp:explore`
guidance; restoring both returned `check` to exit zero.

### rule-harvesting — complete (2026-09-27)

**OPSX change:** `2026-09-26-rule-harvesting` (archived)

Harvests record citations from rule files and derives five kinds of open loop from the index and
the decision graph. Rule globs are configurable as `ruleGlobs` — not `rules`, which already means
per-artifact authoring guidance.

**Measured on cashier's 81 records:** 15 open loops, of which 14 are unguarded decisions — so 50
of 64 are cited, reproducing exactly the manual count `DEC-013` was decided on. The transitive
coverage rule paid for itself: 16 of 17 driver-specs come back asserted, where requiring direct
citation would have reported 13 gaps that are not gaps.

**On this repository:** 10 loops — 7 unguarded decisions, `DS-LOOP-CLOSURE` and
`DS-SELF-USE-SCOPE` unasserted, and `DS-BACKWARD-COMPAT` with no decision at all.

### backlog-seam — complete (2026-09-27)

**OPSX change:** `2026-09-26-backlog-seam` (archived)

Explore loads open loops as part of its surrogate entry and presents them grouped by accountable
hat; propose records what an initiative set out to close; the loops output names where triage
happens. No new workflow (`DEC-007`) and no loop state — a gap exists while the harvest reports
it, so the backlog cannot drift from reality.

The archive and knockdown half of this milestone had already landed with `DEC-014`.

**The loop closed itself during this milestone.** A test in `backlog-seam` named `DEC-007`, which
closed that decision's `decision-unguarded` loop and, transitively, `DS-LOOP-CLOSURE`'s
`constraint-unasserted` one. Nobody marked anything resolved; the count went from 10 to 8 because
the harvest stopped reporting them.

**And the known gap demonstrated itself in the same breath.** The rendered views kept claiming
seven unguarded decisions, and `compact check` kept reporting all sections fresh, because the
`open-loops` section has no record inputs and its hash never changes. Corrected by hand, which is
exactly what the gap makes necessary.

### Open loops

- **`open-loops` sections never go stale.** The section has no record inputs by design, so its
  input hash is constant. Deleting a rule file does not restage it, and the view would keep
  reporting a decision as guarded after its only guard was removed. Fixing it means hashing the
  rule index into that section, which `check` cannot do without scanning the source tree — the
  cost `check` is deliberately kept clear of. **A real gap in loop closure, inside the machinery
  built to close loops.** Needs an operator decision.

- **`zsh-installer.test.ts` isolation defect (18 failures).** Not environmental noise. The
  suite builds a `testHomeDir` under `os.tmpdir()`, but the code path still consults the real
  `os.homedir()`, so `isOhMyZshInstalled` sees the developer's own `~/.oh-my-zsh` and returns
  true where the test expects false. These pass in CI, where Oh My Zsh is absent, and fail for
  any developer who has it. Same shape as the defect above: a guard that does not guard what
  it claims to. Awaiting triage via `/opsp:explore`.
