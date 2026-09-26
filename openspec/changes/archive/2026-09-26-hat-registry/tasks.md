## 1. Hat registry module

- [x] 1.1 Create `src/core/hats.ts` exporting `DEFAULT_HATS` (`product`, `maintainer`, `dev`, `devops`, `agreements`) and `DRIVER_SPEC_TYPES` (`product`, `legal`, `compliance`, `reliability`, `architecture`, `business`) as `as const` arrays
- [x] 1.2 Add `resolveHatRegistry(projectRoot)` — returns the project's `hats` when valid, otherwise `DEFAULT_HATS`; warns and falls back on a malformed or empty value, never throws
- [x] 1.3 Add `isValidHat(value, registry)` and `isValidDriverSpecType(value)` using explicit `Set.has` lookup, case-sensitive; no regex, no pattern matching
- [x] 1.4 Add `defaultHatFor(record, driverSpecsById)` — pure, returns a suggestion or `null`; maps driver-spec `type` by explicit lookup, walks ADR `depends-on` to nearest driver-spec ancestors, returns `null` when ancestors disagree or are absent, and never infers `devops`

## 2. Project config

- [x] 2.1 Add optional `hats: z.array(z.string()).nonempty().optional()` to `ProjectConfigSchema` in `src/core/project-config.ts`, with a `.describe()` matching the existing field style
- [x] 2.2 Verify `readProjectConfig`'s field-by-field `safeParse` degrades a malformed `hats` to undefined without failing the whole config read

## 3. Record parsing

- [x] 3.1 Add optional `hat?: string` to `DriverSpecEntry` and `DecisionEntry` in `src/core/decision-map.ts`, populated from frontmatter when present
- [x] 3.2 Confirm `buildTree`, `renderTree`, `renderImpactTable` and `generateDecisionMap` are unaffected — `hat` is carried, not consumed, in this milestone

## 4. Schema and templates

- [x] 4.1 Add `hat` to the `driver-spec` and `decision-record` artifact instructions in `schemas/sprint-driven/schema.yaml`, stating one hat per record
- [x] 4.2 Add a commented `hat` placeholder to `schemas/sprint-driven/templates/driver-spec.md` and `templates/decision-record.md`

## 5. Tests

- [x] 5.1 `test/core/hats.test.ts` — registry resolution (default, custom, malformed, empty), validation (valid, unknown, wrong case), driver-spec type validation including rejecting `driver-spec`
- [x] 5.2 Inference tests — each of the six type mappings, ADR from single-hat ancestry, `null` on disagreeing ancestors, `null` on no ancestors, and that no input infers `devops`
- [x] 5.3 Backward-compatibility test — records with no `hat` parse successfully and are reported unassigned
- [x] 5.4 Use `path.join()` for every expected path value in assertions
- [x] 5.5 Confirm the suite passes on Windows CI (paths are constructed via `path.join`; hat comparison is case-sensitive and independent of filesystem case-folding)

## 6. Backfill this repository

- [x] 6.1 Ran inference across the repo's records and presented suggestions batched by hat. Operator specified the assignment directly: driver-specs are product/maintainer (requirements the product owner decides), ADRs are dev.
- [x] 6.2 Wrote confirmed `hats` values into all 25 records — product 7, maintainer 1 (DS-BACKWARD-COMPAT), dev 17
- [x] 6.3 No record left unassigned. `devops` is deliberately empty per DS-SELF-USE-SCOPE and DEC-017.

## 7. Verification

- [ ] 7.1 `pnpm test` passes — 1486 pass, 19 fail, all pre-existing and reproduced on the baseline commit: 18 environmental (`zsh-installer`, real `~/.zshrc`, EACCES) and 1 from two malformed source specs shipped by 35a3a21. Tracked as a separate change; this task closes when that change lands.
- [x] 7.2 `pnpm exec tsc --noEmit` passes
- [x] 7.3 `pnpm lint` passes
- [x] 7.4 `node bin/openspec.js validate --strict` passes for the change
- [x] 7.5 Confirm no existing command's output changes — nothing reads `hat` yet

## 8. Surrogate changes raised during implementation

The single-hat rule did not survive contact with real records: six of twenty-one routed to
`agreements`, a hat with no owner. Escalated, and the operator's answers enriched the record
rather than being consumed by this task.

- [x] 8.1 DEC-012 superseded by DEC-016 — a record declares one or more hats; `agreements` removed from the default set
- [x] 8.2 DS-SELF-USE-SCOPE recorded — self-use tool, not competing with provider tooling; the source of the no-GUI, no-CI/CD shape
- [x] 8.3 DS-BACKWARD-COMPAT recorded — best-effort compatibility; semver, npm, static published packages; new releases meet older projects
- [x] 8.4 DEC-017 recorded — the surface is the CLI plus generated agent files, depending on DS-SELF-USE-SCOPE
- [x] 8.5 DECISION-MAP.md regenerated with `regenerateDecisionMap()`, the first actual use of that generator
