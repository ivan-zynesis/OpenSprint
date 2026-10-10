---
id: DEC-MIGRATE-SEPARATE-TOOL
type: adr
status: active
created: 2026-10-10
depth: 1
depends-on:
  - DS-BACKWARD-COMPAT
  - DEC-018
hats: [dev]
---

# DEC-MIGRATE-SEPARATE-TOOL: Schema Migration Is Its Own Tool

## Question

A project whose records were written against an older set of hat shapes will find its views compile
empty — the records are correct, the schema beneath them moved. `/opsp:rebuild-assess` already walks
the decision tree when something changes. Should it cover this too?

## Decision

**No — a separate tool, `/opsp:migrate`.** The two answer different questions:

| | `/opsp:rebuild-assess` | `/opsp:migrate` |
|---|---|---|
| what moved | a **driver-spec** — the world changed | the **schema** — the tool changed |
| what is at risk | decisions that depended on it | records that no longer classify |
| the question | "is this decision still right?" | "where does this record belong now?" |
| the answer | re-evaluate, supersede | backfill a field |

It covers three cases with one tool: a brownfield project after knockdown, an opensprint project
upgrading across a shape change, and one that predates hat views entirely.

```
  DETECT    a role no hat accepts any more          validateRoles — exists
            a record no section can select          record-without-objective — exists
            a hat whose every section is empty      missing
            a bar not yet in ### sub-block form     missing

  GRILL     one record at a time, with the inference carried in the question
            (DEC-CLASSIFY-IN-QUESTION's form, reused)

  BACKFILL  on confirmation
```

## Consideration Factors

| Factor | Weight | A separate tool | Fold into rebuild-assess | Leave it manual |
|---|---|---|---|---|
| The two questions differ | HIGH | Each answers one ✓ | One tool, two meanings ✗ | — |
| Upgrades are survivable | HIGH | Assisted ✓ | ✓ | **We hand-migrated and it was slow** ✗ |
| Detection already half-exists | HIGH | Reuses it ✓ | ✓ | Unused ✗ |
| Tool surface | MED | One more ✗ | None ✓ | None ✓ |
| Clear when to run it | MED | After upgrading ✓ | Ambiguous ✗ | — |

## Rationale

The need is proven rather than anticipated. During `lifecycle-beyond-build`, this repository's own
maintainer records carried `role: bar` while the new seven objectives select on `goal`/`strategy` —
**every maintainer section would have compiled empty.** The old shape had to be pinned in
`openspec/config.yaml` for one milestone, then two records hand-migrated in the next. That is the
upgrade path every existing project will walk, with no assistance and no detection.

Folding it into `/opsp:rebuild-assess` would conflate two genuinely different events. That tool asks
whether a decision still holds now that the world moved; this one asks where a record belongs now
that the schema moved. A record needing migration is not wrong — it was correct when written.

Detection is already half-built, which is a good sign the boundary is in the right place:
`validateRoles` reports a role no hat accepts, and `record-without-objective` reports a record no
section can select. What is missing is the interactive backfill — and the question form
[[DEC-CLASSIFY-IN-QUESTION]] defines is exactly what it needs, reused rather than reinvented.

[[DS-BACKWARD-COMPAT]] makes older records parse, which is necessary and not sufficient: a record
that parses and classifies nowhere is invisible rather than broken, which is worse.

## Invalidation Trigger

If shipped shapes stop changing, this tool stops being needed and should be removed rather than
maintained unused. If migration routinely requires re-deciding rather than re-filing, the boundary
with `/opsp:rebuild-assess` is wrong and they should merge after all.
