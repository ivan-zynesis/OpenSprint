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

## Milestones

- [ ] hat-registry: Define the hat taxonomy and per-project registry, add the primary-hat field to the record schema, and backfill existing driver-specs and ADRs with owner confirmation batched by area.
- [ ] compact-engine: Compile hat views and architecture.md from the record with inline citations, write the provenance manifest, and implement `--check`.
- [ ] rule-harvesting: Scan the codebase for records cited by tests and checks, build the record-to-rule index, and detect open loops per hat.
- [ ] backlog-seam: Hand open loops off to `/opsp:explore`, and make `/opsp:archive` and `/opsp:knockdown` call compact as their compile step.
