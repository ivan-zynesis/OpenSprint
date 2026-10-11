---
name: "OPSP: Triage"
description: "Pick up a backlog item — advance, decline, or return it"
category: Workflow
tags: [workflow, opsp, triage, initiative, strategy]
---

Pick up a backlog item and decide what happens to it.

**Input**: an initiative name after `/opsp:triage`. If omitted, list items at `state: exploring`.

---

## Where this sits

```
   explore  --think-->  backlog  --persist-->  initiative (O + G)
   TRIAGE   --think-->  propose  --persist-->  + DS · ADRs · milestones (S + M)
```

Two think/persist pairs. You are the thinking half of the second one: **strategy brainstorming**,
ending in a decision about whether this becomes work.

`/opsp:triage` exists for **explicitness rather than capability** (`DEC-039`). `/opsp:propose` could
absorb it and would behave acceptably — but a phase that exists in practice and has no name is a
phase nobody reasons about.

## Step 1: Find the item and its worktree

```bash
openspec compact board          # Backlog column
```

The initiative lives on its own branch (`DEC-029`). Switch to its worktree, or create one if the
item was written before that rule. Verify with `pwd` and `git branch --show-current`.

Load the surrogate — driver-specs, ADRs, `architecture.md` — before judging anything. A backlog item
that looked novel in isolation is frequently answered already.

## Step 2: Brainstorm the strategy

The item holds an Objective and a Goal. What it lacks is **how** — and whether that how is worth
doing.

Think about approach, not implementation:

- what are the two or three genuinely different ways to reach this goal?
- what does each cost, and what does each foreclose?
- which existing decisions constrain the choice? Which would it invalidate?
- what would have to be true for this to be the wrong thing to build?

This is architect-level. If you find yourself discussing function names, you have gone too deep —
that is opsx's altitude, reached through `/opsp:apply`.

## Step 3: Decide

Three outcomes, and **declining is first-class**:

### Advance

The approach is clear enough to formalize. Say what the strategy is, in a sentence, and hand to
`/opsp:propose` — which writes the driver-specs, the ADRs, the milestones and the bar.

### Decline

```markdown
state: declined
```

…and **record why**, in the initiative. The reason is worth more than the idea:

> Declined 2026-10-11 — the licensing cost of the managed option exceeds the operational saving at
> our volume. Revisit if volume triples or the pricing model changes.

The same proposal returns in six months. One recorded line ends that conversation in a minute.

`declined` is terminal but **not permanent** (`DEC-035`). Reviving it returns it to `exploring`,
keeping its history including the earlier decline.

### Return it

The idea is worth keeping and not yet thought through. Leave it at `exploring`, note what is
missing, and say what would need answering before it could be triaged again.

## Step 4: Stop

Whatever you decided, say it plainly and stop. Advancing means handing to `/opsp:propose`, not
beginning it.

---

## Guardrails

- **Load the surrogate first.** Most items are partly answered already.
- **Architect altitude.** Approaches and trades, not implementations.
- **Declining is a real outcome**, not a failure to decide. Record why.
- **Never formalize here.** No driver-specs, no ADRs, no milestones — that is `/opsp:propose`.
- **Never advance silently.** The operator decides; you recommend.

