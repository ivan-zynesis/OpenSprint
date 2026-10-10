## Why

Milestone 2 of `surrogate-currency`. `dev` and `devops` views move on the code clock and are compiled only at archive, so they sit stale for the entire duration of an initiative — precisely the window in which agents read them to decide how to build.

`/opsp:apply` mentions compaction zero times today. Everything it changes — the code, and every ADR an escalation produces — feeds exactly the two views it never touches.

## What Changes

- `compact plan --hat <name>…` filters the plan to named hats, symmetric with `seal --hat`
- `/opsp:apply` gains a **compile step at each milestone boundary**: plan, render stale `dev`/`devops` sections, seal them scoped
- Where `product` or `maintainer` are stale, apply **offers** to compile them — and accepting is a **context switch**, not a render: the agent sets down the diff and the test output, loads the product records, compiles, and returns to the dev hat
- Declining leaves them stale and reported, to be compiled at archive

## Capabilities

### Modified Capabilities
- `opsp-compact-engine`: the plan is filterable by hat
- `opsp-apply-workflow`: a milestone boundary compiles what the hat in the room owns, and offers the rest

## Impact

- **Nothing is compiled that was not stale.** `DEC-010`'s per-section staleness means a milestone touching no manifest and producing no ADR renders nothing at all.
- **The offer is the part that can go wrong.** `DEC-COMPILE-ON-MILESTONE`'s invalidation trigger names it: if operators accept without the agent demonstrably switching context, the offer has become the backdoor it was suspected of being, and report-only is the fallback.
- **Archive is unchanged.** `DEC-031` still has archive consume the compile, still compiling everything. This adds a second, narrower occasion.
- **Modified**: `src/commands/compact.ts`, `src/cli/index.ts`, `src/core/templates/workflows/opsp-apply.ts`
