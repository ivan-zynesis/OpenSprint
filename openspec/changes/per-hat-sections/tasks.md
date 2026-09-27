## 1. Section definitions

- [x] 1.1 Replace `SECTION_NAMES` with `SectionDef { name, inputs }` and `SECTION_INPUT_KINDS` as an explicit `as const` list — `all`, `driver-specs`, `decisions`, `none`
- [x] 1.2 Add `DEFAULT_SECTIONS` reproducing today's four exactly: charter/all, constraints/driver-specs, decisions/decisions, open-loops/none
- [x] 1.3 Rewrite `resolveSectionInputs` to switch on the input kind rather than the section name
- [x] 1.4 Add `headingFor(name)` — kebab-case to title-case, so `open-loops` renders as `Open Loops`

## 2. Config

- [x] 2.1 Widen `hats` in `ProjectConfigSchema` to accept an array of strings or a map from name to `{ sections?: SectionDef[] }`
- [x] 2.2 Parse it field-by-field in the existing resilient style; a malformed value warns naming `hats` and degrades to `DEFAULT_HATS`
- [x] 2.3 A section declaring an unknown input kind degrades that hat to `DEFAULT_SECTIONS` and warns, naming the hat and the value
- [x] 2.4 Add `resolveHatSections(projectRoot, hat)` alongside `resolveHatRegistry`

## 3. Engine

- [x] 3.1 `classifyAll` iterates each hat's own sections rather than a shared list
- [x] 3.2 `classifySection` takes a `SectionDef`
- [x] 3.3 Widen `ManifestEntry.section` from the fixed union to `string`
- [x] 3.4 Ignore manifest entries for sections a hat no longer declares — not reported, not rewritten
- [x] 3.5 `seal` writes one entry per section per hat, following each hat's list

## 4. CLI

- [x] 4.1 `plan`, `seal` and `check` work against variable section sets with no interface change
- [x] 4.2 `plan --json` continues to carry section name and state per hat

## 5. Tests

- [x] 5.1 Defaults — a project declaring no hats renders exactly today's four sections per hat
- [x] 5.2 Array form — `hats: [a, b]` still resolves, each with default sections (DS-BACKWARD-COMPAT)
- [x] 5.3 Map form — declared sections are used; a hat with `{}` gets defaults
- [x] 5.4 Input kinds — each of `all`, `driver-specs`, `decisions`, `none` resolves to the documented set
- [x] 5.5 Granularity preserved — a changed ADR restages a `decisions` section and leaves a `driver-specs` section fresh, under a custom section set
- [x] 5.6 Malformed config — bad `hats`, bad section entry, unknown input kind; each warns and degrades without throwing
- [x] 5.7 Orphaned manifest entry is ignored by `check` and dropped by `seal`
- [x] 5.8 Heading derivation for kebab and single-word names
- [x] 5.9 Use `path.join()` for every expected path value

## 6. Verification

- [x] 6.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 6.2 `pnpm exec tsc --noEmit` clean
- [x] 6.3 `pnpm lint` clean
- [x] 6.4 `node bin/openspec.js validate per-hat-sections --strict` passes
- [x] 6.5 This repository's own views remain byte-identical and `compact check` stays green — the proof that nothing changed for a project not declaring sections

## 7. Verification result

- `tsc`, `eslint` and `validate --strict` clean; 1618 tests pass, up 17
- The 18 remaining failures are the known `zsh-installer` isolation defect

### Backward compatibility, demonstrated rather than asserted

This repository declares no `hats`, and after the change its five view files are byte-identical,
the manifest still holds 16 entries — four per hat, the same four names — and `compact check`
exits zero. That is the proof that nothing moved for a project not opting in.

### The map form, end to end

Temporarily declaring `dev` with three custom sections and the other three hats as `{}`:

- `dev` resolved to `tech-stack`, `runtime-topology`, `open-loops`
- the other three resolved to the defaults and stayed fresh
- `tech-stack` and `runtime-topology` reported `unsealed`; `open-loops` stayed fresh, since the
  name carried over and its `none` inputs hash to the same value
- `dev`'s now-orphaned `charter`, `constraints` and `decisions` manifest entries were **ignored**,
  not reported as drift — the live demonstration of that rule
- `check` exited 1 while unsealed, and 0 again once the config was reverted
