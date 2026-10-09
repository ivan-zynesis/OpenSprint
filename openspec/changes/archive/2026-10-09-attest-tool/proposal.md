## Why

Milestone 9 of `lifecycle-beyond-build`, and the one the whole initiative was for.

The framework sets bars well and never comes back for them. `/opsp:propose` writes the acceptance criterion and hands it to the engineer; nothing asks whether it was met. Every open-loop kind before this initiative was a property of the **record graph** — not one was a property of an **outcome**.

Milestone 2 gave the ex-post half of a measure somewhere to live. Milestone 8 gave a compiled claim the authority to say it is true. This writes it.

## What Changes

- New `/opsp:attest` workflow, registered between `apply` and `archive`
- It runs on a **deliberately narrow context**: the objective, the goals, the bars and the CI evidence — never the diff, the design or the ADR rationales (`DEC-033`)
- It refuses to continue in a session that authored the implementation
- `checkAmendment(before, after)` makes `DEC-027`'s bound checkable: only `## Measures` may change
- It never gates (`DEC-023`): always exits zero, records an unmet bar as an exposure rather than a failure

## Capabilities

### Added Capabilities
- `opsp-attest-workflow`: the ex-post half of a measure, assessed at adversarial distance

## Impact

- **15 OPSP workflows, up from 14.** `opsp-attest` sits before `opsp-archive` in the lifecycle order.
- **Nothing is attested on this repository yet** — the tool exists, and running it is the operator's call, not this milestone's.
- **New**: `src/core/templates/workflows/opsp-attest.ts`, `src/core/compact/amend.ts`
