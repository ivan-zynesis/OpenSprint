---
id: DS-CI-ATTESTATION
type: reliability
status: active
created: 2026-10-09
hats: [product, maintainer]
role: strategy
depends-on:
  - DS-ATTESTED-TRUTH
---

# DS-CI-ATTESTATION: Evidence Is a CI Artifact

## Statement

**Evidence is something the pipeline produced.** A coverage report, an end-to-end run recorded on video, a `terraform plan`, a cost diff, a scan result — addressable, attached to the pull request, generated without a human asking.

Testing belongs in **CI, not CD**. Normal work, infrastructure-as-code included, is attested against what continuous integration produced before the merge. A team without that output has nothing a non-engineer can check.

**The named exemption**: a change to the pipeline itself cannot be tested without running it. Those bars are attested post-merge, and the attestation **rides the next initiative that touches the area** rather than getting a pull request of its own.

## Rationale

This is a bet, stated as one.

The accommodating alternative is to move attestation after the merge, to a staging environment, where a product owner can click around — which is how most teams do it and why most teams' acceptance is theatre. Refusing that forces the investment: if a bar can only be attested from CI output, then CI must produce output worth attesting. **The tool creates the incentive rather than accommodating its absence.**

The cost is real and should not be hidden. A team without integration and end-to-end testing in CI will find attestation empty at first, and the honest response is to record that emptiness rather than to route around it. `posture: cannot assess — evidence inadequate`, with an exposure pointing at the missing coverage, is a valid attestation. It does not block ([[DEC-023]]), and it generates exactly the backlog item that makes the next attestation possible. **The system produces its own instructions for becoming attestable.**

Exempting pipeline changes is a recognised exception with a stated reason, which is a different thing from a loophole. Making it ride the next initiative rather than earn its own pull request is what keeps it from widening — there is no mechanism to abuse.

## Measures

- **Primary**: every `### Evidence` block references an artifact produced by a pipeline run, resolvable from the pull request
- **Guardrail**: an evidence reference that does not resolve is harvested, not assumed good
- **Honesty**: `cannot assess` is a recorded outcome with an exposure, never a silent pass

## Implications

- Evidence is a CI artifact reference; the pipeline exemption rides the next initiative: [[DEC-032]]
- The attester may not read the code, which is what gives this bet teeth: [[DEC-033]]
- Bars are written in BDD form so that a pipeline can be pointed at them: [[DEC-038]]
