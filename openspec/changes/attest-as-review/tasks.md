## 1. The verdict vocabulary

- [x] 1.1 `POSTURE_VERDICTS` — `met`, `partially met`, `not met`, `cannot assess`, explicit list
- [x] 1.2 `normalizeVerdict` ignoring case and whitespace, null for anything outside it
- [x] 1.3 `verdictRequires` — `met` owes evidence, everything else owes exposure

## 2. Conditional measure loops

- [x] 2.1 `measure-unattested` added to `OPEN_LOOP_KINDS`
- [x] 2.2 No posture → `measure-unattested`, once, not alongside the other two
- [x] 2.3 Unrecognised verdict → `measure-unattested`, naming the accepted values
- [x] 2.4 `met` with no evidence → `measure-unasserted`
- [x] 2.5 Any other verdict with no exposure → `measure-unexposed`
- [x] 2.6 `met` no longer owes an exposure; a non-met verdict no longer owes evidence

## 3. The attestation section

- [x] 3.1 `DOORS` — `one-way`, `two-way`, explicit lookup; anything else reads as absent
- [x] 3.2 `RaciRow` with `automated`, and R/A/C/I optional
- [x] 3.3 `parseAttestation` reading `door`, `blast-radius` and the RACI table
- [x] 3.4 A row naming a system is automated and needs no human names
- [x] 3.5 Dash, em-dash, en-dash, empty and `n/a` all read as absent
- [x] 3.6 Header and separator rows skipped; a short table parses rather than failing
- [x] 3.7 Carried on `InitiativeEntry` when present

## 4. The workflow

- [x] 4.1 Reading scope: test files in; source, design and rationales out
- [x] 4.2 State why tests and not source — same altitude, bar restated
- [x] 4.3 "Does this test actually assert the bar?" as the operative question
- [x] 4.4 Refuse the authoring session, tests included, not satisfiable by assertion
- [x] 4.5 The verdict table — what each posture owes
- [x] 4.6 The three review questions, with the system-or-human rule
- [x] 4.7 Refuse "the team" as an owner
- [x] 4.8 Bounds check extended to `## Attestation`
- [x] 4.9 State which half of change management is in scope

## 5. Verification

- [x] 5.1 Unit tests for the verdict vocabulary
- [x] 5.2 Unit tests for every branch of the conditional loops
- [x] 5.3 Unit tests for `parseAttestation`, including malformed and short tables
- [x] 5.4 Tests that the instructions carry each decision
- [x] 5.5 `pnpm test` green apart from the known zsh-installer failures
- [x] 5.6 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean
- [x] 5.7 Loop counts on this repository before and after

## 6. Result on this repository

- [x] 6.1 `measure-unasserted` + `measure-unexposed` fell from **35 combined to 0**, replaced by **22 `measure-unattested`** — one per measure nobody has judged, rather than two misleading findings each. Total loops 60 → 48.
- [x] 6.2 Updated `test/core/attest.test.ts` to cite `DEC-040`, clearing the `rule-guards-dead-record` loop that superseding `DEC-033` created.

## 7. Discovered during implementation

- [x] 7.1 **Four assertions on the workflow prose failed, and only three were real.** The fourth — `residue after automation` — was present but wrapped across a line break, so the regex missed it. Asserting on wrapped prose is inherently fragile; the prose assertions are now whitespace-tolerant. The three genuine omissions (the explicit "Evidence is a CI artifact" definition, the `DEC-027` citation on the bounds check, and the attested-requires-both rule) were restored rather than deleted from the tests.
