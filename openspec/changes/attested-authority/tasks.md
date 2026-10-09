## 1. Attestation metadata

- [x] 1.1 `POSTURE_LABELS` — `verdict`, `attested-by`, `attested-on`
- [x] 1.2 `parsePosture(block)` sharing `parseBar`'s labelled-line reader rather than repeating it
- [x] 1.3 Factor that reader out as `parseLabelled(block, labels)`
- [x] 1.4 Prose beneath the labels is kept; the labels are the structured part

## 2. Authority

- [x] 2.1 `attestationOf(content)` returning `{ attested, verdict?, by?, on?, authority }`
- [x] 2.2 `attested` requires both an attestation date and populated evidence
- [x] 2.3 Computed from content, never declared in frontmatter
- [x] 2.4 The date is carried and never expired — `DEC-021` leaves the threshold open

## 3. Reporting

- [x] 3.1 `compact plan --json` carries `authority` per staged record
- [x] 3.2 Verdict, attester and date carried where stated

## 4. The rendering contract

- [x] 4.1 Replace the two-authority section with three, as a table
- [x] 4.2 State that only `attested` licenses the present tense
- [x] 4.3 Carry the real failure as the worked example — `architecture.md` and `squad/maintainer.md` disagreeing about the same guardrail in the same pass
- [x] 4.4 Keep the three existing rules about observations

## 5. Verification

- [x] 5.1 Unit tests for `parsePosture` and `attestationOf`, including both half-attested cases
- [x] 5.2 Test that an old attestation stays attested, with its date carried
- [x] 5.3 `pnpm test` green apart from the known zsh-installer failures
- [x] 5.4 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean
- [x] 5.5 Confirm every record on this repository reports `decided` — 57 of 57, which is the finding

## 6. Discovered during implementation

- [x] 6.1 **Milestone 7 left `opensprint/specs/opsp-board/spec.md` with archive placeholder text.** Archiving a change that adds a new capability writes `TBD - created by archiving change board-view`, and the normalization test catches it — but only on the next full run. Wrote the real Purpose section.
