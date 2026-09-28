## Why

This is milestone 1 of the `compact-surrogate` initiative.

`/opsp:compact` must group driver-specs and ADRs by hat before it can render a per-hat view. Today there is nothing to group on. `DEC-016` requires an explicit `hats` field on every record, validated by list lookup against a per-project registry, because the existing `type` field cannot carry the routing: across four production projects it means four different things — cashier sets `type: driver-spec` on all 17 driver-specs and `type: adr` on all 64 ADRs, pixlr-web invented `operating-model`, and no project tags ADRs by domain at all.

There is a second, smaller problem this exposes. The six accepted driver-spec types are documented in `schemas/sprint-driven/schema.yaml` prose and in the template, but nothing in `src/` validates them. That is how `type: driver-spec` came to exist in two of this repo's own records. The registry introduced here is the first mechanical validation of record frontmatter, and the driver-spec type list joins it.

## What Changes

- A new `opsp-hat-registry` capability: the default hat set, a per-project registry in `openspec/config.yaml`, and explicit list-lookup validation for both `hat` and driver-spec `type`
- Driver-spec and ADR frontmatter gain an optional `hats` field, holding one or more hats
- The sprint-driven schema instructions and the `driver-spec.md` / `decision-record.md` templates document `hats`
- Default-hat inference for backfill: from `type` for driver-specs, from the nearest driver-spec ancestor for ADRs
- This repository's own records are backfilled

`hats` is **optional**, not required. A record without it is *unassigned* — a real state that `/opsp:compact` will report as an open loop (`DEC-007`) rather than an error. Making it required would invalidate every record in every existing project on upgrade, which `DS-BACKWARD-COMPAT` forbids.

The field is multi-valued. `DEC-016` superseded `DEC-012` mid-implementation: the original single-hat rule needed a fifth `agreements` hat to hold cross-cutting constraints, and six of this repository's twenty-one records routed there — the signal that the rule, not the records, was wrong. A record now declares each hat it crosses.

## Capabilities

### New Capabilities
- `opsp-hat-registry`: hat taxonomy, per-project registry, frontmatter validation, and default-hat inference

### Modified Capabilities
- `opsp-driver-specs`: frontmatter gains an optional `hats` field; the six `type` values become mechanically validated
- `opsp-decision-records`: frontmatter gains an optional `hats` field
- `opsp-sprint-schema`: schema artifact instructions and templates document `hats`

## Impact

- **New**: `src/core/hats.ts`
- **Modified**: `src/core/project-config.ts` (`ProjectConfigSchema` gains `hats`), `src/core/decision-map.ts` (record entry types gain `hats`), `schemas/sprint-driven/schema.yaml`, `schemas/sprint-driven/templates/driver-spec.md`, `schemas/sprint-driven/templates/decision-record.md`
- **Surrogate**: `DEC-012` superseded by `DEC-016`; new `DEC-017`, `DS-SELF-USE-SCOPE`, `DS-BACKWARD-COMPAT`
- **Data**: this repo's `opensprint/driver-specs/*.md` (8) and `opensprint/ADRs/*.md` (17)
- **No behaviour change** to any existing command. Nothing reads `hats` until milestone 2.
