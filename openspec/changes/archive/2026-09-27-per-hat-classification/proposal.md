## Why

Milestone 7 of `compact-surrogate`.

The decision layer is a graph: 64 of 64 cashier ADRs carry `depends-on`. The driver-spec layer is a flat pile — **72 driver-specs across five production projects, zero relationship edges.** `DECISION-MAP.md` renders driver-specs as independent roots because nothing records a relationship between them, and no project can currently answer *which constraint exists because of which other constraint*.

That question is the one a product manager asks first, and it is what OGSM's causality needs: an objective, therefore a goal, therefore a strategy. Without edges the four elements are four buckets rather than a chain.

This change records the structure. Rendering it is `hat-templates`.

## What Changes

- Records gain an optional `role` — their classification **within their hat**, validated against roles the hat declares
- `product` defaults to the OGSM node kinds: `objective`, `goal`, `strategy`. `measure` is deliberately not a role — it is a section of a goal, not a node of its own.
- Driver-specs gain `depends-on`, the same field the ADR layer has always had, validated to reference driver-specs and checked for cycles
- A new open-loop kind, `record-unclassified`, so a hat that declares roles can show which of its records have none
- This repository's product records are backfilled with operator confirmation

**The mechanism is per-hat, not product-specific.** Maintainer will want a bar dimension and devops a pipeline or environment; those are configuration, not further code.

## Capabilities

### Modified Capabilities
- `opsp-hat-registry`: a hat may declare the roles its records can take
- `opsp-driver-specs`: driver-specs may declare `depends-on`
- `opsp-rule-harvesting`: a new open-loop kind for unclassified records

## Impact

- **Modified**: `src/core/hats.ts`, `src/core/compact/records.ts`, `src/core/compact/loops.ts`, `src/core/project-config.ts`, `schemas/sprint-driven/` templates and instructions
- **`DECISION-MAP.md` is unaffected.** It builds edges from decision `depends-on` and will not traverse driver-spec edges. The two maps are layered, not competing — OGSM structures the root layer the decision map treats as flat.
- **Backward compatible**: both fields optional; a record without either behaves exactly as now (`DS-BACKWARD-COMPAT`)
