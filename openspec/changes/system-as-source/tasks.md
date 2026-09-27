## 1. Section definitions

- [x] 1.1 Add `observes?: 'rules' | string[]` to `SectionDef`, independent of `inputs`
- [x] 1.2 Add `OBSERVES_RULES` as the named-set constant rather than a bare string literal at use sites
- [x] 1.3 `DEFAULT_SECTIONS` — `open-loops` gains `observes: rules`, keeping `inputs: none`

## 2. Resolution

- [x] 2.1 Add `resolveObservedFiles(projectRoot, section)` — `rules` resolves through `resolveRuleGlobs`, an array resolves directly; both apply `EXCLUDED_DIRS`
- [x] 2.2 Return project-relative paths with separators normalised to `/`, sorted
- [x] 2.3 Validate `observes` in `resolveHatSections`; malformed degrades the hat to defaults and warns, naming hat and value

## 3. Provenance

- [x] 3.1 Add `observed: Record<string, string>` to `ManifestEntry`, keyed by path, distinct from record `inputs`
- [x] 3.2 Fold observations into the section input hash, sorted, so a moved file restages the section
- [x] 3.3 `classifySection` reports observed paths added, removed and modified, kept distinct from record ids

## 4. CLI

- [x] 4.1 `plan` and `plan --json` carry observed paths for a stale section, alongside its records
- [x] 4.2 `seal` writes observations
- [x] 4.3 `check` hashes observations; no interface change

## 5. The rendering contract

- [x] 5.1 Extend `/opsp:compact` instructions: a claim from a record cites the record; a claim from an observation cites its path
- [x] 5.2 An observation no record explains stands, citing its path; the view does not invent a rationale
- [x] 5.3 An apparent contradiction between record and system is surfaced, not resolved — that is a rule's job

## 6. Tests

- [x] 6.1 `observes: rules` resolves through `ruleGlobs`, including a project that overrides them
- [x] 6.2 Explicit globs resolve, with exclusions applied
- [x] 6.3 A changed observed file restages a section whose records did not move
- [x] 6.4 A deleted rule file restages `open-loops` — the milestone-3 gap, closed
- [x] 6.5 Added, removed and modified observed paths are reported and kept distinct from record ids
- [x] 6.6 Path normalisation — a hash does not depend on separator or on glob order
- [x] 6.7 Malformed `observes` degrades and warns without throwing
- [x] 6.8 A section declaring no `observes` behaves exactly as before
- [x] 6.9 Skill instructions carry the three boundary rules
- [x] 6.10 Use `path.join()` for every expected path value

## 7. Verification

- [x] 7.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 7.2 `pnpm exec tsc --noEmit` clean
- [x] 7.3 `pnpm lint` clean
- [x] 7.4 `node bin/openspec.js validate system-as-source --strict` passes, with the exit code unpiped
- [x] 7.5 Demonstrate the closed gap on this repository: delete a rule citing a decision, confirm `open-loops` goes stale, restore, confirm fresh
- [x] 7.6 Measure `check` cost against cashier and record it

## 8. Verification result

- `tsc`, `eslint` and `validate --strict` clean; 1646 tests pass, up 28
- The 18 remaining failures are the known `zsh-installer` isolation defect

### The milestone-3 gap, closed and demonstrated

Deleting `test/core/backlog-seam.test.ts` — the only rule citing `DEC-007` — on this repository:

- all four `open-loops` sections went `stale`
- the report named `test/core/backlog-seam.test.ts` under `observedRemoved`
- `DEC-007` was reported unguarded again
- `check` exited 1

Before this change `check` reported fresh and the view kept claiming the decision was guarded.
Restoring the file returned everything to fresh.

### Cost, measured rather than assumed

| | records | rule files | `compact check` |
|---|---|---|---|
| cashier | 81 | 103 | ~174 ms |
| this repository | 27 | 81 | ~147 ms |

Most of both figures is node startup; the observation work is ~27 ms, matching a direct
measurement of 31 ms to glob and 3 ms to hash. The milestone-3 trade-off between a cheap gate and
a complete one did not exist — it assumed a source-tree walk, where `fast-glob` prunes ignored
directories during traversal.

### Noticed in passing

`tsconfig.json` includes only `src/**/*`, so test files are never typechecked. A fixture
constructing a `ManifestEntry` without the new `observed` field compiled silently and passed at
runtime. Corrected here; the gap itself is out of scope and left unrecorded.
