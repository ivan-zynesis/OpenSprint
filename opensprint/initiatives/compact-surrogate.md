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
- [ ] backlog-seam: Hand open loops off to `/opsp:explore`, and make `/opsp:archive` and `/opsp:knockdown` call compact as their compile step.

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
