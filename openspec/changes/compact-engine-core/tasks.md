## 1. Engine — grouping and sections

- [ ] 1.1 Create `src/core/compact/sections.ts` exporting `SECTION_NAMES` (`charter`, `constraints`, `decisions`, `open-loops`) as an explicit `as const` list
- [ ] 1.2 Add `groupRecordsByHat(driverSpecs, decisions, registry)` — assigns each record to every hat it declares, filters to `active`/`accepted`, and returns the unassigned and unknown-hat records separately
- [ ] 1.3 Add `resolveSectionInputs(hat, grouped)` — `charter` gets all the hat's records, `constraints` its driver-specs, `decisions` its ADRs, `open-loops` none

## 2. Engine — hashing and manifest

- [ ] 2.1 Create `src/core/compact/manifest.ts` with the manifest shape: per entry, hat, section, contributing record ids with content hashes, combined input hash, rendered output hash
- [ ] 2.2 Add `hashContent(text)` — normalise `\r\n` to `\n`, then sha256, so line-ending rewrites do not change a hash
- [ ] 2.3 Add `sectionInputHash(records)` — sort by record id before hashing so directory iteration order cannot affect the result
- [ ] 2.4 Add `readManifest(opensprintDir)` / `writeManifest(opensprintDir, manifest)` using `path.join`; a missing or malformed manifest reads as empty rather than throwing

## 3. Engine — staleness

- [ ] 3.1 Create `src/core/compact/status.ts` with `classifySection()` returning `fresh` | `stale` | `tampered` | `unsealed`
- [ ] 3.2 Report, for a stale section, which record ids were added, removed or modified against the manifest
- [ ] 3.3 Treat a missing manifest entry as `unsealed`, never `stale`
- [ ] 3.4 Treat a missing view file as `unsealed` when unsealed, and report the hat as unrendered during `seal`

## 4. CLI

- [ ] 4.1 Create `src/commands/compact.ts` with `plan`, `seal` and `check`
- [ ] 4.2 Register the command in `src/cli/index.ts`, following the existing subcommand style
- [ ] 4.3 `plan` and `check` support `--json`; when `--json` is passed, JSON is the only thing on stdout
- [ ] 4.4 `check` exits non-zero on any section that is not fresh, and names each with its state
- [ ] 4.5 `check` and `plan` never write; only `seal` writes
- [ ] 4.6 `tampered` guidance directs the operator to `/opsp:explore`, per DEC-006

## 5. Tests

- [ ] 5.1 Grouping — multi-hat records land in every declared hat; unassigned and unknown-hat records are reported separately; superseded records are excluded
- [ ] 5.2 Section inputs — the four sections resolve to the documented input sets
- [ ] 5.3 Hashing — order independence (shuffled input yields the same hash) and line-ending independence (`\r\n` and `\n` yield the same hash)
- [ ] 5.4 Classification — each of `fresh`, `stale`, `tampered`, `unsealed`; a changed ADR restages `decisions` but leaves `constraints` fresh; a changed superseded record restages nothing
- [ ] 5.5 Manifest — round-trip; missing file reads as empty; malformed file reads as empty without throwing
- [ ] 5.6 CLI — `check` exit codes, `--json` purity on stdout, and that neither `check` nor `plan` writes
- [ ] 5.7 Use `path.join()` for every expected path value in assertions

## 6. Verification

- [ ] 6.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 6.2 `pnpm exec tsc --noEmit` clean
- [ ] 6.3 `pnpm lint` clean
- [ ] 6.4 `node bin/openspec.js validate compact-engine-core --strict` passes
- [ ] 6.5 Run `compact plan` against this repository's own 25 records and confirm the reported sections and inputs match the assignment made in milestone 1
