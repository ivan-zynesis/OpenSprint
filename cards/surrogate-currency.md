---
id: surrogate-currency
title: surrogate-currency
state: completed
created: 2026-10-10
updated: 2026-11-03T15:30:12Z
branch: opsp/surrogate-currency
---

Compiled views are produced once, at archive, by whoever happens to be there. That is correct for half of them and wrong for the other half, and nothing says which.

## Milestones

- [done] scoped-seal: `compact seal --hat <name>…`; sealing never blesses a section it did not just render. **Blocks everything else** — without it, compiling two hats marks four fresh, which this project already did once by accident
- [done] render-on-milestone: `/opsp:apply` compiles stale `dev` and `devops` sections at each milestone boundary, after the change branch merges
- [done] escalation-handoff: the visible pause; inferred classification carried in the question with a draft record and blast radius; explicit approval; the affected hat's view compiled on approval
- [done] knockdown-views: `/opsp:knockdown` produces all five views, empty `product` and `maintainer` rendered as a first-class finding
- [done] migrate-tool: `/opsp:migrate` — detect records the current shapes cannot select, grill the operator one record at a time, backfill on confirmation. **Validated against this repository's own stale state** (see below)

## History

- 2026-10-18T06:38:46Z  imported at completed from opensprint/initiatives/20261010-surrogate-currency.md  by Ivan Lee
- 2026-11-03T15:30:12Z  resynced milestones from opensprint/initiatives/20261010-surrogate-currency.md  by Ivan Lee
