## Why

Milestone 5 of `compact-surrogate`, the first of the four added at re-exploration.

Every hat currently renders the same four sections — `charter · constraints · decisions · open-loops`. That encodes an assumption that each hat produces the same *kind* of knowledge differing only in subject. It holds for product and maintainer, which both produce driver-specs in one format (`DS-SQUAD-HATS`). It does not hold for dev and devops, which describe a system rather than list constraints.

This change makes the section set a property of the hat. It does not define the new shapes — that is `hat-templates`, and it needs `system-as-source` first so that `dev` and `devops` have something to compile from.

## What Changes

- A section becomes a **definition**, not a name: `{ name, inputs }`, where `inputs` declares which records feed it
- `hats` in `openspec/config.yaml` accepts either the current array of names or a map from name to `{ sections }`
- A hat that declares no sections gets the current four, so existing projects render identically
- The engine iterates each hat's own sections; the manifest's `section` widens from a fixed union to a string

**No new shapes ship here.** The four defaults are unchanged, and any project not declaring sections sees no difference.

## Capabilities

### Modified Capabilities
- `opsp-compact-engine`: sections are per-hat definitions with declared inputs, rather than one fixed list

## Impact

- **Modified**: `src/core/compact/sections.ts`, `status.ts`, `manifest.ts`, `src/core/hats.ts`, `src/core/project-config.ts`, `src/commands/compact.ts`
- **Behaviour**: unchanged for every project that does not declare sections
- **Backward compatible**: `hats: [product, dev]` keeps working and keeps meaning what it meant (`DS-BACKWARD-COMPAT`)
