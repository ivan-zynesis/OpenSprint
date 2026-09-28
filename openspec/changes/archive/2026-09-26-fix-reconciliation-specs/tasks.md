## 1. Formalize reconciliation-citizen-taxonomy

- [x] 1.1 Write the delta spec: citizen definition, one-classification-per-run, the four classifications with their criteria and rules, DFS traversal order, and the confidence guardrail
- [x] 1.2 Strip the superseded free-form sections (`## Definitions`, `## DFS Traversal Order`, `## Agent Confidence Guardrail`) from the source spec, preserving `## Purpose` verbatim

## 2. Formalize reconciliation-conflict-manifest

- [x] 2.1 Write the delta spec: when the manifest is produced, the summary table, the detail section, the cross-skill warning, and the confirmation prompt
- [x] 2.2 Strip the superseded free-form sections (`## When It Is Produced`, `## Display Format`, `## Detail Section`, `## Cross-Skill Warning`, `## Operator Confirmation Prompt`), preserving `## Purpose` verbatim

## 3. Verification

- [x] 3.1 `node bin/openspec.js validate fix-reconciliation-specs --strict` passes
- [x] 3.2 Archive the change so the requirements land in the source specs
- [x] 3.3 `source-specs-normalization` passes — the suite's only non-environmental failure is gone
- [x] 3.4 Confirm every normative statement from the original prose appears in the restructured spec, by reading the diff clause by clause
- [x] 3.5 `pnpm exec tsc --noEmit` and `pnpm lint` still clean (no `src/` changes expected)

## 4. Verification result

- 13 requirements added across the two specs; `## Purpose` preserved verbatim in both
- `source-specs-normalization` passes — `main` is no longer red on this count
- Full suite: 1487 pass, 18 fail, all in `zsh-installer`
- `tsc --noEmit` and `eslint src/` clean; no `src/` changes were made

### Open loop raised, not fixed here

The 18 remaining failures are a **test-isolation defect, not environmental noise**.
`zsh-installer.test.ts` builds a `testHomeDir` under `os.tmpdir()`, but the code path still
consults the real `os.homedir()`, so `isOhMyZshInstalled` sees this machine's `~/.oh-my-zsh`
and returns true where the test expects false. These tests pass in CI, where no Oh My Zsh is
installed, and fail for any developer who has it. Same shape as the defect this change fixed:
a guard that does not guard what it claims to. Left for triage via `/opsp:explore`.
