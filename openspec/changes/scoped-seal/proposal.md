## Why

Milestone 1 of `surrogate-currency`, and the one that blocks the two after it.

`compactSealCommand()` takes no arguments and rebuilds the manifest for **every section of every hat**. That makes `DS-VIEW-AUTHORSHIP` unimplementable: compiling `dev` and `devops` at a milestone boundary and then sealing would mark `product` and `maintainer` fresh while they are stale.

This is not hypothetical. During `lifecycle-beyond-build` the maintainer view was re-rendered and `compact seal` was run; it sealed all twenty-one sections across four hats, marking three of them fresh while their content described a world three milestones out of date. **`compact check` then passed over stale views.** It was caught by reading the output, not by any guard — which is the worst class of bug `DEC-010` exists to prevent: a gate that passes when it should fail.

## What Changes

- `compact seal --hat <name>…` seals only the named hats; every other manifest entry is carried forward untouched
- **Sealing never blesses a section it did not just render.** Where a hat's rendered view is byte-identical to what the manifest already records, its entries are carried forward rather than resealed against current inputs
- An unknown hat name warns and is ignored rather than silently sealing nothing
- Unscoped `compact seal` keeps its meaning — every hat — because `/opsp:archive` legitimately closes an initiative with all hats in scope

## Capabilities

### Modified Capabilities
- `opsp-compact-engine`: sealing is scopeable, and output-compared so it cannot bless an unrendered section

## Impact

- **The second rule matters more than the flag.** A caller could scope correctly and still bless a section whose inputs moved but whose prose was never regenerated. Output comparison closes that independently of scoping.
- **It fixes the bug retroactively on this repository.** Twelve sections are currently stale; after this change an unscoped `seal` leaves them stale rather than blessing them — which is required, because those twelve are a deliberate migration fixture.
- **Modified**: `src/commands/compact.ts`, `src/cli/index.ts`
