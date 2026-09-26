## 1. The compact skill template

- [x] 1.1 Create `src/core/templates/workflows/opsp-compact.ts` exporting `getOpspCompactSkillTemplate()` and `getOpspCompactCommandTemplate()`, following the shape of the other OPSP workflow templates
- [x] 1.2 Instructions: the compile loop — `compact plan --json`, render only non-fresh sections, `compact seal`; never write the manifest directly
- [x] 1.3 Instructions: rebuild a stale section from the full input records named by the plan; the existing view text is output, never input (DEC-011)
- [x] 1.4 Instructions: every claim carries its record ids inline, with the partial-supersession case given as the worked reason (DEC-009)
- [x] 1.5 Instructions: the view structure — Charter, Constraints, Decisions, Open Loops — and the index as a router
- [x] 1.6 Instructions: open loops report only unassigned records, unknown hats and empty hats; inventing a gap is forbidden (DEC-007)
- [x] 1.7 Instructions: a tampered section stops the run and directs the operator to `/opsp:explore` (DEC-006)
- [x] 1.8 Guardrails: compact never writes driver-specs, ADRs or DECISION-MAP.md; all paths via `path.join`

## 2. Registration

- [x] 2.1 Re-export the templates from `src/core/templates/skill-templates.ts`
- [x] 2.2 Add `opsp-compact` to `OPSP_WORKFLOW_IDS` in `src/core/shared/skill-generation.ts`
- [x] 2.3 Add the skill to `getOpspSkillTemplates()` with dirName `opensprint-compact`, and the command to the command contents

## 3. Wire the callers (DEC-014)

- [x] 3.1 `/opsp:archive` — replace its architecture.md synthesis with an invocation of compact
- [x] 3.2 `/opsp:knockdown` — its final phase compiles via compact rather than writing architecture.md directly
- [x] 3.3 `/opsp:rebase` and `/opsp:abandon` — recompile via compact after reconciliation, since compiled output is regenerated rather than merged

## 4. Tests

- [x] 4.1 Registration — `opsp-compact` present in `OPSP_WORKFLOW_IDS`, skill templates and command contents
- [x] 4.2 Naming — skill name and dirName are `opensprint-compact`
- [x] 4.3 Guardrails present in the instruction text: the plan/seal loop, rebuild-from-full-inputs, inline citation, the tampered stop, and the never-writes-records rule
- [x] 4.4 Archive template no longer instructs its own architecture.md synthesis and does reference compact
- [x] 4.5 Knockdown, rebase and abandon templates reference compact for their compile step

## 5. Verification

- [x] 5.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 5.2 `pnpm exec tsc --noEmit` clean
- [x] 5.3 `pnpm lint` clean
- [x] 5.4 `node bin/openspec.js validate compact-skill --strict` passes
- [x] 5.5 Run `/opsp:compact` against this repository and render its first real views, then confirm `opensprint compact check` exits zero

## 6. Verification result

- `tsc`, `eslint` and `validate --strict` clean; 1556 tests pass
- The 18 remaining failures are the known `zsh-installer` isolation defect

### First real views, rendered from this repository's own records

`/opsp:compact` ran end to end against 8 driver-specs and 16 active decisions:
plan → read inputs in full → render → seal → check exits zero.

**Measured compaction: 15,347 tokens of record → 5,328 tokens of views, 2.9x.**
Below the 4–5x estimated during explore. This repository's records are terse relative to
cashier's, so there is less redundancy to squeeze; the ratio on a larger surrogate is an open
question, and `DEC-015` already defers the loading switch until the views are proven.

**The gate was exercised, not just unit-tested.** Appending a paragraph to `DEC-009` moved
`dev/charter` and `dev/decisions` to `stale`; hand-editing `dev.md` moved every `dev` section to
`tampered` with the `/opsp:explore` guidance; restoring both returned `check` to exit zero.

### Caught during implementation

`opsp-skill-generation.test.ts` asserts the workflow registry by explicit count and id list, so
adding a fourteenth workflow failed it. That is the test doing its job — the project tracks
generated artifacts by name in a constant — so the assertions were updated rather than loosened.
