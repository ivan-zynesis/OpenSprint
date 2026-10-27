## 1. The card
- [x] 1.1 Layout constants: branch `kanban`, default remote `origin`, `README.md`, `cards/<id>.md`
- [x] 1.2 `MILESTONE_STAGES`: `todo`, `specifying`, `building`, `review`, `done`, `superseded`
- [x] 1.3 `parseCard` / `renderCard`: frontmatter, summary, `## Milestones`, `## History`; round trip is byte-identical
- [x] 1.4 A card with no `## Milestones` reads as having none
- [x] 1.5 `InitiativeEntry.summary`: the first paragraph of `## Description`

## 2. From an initiative
- [x] 2.1 `cardFromInitiative`: state, or `completed` by status, or `exploring`; milestone stages from done / superseded / open
- [x] 2.2 `cardDrift`: which of state, owner, summary and milestones differ
- [x] 2.3 `resyncCard`: copies those fields, keeps an in-progress stage on an open milestone, appends one history line

## 3. The store
- [x] 3.1 `fetchBoard`: the board commit, or null where the remote has no branch; a failed `ls-remote` throws
- [x] 3.2 `readCards`: every card at a commit, without a checkout
- [x] 3.3 `writeBoard`: temporary index, `commit-tree`, fast-forward push without `--force`; orphan when there is no parent
- [x] 3.4 `transact`: re-read and re-apply after a lost race, bounded attempts

## 4. The commands
- [x] 4.1 `opensprint kanban init`: create and seed in one commit; change nothing where a board exists
- [x] 4.2 `opensprint kanban seed`: add missing cards, report drift; `--resync` rewrites it
- [x] 4.3 `--remote`, `--dry-run`, `--json` on both
- [x] 4.4 Registered in `src/cli/index.ts`; listed in `docs/workflows.md`

## 5. Tests
- [x] 5.1 Card parse, render, round trip, the proof-of-concept card format
- [x] 5.2 Against a bare remote: init creates an orphan with README and cards; init twice changes nothing
- [x] 5.3 Seed adds, reports drift, resyncs with a history line, keeps an in-progress stage, pushes nothing when clean
- [x] 5.4 A lost race is re-applied and both writes survive; the remote history only fast-forwards
- [x] 5.5 `--dry-run` pushes nothing
