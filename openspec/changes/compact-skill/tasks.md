## 1. The compact skill template

- [ ] 1.1 Create `src/core/templates/workflows/opsp-compact.ts` exporting `getOpspCompactSkillTemplate()` and `getOpspCompactCommandTemplate()`, following the shape of the other OPSP workflow templates
- [ ] 1.2 Instructions: the compile loop — `compact plan --json`, render only non-fresh sections, `compact seal`; never write the manifest directly
- [ ] 1.3 Instructions: rebuild a stale section from the full input records named by the plan; the existing view text is output, never input (DEC-011)
- [ ] 1.4 Instructions: every claim carries its record ids inline, with the partial-supersession case given as the worked reason (DEC-009)
- [ ] 1.5 Instructions: the view structure — Charter, Constraints, Decisions, Open Loops — and the index as a router
- [ ] 1.6 Instructions: open loops report only unassigned records, unknown hats and empty hats; inventing a gap is forbidden (DEC-007)
- [ ] 1.7 Instructions: a tampered section stops the run and directs the operator to `/opsp:explore` (DEC-006)
- [ ] 1.8 Guardrails: compact never writes driver-specs, ADRs or DECISION-MAP.md; all paths via `path.join`

## 2. Registration

- [ ] 2.1 Re-export the templates from `src/core/templates/skill-templates.ts`
- [ ] 2.2 Add `opsp-compact` to `OPSP_WORKFLOW_IDS` in `src/core/shared/skill-generation.ts`
- [ ] 2.3 Add the skill to `getOpspSkillTemplates()` with dirName `opensprint-compact`, and the command to the command contents

## 3. Wire the callers (DEC-014)

- [ ] 3.1 `/opsp:archive` — replace its architecture.md synthesis with an invocation of compact
- [ ] 3.2 `/opsp:knockdown` — its final phase compiles via compact rather than writing architecture.md directly
- [ ] 3.3 `/opsp:rebase` and `/opsp:abandon` — recompile via compact after reconciliation, since compiled output is regenerated rather than merged

## 4. Tests

- [ ] 4.1 Registration — `opsp-compact` present in `OPSP_WORKFLOW_IDS`, skill templates and command contents
- [ ] 4.2 Naming — skill name and dirName are `opensprint-compact`
- [ ] 4.3 Guardrails present in the instruction text: the plan/seal loop, rebuild-from-full-inputs, inline citation, the tampered stop, and the never-writes-records rule
- [ ] 4.4 Archive template no longer instructs its own architecture.md synthesis and does reference compact
- [ ] 4.5 Knockdown, rebase and abandon templates reference compact for their compile step

## 5. Verification

- [ ] 5.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 5.2 `pnpm exec tsc --noEmit` clean
- [ ] 5.3 `pnpm lint` clean
- [ ] 5.4 `node bin/openspec.js validate compact-skill --strict` passes
- [ ] 5.5 Run `/opsp:compact` against this repository and render its first real views, then confirm `opensprint compact check` exits zero
