## 1. Rename decisions/ → ADRs/

- [x] 1.1 Update `src/core/init.ts` — change `decisions` directory creation to `ADRs` in `createOpenSprintStructure`
- [x] 1.2 Update `src/core/decision-map.ts` — change `readDecisionRecords` to read from `ADRs/` instead of `decisions/`
- [x] 1.3 Update `schemas/sprint-driven/schema.yaml` — change `decisions/DEC-*.md` generates path to `ADRs/DEC-*.md`
- [x] 1.4 Update existing skill templates (`decide.ts`, `tree.ts`, `rebuild-assess.ts`) — replace all `decisions/` path references with `ADRs/`
- [x] 1.5 Update tests — completed in Group 5
- [x] 1.6 Update `driver.ts` skill template — no cross-references found, already clean

## 2. New Artifact Templates and Schema Updates

- [x] 2.1 Create `schemas/sprint-driven/templates/initiative.md` — template with frontmatter placeholders and sections (Description, Driver Specs, ADRs, Milestones)
- [x] 2.2 Create `schemas/sprint-driven/templates/architecture.md` — template with section headers (System Overview, Driver Specs, Architectural Decisions, System Structure, Constraints & Non-Negotiables)
- [x] 2.3 Update `schemas/sprint-driven/schema.yaml` — add `initiative` and `architecture` artifact definitions
- [x] 2.4 Update `src/core/init.ts` — create `initiatives/` directory and empty `architecture.md` from template during sprint-driven init

## 3. Lifecycle Skill Templates

- [x] 3.1 Create `src/core/templates/workflows/opsp-explore.ts` — initiative-level thinking partner, reads surrogate context, no artifacts, architect-level reasoning
- [x] 3.2 Create `src/core/templates/workflows/opsp-propose.ts` — analyze conversation, classify into driver-specs + ADRs, create initiative descriptor with milestone plan
- [x] 3.3 Create `src/core/templates/workflows/opsp-apply.ts` — orchestrate opsx cycles per milestone, surrogate-based question resolution, escalation to operator, context carry-forward
- [x] 3.4 Create `src/core/templates/workflows/opsp-archive.ts` — compile architecture.md from driver-specs + ADRs + decision-map, mark initiative completed

## 4. Command Generation Registration

- [x] 4.1 Export new lifecycle templates from `src/core/templates/skill-templates.ts`
- [x] 4.2 Add lifecycle workflow entries to `getOpspSkillTemplates()` in `src/core/shared/skill-generation.ts`
- [x] 4.3 Add lifecycle command entries to `getOpspCommandTemplates()` and `getOpspCommandContents()`
- [x] 4.4 Update `OPSP_WORKFLOW_IDS` constant to include all 8 OPSP workflows
- [x] 4.5 Update `OPSP_WORKFLOW_TO_SKILL_DIR` in `src/core/init.ts` to include lifecycle skill directory names

## 5. Tests

- [x] 5.1 Update `test/core/decision-map.test.ts` — verify reads from `ADRs/` directory
- [x] 5.2 Update `test/core/init-opensprint.test.ts` — verify `ADRs/`, `initiatives/`, and `architecture.md` creation
- [x] 5.3 Add test for lifecycle skill template existence and non-empty instructions
- [x] 5.4 Add test for 8 total OPSP workflows in generation pipeline
- [x] 5.5 Run full test suite to verify no regressions from rename
