## 1. Hat registry module

- [ ] 1.1 Create `src/core/hats.ts` exporting `DEFAULT_HATS` (`product`, `maintainer`, `dev`, `devops`, `agreements`) and `DRIVER_SPEC_TYPES` (`product`, `legal`, `compliance`, `reliability`, `architecture`, `business`) as `as const` arrays
- [ ] 1.2 Add `resolveHatRegistry(projectRoot)` — returns the project's `hats` when valid, otherwise `DEFAULT_HATS`; warns and falls back on a malformed or empty value, never throws
- [ ] 1.3 Add `isValidHat(value, registry)` and `isValidDriverSpecType(value)` using explicit `Set.has` lookup, case-sensitive; no regex, no pattern matching
- [ ] 1.4 Add `defaultHatFor(record, driverSpecsById)` — pure, returns a suggestion or `null`; maps driver-spec `type` by explicit lookup, walks ADR `depends-on` to nearest driver-spec ancestors, returns `null` when ancestors disagree or are absent, and never infers `devops`

## 2. Project config

- [ ] 2.1 Add optional `hats: z.array(z.string()).nonempty().optional()` to `ProjectConfigSchema` in `src/core/project-config.ts`, with a `.describe()` matching the existing field style
- [ ] 2.2 Verify `readProjectConfig`'s field-by-field `safeParse` degrades a malformed `hats` to undefined without failing the whole config read

## 3. Record parsing

- [ ] 3.1 Add optional `hat?: string` to `DriverSpecEntry` and `DecisionEntry` in `src/core/decision-map.ts`, populated from frontmatter when present
- [ ] 3.2 Confirm `buildTree`, `renderTree`, `renderImpactTable` and `generateDecisionMap` are unaffected — `hat` is carried, not consumed, in this milestone

## 4. Schema and templates

- [ ] 4.1 Add `hat` to the `driver-spec` and `decision-record` artifact instructions in `schemas/sprint-driven/schema.yaml`, stating one hat per record
- [ ] 4.2 Add a commented `hat` placeholder to `schemas/sprint-driven/templates/driver-spec.md` and `templates/decision-record.md`

## 5. Tests

- [ ] 5.1 `test/core/hats.test.ts` — registry resolution (default, custom, malformed, empty), validation (valid, unknown, wrong case), driver-spec type validation including rejecting `driver-spec`
- [ ] 5.2 Inference tests — each of the six type mappings, ADR from single-hat ancestry, `null` on disagreeing ancestors, `null` on no ancestors, and that no input infers `devops`
- [ ] 5.3 Backward-compatibility test — records with no `hat` parse successfully and are reported unassigned
- [ ] 5.4 Use `path.join()` for every expected path value in assertions
- [ ] 5.5 Confirm the suite passes on Windows CI (paths are constructed via `path.join`; hat comparison is case-sensitive and independent of filesystem case-folding)

## 6. Backfill this repository

- [ ] 6.1 Run `defaultHatFor` across this repo's 6 driver-specs and 15 ADRs and present suggestions batched by hat for confirmation
- [ ] 6.2 Write confirmed `hat` values into the frontmatter of each record
- [ ] 6.3 Leave any record whose hat the operator does not confirm unassigned, and report it

## 7. Verification

- [ ] 7.1 `pnpm test` passes
- [ ] 7.2 `pnpm exec tsc --noEmit` passes
- [ ] 7.3 `pnpm lint` passes
- [ ] 7.4 `node bin/openspec.js validate --strict` passes for the change
- [ ] 7.5 Confirm no existing command's output changes — nothing reads `hat` yet
