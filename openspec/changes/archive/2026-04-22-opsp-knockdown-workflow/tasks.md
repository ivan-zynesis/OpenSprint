## 1. Create opsp-knockdown Skill Template

- [x] 1.1 Create `src/core/templates/workflows/opsp-knockdown.ts` — new skill template with `getOpspKnockdownSkillTemplate()` and `getOpspKnockdownCommandTemplate()` exports
- [x] 1.2 Implement operator readiness warning — warn about advanced model + extended thinking + large context window, ask for confirmation
- [x] 1.3 Implement Phase 1 (TOC Build) instructions — walk file system using names only, build toc.yaml, categorize entries (architectural/scan-structure/skip), record structural observations, small codebase escape hatch
- [x] 1.4 Implement Phase 2 (File Scan) instructions — filename-first inference, content-read fallback for ambiguous names, one-line summaries, three-question classifier (driver-spec? / ADR? / affects-ADR? / drop), mark status in toc.yaml
- [x] 1.5 Implement Phase 3 (Bottom-Up Compaction) instructions — collect surviving summaries per directory, group by relatedness, compact groups into directory summaries in opensprint/knockdown/summaries/, classify compacted results, don't force unrelated merges, orphans float up
- [x] 1.6 Implement Phase 4 (Architecture Extraction) instructions — read findings + surviving summaries, fill architecture.md template in reverse system design order (tech stack → architecture → requirements), batch ADR confirmation by area, driver-spec confirmation, generate DECISION-MAP.md
- [x] 1.7 Implement pause/resume instructions — persist progress in toc.yaml + summaries/ + findings.md, detect existing working data on invocation, resume from last pending position
- [x] 1.8 Define architecture.md template within skill instructions — System Identity, System Boundary, Component Map, Cross-Cutting Concerns, Infrastructure Topology, Constraints
- [x] 1.9 Define architecture probe checklist within skill instructions — Compute Model, Scaling Strategy, Communication Patterns, Data Architecture, Cloud/Provider, Resilience, Security Model
- [x] 1.10 Add guardrails — read-only (no code modification), operator drives confirmation, batch questions by area, language/framework/platform agnostic

## 2. Register New Skill in Generation Pipeline

- [x] 2.1 Export `getOpspKnockdownSkillTemplate` and `getOpspKnockdownCommandTemplate` from `src/core/templates/skill-templates.ts`
- [x] 2.2 Add `opsp-knockdown` workflow entry to `getOpspSkillTemplates()` in `src/core/shared/skill-generation.ts`
- [x] 2.3 Add `opsp-knockdown` command entry to `getOpspCommandTemplates()` and `getOpspCommandContents()`
- [x] 2.4 Add `opsp-knockdown` to `OPSP_WORKFLOW_IDS` constant
- [x] 2.5 Add `opsp-knockdown` skill directory mapping to `OPSP_WORKFLOW_TO_SKILL_DIR` in `src/core/init.ts`

## 3. Tests

- [x] 3.1 Add test verifying `opsp-knockdown` skill template exists and returns non-empty instructions
- [x] 3.2 Update test for total OPSP workflow count (now 11 instead of 10)
- [x] 3.3 Verify opsp-knockdown instructions contain key concepts: toc.yaml, three-question classifier, compaction, architecture template, reverse system design, pause/resume
- [x] 3.4 Run full test suite to verify no regressions
