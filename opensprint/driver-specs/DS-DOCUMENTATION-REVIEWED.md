---
id: DS-DOCUMENTATION-REVIEWED
type: product
status: active
created: 2026-10-10
hats: [product, maintainer]
role: strategy
objective: change-quality
depends-on:
  - DS-DOCUMENTATION-AS-OUTPUT
  - DS-ATTEST-AS-REVIEW
---

# DS-DOCUMENTATION-REVIEWED: Documentation Quality Is Reviewed at Attestation

## Statement

Attestation reviews **how well the documentation is already done**, and improves it where it is
thin.

The question is not *who wrote it* — documentation is not owned by `product` or `maintainer` by
virtue of being documentation. The question is whether what exists is **adequate and complete for
what shipped**.

This is the second audience. The compiled surrogate under `opensprint/` is the **operating** record:
detailed, cited, read by agents and by whoever is doing the work. A separate, far more condensed
account belongs to **external stakeholders who never open the repository** — and it lives in a
documentation directory, `docs/` by default.

`/opsp:attest` is where that account is written. It grills the operator, produces the answers in
context, and then **urges them into the documentation directory** rather than leaving them in a
conversation that ends.

## Rationale

Documentation was already a compiled output ([[DS-DOCUMENTATION-AS-OUTPUT]]), and that remains true
of the surrogate. What compiling cannot produce is the account someone outside the repository needs:
shorter, free of record ids, written for a reader who will never follow a citation.

Nothing in the lifecycle asked for that account, and nothing checked whether it existed. Attestation
is the natural moment — it is the last point before a change reaches production, the operator is
already being asked what shipped and what remains exposed, and the answers to those questions *are*
the material an external account is made of.

Reviewing rather than authoring is the important distinction. The documentation may have been
written by anyone, at any point. What attestation owns is its **quality and completeness against
what actually shipped**, which is a judgement nobody else in the lifecycle is positioned to make:
`product` wrote the intent before the work, `dev` was inside it, and only the attester is looking at
the finished thing from outside.

**Urging rather than writing silently** is deliberate. The operator decides what an external reader
should be told; the tool makes sure the question is asked and the answer lands somewhere durable.

## Measures

- **Primary**: every attested initiative records a judgement on documentation adequacy
- **Location**: external-facing documentation is written to the configured documentation directory, `docs/` by default
- **Guardrail**: inadequate documentation is an open loop, never a block

### Exposure

The documentation directory is prose for humans, so nothing compiles or checks it. An account that
drifts from what shipped will not fail a build the way a compiled view does — only the next
attestation will notice.
mitigated-by: lifecycle-beyond-build

## Implications

- Attest gains a second write target, configurable: [[DEC-044]]
- The operating surrogate and the external account stay separate, by audience and density
- This answers, in part, the deferred question of a published documentation surface
