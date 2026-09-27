---
id: DS-SURROGATE-SCOPE
type: product
status: active
created: 2026-09-27
hats: [product]
---

# DS-SURROGATE-SCOPE: Compaction Stops at the Surrogate

## Statement

OpenSprint's compaction scope is **preparing the compacted surrogate** — reading the records and the system, and rendering the views an engineering team orients from.

It stops there. The following are deliberately **out of scope**:

- **Certification** — a recorded act of a hat owner accepting what another hat produced
- **Change management** — governing how a change is proposed, approved and admitted
- **Release management** — product-driven triggers into GitOps, promotion, and the path to production

## Rationale

OpenSprint has become a spine that an entire virtual engineering team operates on, and that a human operator can step into by working with the same artifacts. That reach is precisely why the boundary has to be stated: each of the three above is a plausible next step from where the tool now stands, and each pulls in a domain of its own.

Certification is the clearest case. It sounds like a small addition — a hat owner signing off on a compiled section — but a signature is only meaningful if something governs what happens when it is withheld. That is change management. And once a product decision can gate what ships, that is release management. One artifact drags in two disciplines.

Nothing here says these are wrong to build. It says they are not this, and that attempting them alongside compaction would deliver a shallow version of three things instead of a complete version of one.

## Implications

- Compaction renders and reports. It does not approve, gate or promote.
- A view is reviewed through whatever the project already uses — code ownership, pull requests, a conversation. OpenSprint does not supply a review mechanism, and `DEC-007` already takes the same position on remediation.
- Open loops are reported for triage, never blocked on (`DEC-007`).
- Revisiting this is a product decision, not an engineering one. The question to answer first is which of the three is being taken on **in full**, not which parts of them compaction could reach into.

## Non-Goals

| Out of scope | Where it would belong |
|---|---|
| Certification of compiled sections | a change-management capability |
| Approval gates on the record | a change-management capability |
| Product-triggered release promotion | a release-management capability |
| Environment and pipeline orchestration | `devops` hat territory, described by compaction but not driven by it |
