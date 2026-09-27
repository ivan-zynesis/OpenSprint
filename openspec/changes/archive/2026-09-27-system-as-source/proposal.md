## Why

Milestone 6 of `compact-surrogate`, and the one that changes what a view is.

Until now a view describes the **record**. The re-exploration settled that it should describe the **system**, citing records where they explain it: where the record is silent, something was never made explicit, which is reportable but not wrong; where the record contradicts the system, that is a defect, and `DS-LOOP-CLOSURE` already says a failing rule is how it surfaces.

Nothing in the engine can express that today. A `dev` view cannot state a tech stack, because a tech stack lives in `package.json` and lockfiles, not in an ADR. Without this, `hat-templates` would ship three hat shapes with nothing to compile from.

It also closes a gap left open at milestone 3. The `open-loops` section has no record inputs, so its hash never changes and a deleted rule file never restages it — a view would keep reporting a decision as guarded after its only guard was removed.

## What Changes

- A section may **observe** the system: `observes: 'rules' | string[]`, alongside the records it takes
- Observed files contribute to the section's input hash, so code moving restages the section
- Staleness reports which observed paths were added, removed or modified, beside the records
- `open-loops` observes `rules` by default, closing the milestone-3 gap
- The rendering contract gains a boundary rule: **a claim from a record cites the record; a claim from the system cites the path it was observed at**

## Capabilities

### Modified Capabilities
- `opsp-compact-engine`: sections may observe the system; observations participate in provenance
- `opsp-compact-skill`: the record/system boundary must be visible in rendered output

## Impact

- **New behaviour**: `check` now hashes observed files. Measured on cashier — 103 rule files, glob 31ms, hash 3ms, **34ms total**. The gate stays a gate.
- **Modified**: `src/core/compact/sections.ts`, `manifest.ts`, `status.ts`, `src/core/hats.ts`, `src/commands/compact.ts`, `src/core/templates/workflows/opsp-compact.ts`
- **Behaviour for existing projects**: `open-loops` gains observed inputs, so it restages once when a rule file changes. No other section is affected until a project declares `observes`.
