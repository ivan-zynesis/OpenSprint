---
name: "OPSP: Reideate"
description: "Think again at the objective and goal — writes nothing, returns to exploring"
category: Workflow
tags: [workflow, opsp, reideate, ideation, goal]
---

Think again at the **objective and goal**, with the work in hand.

**Input**: the initiative name after `/opsp:reideate`. If omitted, list initiatives at `building` or `ready-for-attestation` and let the operator choose.

---

## This is `/opsp:explore`, later

The symmetry is the point. `/opsp:explore` is thinking time before anything exists and **writes
nothing**. This is thinking time when a great deal exists and the goal it was built for no longer
holds — and it writes nothing either (`DEC-HAT-HANDOFFS`).

A tool called *re*-explore that produced artifacts would not be re-exploring. That tool exists and
is called `/opsp:repropose`.

```
  /opsp:explore  ──► /opsp:backlog ──► /opsp:triage ──► /opsp:propose ──► ...
  /opsp:reideate ──┘
        the same road, rejoined, with everything you learned building
```

## Which rung is this?

```
  the GOAL moved          → YOU ARE HERE
      the objective, the goal, or what the business needs no longer holds

  the STRATEGY moved      → /opsp:repropose
      the goal holds. What was decided about reaching it does not, and the
      measures and milestones beneath it are redrawn.

  the work is MISSING     → a change request from /opsp:attest
      everything holds. It was not finished.
```

**The test**: does a driver-spec's **Statement** have to change? If only its `## Measures` move, the
goal still holds and this is `/opsp:repropose`.

---

## Put the right hat on first

This is **product** and **maintainer** work (`DS-SQUAD-HATS`). You have been wearing dev, and the
objective is not dev's to restate.

```
══ HAT CHANGE ═══════════════════════════════════════════════════
   setting down:  dev, devops
   picking up:    product, maintainer
   because:       the goal is in question, and dev does not own it
```

**Set down what you are holding** — the diff, the test output, the escalation you were resolving.
An objective rethought while holding an implementation becomes a rationalisation of that
implementation.

## Step 1: Load the goal, not the build

Read the initiative in `opensprint/initiatives/` — **resolve by the `id:` in frontmatter, not by
filename.** Filenames carry a creation-date prefix (`20261011-<name>.md`), so `<name>.md` will not
exist; `openspec compact board` lists every initiative with its path.

```
  LOAD                                 DO NOT LOAD
  ──────────────────────────────       ─────────────────────────────
  the initiative's Objective + Goal    the implementation
  the driver-specs it claims           the milestone plan in detail
  the real-world context that          the ADRs' rationales
    prompted it
  what attestation found, if any
```

**What attestation found is the most valuable input here**, where there is any. A posture of
`not met` with a stated exposure is the clearest evidence a goal was wrong that this process ever
produces.

## Step 2: Think

Architect altitude, same as `/opsp:explore`:

- what did building this teach us that we did not know when we set the goal?
- is the objective still the right one, or did the world move?
- does the goal still serve the objective?
- what would we have written, knowing what we know?
- is this the same initiative at all?

**Write nothing.** No driver-specs, no ADRs, no milestones. This is thinking time and the whole
value is that nothing is committed while you do it.

## Step 3: Conclude

Three ways out:

### The goal holds after all

Say so and stop. The initiative's state does not change. If the strategy is what needs restating,
hand to `/opsp:repropose`; if the work was simply unfinished, hand back to `/opsp:apply`.

A re-ideation that concludes nothing changes is a **successful** re-ideation. Record it:

> **Re-ideated 2026-10-11** — attestation found `DS-SETTLEMENT-WINDOW` not met. Reconsidered
> whether 4h is the right window; it is, and the strategy is what failed. To `/opsp:repropose`.

### The goal moved

```bash
opensprint advance <initiative-name> --to exploring --hat product
```

Then **mark the milestones that served the old goal as superseded**, because they did:

```markdown
- [x] ~~settlement-runner~~ (superseded — served the 4h window, which no longer holds)
```

Superseded milestones stop holding the initiative open and keep their history, which is what
makes the record readable later rather than tidy now.

Then carry on as you would have the first time:

```
  /opsp:backlog   persist the restated objective and goal
  /opsp:triage    brainstorm the strategy that follows from it
  /opsp:propose   formalize — new driver-specs, new ADRs, new milestones, a new bar
```

**The work already done is not wasted and not pretended away.** It sits in the initiative's history
as milestones that served a goal that no longer holds, which is exactly what happened.

### This is a different thing entirely

Where the rethink produces something that is not this initiative, say so and hand to
`/opsp:triage`. Declining this one and backlogging the new one keeps both honest —
`DEC-035` makes `declined` terminal but not permanent, and the reason recorded on the way out is
worth more than the idea.

---

## Guardrails

- **Writes nothing.** Like `/opsp:explore`. The only write is the state move and the milestone
  supersessions that follow it.
- **Product and maintainer, not dev.** State the hat change out loud before thinking.
- **Do not load the implementation.** An objective rethought while holding a diff rationalises it.
- **If only `## Measures` moves, you are on the wrong rung** — that is `/opsp:repropose`.
- **Concluding "no change" is a result**, not a failure. Record it.
- **Rejoin the road.** Reideate does not propose; `/opsp:backlog` and `/opsp:propose` do.

