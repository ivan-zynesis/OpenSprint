## 1. Update opsp-apply Skill Template — Git Branching

- [x] 1.1 Add initiative branch creation instructions to Phase 1 of `src/core/templates/workflows/opsp-apply.ts` — agent runs `git checkout -b opsp/<initiative-name>` after loading context, with handling for existing branch
- [x] 1.2 Add change branch creation instructions to Phase 2 (Step 2c) — agent runs `git checkout -b opsx/<initiative-name>/<change-name>` from initiative branch before implementing tasks
- [x] 1.3 Add change branch merge instructions to Phase 2 (Step 2d) — after archive, agent runs `git checkout opsp/<initiative-name> && git merge opsx/<initiative-name>/<change-name>`, with merge conflict escalation to operator

## 2. Update opsp-apply Skill Template — Milestone Pause

- [x] 2.1 Add review mode selection to Phase 1 — after loading context and creating initiative branch, agent presents per-milestone (default) / per-change / continuous options via AskUserQuestion
- [x] 2.2 Add milestone checkpoint to Phase 3 — when review mode is per-milestone, agent displays milestone summary (changes, branch, commit count, remaining milestones) and presents continue/switch-mode/stop options
- [x] 2.3 Add per-change checkpoint logic — when review mode is per-change, agent pauses after each opsx archive with change summary and branch info
- [x] 2.4 Add continuous mode logic — agent logs brief summary and proceeds without pause (except surrogate escalations)
- [x] 2.5 Add review mode switching at checkpoints — include "Switch review mode" option at every checkpoint

## 3. Create opsp-review Skill Template

- [x] 3.1 Create `src/core/templates/workflows/opsp-review.ts` — new skill template with `getOpspReviewSkillTemplate()` and `getOpspReviewCommandTemplate()` exports
- [x] 3.2 Implement review instructions: commit graph display via `git log --graph --oneline`, branch listing with merge status, milestone-to-change mapping from initiative descriptor
- [x] 3.3 Implement branch-level review assistance: `git diff` for individual change review, combined diff for milestone-level review

## 4. Register New Skill in Generation Pipeline

- [x] 4.1 Export `getOpspReviewSkillTemplate` and `getOpspReviewCommandTemplate` from `src/core/templates/skill-templates.ts`
- [x] 4.2 Add `opsp-review` workflow entry to `getOpspSkillTemplates()` in `src/core/shared/skill-generation.ts`
- [x] 4.3 Add `opsp-review` command entry to `getOpspCommandTemplates()` and `getOpspCommandContents()`
- [x] 4.4 Add `opsp-review` to `OPSP_WORKFLOW_IDS` constant
- [x] 4.5 Add `opsp-review` skill directory mapping to `OPSP_WORKFLOW_TO_SKILL_DIR` in `src/core/init.ts`

## 5. Tests

- [x] 5.1 Add test verifying `opsp-review` skill template exists and returns non-empty instructions
- [x] 5.2 Update test for total OPSP workflow count (now 9 instead of 8)
- [x] 5.3 Verify updated opsp-apply instructions contain branch management and pause checkpoint content
- [x] 5.4 Run full test suite to verify no regressions
