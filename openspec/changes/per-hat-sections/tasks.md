## 1. Section definitions

- [ ] 1.1 Replace `SECTION_NAMES` with `SectionDef { name, inputs }` and `SECTION_INPUT_KINDS` as an explicit `as const` list — `all`, `driver-specs`, `decisions`, `none`
- [ ] 1.2 Add `DEFAULT_SECTIONS` reproducing today's four exactly: charter/all, constraints/driver-specs, decisions/decisions, open-loops/none
- [ ] 1.3 Rewrite `resolveSectionInputs` to switch on the input kind rather than the section name
- [ ] 1.4 Add `headingFor(name)` — kebab-case to title-case, so `open-loops` renders as `Open Loops`

## 2. Config

- [ ] 2.1 Widen `hats` in `ProjectConfigSchema` to accept an array of strings or a map from name to `{ sections?: SectionDef[] }`
- [ ] 2.2 Parse it field-by-field in the existing resilient style; a malformed value warns naming `hats` and degrades to `DEFAULT_HATS`
- [ ] 2.3 A section declaring an unknown input kind degrades that hat to `DEFAULT_SECTIONS` and warns, naming the hat and the value
- [ ] 2.4 Add `resolveHatSections(projectRoot, hat)` alongside `resolveHatRegistry`

## 3. Engine

- [ ] 3.1 `classifyAll` iterates each hat's own sections rather than a shared list
- [ ] 3.2 `classifySection` takes a `SectionDef`
- [ ] 3.3 Widen `ManifestEntry.section` from the fixed union to `string`
- [ ] 3.4 Ignore manifest entries for sections a hat no longer declares — not reported, not rewritten
- [ ] 3.5 `seal` writes one entry per section per hat, following each hat's list

## 4. CLI

- [ ] 4.1 `plan`, `seal` and `check` work against variable section sets with no interface change
- [ ] 4.2 `plan --json` continues to carry section name and state per hat

## 5. Tests

- [ ] 5.1 Defaults — a project declaring no hats renders exactly today's four sections per hat
- [ ] 5.2 Array form — `hats: [a, b]` still resolves, each with default sections (DS-BACKWARD-COMPAT)
- [ ] 5.3 Map form — declared sections are used; a hat with `{}` gets defaults
- [ ] 5.4 Input kinds — each of `all`, `driver-specs`, `decisions`, `none` resolves to the documented set
- [ ] 5.5 Granularity preserved — a changed ADR restages a `decisions` section and leaves a `driver-specs` section fresh, under a custom section set
- [ ] 5.6 Malformed config — bad `hats`, bad section entry, unknown input kind; each warns and degrades without throwing
- [ ] 5.7 Orphaned manifest entry is ignored by `check` and dropped by `seal`
- [ ] 5.8 Heading derivation for kebab and single-word names
- [ ] 5.9 Use `path.join()` for every expected path value

## 6. Verification

- [ ] 6.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 6.2 `pnpm exec tsc --noEmit` clean
- [ ] 6.3 `pnpm lint` clean
- [ ] 6.4 `node bin/openspec.js validate per-hat-sections --strict` passes
- [ ] 6.5 This repository's own views remain byte-identical and `compact check` stays green — the proof that nothing changed for a project not declaring sections
