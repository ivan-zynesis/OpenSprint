---
id: DEC-CLASSIFY-IN-QUESTION
type: adr
status: active
created: 2026-10-10
depth: 1
depends-on:
  - DS-ESCALATION-HANDOFF
  - DEC-028
hats: [dev]
---

# DEC-CLASSIFY-IN-QUESTION: The Escalation Carries Its Own Classification

## Question

`/opsp:apply` classifies **after** the operator answers — *"new ADR? new driver-spec? update to
existing?"* — which leaves the operator writing prose somebody then has to file. Where does
classification belong, and should the operator be asked which hat applies?

## Decision

**Classification moves into the question, and the hat is inferred rather than asked.**

An escalation presents:

```
  ESCALATION — apply paused at milestone N

  I need to know:   <the question, at architect altitude>

  I believe this is: product · a goal
                     inferred from: the question constrains what the system
                     must do, not how it is built

  Proposed record:   DS-SETTLEMENT-WINDOW
                     <the statement as it would be written>
                     ## Measures — bar: given / when / then …

  If you confirm, this changes:
      · 2 decisions depend on DS-RTO and may need re-evaluation
      · milestone 3 is scoped against it

  Approve · Correct the classification · Answer differently
```

**There is never a separate "which hat is this?" prompt.** Confirmation happens by approving the
record.

Inference reuses what exists: `DRIVER_SPEC_TYPE_TO_HAT` for driver-specs, [[DEC-028]] for decisions,
and the subject matter of the question itself.

## Consideration Factors

| Factor | Weight | Classify in the question | Classify after the answer (today) | Ask which hat |
|---|---|---|---|---|
| The answer is absorbable | HIGH | Lands in a slot ✓ | Prose someone must file ✗ | ✓ |
| The operator answers in a hat | HIGH | Named before they answer ✓ | Not named ✗ | ✓ |
| Number of questions asked | HIGH | One ✓ | One ✓ | **Two** ✗ |
| Inference is correctable | HIGH | "Correct the classification" ✓ | — | ✓ |
| The agent must get it right | MED | Can be wrong ✗ | No inference needed ✓ | Operator decides ✓ |

## Rationale

The agent already knows what it needs and what shape the answer must take to be usable. Withholding
that and asking an open question is throwing away information the operator then has to reconstruct.

Not asking the hat separately follows the project's own stated philosophy. `hats.ts` says
*"inference produces a suggestion; the owner confirms it"* — and the confirmation that matters is
approving the record, not answering a classification quiz. Two prompts where one will do trains
people to click through both.

Presenting a **draft record** rather than a question is what makes the difference concrete. The
operator reads a statement they can correct, which is a far easier judgement than composing prose
against a schema they do not have in front of them.

Stating the **blast radius** inside the question is what makes [[DEC-COMPILE-ON-APPROVAL]]'s approval
meaningful. Nobody can consent to a change whose cost is not shown, and a driver-spec can invalidate
decisions already made — which is the entire premise of `/opsp:rebuild-assess`.

## Invalidation Trigger

If operators frequently choose "correct the classification", inference is unreliable and should
present two candidates rather than one assertion. If they approve drafts without reading them, the
draft has become a rubber stamp and the blast radius needs to lead rather than follow.
