## Why

Milestone 2 of `lifecycle-beyond-build`, and the one that gives a measure its parts.

`DS-MEASURE-ANATOMY` establishes that a measure is not a single value: it has four, and they are the same four for every hat. **bar** is written ex ante, at proposal. **posture**, **evidence** and **exposure** are written ex post, by `/opsp:attest` — which has nowhere to write until this lands.

The modelling error this corrects is visible in this repository's own maintainer view. `bars` is a top-level section with two records in it, while `evidence` and `exposure` are top-level sections with **nothing in them at all**. That is the symptom: those were never top-level concerns. They are facets that only mean something attached to a specific measure, and as whole sections they had nothing to be about.

Milestone 1 had to pin this repository's maintainer sections to the old shape, because its two bars carry `role: bar` and the shipped seven objectives select on `goal`/`strategy`. This milestone migrates those records and removes the pin.

## What Changes

- `## Measures` may carry optional `### Bar`, `### Posture`, `### Evidence`, `### Exposure` sub-blocks
- A `### Bar` is labelled lines by explicit lookup — `dimension`, `chosen`, `traded for`, `neighbour`
- Three harvest rules: `measure-unasserted` (no evidence), `measure-unexposed` (no exposure), `bar-without-neighbour`
- `DS-HIGH-IMPACT-OPS` migrates to `integrity-correctness`, `DS-BACKWARD-COMPAT` to `change-quality` — both become `role: strategy` with their bar as a sub-block
- This repository's maintainer section pin is removed; the shipped seven apply

## Capabilities

### Modified Capabilities
- `opsp-driver-specs`: a `## Measures` section may carry the measure anatomy as sub-blocks
- `opsp-rule-harvesting`: three new open-loop kinds covering the ex-post half of a measure

## Impact

- **Backward compatible.** All four sub-blocks are optional; a record with a `## Measures` section and no sub-blocks behaves exactly as before, and `constraint-unmeasurable` is unchanged. `DS-BACKWARD-COMPAT` holds.
- **New loops appear on existing projects.** A record with measures but no evidence now reports `measure-unasserted`. That is the intended finding — a measure with no evidence is an aspiration — but it will raise loop counts on first run.
- **`bar-without-neighbour` makes a synthetic finding deterministic.** `squad/maintainer.md` currently hand-notes *"Neither bar states its neighbour"* — the rendering skill noticed that. It becomes harvested, which is `DEC-013`'s direction.
- **Modified**: `src/core/compact/loops.ts`, `src/core/compact/measures.ts` (new), `openspec/config.yaml`, two driver-specs
