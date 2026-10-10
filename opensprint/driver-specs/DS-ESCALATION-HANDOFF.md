---
id: DS-ESCALATION-HANDOFF
type: product
status: active
created: 2026-10-10
hats: [product, maintainer]
role: strategy
objective: change-quality
depends-on:
  - DS-HATS-AS-CONTEXT
  - DS-SME-OWNERSHIP
---

# DS-ESCALATION-HANDOFF: An Escalation Is a Hat Handoff, Not an Interruption

## Statement

**A specification that does not cover everything a developer needs is the normal case, not a
defect.** Every real lifecycle produces questions the spec did not anticipate.

So when the surrogate cannot answer a question in driver-spec scope, that is not apply overstepping.
It is apply correctly discovering that product or maintainer left something unsaid, and handing
back:

```
   apply  [dev hat]
      │  surrogate consulted → cannot answer, DS scope
      ▼
   ══ PAUSE ════════════════════════════════════════
   the dev hat is set down. visibly.
   the question's hat is INFERRED, never asked
      │
      ▼
   operator answers  [product or maintainer hat]
      │
      ▼
   ══ EXPLICIT APPROVAL ════════════════════════════
   the record, and what it invalidates
      │
      ▼
   apply resumes  [dev hat]
```

Four properties:

1. **The pause is visible.** An escalation is a stage boundary, and reads as one.
2. **The hat is inferred, not asked.** Never "is this a product question?" — the agent determines it
   and carries the determination in the question.
3. **The question is structured.** It presents a draft record, so the answer can be *absorbed*
   rather than interpreted later.
4. **Approval is explicit, and shows blast radius.** The answer may change everything under
   product or maintainer; nobody can approve what they cannot see the cost of.

## Rationale

Today `/opsp:apply` classifies **after** the answer — *"new ADR? new driver-spec? update to
existing?"* — which leaves the operator writing prose that somebody then has to file. The
classification belongs **in the question**, because the agent already knows what it needs and what
shape the answer must take to be usable.

Inference rather than interrogation follows the project's existing philosophy. `hats.ts` already
says *"inference produces a suggestion; the owner confirms it"*, and the machinery exists:
`DRIVER_SPEC_TYPE_TO_HAT` maps a driver-spec type to its hat, and [[DEC-028]] fixes decisions to
`dev`/`devops`. Confirmation then happens **by approving the record**, never as a separate
classification prompt — one approval, not two questions.

Explicit approval is required because the blast radius is real: a new or changed driver-spec can
invalidate decisions already made, which is the whole reason `/opsp:rebuild-assess` exists. Stating
that cost inside the question is what makes the approval meaningful rather than reflexive.

This is also what makes [[DS-VIEW-AUTHORSHIP]] permit something it otherwise forbids. During an
approved escalation the operator **is** the product hat — present, answering, approving — which is
the only condition that rule requires.

## Measures

- **Primary**: every escalation presents an inferred hat and a draft record, not an open question
- **Visibility**: the pause is rendered as a stage boundary rather than as a prompt
- **Consent**: no product or maintainer record changes during apply without explicit approval
- **Honesty**: the blast radius is stated before approval is sought

### Exposure

Inference can be wrong, and an operator approving quickly may accept a misclassified record. The
record is correctable afterwards, but a wrong hat routes a constraint to the wrong view and the
wrong reviewer.
mitigated-by: surrogate-currency

## Implications

- The escalation renders as a stage boundary: [[DEC-ESCALATION-IS-A-STAGE]]
- Classification moves into the question: [[DEC-CLASSIFY-IN-QUESTION]]
- Approval permits compiling the affected hat's view: [[DEC-COMPILE-ON-APPROVAL]]
