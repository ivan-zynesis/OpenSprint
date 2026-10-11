## Context

`DEC-036` is one decision with two halves that cannot ship together, because each half has a different prerequisite.

The semantic-id half had to come **first**. `RECORD_ID_PATTERN` is what the rule harvest uses to find record citations in test files; it matched `DEC-\d{3}` only. Writing the first semantically-named decision before widening that pattern would have made the harvest silently blind to it — `decision-unguarded` would fire for a decision that was in fact guarded, and nobody would know why. So the widening was pulled forward into `surrogate-currency`, ahead of its own milestone, and the numbered era stopped at `DEC-044`.

The date-prefix half had to come **last**. Every workflow that read an initiative built the path from the name. Prefixing the files before the reader resolved by `id:` would have broken `/opsp:apply` on contact.

## Goals / Non-Goals

**Goals**
- No tool allocates a decision number
- No tool constructs an initiative path from a name
- The convention applies to the files that already exist, not only to new ones

**Non-Goals**
- Renaming `DEC-001`–`DEC-044`. They are cited across records, compiled views and tests; the cost is a large diff and the benefit is aesthetic.
- Validating the date prefix. It is presentation; a check on it would create a failure mode where none exists.
- A migration tool. `findMigrations` exists for records whose *shape* the compiler can no longer select. A filename is not shape.

## Decisions

**The prefix is not the identifier.** `resolveInitiative` matches frontmatter `id:` first and only falls back to the stem. This is what makes the rename a `git mv` rather than a coordinated change: every reference in every record already points at the id.

**`RoadmapRow` carries the stem rather than deriving it.** The roadmap resolves `mitigated-by: <id>` against the initiative list; it had the entry in hand and threw the stem away, rebuilding the link from the id. Carrying it is one field, and the alternative — a second lookup at render time — would duplicate the resolution the row already did.

**The skills are told what *not* to do.** `/opsp:decide` says "do not read the directory and increment" in those words, because that is the instruction an agent reconstructs from the surrounding convention when it is not told otherwise. A rule that only states the new behaviour leaves the old one available.

## Risks / Trade-offs

**Two semantic ids can still collide** — two authors can both coin `DEC-SCOPED-SEAL`. This is strictly better than numbers, where collision is the default rather than the coincidence, and it surfaces the same way: at merge, as a conflicting file.

**A reader looking for `DEC-045` will not find it.** Anyone who learned the numbered convention from `DEC-001`–`DEC-044` will expect the next one to be `DEC-045`. `/opsp:decide` and `/opsp:propose` both state the rule and both name the cutoff, so the convention is discoverable from the tools rather than only from the directory.
