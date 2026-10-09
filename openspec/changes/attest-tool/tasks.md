## 1. The amendment guard

- [x] 1.1 New `src/core/compact/amend.ts` with `checkAmendment(before, after)`
- [x] 1.2 Everything outside `## Measures` compared byte for byte
- [x] 1.3 The heading is stripped with its body, so a record gaining its first measure is bounded
- [x] 1.4 Trailing whitespace normalised, so an appended section's separating newline is not a change
- [x] 1.5 The reason names frontmatter specifically, and otherwise points at `/opsp:decide`

## 2. The workflow

- [x] 2.1 New `src/core/templates/workflows/opsp-attest.ts`
- [x] 2.2 The narrow context as a load/do-not-load table, with the ADR exclusion justified
- [x] 2.3 Refuse to continue in the authoring session
- [x] 2.4 Evidence defined as a CI artifact; prose is not evidence
- [x] 2.5 `cannot assess` as a complete outcome, with "stop looking"
- [x] 2.6 The three parts, with the attested-requires-both rule
- [x] 2.7 A bounds check the operator can run — `git diff --unified=0`
- [x] 2.8 Never gates: exits zero, names certification and `DS-SURROGATE-SCOPE`
- [x] 2.9 Hands to `/opsp:archive`, which cannot honestly run first

## 3. Registration

- [x] 3.1 Re-export from `skill-templates.ts`
- [x] 3.2 `OPSP_WORKFLOW_IDS`, before `opsp-archive`
- [x] 3.3 `getOpspSkillTemplates` and `getOpspCommandTemplates`
- [x] 3.4 `init.ts` workflow-to-directory mapping

## 4. Verification

- [x] 4.1 Unit tests for `checkAmendment`: unchanged, ex-post parts added, first measure added, changed statement, changed frontmatter, changed implications
- [x] 4.2 Tests that the skill is registered in all three places, before archive
- [x] 4.3 Tests that the instructions carry each decision they implement
- [x] 4.4 `pnpm test` green apart from the known zsh-installer failures
- [x] 4.5 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 5. Discovered during implementation

- [x] 5.1 **The amendment bound initially rejected a record's first attestation.** `outsideMeasures` stripped the section body but left its heading, so adding `## Measures` to a record that had none read as a change outside the section — which would have made it impossible to attest anything not already carrying measures. Strip the heading with the body, and normalise trailing whitespace so the separating newline is not a content change.
