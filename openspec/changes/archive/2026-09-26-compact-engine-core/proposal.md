## Why

Milestone 2 of `compact-surrogate`, first of two changes.

`/opsp:compact` has to do two different kinds of work. Grouping records by hat, hashing their content, deciding which parts of a view have gone stale, and failing CI when one has — all of that is deterministic and belongs in code. Writing the condensed prose is not: it is synthesis, and it needs a model.

This change builds the deterministic half. The second change adds the skill that renders the views on top of it.

Splitting them this way keeps the CI gate (`DEC-010`) testable without a model in the loop, which is the property that makes it trustworthy as a gate.

## What Changes

- A new `opsp-compact-engine` capability: section definitions, provenance manifest, and staleness computation
- `src/core/compact/` — record grouping by hat, per-section input resolution, manifest read/write, and fresh/stale/tampered classification
- A new CLI command with three modes:
  - `opensprint compact plan` — what is stale and which records feed each stale section
  - `opensprint compact seal` — write the manifest for the views as they currently stand
  - `opensprint compact check` — recompute and compare; exits non-zero on anything not fresh
- `--json` on `plan` and `check`, so the skill can consume the output rather than parse prose

**No views are written by this change.** `plan` reports what a renderer would need; nothing renders yet.

## Capabilities

### New Capabilities
- `opsp-compact-engine`: view sections and their inputs, the provenance manifest format, staleness classification, and the CLI surface

## Impact

- **New**: `src/core/compact/` (sections, manifest, status), `src/commands/compact.ts`
- **Modified**: `src/cli/index.ts` (registers the command)
- **Reads**: `opensprint/driver-specs/`, `opensprint/ADRs/`, and `opensprint/squad/` when present
- **Writes**: `opensprint/squad/.manifest.json` only, and only on `seal`
- **No behaviour change** to any existing command.
