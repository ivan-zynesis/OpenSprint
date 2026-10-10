## 1. Scoping

- [x] 1.1 `compactSealCommand({ hats })` accepting an optional list
- [x] 1.2 `compact seal --hat <name>` on the CLI, repeatable
- [x] 1.3 An unknown hat warns, naming it and the registry, and does not fail
- [x] 1.4 No hats named means every hat, preserving archive's behaviour

## 2. Never bless what was not rendered

- [x] 2.1 Read the existing manifest before sealing
- [x] 2.2 Compare each hat's current view hash against what the manifest records
- [x] 2.3 Unchanged view → carry its entries forward verbatim, including `inputHash`
- [x] 2.4 Changed view → reseal with current inputs and observations
- [x] 2.5 No existing entries → seal (first seal is always allowed)
- [x] 2.6 The rule applies regardless of scope, so a correctly-scoped call still cannot bless

## 3. Reporting

- [x] 3.1 Say how many sections were sealed and how many carried forward
- [x] 3.2 Name the hats skipped because their view was unchanged, so the operator knows why

## 4. Verification

- [x] 4.1 Unit tests: scoped seal leaves other hats' input hashes untouched
- [x] 4.2 Unit test: an unchanged view is not resealed even when in scope
- [x] 4.3 Unit test: a changed view is resealed
- [x] 4.4 Unit test: first seal works with no prior manifest
- [x] 4.5 Unit test: unknown hat warns and does not fail
- [x] 4.6 **Regression test for the original bug** — render one hat, seal, confirm the other three remain stale under `check`
- [x] 4.7 `pnpm test` green apart from the known flaky zsh-installer file
- [x] 4.8 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 5. Result on this repository

- [x] 5.1 **The original bug no longer reproduces.** With twelve sections stale and nothing re-rendered, an unscoped `compact seal` now reports `Sealed 0 section(s)` and `carried forward unchanged: product, dev, devops, maintainer`. `compact check` still reports twelve stale and the manifest is byte-identical. Before this change the same command would have blessed all twelve and made the gate pass.
- [x] 5.2 It also protects the migration fixture automatically — the deliberate stale state recorded in the initiative survives a seal rather than needing anyone to remember not to run one.

## 6. Discovered during implementation

- [x] 6.1 **The new tests landed in the wrong `describe`.** `test/cli-e2e/compact.test.ts` has two top-level suites, and appending to the end of the file put the block inside the second one, which has none of the fixture helpers. Eight tests failed with `squadDir is not defined`. Moved into the first suite. Worth noting because appending to the end of a test file is only correct when the file has exactly one suite.
