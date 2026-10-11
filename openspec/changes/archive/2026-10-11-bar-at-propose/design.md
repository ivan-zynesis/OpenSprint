## Context

`DS-PROGRESSIVE-CRYSTALLIZATION` says an initiative's state is how far down OGSM it has crystallized: Objective and Goal at exploration, **Strategy and the bar at proposal**, posture and evidence at attestation. Three documents said the bar lands at propose. No instruction did.

## Goals / Non-Goals

**Goals**
- The template an agent copies carries the hat, the role and the bar
- An operator who cannot state a bar yet records that, rather than one being invented
- `/opsp:repropose` is classified by whose record it is, not by which section it touches

**Non-Goals**
- Backfilling existing records. `constraint-unmeasurable` reports them; closing them is attestation's job.
- Refusing to create a driver-spec without a bar. The honest gap is a legitimate answer.
- Changing `DEC-027`. The three modes are right; the roster was written before repropose existed.

## Decisions

**The template is the instruction.** `DEC-STATE-MACHINE` found this exact failure one milestone ago: `/opsp:propose`'s initiative template omitted `state:` while a guardrail further down said to set one, and agents followed the template. The same shape here — prose claiming the bar is written at propose, a template with no `## Measures` in it. Putting it in the template is the whole fix.

**`/opsp:repropose` writes in `create` mode.** The distinction between `create` and `amend` is **whose record it is**, not which section is touched.

`/opsp:attest` writes posture into a record authored by somebody else, at a different altitude, after the fact. That needs bounding, and `DEC-027` bounds it with `checkAmendment`.

`/opsp:repropose` wears product and maintainer — the hat that wrote the bar in the first place. It is the propose stage run again. The Statement stays out of bounds, but because changing it means the **goal** moved and that is `/opsp:reideate`'s rung, not because a write mode is being borrowed.

Classifying it as `amend` would have produced a check that enforces the wrong thing: `checkAmendment` would reject a repropose that legitimately rewrites a bar's `### Bar` block alongside the strategy it measures.

**`DEC-027` is not edited.** It was silent about a tool that did not exist. A new decision that names repropose's mode is the shape `/opsp:repropose` itself prescribes — supersede where the answer changed, add where the record was silent.

**`DEC-HAT-HANDOFFS` is not edited either.** Its misclassification is in the historical record and stays there; this decision supersedes the claim without rewriting the page that made it. That is the multiverse rule applied to the project's own reasoning.

## Risks / Trade-offs

**Asking for a bar at intake may be too early.** `/opsp:driver` records a constraint the moment an operator states it, and the measure often is not known then. The honest gap handles it, but if `unstated` becomes the common answer rather than the exception, the bar belongs at triage — where the strategy is brainstormed — rather than where the constraint is recorded. That is the invalidation trigger.

**Nothing enforces it.** The template carries the section; an agent can still write a driver-spec without one. `constraint-unmeasurable` reports that, which is the same enforcement every other record shape has.
