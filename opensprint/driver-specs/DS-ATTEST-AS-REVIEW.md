---
id: DS-ATTEST-AS-REVIEW
type: product
status: active
created: 2026-10-10
hats: [product, maintainer]
role: strategy
objective: change-quality
depends-on:
  - DS-ATTESTED-TRUTH
  - DS-SURROGATE-SCOPE
---

# DS-ATTEST-AS-REVIEW: Attestation Reviews the Implementation Against the Stated Strategy

## Statement

Attestation is not only a sign-off on artifacts. It is **the review of how the implementation
matches the strategy that was proposed** — and it is the moment a change hands off from `dev` into
`sec` and `ops`.

It reads the **test files**, and still never reads the implementation source, the design discussion
or the decision rationales.

Every attestation answers three questions beyond the bars:

1. **One-way door or two-way door.** Can this be rolled back without irreversible damage?
2. **Blast radius.** What does this affect — especially where an exposure is being accepted?
3. **RACI, for whatever no system handles.** `dev` is done when the pull request closes. Past that
   point the change lives in security and operations. For every follow-up concern a system does not
   handle automatically, a human is named: **R**esponsible, **A**ccountable, **C**onsulted,
   **I**nformed.

The verdict drives what else is required:

| Posture | Requires |
|---|---|
| met | **evidence**, cited |
| partially met · not met · cannot assess | **exposure**, naming what remains |

## Rationale

The previous rule read only the bar and the CI evidence, and refused the implementation entirely.
That was right about the risk — an attester holding the source rationalises — and wrong about which
artifact carries the risk.

**A test is the implementation's own restatement of a bar.** [[DEC-038]] already writes a maintainer
bar as `given / when / then`, which is test syntax. So comparing a bar to its tests compares two
statements *at the same altitude*; comparing a bar to source compares across altitudes, and that
asymmetry is what biases an attester toward accepting, because source always looks reasonable to
whoever is reading it.

Reading tests also closes a hole the CI-only rule could not. A CI artifact proves a test **ran**; a
test file shows **what was asserted**. A green suite that never asserts the bar was previously
invisible, and it is the most common way a measure is satisfied on paper and not in fact. This does
not weaken [[DS-CI-ATTESTATION]] — where there are no tests, the outcome is still `cannot assess`,
and the pressure to invest in CI is intact.

Decision rationales stay excluded for the original reason, unchanged: an ADR is an argument *for the
mechanism that was chosen*, so loading it makes the attester assess whether the mechanism was
reasonable instead of whether the bar was met.

**The three questions exist because merging is a handoff, not a finish.** When the pull request
closes, `dev`'s accountability ends and the change becomes a security and operations concern. For
most of this project's life the `devops` hat was empty precisely because nothing ever forced anyone
to name who holds an operational concern after merge.

RACI is scoped to **whatever no system handles**. If monitoring, alerting or automation covers it,
name the system and move on. That qualifier is what keeps this from becoming bureaucracy: the table
grows only where the automation does not.

This is **change management's recording half**, which [[DS-SURROGATE-SCOPE]] admitted deliberately on
2026-10-10. Recording who holds a risk is a record; deciding whether the risk is acceptable is
governance, and stays out.

## Measures

- **Primary**: every attested initiative answers reversibility, blast radius and RACI, or records why not
- **Guardrail**: an unanswered question is an open loop, never a block ([[DEC-023]])
- **Scope**: no attestation reads the implementation source, the design discussion or an ADR rationale

### Bar

- **dimension**: review depth ←→ attester independence
- **chosen**: test files, bars and CI artifacts — never source, design or rationale
- **traded for**: the ability to diagnose *why* a bar was missed, which stays with `dev`
- **neighbour**: unrecorded — nothing says what reading the diff under a stricter protocol would buy

### Exposure

Reading tests reintroduces some of the self-assessment risk the narrow context removed, because the
agent that wrote the tests is often the one asked to attest. Lower than with source — *"does this
test assert the bar?"* is falsifiable where *"is this code reasonable?"* is not — but not zero.
mitigated-by: lifecycle-beyond-build

## Implications

- The reading scope supersedes the original: [[DEC-040]]
- Posture drives what else is required: [[DEC-041]]
- The three questions live on the initiative: [[DEC-042]]
- The same agent may not write the tests and attest them: [[DEC-043]]
