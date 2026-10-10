---
id: DS-SURROGATE-SCOPE
type: product
status: active
created: 2026-09-27
hats: [product]
role: strategy
depends-on:
  - DS-AGENTIC-SDLC
---

# DS-SURROGATE-SCOPE: Compaction Stops at the Surrogate

## Statement

OpenSprint's compaction scope is **preparing the compacted surrogate** — reading the records and the system, and rendering the views an engineering team orients from.

It stops there. The following are deliberately **out of scope**:

- **Certification** — a recorded act of a hat owner accepting what another hat produced
- **Change management — the governing half.** Approving a change, admitting it, or blocking it
- **Release management** — product-driven triggers into GitOps, promotion, and the path to production

**Amended 2026-10-10.** Change management is no longer wholly out. The scope now cuts it in two:

| | |
|---|---|
| **recording** the facts — is this reversible, what is the blast radius, who is accountable for what no system handles | **in scope**, and legitimately product and maintainer work |
| **governing** the change — approving it, gating it, promoting it | **out of scope**, unchanged |

This is the deliberate product decision the Implications below ask for, and it is narrow on purpose:
`/opsp:attest` records who holds a risk; it never decides whether the risk is acceptable. The test
is unchanged — the tool still exits zero, and an unanswered question is an open loop rather than a
block (`DEC-023`).

## Rationale

OpenSprint has become a spine that an entire virtual engineering team operates on, and that a human operator can step into by working with the same artifacts. That reach is precisely why the boundary has to be stated: each of the three above is a plausible next step from where the tool now stands, and each pulls in a domain of its own.

Certification is the clearest case. It sounds like a small addition — a hat owner signing off on a compiled section — but a signature is only meaningful if something governs what happens when it is withheld. That is change management. And once a product decision can gate what ships, that is release management. One artifact drags in two disciplines.

Nothing here says these are wrong to build. It says they are not this, and that attempting them alongside compaction would deliver a shallow version of three things instead of a complete version of one.

## Implications

- Compaction renders and reports. It does not approve, gate or promote.
- A view is reviewed through whatever the project already uses — code ownership, pull requests, a conversation. OpenSprint does not supply a review mechanism, and `DEC-007` already takes the same position on remediation.
- Open loops are reported for triage, never blocked on (`DEC-007`).
- Revisiting this is a product decision, not an engineering one. The question to answer first is which of the three is being taken on **in full**, not which parts of them compaction could reach into.
- **That revisiting has happened once.** Change management's recording half was taken on in full — every attestation answers reversibility, blast radius and accountability, not a selection of them — while its governing half stays out entirely. Certification and release management are untouched.

## Non-Goals

| Out of scope | Where it would belong |
|---|---|
| Certification of compiled sections | a change-management capability |
| Approval gates on the record | a change-management capability |
| Product-triggered release promotion | a release-management capability |
| Environment and pipeline orchestration | `devops` hat territory, described by compaction but not driven by it |
