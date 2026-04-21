## 1. Create opsp-reexplore Skill Template

- [x] 1.1 Create `src/core/templates/workflows/opsp-reexplore.ts` — new skill template with `getOpspReexploreSkillTemplate()` and `getOpspReexploreCommandTemplate()` exports
- [x] 1.2 Implement Phase 1 (context loading) instructions — read initiative descriptor, load surrogate, identify completed/pending milestones and active opsx changes
- [x] 1.3 Implement Phase 2 (initiative briefing + explore) instructions — present state-of-initiative summary, enter `/opsx:explore` stance at initiative level, handle conclude with no changes vs changes needed
- [x] 1.4 Implement Phase 3 (plan revision) instructions — for pending milestones: archive-and-repropose via `/opsx:propose`; for completed milestones: add corrective milestone and propose; for new milestones: add to plan and optionally propose; for reordering: update descriptor
- [x] 1.5 Implement audit logging instructions — log re-exploration entry in initiative descriptor with date, summary, and plan changes
- [x] 1.6 Add guardrails — stop at propose (don't execute), preserve completed milestone archives, ensure all new changes are associated to initiative

## 2. Register New Skill in Generation Pipeline

- [x] 2.1 Export `getOpspReexploreSkillTemplate` and `getOpspReexploreCommandTemplate` from `src/core/templates/skill-templates.ts`
- [x] 2.2 Add `opsp-reexplore` workflow entry to `getOpspSkillTemplates()` in `src/core/shared/skill-generation.ts`
- [x] 2.3 Add `opsp-reexplore` command entry to `getOpspCommandTemplates()` and `getOpspCommandContents()`
- [x] 2.4 Add `opsp-reexplore` to `OPSP_WORKFLOW_IDS` constant
- [x] 2.5 Add `opsp-reexplore` skill directory mapping to `OPSP_WORKFLOW_TO_SKILL_DIR` in `src/core/init.ts`

## 3. Tests

- [x] 3.1 Add test verifying `opsp-reexplore` skill template exists and returns non-empty instructions
- [x] 3.2 Update test for total OPSP workflow count (now 11 instead of 10)
- [x] 3.3 Verify opsp-reexplore instructions contain initiative context loading, explore stance, and plan revision content
- [x] 3.4 Run full test suite to verify no regressions
