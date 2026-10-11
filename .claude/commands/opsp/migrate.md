---
name: "OPSP: Migrate"
description: Backfill records the current hat shapes can no longer select
category: Workflow
tags: [workflow, opsp, migrate, schema, backfill]
---

Backfill records that the current hat shapes can no longer select.

---

## What this is for, and what it is not

A project's records are written against the hat shapes of the day. When those shapes move — a hat
gains objectives, a role vocabulary changes — **the records do not become wrong.** They become
*misfiled*, and a misfiled record is invisible rather than broken: it still parses
(`DS-BACKWARD-COMPAT`), and nothing makes it appear in a view.

| | |
|---|---|
| `/opsp:rebuild-assess` | the **world** moved — is this decision still right? |
| **`/opsp:migrate`** | the **schema** moved — where does this record belong now? |

Do not re-decide anything here. A record needing migration was correct when it was written.

## Step 1: Find what cannot be selected

```bash
openspec migrate
```

Four kinds of finding:

| Kind | Means |
|---|---|
| `role-not-accepted` | a role no hat of the record accepts any more |
| `objective-missing` | every section that could take it filters on `objective`, and it declares none |
| `bar-not-in-anatomy` | a `role: bar` record predating the measure-anatomy sub-blocks |
| `hat-entirely-empty` | a hat holding records where every section selects nothing |

**`hat-entirely-empty` is the one to read first.** It is the only finding that is a property of the
*view* rather than of a record, and it is how a shape change nobody noticed surfaces. A hat holding
eight records and rendering nothing has had the ground move underneath it.

It can also be a false positive: a project that genuinely records nothing for `devops` is not
mis-migrated. Say so and move on.

## Step 2: One record at a time

Use the form `DEC-CLASSIFY-IN-QUESTION` settled — the inference, a draft of the change, and
confirmation by approving it. Do not invent a second convention:

```
  MIGRATION — 1 of 3

  DS-HIGH-IMPACT-OPS carries role 'bar', which maintainer no longer accepts.

  I believe this is:  objective · integrity & correctness
                      inferred from: it constrains the surrogate staying
                      uncorrupted, which is integrity rather than access,
                      isolation or cost

  Proposed change:    role:      bar  →  strategy
                      objective: —    →  integrity-correctness

                      and the bar moves under ## Measures:

                      ### Bar
                      - **dimension**: automation ←→ human confirmation
                      - **chosen**: fully manual
                      - **traded for**: <from the record's existing prose>
                      - **neighbour**: <stated, or 'unrecorded'>

  Nothing else in the record changes.

  [1] Approve   [2] Correct the classification   [3] Skip this record
```

**Batch-approving defeats the point.** A migration touching many records is many judgements, and
approving them together reproduces exactly the skim-and-trust this tool replaces.

## Step 3: Backfill on approval

Write **only** what was approved — the frontmatter field, or the measure sub-block. A migration does
not revise a Statement, a Rationale or a Decision; if the record's *content* is now wrong, that is a
new decision (`/opsp:decide`), not a migration.

Move the bar's prose rather than rewriting it. The wording was approved once already.

## Step 4: Confirm it worked

```bash
openspec migrate              # should report nothing, or only what was skipped
openspec compact plan         # the views that were empty now have inputs
```

Then compile. The operator is present and has just approved every change, which is the condition
`DS-VIEW-AUTHORSHIP` requires:

```bash
openspec compact seal --hat <the hats you migrated>
```

---

## Guardrails

- **Never re-decide.** A record needing migration is misfiled, not wrong.
- **Never batch.** One record, one approval.
- **Never write unapproved.** Skipping is a complete answer; the finding simply remains.
- **Never touch content.** Frontmatter and the measure anatomy only.
- **Say when a finding is a false positive.** A genuinely empty hat is not a migration.

