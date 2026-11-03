---
id: compact-surrogate
title: compact-surrogate
state: completed
created: 2026-09-26
updated: 2026-11-03T15:30:12Z
branch: opsp/compact-surrogate
---

Add `/opsp:compact` — a compile step that renders the surrogate (driver-specs and ADRs) into per-hat views, so that engineering accountability becomes assignable and the surrogate becomes affordable to load.

## Milestones

- [done] hat-registry: Define the hat taxonomy and per-project registry, add the primary-hat field to the record schema, and backfill existing driver-specs and ADRs with owner confirmation batched by area.
- [done] compact-engine: Compile hat views and architecture.md from the record with inline citations, write the provenance manifest, and implement `--check`.
- [done] rule-harvesting: Scan the codebase for records cited by tests and checks, build the record-to-rule index, and detect open loops per hat.
- [done] backlog-seam: Hand open loops off to `/opsp:explore`, and make `/opsp:archive` and `/opsp:knockdown` call compact as their compile step.
- [done] per-hat-sections: Make the view's section set per-hat rather than uniform — section templates in the hat registry, variable section lists in the provenance manifest. The four generic sections become the default for hats that want them, not the shape every hat is forced into.
- [done] system-as-source: Make code a compile input. A view describes the system, citing records where they explain it and reporting what no record explains. Extends the manifest to hash code inputs, which closes the `open-loops` staleness gap as a side effect.
- [done] per-hat-classification: Classify records within their hat, and give the driver-spec layer the dependency edges it has never had. Product first, with OGSM — `objective | goal | strategy` as node kinds and `measure` as a section of a goal rather than a node of its own. Backfilled with operator confirmation batched by area, defaulting driver-specs to objective or goal. Uses the `depends-on` the ADR layer already has, and the `revises` / `refines` / `supersedes` vocabulary that emerged organically in overheard and cashier, so "reinforce" and "change" need nothing new. The mechanism is per-hat, not product-specific: maintainer will want a bar dimension, devops a pipeline or environment.
- [done] hat-templates: The actual shapes. Views are big-picture documentation, not an index of every record — no hat enumerates its records, and a record may legitimately appear in no view.
- [done] documentation-rewrite _(added at re-exploration, 2026-09-27)_: Rewrite the primary documentation now that the surrogate holds what it

## History

- 2026-10-18T06:38:46Z  imported at completed from opensprint/initiatives/20260926-compact-surrogate.md  by Ivan Lee
- 2026-11-03T15:30:12Z  resynced milestones from opensprint/initiatives/20260926-compact-surrogate.md  by Ivan Lee
