## Why

`main` has been red since 35a3a21 — the merge that completed the `parallel-universe-reconciliation` initiative. `test/specs/source-specs-normalization.test.ts` has been failing for an entire initiative because two source specs shipped by that change are written as free-form documents rather than in the required structure:

- `reconciliation-citizen-taxonomy` uses `## Definitions` and `#### MIGRATE`
- `reconciliation-conflict-manifest` uses `## Display Format` and `## Cross-Skill Warning`

Neither has a `## Requirements` section, so `MarkdownParser.parseSpec` throws. A third sibling from the same change, `reconciliation-migration-manifest`, conforms — so this was inconsistency within one change, not a misunderstanding of the format.

This is the loop's last arrow in practice. The rule fired, and nobody acted on it. Leaving it red means every later milestone in this initiative verifies against a baseline that is already failing, which is how a second defect hides behind the first.

## What Changes

- The normative content of both specs is promoted into `### Requirement:` / `#### Scenario:` blocks under `## Requirements`
- The free-form normative sections those requirements replace are removed from the source specs
- `## Purpose` is preserved verbatim in both

**No behaviour changes.** Every rule stated in the prose is preserved; only its shape changes. The ASCII display formats are kept inside the requirements that mandate them, because the exact rendering is the requirement.

## Capabilities

### Modified Capabilities
- `reconciliation-citizen-taxonomy`: the citizen definition, the four classifications, DFS traversal order, and the confidence guardrail become explicit requirements
- `reconciliation-conflict-manifest`: manifest production, summary table, detail section, cross-skill warning, and confirmation prompt become explicit requirements

## Impact

- **Modified**: `openspec/specs/reconciliation-citizen-taxonomy/spec.md`, `openspec/specs/reconciliation-conflict-manifest/spec.md`
- **Fixes**: `test/specs/source-specs-normalization.test.ts`, failing since 35a3a21
- **No source changes.** Nothing in `src/` is touched.
