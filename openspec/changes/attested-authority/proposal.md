## Why

Milestone 8 of `lifecycle-beyond-build`, and the one that makes the compiled output honest.

`architecture.md` states *"Operator-only reconciliation — absolute, not a preference"* under **Constraints & Non-Negotiables**, which reads as a fact about the running system. It is not one. `squad/maintainer.md`, compiled in the same pass from the same records, admits *"the guardrail is instruction text in a skill, which no rule reads."*

Neither is wrong. `DEC-009` gives a claim two possible authorities — **decided**, citing a record id, and **observed**, citing a path — and reasons correctly that they differ. What it did not anticipate is that **a decision that binds may simply not be true yet**, and the compiler has no third category to say so.

`DS-ATTESTED-TRUTH` adds it: a compiled claim may be stated as present-tense fact only when a human has asserted it with evidence.

## What Changes

- `### Posture` carries attestation metadata as labelled lines — `verdict`, `attested-by`, `attested-on` — read by the same explicit lookup `### Bar` uses
- `attestationOf(content)` reports whether a record is attested, by whom and when
- A record is **attested** only when its posture carries `attested-on` **and** its measure carries evidence; a verdict with no evidence is an opinion
- `compact plan` carries each record's authority, so the renderer knows which claims may be stated in the present tense
- The skill's citation contract gains the third authority and the rule that follows from it

## Capabilities

### Modified Capabilities
- `opsp-compact-engine`: a record's citation authority is computed and reported
- `opsp-compact-skill`: three authorities, and only one of them licenses the present tense

## Impact

- **Nothing is attested yet**, because `/opsp:attest` is milestone 9. Every record reports `decided` or `observed`, which is accurate — and is exactly the finding `DS-ATTESTED-TRUTH` exists to surface.
- **Backward compatible.** Attestation metadata is optional; a record without it reports `decided` as before.
- **Attestation ages, deliberately.** `attested-on` is carried and surfaced; nothing expires automatically, because `DEC-021` leaves the threshold undecided and inventing one would be worse than reporting the date.
- **Modified**: `src/core/compact/measures.ts`, `src/commands/compact.ts`, `src/core/templates/workflows/opsp-compact.ts`
