## Context

`DEC-MIGRATE-SEPARATE-TOOL` decides this is its own tool and why it is not `/opsp:rebuild-assess`.

## Goals / Non-Goals

**Goals**
- Detect records the current shapes cannot select
- Ask about them one at a time, in the form that makes the answer absorbable
- Backfill on confirmation

**Non-Goals**
- Deciding anything — a record needing migration is not wrong, it is misfiled
- Automatic backfill. Inference suggests; the owner confirms.
- Covering a *driver-spec* changing, which is `/opsp:rebuild-assess`

## Decisions

### Detection is a function, the interview is a workflow

`findMigrations(projectRoot)` returns what needs attention, as data. That makes the detection
testable without a model and reusable — `compact loops` could surface the same findings later, and
the board could count them.

The grilling is prose, because choosing which of seven objectives a bar belongs to is judgement.

### Four finding kinds, named for what is wrong

| Kind | Means |
|---|---|
| `role-not-accepted` | a role no hat of the record accepts any more |
| `objective-missing` | every section that could take it filters on `objective`, and it declares none |
| `bar-not-in-anatomy` | a `role: bar` record predating the sub-block form |
| `hat-entirely-empty` | a hat with records in it, where every section selects nothing |

The last is the one that catches a shape change nobody noticed, because it is a property of the
*view* rather than of any record. It is how this repository's near-miss would have been caught
automatically.

### The question form is borrowed, not reinvented

`DEC-CLASSIFY-IN-QUESTION` already settled what a good structured question looks like: the inferred
answer, a draft of the change, and confirmation by approving it. Migration asks the same shape of
question about a different subject, so it reuses the form rather than inventing a second convention.

### Nothing is written without approval, one record at a time

A migration touching many records is still many judgements. Batch-approving them would reproduce the
hand-migration this tool replaces, where the operator skims and trusts.

## Risks / Trade-offs

**Validated against fixtures the author wrote.** Stated plainly rather than implied: there is no real
case left in this repository. A tool tested only against fixtures matching its own expectations can
be confidently wrong, and the first genuine shape change is where that will show.

**`hat-entirely-empty` will fire on a legitimately empty hat.** A project that genuinely records
nothing for `devops` is not mis-migrated. The finding says so and is reported rather than acted on.

## Migration Plan

None — this is the migration tool.

## Open Questions

None blocking.
