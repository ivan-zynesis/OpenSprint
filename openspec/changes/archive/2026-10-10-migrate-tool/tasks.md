## 1. Detection

- [x] 1.1 New `src/core/migrate.ts` with `findMigrations(projectRoot, opensprintDir)` returning data
- [x] 1.2 `MIGRATION_KINDS` as an explicit list of four
- [x] 1.3 `role-not-accepted`, offering the roles the hats do accept
- [x] 1.4 `objective-missing`, offering the hat's objectives
- [x] 1.5 `bar-not-in-anatomy`
- [x] 1.6 `hat-entirely-empty` — the view-level finding
- [x] 1.7 Superseded records ignored

## 2. The command

- [x] 2.1 `opensprint migrate`, reporting only
- [x] 2.2 `--json`
- [x] 2.3 The view-level finding sorted first, because it explains the record-level ones
- [x] 2.4 Says plainly when there is nothing to migrate

## 3. The workflow

- [x] 3.1 New `/opsp:migrate`, registered as a utility workflow
- [x] 3.2 States what it is not — `/opsp:rebuild-assess` is the world moving
- [x] 3.3 Tells the reader to read `hat-entirely-empty` first, and why
- [x] 3.4 Admits it can be a false positive
- [x] 3.5 Reuses `DEC-CLASSIFY-IN-QUESTION`'s form rather than inventing one
- [x] 3.6 Forbids batching
- [x] 3.7 Bounds writes to frontmatter and the measure anatomy

## 4. Verification

- [x] 4.1 Unit tests for every finding kind, positive and negative
- [x] 4.2 **The historical case reconstructed** — two maintainer records at `role: bar`, confirming all three record findings plus `hat-entirely-empty`, then silence once migrated the way they were migrated by hand
- [x] 4.3 Tests that the workflow is registered and carries each decision
- [x] 4.4 `pnpm test` green apart from the known flaky zsh-installer file
- [x] 4.5 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 5. Honest scope of validation

- [x] 5.1 **This tool has never run against a real migration.** This repository reports zero findings — `validateRoles`, `record-without-objective` and `record-unclassified` all agree — because the only two genuine cases were hand-migrated in `lifecycle-beyond-build` milestone 2. The fixture that motivated the tool was consumed by the work that proved the need. The reconstructed test is the closest available, and the next real shape change is the first true validation.
- [x] 5.2 Corrected the `surrogate-currency` note claiming this repository's stale views were a migration fixture. They are ordinary staleness from records added this session, which archive clears. Two different things had been conflated.

## 6. Discovered during implementation

- [x] 6.1 **`record-without-objective` has silently never fired in production.** Writing the equivalent check here exposed the flaw in both: `open-loops` declares `inputs: 'none'` and no roles, and treating "declares no roles" as "takes anything" made every record look reachable. Its milestone-2 tests passed only because the fixtures had no `open-loops` section — exactly the "validated against fixtures the author wrote" risk this change's own design names. Both call sites now exclude sections that take no records.
