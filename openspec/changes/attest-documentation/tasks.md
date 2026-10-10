## 1. The documentation directory

- [x] 1.1 `docsDir` in the Zod schema, optional, non-empty string
- [x] 1.2 `docsDir` in the **runtime** parser — the schema alone was not enough
- [x] 1.3 A malformed value warns and degrades to the default rather than failing
- [x] 1.4 `DEFAULT_DOCS_DIR` and `resolveDocsDir(projectRoot)`, trimming whitespace

## 2. The three attestation loops

- [x] 2.1 `reversibility-unstated`, `blast-radius-unstated`, `raci-unassigned` added to `OPEN_LOOP_KINDS`
- [x] 2.2 `deriveOpenLoops` gains an `initiatives` parameter, defaulting to none
- [x] 2.3 Scoped to `state: attested` or `completed`; silent otherwise
- [x] 2.4 A row naming a system needs no names
- [x] 2.5 A manual row owes Responsible and Accountable; the report names which is missing
- [x] 2.6 No RACI at all reports once, as its own finding
- [x] 2.7 One loop per unowned row
- [x] 2.8 Wired through `openLoopsFor` using the scan's `opensprintDir`

## 3. The workflow

- [x] 3.1 A documentation review step, between the three questions and the bounds check
- [x] 3.2 The four questions it asks of existing documentation
- [x] 3.3 Not a question of authorship — adequacy and completeness
- [x] 3.4 Urge, then write only on confirmation
- [x] 3.5 Name the documentation directory as the one free write target
- [x] 3.6 Bounds check extended: outside the docs directory, `## Measures` or `## Attestation` only
- [x] 3.7 Thin documentation the operator declines to improve is recorded as a finding

## 4. Verification

- [x] 4.1 Unit tests for `resolveDocsDir`: default, override, whitespace, malformed, no config
- [x] 4.2 Unit tests for every branch of the three attestation loops
- [x] 4.3 Tests that the instructions carry the documentation review and the write bound
- [x] 4.4 `pnpm test` green apart from the known zsh-installer failures
- [x] 4.5 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 5. Result on this repository

- [x] 5.1 The three loops are **silent**, correctly: nothing claims `state: attested`. Verified by test rather than inferred from the quiet result.
- [x] 5.2 `rule-guards-dead-record` cleared — milestone 11's `DEC-040` citation resolved the loop that superseding `DEC-033` created.
- [x] 5.3 Sixteen loop kinds, up from thirteen.

## 6. Discovered during implementation

- [x] 6.1 **Adding `docsDir` to the Zod schema did not make it readable.** `readProjectConfig` parses each field explicitly at runtime — the schema describes the shape, the parser decides what is kept — so a configured `docsDir` silently resolved to the default. The tests caught it; both places now handle it, matching how `hats` and `ruleGlobs` already work.
