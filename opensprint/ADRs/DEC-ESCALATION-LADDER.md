---
id: DEC-ESCALATION-LADDER
type: adr
status: accepted
created: 2026-10-11
depth: 2
depends-on:
  - DEC-STATE-MACHINE
  - DS-ESCALATION-HANDOFF
  - DS-PROGRESSIVE-CRYSTALLIZATION
  - DEC-039
hats: [dev]
---

# DEC-ESCALATION-LADDER: Escalation Has Three Rungs, and They Are the OGSM Altitudes

## Question

[[DS-ESCALATION-HANDOFF]] made escalation a hat handoff: a question is asked with its classification already in it, the operator answers, a record is written, work resumes. That covers the common case — a missing fact.

It does not cover what happens when the answer is bigger than a record. An operator saying *"we decided that wrongly"* or *"this is not what we meant"* has no exit. The skill offers `[1] Approve  [2] Correct the classification  [3] Answer differently`, all three of which end in writing one record and carrying on.

The same gap sits at the other end. `/opsp:attest` could record a bad posture and could not say *send this back*. The only state move it had was forward.

And `/opsp:reexplore` existed without a stated boundary: "revise the milestone plan" says nothing about whether revising a decision is in scope, so in practice it was whatever the session decided.

## Decision

**Escalation has three rungs, and they are the OGSM altitudes.** What has to move decides which.

```
  the GOAL moved          objective, goal, or the bar
      → /opsp:triage, or /opsp:driver — a conversation that starts over
      → the initiative does not continue in its current form

  the STRATEGY moved      what was decided about reaching the goal
      → /opsp:repropose — supersedes ADRs, redraws the milestones beneath
      → returns the initiative to `proposed`

  the PLAN moved          the milestones implementing the strategy
      → /opsp:reexplore — revises milestones, leaves the decision trail alone
      → leaves the initiative at `building`
```

**`/opsp:repropose` is new.** Driver-specs are its invariant: if one must change, it stops and says so. It supersedes rather than rewrites, redraws only the milestones that rested on what it superseded, and returns the initiative to `proposed`.

**Four transitions are added:**

| From | To | By | When |
|---|---|---|---|
| building | proposed | `/opsp:repropose` | an escalation found the strategy does not survive contact |
| ready-for-attestation | proposed | `/opsp:repropose` | the strategy must be restated |
| ready-for-attestation | building | `/opsp:attest` | a change is requested — the plan holds, the work does not |
| ready-for-attestation | building | `/opsp:reexplore` | re-planning adds work *(already existed)* |

**A change request is not a repropose.** Attestation finding that something is missing, where building it is all that is needed, goes back to `building` with nothing superseded. That is the plan not having been finished, not the plan being wrong.

## Consideration Factors

| | Three rungs | One escalation path (status quo) | Two rungs (no repropose) |
|---|---|---|---|
| A wrong decision has somewhere to go | ✓ | ✗ — written as a new record beside the wrong one | ✗ — collapses into a plan change |
| Attestation can send work back | ✓ | ✗ | ✓ |
| The decision trail survives | ✓ — supersede, never rewrite | ✗ | ✗ — re-explore would edit ADRs |
| Re-entry state is right | ✓ — strategy re-entry forces apply to reopen | n/a | ✗ — plan and strategy re-enter alike |
| A tool to learn | ✗ — one more | ✓ | ✓ |

## Rationale

**The rungs are not invented; they are already the artifact hierarchy.** Driver-specs hold the objective and the goal, ADRs hold the strategy, milestones hold the plan. [[DS-PROGRESSIVE-CRYSTALLIZATION]] says an initiative's state is how far down OGSM it has crystallized, so *falling back* must be expressible in the same terms. The ladder is what the records already are, read downwards.

That also makes the test mechanical rather than a judgement call: **what has to move?** Nobody has to decide whether something is "a big change". They have to say whether a driver-spec changes, an ADR changes, or a milestone changes — and those are three different files.

**Re-entering at `proposed` rather than `building` is the load-bearing part.** A restated strategy has a bar nothing has been built against yet. Re-entering at `building` would let revised milestones ride on a state claiming work was already underway against them, which is precisely the bookkeeping [[DEC-STATE-MACHINE]] exists to prevent. A plan revision needs no such reset, because the strategy it implements has not moved.

This is why the two rungs cannot be one tool with a flag. The state they return to is the difference between them.

**Repropose supersedes rather than edits**, which is [[DS-PARALLEL-EXEC]]'s multiverse reasoning applied backwards in time. A superseded ADR is how someone later reads why the first answer looked right; delete it and only the current answer remains, which always looks obvious. The cascade then surfaces as `decision-on-superseded` rather than being tracked by hand.

**Attestation needed its own exit because it is the last gate before merge.** [[DEC-030]] makes attest-then-archive-then-merge one pull request. An attester who can only record a verdict is a reviewer who can only comment — and the moment the review has teeth is the moment the work can be sent back. `ready-for-attestation → building` is that.

**The "not what we meant" case is the one this whole lifecycle exists to catch**, and it had no home. It is not a defect: nothing is broken, every bar may pass, and the thing still serves the goal badly. It is a strategy that was underspecified, discovered by the only people who could discover it, at the only point they were asked to look.

## Invalidation Trigger

If operators routinely reach for `/opsp:repropose` where `/opsp:reexplore` would do — because returning to `proposed` feels more thorough — the rungs are being chosen by instinct rather than by what moves, and the question in the escalation prompt needs to be mechanical rather than offered.

If `/opsp:repropose` is routinely used to change a driver-spec despite the guardrail, the goal rung needs a tool of its own rather than a hand-off to [[DEC-039]]'s triage.
