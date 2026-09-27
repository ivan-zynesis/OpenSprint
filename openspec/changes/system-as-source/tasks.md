## 1. Section definitions

- [ ] 1.1 Add `observes?: 'rules' | string[]` to `SectionDef`, independent of `inputs`
- [ ] 1.2 Add `OBSERVES_RULES` as the named-set constant rather than a bare string literal at use sites
- [ ] 1.3 `DEFAULT_SECTIONS` — `open-loops` gains `observes: rules`, keeping `inputs: none`

## 2. Resolution

- [ ] 2.1 Add `resolveObservedFiles(projectRoot, section)` — `rules` resolves through `resolveRuleGlobs`, an array resolves directly; both apply `EXCLUDED_DIRS`
- [ ] 2.2 Return project-relative paths with separators normalised to `/`, sorted
- [ ] 2.3 Validate `observes` in `resolveHatSections`; malformed degrades the hat to defaults and warns, naming hat and value

## 3. Provenance

- [ ] 3.1 Add `observed: Record<string, string>` to `ManifestEntry`, keyed by path, distinct from record `inputs`
- [ ] 3.2 Fold observations into the section input hash, sorted, so a moved file restages the section
- [ ] 3.3 `classifySection` reports observed paths added, removed and modified, kept distinct from record ids

## 4. CLI

- [ ] 4.1 `plan` and `plan --json` carry observed paths for a stale section, alongside its records
- [ ] 4.2 `seal` writes observations
- [ ] 4.3 `check` hashes observations; no interface change

## 5. The rendering contract

- [ ] 5.1 Extend `/opsp:compact` instructions: a claim from a record cites the record; a claim from an observation cites its path
- [ ] 5.2 An observation no record explains stands, citing its path; the view does not invent a rationale
- [ ] 5.3 An apparent contradiction between record and system is surfaced, not resolved — that is a rule's job

## 6. Tests

- [ ] 6.1 `observes: rules` resolves through `ruleGlobs`, including a project that overrides them
- [ ] 6.2 Explicit globs resolve, with exclusions applied
- [ ] 6.3 A changed observed file restages a section whose records did not move
- [ ] 6.4 A deleted rule file restages `open-loops` — the milestone-3 gap, closed
- [ ] 6.5 Added, removed and modified observed paths are reported and kept distinct from record ids
- [ ] 6.6 Path normalisation — a hash does not depend on separator or on glob order
- [ ] 6.7 Malformed `observes` degrades and warns without throwing
- [ ] 6.8 A section declaring no `observes` behaves exactly as before
- [ ] 6.9 Skill instructions carry the three boundary rules
- [ ] 6.10 Use `path.join()` for every expected path value

## 7. Verification

- [ ] 7.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 7.2 `pnpm exec tsc --noEmit` clean
- [ ] 7.3 `pnpm lint` clean
- [ ] 7.4 `node bin/openspec.js validate system-as-source --strict` passes, with the exit code unpiped
- [ ] 7.5 Demonstrate the closed gap on this repository: delete a rule citing a decision, confirm `open-loops` goes stale, restore, confirm fresh
- [ ] 7.6 Measure `check` cost against cashier and record it
