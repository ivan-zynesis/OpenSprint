## 1. The rename
- [x] 1.1 `opsp-reideate.ts` → `opsp-reexplore.ts`
- [x] 1.2 Template functions, skill name, directory name, workflow id
- [x] 1.3 The transition table, `src/core/init.ts`, and every workflow referencing it
- [x] 1.4 Tests and documentation

## 2. The duplicate capability
- [x] 2.1 `opsp-reideate-workflow` removed; `opsp-reexplore-workflow` keeps the name it always had
- [x] 2.2 The four plan-revision requirements removed, each with a reason and a migration
- [x] 2.3 The goal-rung requirement added in their place
- [x] 2.4 The Purpose rewritten to the current behaviour

## 3. The record
- [x] 3.1 `DEC-REEXPLORE-NAME`
- [x] 3.2 `DEC-HAT-HANDOFFS` left intact
- [x] 3.3 `DECISION-MAP.md` regenerated

## 4. Verification
- [x] 4.1 No reference to the old name survives in `src/`, `test/`, `docs/` or `openspec/specs/`
- [x] 4.2 The workflow roster still names nineteen
- [x] 4.3 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
