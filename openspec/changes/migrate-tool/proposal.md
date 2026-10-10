## Why

Milestone 5 of `surrogate-currency`, and the last.

A project whose records were written against an older set of hat shapes finds its views compile empty. The records are correct — they were right when written — and the schema beneath them moved. Nothing detects that, and nothing helps.

This repository walked it: in `lifecycle-beyond-build` milestone 1, its maintainer records carried `role: bar` while the new seven objectives select on `goal`/`strategy`, so **every maintainer section would have compiled empty**. The old shape was pinned in `openspec/config.yaml` for one milestone, then two records hand-migrated in the next. Every existing project will walk the same path on upgrade, with no assistance.

`/opsp:rebuild-assess` does not cover it: that asks whether a decision still holds now the *world* moved. This asks where a record belongs now the *schema* moved — and a record needing migration is not wrong.

## What Changes

- New `/opsp:migrate` workflow: detect, grill, backfill on confirmation
- Detection reuses what exists — `validateRoles` for a role no hat accepts, `record-without-objective` for a record no section can select — and adds a hat whose every section is empty
- The question form is `DEC-CLASSIFY-IN-QUESTION`'s, reused rather than reinvented: inferred classification, a draft of the change, confirmation by approving it
- One record at a time, and nothing is written without approval

## Capabilities

### Added Capabilities
- `opsp-migrate-workflow`: assisted backfill when the schema moves underneath correct records

## Impact

- **Validated against constructed fixtures only.** This repository has **zero** unmigratable records — `validateRoles`, `record-without-objective` and `record-unclassified` all report none, because the only two real cases were hand-migrated in `lifecycle-beyond-build` milestone 2. The fixture that motivated the tool was consumed by the work that proved the need. The next genuine shape change is the first real validation.
- **It covers three situations with one tool**: a brownfield project after knockdown, a project upgrading across a shape change, and one that predates hat views entirely.
- **New**: `src/core/migrate.ts`, `src/core/templates/workflows/opsp-migrate.ts`
