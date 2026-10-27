## 1. The table
- [x] 1.1 `MILESTONE_COLUMNS`: To do · Specifying · Building · Review · Done (with superseded)
- [x] 1.2 `MILESTONE_STAGE_MOVES` and `checkStageMove`, naming the legal moves on refusal

## 2. The writer
- [x] 2.1 `stageCard`: mirror the list from the file, refuse out-of-order and unchecked done, validate, write one history line
- [x] 2.2 `opensprint kanban stage <initiative> <milestone> <stage>`: never fails for the board's sake; `--json`

## 3. Apply
- [x] 3.1 2b specifying · 2c building · 2d review · Phase 3 done · change request specifying

## 4. The page
- [x] 4.1 A card opens onto its milestone board: five columns, superseded struck through
- [x] 4.2 Continue on the next open milestone; change request in Review; no escalation on tickets
- [x] 4.3 The milestone columns and the stage moves in the configuration
- [x] 4.4 This repository's kanban files regenerated

## 5. Tests
- [x] 5.1 The table: every declared move legal, every other refused with the legal ones named
- [x] 5.2 Against a remote: a stage moves with a history line; out of order refused; unchecked done refused; the list follows the file; no board is a note
- [x] 5.3 Apply names every stage at its step
- [x] 5.4 The page still parses, loads nothing and builds no HTML from text
