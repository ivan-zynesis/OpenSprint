## Why

Milestone 3 of `compact-surrogate`.

`DS-LOOP-CLOSURE` requires the loop to close: driver-spec → ADR → implementation → rule, and back to the constraint when a rule fails. The first two arrows are recorded. The third and fourth are not visible to anything, so nobody notices when a decision was never guarded or when a guard outlived the decision it guarded.

`DEC-013` settles how to see them: harvest the links from code rather than declaring them in records. The data is unambiguous — across cashier, 69 of 96 test files already cite a record and 16 of 26 codex rules do, while only 4 of 64 ADRs cite a test and no frontmatter field links one. The links exist; nothing reads them.

Two defects found during this initiative had the same shape — a guard that did not guard what it claimed to. This is the machinery that would have surfaced both as backlog instead of as surprises.

## What Changes

- A new `opsp-rule-harvesting` capability: how rule files are located, how citations are extracted, and what constitutes an open loop
- `src/core/compact/rules.ts` — scan configured globs for record ids, build the record→rule index
- `src/core/compact/loops.ts` — derive the five open-loop kinds from the index and the decision graph
- `ruleGlobs` in `openspec/config.yaml`, defaulting to an explicit list covering the suffixes real projects use
- `opensprint compact plan` reports open loops per hat; `--json` carries them for the renderer
- A new `opensprint compact loops` for reading them directly

**Open loops are reported, never gated.** `check` continues to fail only on drift between a view and its records. A gap is a backlog item (`DEC-007`); failing the build on one would block every build until the backlog is empty.

## Capabilities

### New Capabilities
- `opsp-rule-harvesting`: rule discovery, citation extraction, the record→rule index, and open-loop derivation

## Impact

- **New**: `src/core/compact/rules.ts`, `src/core/compact/loops.ts`
- **Modified**: `src/core/project-config.ts` (`ruleGlobs`), `src/commands/compact.ts` (`loops`, and open loops in `plan`)
- **Reads**: the project's source tree, excluding `opensprint/`, `openspec/` and the usual build output
- **Writes**: nothing new. The manifest is unchanged.
