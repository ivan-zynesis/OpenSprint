---
id: DEC-HAT-HANDOFFS
type: adr
status: accepted
created: 2026-10-11
depth: 3
depends-on:
  - DEC-ESCALATION-LADDER
  - DEC-STATE-MACHINE
  - DS-HATS-AS-CONTEXT
  - DS-SQUAD-HATS
hats: [dev]
---

# DEC-HAT-HANDOFFS: Reideate Is Explore, Later — and Every Transition Names Its Hat

## Question

[[DEC-ESCALATION-LADDER]] put three rungs in place and got two of them wrong.

`/opsp:reexplore` was assigned the plan rung — revise milestones, leave the decision trail alone. But that *is* what `/opsp:repropose` does: superseding a strategy redraws the milestones that rested on it, and there is no interesting case where milestones change and nothing above them did. The two tools overlapped almost entirely, and the name was the giveaway: a tool called *re*-explore that produces artifacts is not re-exploring. `/opsp:explore` writes nothing.

So the plan rung had a tool it did not need and the **goal** rung had no tool at all — it was a hand-off to `/opsp:triage` with no stated process.

Separately: [[DEC-STATE-MACHINE]] made every transition a command, and said nothing about who may run it. [[DS-HATS-AS-CONTEXT]] says most hats are the same engineer, which makes every handoff invisible unless something declares it.

## Decision

**`/opsp:reexplore` becomes `/opsp:reideate`, and moves to the goal rung.**

It is `/opsp:explore` with the work in hand: thinking time at the objective and goal, **writing nothing**, returning the initiative to `exploring`. The operator then rejoins the road — `backlog → triage → propose` — exactly as the first time. Milestones that served the old goal are marked superseded, because they did.

**`/opsp:repropose` absorbs the plan rung**, and its scope gains the measures:

```
  MAY CHANGE                           MUST NOT CHANGE
  ------------------------------       -----------------------------
  ADRs — superseded, or added          a driver-spec's Statement
  a driver-spec's ## Measures          its objective, goal or role
  the bar, where the strategy
    changed how it is known met        anything outside ## Measures
  milestones resting on the above
```

That is [[DEC-027]]'s **amend** mode, now used by a second tool. A record's claim never changes under a reader who cited it; how that claim is measured is allowed to improve.

**A bar that got easier is a goal that moved.** If the new bar is lower rather than different, that is `/opsp:reideate`, and the operator is told so in those words.

**Every transition declares the hat it must be made wearing, and whether making it is a handoff.** Where it is, `opensprint advance` refuses the move until `--hat` names an accepted accountability.

| From | To | By | Hat | Handoff |
|---|---|---|---|---|
| exploring | proposed | `/opsp:propose` | all four | |
| exploring | declined | `/opsp:triage` | product · maintainer | |
| declined | exploring | `/opsp:triage` | product · maintainer | |
| proposed | building | `/opsp:apply` | dev · devops | **yes** |
| building | ready-for-attestation | `/opsp:apply` | dev · devops | **yes** |
| building | proposed | `/opsp:repropose` | product · maintainer | **yes** |
| building | exploring | `/opsp:reideate` | product · maintainer | **yes** |
| ready-for-attestation | building | `/opsp:attest` | product · maintainer | |
| ready-for-attestation | proposed | `/opsp:repropose` | product · maintainer | |
| ready-for-attestation | exploring | `/opsp:reideate` | product · maintainer | |
| ready-for-attestation | attested | `/opsp:attest` | product · maintainer | |
| attested | completed | `/opsp:archive` | all four | **yes** |

## Consideration Factors

| | reideate at the goal rung | reexplore at the plan rung |
|---|---|---|
| The name describes the behaviour | ✓ — writes nothing, like explore | ✗ — "re-explore" produced artifacts |
| Overlaps repropose | ✗ | ✓ — almost entirely |
| The goal rung has a process | ✓ | ✗ — an unspecified hand-off to triage |
| Evidence from the build can reach the objective | ✓ | ✗ |

| | `--hat` required on a handoff | Announce it in prose | Nothing |
|---|---|---|---|
| Survives an agent that skips it | ✓ — the move fails | ✗ | ✗ |
| Makes the operator state an accountability | ✓ | ✗ | ✗ |
| Verifies the context was actually cleared | ✗ | ✗ | ✗ |
| Costs a flag | ✗ | ✓ | ✓ |

## Rationale

**The symmetry is the argument.** `explore → backlog → triage → propose` is the road in. `reideate` rejoins it at the top, which means the goal rung needs no new vocabulary, no new artifacts and no new stage — it reuses the one the project already has. A fallback path that reuses the forward path is one fewer thing to learn and one fewer thing to drift.

**Nothing is lost by writing nothing.** The objection to a tool that produces no artifact is that the thinking evaporates. It does not: `/opsp:backlog` is the deliberate flush and already exists, and routing through it means a re-ideated goal is persisted by the same tool, in the same shape, as an original one.

**`## Measures` is the right boundary for repropose** because it is already the boundary for attest. A new strategy frequently makes a genuinely different thing observable, and a bar still describing the old mechanism is worse than no bar — it reads as a target when it is an artefact. Meanwhile the Statement, which is what everything downstream cited, does not move.

**The bar-lowering guard is the load-bearing part of that.** Letting a tool touch `## Measures` without it would make repropose the quiet path to "we didn't hit it, so change what we were aiming at". Naming that case and routing it to `/opsp:reideate` makes lowering a target a *decision somebody takes at the goal altitude* rather than an edit.

**`--hat` is the cheapest enforceable version of "change context".** No command can verify that a context window was cleared or that a human re-read the records. What it can do is refuse to move until somebody states which accountability they are exercising — and the moment of stating it is the moment the switch becomes deliberate. The same reasoning as the escalation prompt carrying its classification: the question is not *whether* you can bypass it, but whether bypassing it is something you did on purpose.

**Not every transition is a handoff, and marking them all would make the flag meaningless.** All three of attestation's exits are product and maintainer work, and so is attestation — the hat change already happened, at the handoff into `ready-for-attestation`. That is what the handoff was for.

## Invalidation Trigger

If operators pass `--hat` reflexively without changing context, the flag has become a password rather than a step, and the handoff needs a stronger marker — a separate session, or a check on what the context has loaded.

If `/opsp:reideate` is routinely used where `/opsp:repropose` would do, because returning to `exploring` feels more thorough, the Statement test is not landing and should be asked mechanically rather than offered.
