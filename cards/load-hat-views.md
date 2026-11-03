---
id: load-hat-views
title: load-hat-views
state: completed
created: 2026-10-18
updated: 2026-11-03T15:30:12Z
branch: opsp/load-hat-views
---

`/opsp:apply`, `/opsp:explore`, `/opsp:triage` and `/opsp:propose` told the agent to read **all** of the driver-specs, the ADRs, `architecture.md` and `DECISION-MAP.md`, and apply reloaded all of it after a correction. The per-hat views that `/opsp:compact` compiles and seals were never read by any workflow. [[DS-SURROGATE-BUDGET]] already recorded the goal; [[DEC-015]] deferred the switch to a later initiative. This is that initiative.

## Milestones

- [done] load-hat-views: apply, explore, triage and propose load the per-hat views instead of every record, and attest reads only the owning hat's section — built in `3dadf45`, asserted by `test/core/opsp-load-views.test.ts`

## History

- 2026-10-18T06:38:46Z  imported at completed from opensprint/initiatives/20261018-load-hat-views.md  by Ivan Lee
- 2026-11-03T15:30:12Z  resynced milestones from opensprint/initiatives/20261018-load-hat-views.md  by Ivan Lee
