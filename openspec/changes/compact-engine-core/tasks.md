## 1. Engine — grouping and sections

- [x] 1.1 Create `src/core/compact/sections.ts` exporting `SECTION_NAMES` (`charter`, `constraints`, `decisions`, `open-loops`) as an explicit `as const` list
- [x] 1.2 Add `groupRecordsByHat(driverSpecs, decisions, registry)` — assigns each record to every hat it declares, filters to `active`/`accepted`, and returns the unassigned and unknown-hat records separately
- [x] 1.3 Add `resolveSectionInputs(hat, grouped)` — `charter` gets all the hat's records, `constraints` its driver-specs, `decisions` its ADRs, `open-loops` none

## 2. Engine — hashing and manifest

- [x] 2.1 Create `src/core/compact/manifest.ts` with the manifest shape: per entry, hat, section, contributing record ids with content hashes, combined input hash, rendered output hash
- [x] 2.2 Add `hashContent(text)` — normalise `\r\n` to `\n`, then sha256, so line-ending rewrites do not change a hash
- [x] 2.3 Add `sectionInputHash(records)` — sort by record id before hashing so directory iteration order cannot affect the result
- [x] 2.4 Add `readManifest(opensprintDir)` / `writeManifest(opensprintDir, manifest)` using `path.join`; a missing or malformed manifest reads as empty rather than throwing

## 3. Engine — staleness

- [x] 3.1 Create `src/core/compact/status.ts` with `classifySection()` returning `fresh` | `stale` | `tampered` | `unsealed`
- [x] 3.2 Report, for a stale section, which record ids were added, removed or modified against the manifest
- [x] 3.3 Treat a missing manifest entry as `unsealed`, never `stale`
- [x] 3.4 Treat a missing view file as `unsealed` when unsealed, and report the hat as unrendered during `seal`

## 4. CLI

- [x] 4.1 Create `src/commands/compact.ts` with `plan`, `seal` and `check`
- [x] 4.2 Register the command in `src/cli/index.ts`, following the existing subcommand style
- [x] 4.3 `plan` and `check` support `--json`; when `--json` is passed, JSON is the only thing on stdout
- [x] 4.4 `check` exits non-zero on any section that is not fresh, and names each with its state
- [x] 4.5 `check` and `plan` never write; only `seal` writes
- [x] 4.6 `tampered` guidance directs the operator to `/opsp:explore`, per DEC-006

## 5. Tests

- [x] 5.1 Grouping — multi-hat records land in every declared hat; unassigned and unknown-hat records are reported separately; superseded records are excluded
- [x] 5.2 Section inputs — the four sections resolve to the documented input sets
- [x] 5.3 Hashing — order independence (shuffled input yields the same hash) and line-ending independence (`\r\n` and `\n` yield the same hash)
- [x] 5.4 Classification — each of `fresh`, `stale`, `tampered`, `unsealed`; a changed ADR restages `decisions` but leaves `constraints` fresh; a changed superseded record restages nothing
- [x] 5.5 Manifest — round-trip; missing file reads as empty; malformed file reads as empty without throwing
- [x] 5.6 CLI — `check` exit codes, `--json` purity on stdout, and that neither `check` nor `plan` writes
- [x] 5.7 Use `path.join()` for every expected path value in assertions

## 6. Verification

- [x] 6.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 6.2 `pnpm exec tsc --noEmit` clean
- [x] 6.3 `pnpm lint` clean
- [x] 6.4 `node bin/openspec.js validate compact-engine-core --strict` passes
- [x] 6.5 Run `compact plan` against this repository's own 25 records and confirm the reported sections and inputs match the assignment made in milestone 1

## 7. Verification result

- `tsc --noEmit`, `eslint src/` and `validate --strict` all clean
- 1531 tests pass, up 44. The 18 failures are the known `zsh-installer` isolation defect.
- `compact plan` against this repository's 25 records reproduces milestone 1's assignment
  exactly: product 7 constraints, maintainer 1, dev 16 decisions, devops 0, nothing
  unassigned, no unknown hats. The superseded DEC-012 is correctly excluded.

### Caught during implementation

A `require()` call had been written inside an ESM module in the seal path. `tsc` accepted it,
so it would have thrown only at runtime, on the one mode that writes. Replaced with a static
import and asserted absent before the tests ran.
