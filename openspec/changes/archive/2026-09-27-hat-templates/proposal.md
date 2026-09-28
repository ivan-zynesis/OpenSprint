## Why

Milestone 8 of `compact-surrogate`, and the one everything else was built to enable.

Every hat still renders `charter · constraints · decisions · open-loops`. The engine can now express per-hat shapes, observe the system, and classify records within their hat — but no shape has been defined, so a `dev` view still enumerates sixteen ADRs and tells a reader nothing about what the system *is*.

This change defines the four shapes.

## What Changes

- **Per-hat default sections**, replacing the one list every hat shares:

| Hat | Sections |
|---|---|
| product | objective · goals · strategies · measures · open-loops |
| maintainer | bars · posture · evidence · exposure · open-loops |
| dev | tech-stack · runtime-topology · entity-schema · open-loops |
| devops | infra-architecture · gitops · open-loops |

- **Role-filtered section inputs** — a section may take only records of given roles, so adding a strategy restages `strategies` and leaves `objective` fresh
- **Default observation globs** for the sections that describe the system — manifests for tech-stack, migrations and schemas for entity-schema, IaC for infra-architecture, pipeline definitions for gitops
- **`## Measures`** restored to the driver-spec template, as the design document specified and shipping dropped
- **`constraint-unmeasurable`** — a record stating a target with no way to tell whether it is met
- **Diagram convention detection** — reported by `compact plan`, ASCII by default, escalated to the operator when the repository's habit is unclear

## Capabilities

### Modified Capabilities
- `opsp-compact-engine`: per-hat default sections, role-filtered inputs, diagram convention detection
- `opsp-compact-skill`: the four shapes, and how a diagram is chosen
- `opsp-rule-harvesting`: `constraint-unmeasurable`
- `opsp-sprint-schema`: `## Measures` in the driver-spec template

## Impact

- **Every existing view re-renders.** This repository's four views change shape entirely — the point of the change, and the first real test of whether the condensed surrogate reads better than the record.
- **Backward compatible in configuration**: a project declaring its own sections is unaffected; one relying on defaults gets the new shapes.
- `dev` and `devops` shapes cannot be validated here — one maintainer record until recently, zero devops records. Cashier is the candidate.
