## Why

Milestone 3 of `surrogate-currency`, and the one that changes what an escalation *is*.

Today `/opsp:apply` treats an escalation as a question to ask and move past: reformulate it, get an answer, then **classify afterwards** — *"new ADR? new driver-spec? update to existing?"*. That leaves the operator writing prose somebody then has to file, and it never says which hat they are answering in.

`DS-ESCALATION-HANDOFF` reframes it: a specification that does not cover everything a developer needs is the **normal case**, not a defect. When the surrogate cannot answer a driver-spec question, apply has correctly discovered that product or maintainer left something unsaid — and should hand back, visibly.

## What Changes

- **The pause renders as a stage boundary.** The dev hat is explicitly set down and picked back up; apply's state says it is paused and awaiting a named hat
- **Classification moves into the question.** The escalation presents an inferred hat, a draft record and the blast radius, so the operator approves a slot rather than composing prose against a schema they cannot see
- **The hat is inferred, never asked.** No separate "which hat is this?" prompt — confirmation happens by approving the record
- **Approval is explicit**, and the affected hat's view may then be compiled, because the accountable author is present (`DEC-COMPILE-ON-APPROVAL`)

## Capabilities

### Modified Capabilities
- `opsp-apply-workflow`: an escalation is a hat handoff with an inferred, structured question and an explicit approval

## Impact

- **It is still prose.** Inference reuses `DRIVER_SPEC_TYPE_TO_HAT` and `DEC-028`, but the judgement is the agent's and the enforcement is instruction, as with `DEC-043`.
- **More ceremony on something frequent.** Accepted deliberately — ceremony is what makes a hat switch real while most hats are worn by one person. The invalidation trigger names the alternative: if escalations become frequent enough that the ceremony is skipped, the fix belongs at propose, where the bars are too thin.
- **Modified**: `src/core/templates/workflows/opsp-apply.ts`
