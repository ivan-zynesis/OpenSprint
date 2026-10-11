---
name: opensprint-repropose
description: Restate an initiative's strategy when what was built does not meet it. Supersedes ADRs and revises milestones; the driver-specs do not move.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: opensprint
  version: "1.0"
  generatedBy: "0.0.9"
---

Restate an initiative's **strategy** when what was built does not meet it.

**Input**: the initiative name after `/opsp:repropose`. If omitted, list initiatives at `building` or `ready-for-attestation` and let the operator choose.

---

## Which rung is this?

Escalation has three rungs, and they are the OGSM altitudes (`DEC-ESCALATION-LADDER`):

```
  the GOAL was wrong            → a new initiative, or /opsp:driver
      the objective or the goal no longer says what the business needs

  the STRATEGY was wrong        → YOU ARE HERE
      the goal holds. What was decided about how to reach it does not.

  the PLAN was wrong            → /opsp:reexplore
      the goal and the strategy hold. The milestones that implement them do not.
```

**The test is what has to move.** If a driver-spec's Statement or its bar must change, this is the
wrong tool — the goal moved, and that is a conversation with product that starts over. If only the
milestones must change, `/opsp:reexplore` is cheaper and leaves the decision trail alone.

Repropose is the middle: **driver-specs untouched, ADRs superseded, milestones redrawn beneath
them.**

## What brings you here

Two routes, and they feel different:

**From `building`** — an escalation during implementation found that the strategy does not survive
contact. Not a missing fact that one new ADR answers; a decision that was made and is wrong.

**From `ready-for-attestation`** — product or maintainer looked at what was built and said *this
is not what we meant*. The goal is right and the thing in front of them does not serve it. That is
not a defect report — a defect goes back to `building` through `/opsp:attest`'s change request.
It is a statement that the **strategy** was underspecified, and the misunderstanding is the finding.

---

## Step 1: Establish what still holds

Read the initiative and the surrogate it claims:

- `opensprint/initiatives/` — resolve by the `id:` in frontmatter, not by filename
- every driver-spec the initiative lists, and its `## Measures`
- every ADR the initiative lists, and what each `depends-on`
- `opensprint/DECISION-MAP.md` — what rests on what

Then state the invariant out loud, to the operator:

```
Unchanged (the goal):
  DS-SETTLEMENT-WINDOW   settlement completes within 4h of the originating transaction
                         bar: given a transaction at T, when 4h elapse, then it has settled

In question (the strategy):
  DEC-BATCH-SETTLEMENT   hourly batch job          ← does not meet the bar under backlog
  DEC-RETRY-BUDGET       3 attempts, 20m apart     ← rests on the above

Milestones resting on these: 2 of 5 (settlement-runner, retry-policy)
```

**If the operator corrects the invariant** — if a driver-spec or a bar must change after all —
**stop.** Say that this is the goal moving, not the strategy, and hand to `/opsp:triage` or
`/opsp:driver`. Repropose that quietly edits a driver-spec has removed the one line in the ladder
that makes the rungs mean anything.

## Step 2: Supersede, never rewrite

```markdown
status: superseded
superseded-by: DEC-CONTINUOUS-SETTLEMENT
```

The old decision keeps its Question, its Operator Decision, its Consideration Factors and its
Rationale **exactly as written**. You are not correcting a record; you are recording that the
answer changed.

This is `DS-PARALLEL-EXEC`'s multiverse reasoning applied backwards in time. A superseded ADR is
how someone later reads why the first answer looked right — delete it and the only thing left is
the current answer, which always looks obvious. The compile reports
`decision-on-superseded` for anything still resting on it, which is how the cascade surfaces
rather than being tracked by hand.

Then write the replacement with `/opsp:decide`:

- a **semantic id**, never a number (`DEC-036`)
- `depends-on` pointing at the same driver-spec — the goal did not move
- the Question stating **what changed**, not only what is decided: *"DEC-BATCH-SETTLEMENT assumed a
  steady arrival rate. Under backlog it misses the bar. What replaces it?"*
- an Invalidation Trigger that would have caught the first one

**Where the strategy was not wrong but silent**, add rather than supersede. An escalation that
found nobody had decided something is a gap, and a gap is filled with a new ADR beside the old
ones.

## Step 3: Redraw the milestones beneath them

Only the milestones that rested on the superseded decisions.

**Not yet started** — rewrite the milestone in the initiative. Nothing else to do.

**In flight** — supersede the opsx change rather than editing it:

```bash
mv openspec/changes/<name> openspec/changes/archive/$(date +%Y-%m-%d)-<name>-superseded
```

**Already archived** — leave it alone and add a corrective milestone. Completed work is immutable;
the decision trail is worth more than a tidy plan.

Mark superseded milestones so they stop holding the initiative open:

```markdown
- [x] ~~settlement-runner~~ (superseded by continuous-settlement)
- [ ] continuous-settlement: stream settlement off the transaction log
```

## Step 4: Return it to proposed

```bash
opensprint advance <initiative-name> --to proposed
```

**Back to `proposed`, not `building`.** That is the whole point of the rung: a restated strategy
has a bar nobody has worked against yet, and `/opsp:apply` must open it again. Re-entering at
`building` would let revised milestones ride on a state that claims work was already underway
against them (`DEC-ESCALATION-LADDER`).

The board moves the card from Doing or Handoff back to Next, which is the honest picture: this
initiative is committed and not started.

## Step 5: Record why

In the initiative, under `## Description` or a `## Revisions` section:

> **Reproposed 2026-10-11** — `DEC-BATCH-SETTLEMENT` superseded by
> `DEC-CONTINUOUS-SETTLEMENT`. Hourly batching met the bar at steady state and missed it under
> backlog, which attestation surfaced. `DS-SETTLEMENT-WINDOW` unchanged. Milestones
> `settlement-runner` and `retry-policy` superseded; `continuous-settlement` added.

**Name what did not change.** A revision log that lists only what moved reads, six months later,
as though everything was in doubt.

---

## Guardrails

- **Driver-specs are the invariant.** If one must change, this is the wrong rung. Stop and say so.
- **The bar does not move here.** It lives in the driver-spec's `## Measures`. A strategy that
  cannot meet the bar is a strategy to replace, not a bar to lower.
- **Supersede, never rewrite.** The old ADR keeps every word. `status` and `superseded-by` are
  the only fields that change.
- **Archived work is immutable.** Add a corrective milestone; never edit a completed change.
- **Stop at proposed.** Repropose plans. `/opsp:apply` implements.
- **The operator decides.** Surface the cascade and the cost; do not pick the new strategy for them.
- **Regenerate `DECISION-MAP.md`** after superseding anything.

