# Tasks: OPSP Rebase & Abandon Tests

## Task 1: Create opsp-rebase workflow template
- [x] Create `src/core/templates/workflows/opsp-rebase.ts`

## Task 2: Create opsp-abandon workflow template
- [x] Create `src/core/templates/workflows/opsp-abandon.ts`

## Task 3: Export from skill-templates.ts
- [x] Add exports for rebase and abandon templates

## Task 4: Register in skill-generation.ts
- [x] Add to OPSP_WORKFLOW_IDS, getOpspSkillTemplates, getOpspCommandTemplates

## Task 5: Write tests
- [x] Create `test/core/opsp-rebase-abandon.test.ts`
