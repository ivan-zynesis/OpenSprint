---
id: DS-ATTESTED-TRUTH
type: compliance
status: active
created: 2026-10-01
hats: [product, maintainer]
role: goal
objective: integrity-correctness
depends-on:
  - DS-DOCUMENTATION-AS-OUTPUT
---

# DS-ATTESTED-TRUTH: Nothing Is Documented as True Until It Is Attested

## Statement

**A compiled claim may be stated as present-tense fact only when a human has asserted it with evidence.**

Documentation depends on attestation. You cannot document something that has not been attested — what you produce otherwise is intent wearing the grammar of state.

This gives a compiled claim three possible authorities, where [[DEC-009]] recognised two:

| Authority | Cited by | Says | Weakness |
|---|---|---|---|
| **decided** | a record id | it binds | may not be true yet |
| **observed** | a path | it is true now | may be an accident |
| **attested** | evidence ref · date · attester | asserted true, with an artifact behind it | ages |

Only **attested** licenses the present tense.

## Rationale

The gap is visible in this project's own output today. `architecture.md` lists *"Operator-only reconciliation — absolute, not a preference"* under **Constraints & Non-Negotiables**, which reads as a fact about the running system. It is not one. Two files away, `squad/maintainer.md` admits it: *"the guardrail is instruction text in a skill, which no rule reads."*

Both statements were compiled, in the same pass, from the same records. Neither is wrong. The compiler simply had no way to distinguish a decision that binds from a property that holds, because [[DEC-009]]'s two authorities do not cover the difference.

[[DS-DOCUMENTATION-AS-OUTPUT]] argues that a compiled document is honest because it cannot drift without the compile reporting it. That is true of drift *from the records*. It says nothing about drift between the records and reality — which is the drift a reader actually cares about, and the one attestation closes.

The weakness of attestation is that it ages: an attestation is true as of a date and an artifact, and both go stale. That is a far better failure mode than a claim that was never true at all.

## Measures

- **Primary**: no compiled claim is stated in the present tense without an attestation behind it
- **Guardrail**: a compiled view visibly distinguishes decided, observed and attested claims
- **Freshness**: an attestation carries a date, so staleness is computable rather than assumed

### Posture

- **verdict**: partially met
- **attested-by**: Ivan Lee
- **attested-on**: 2026-10-11

Classification of a record as decided or attested is asserted, including that an attestation needs
both a date and evidence and that the date carries without expiring
(`test/core/compact-measures.test.ts`). Not asserted: the tense of compiled claims (**Primary**); the
`observed` authority in compiled output — the test titled "three authorities" checks two, neither of
them `attested` (**Guardrail**); and that a verdict with evidence but no `attested-on` is downgraded
(**Freshness**).

### Exposure

A compiled view may state present-tense claims with no attestation behind them, and the
decided / observed / attested distinction is unverified in rendered output.

## Implications

- `attested` becomes a third citation authority: [[DEC-021]]
- Attestation needs its own tool; it cannot live inside compact: [[DEC-022]]
- That tool writes records but never gates, or it becomes certification: [[DEC-023]]
- Attestation produces the ex-post half of every measure: [[DS-MEASURE-ANATOMY]]
