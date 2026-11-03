## Why

Milestone 1 of the `kanban` initiative. `DS-LIVE-BOARD` wants one central copy of in-flight state
that every checkout reads the same way, and `DEC-BOARD-ON-REMOTE-BRANCH` puts it on a dedicated
remote branch, `origin/kanban`, one file per card.

That branch exists, but only as proof-of-concept data. A node script created and seeded it, and was
then deleted. Nothing in `opensprint` can create the branch, nothing defines what a card holds, and
nothing can correct the card the prototype left wrong. Every later milestone writes or renders cards,
so the layout and the format have to be code first.

## What Changes

- **The layout, named once in code**: branch `kanban` on a remote (`origin` by default), a
  `README.md`, and `cards/<id>.md`
- **The card format**: frontmatter `id`, `title`, `state`, `owner`, `created`, `updated`, `branch`;
  then a summary, a `## Milestones` list carrying each milestone's stage, and a `## History` list with
  one line per write
- **The milestone stages** `DEC-MILESTONE-BOARD` names: `todo`, `specifying`, `building`, `review`,
  `done`, plus `superseded`
- **One write path**: read the board without checking it out, build the new commit in a temporary
  index, and push it as a fast-forward. A push that loses a race is re-read and re-applied, never
  forced (`DEC-CARD-WRITES-THROUGH-CLI`)
- **`opensprint kanban init`**: creates the branch and seeds it with every initiative this machine
  knows, in one commit, so onboarding is one step
- **`opensprint kanban seed`**: adds cards for initiatives the board lacks, and reports cards that
  disagree with their initiative. `--resync` rewrites those cards from the initiative, with a history
  line saying what changed
- `InitiativeEntry` gains `summary`, the first paragraph of `## Description`

## Capabilities

### New Capabilities
- `opsp-live-board`: the board on its own remote branch: layout, card format, and how it is created,
  seeded and written

## Impact

- **New**: `src/core/kanban.ts`, `src/commands/kanban.ts`; `opensprint kanban init|seed` in
  `src/cli/index.ts`
- **Modified**: `src/core/initiatives.ts` (`summary`), `docs/workflows.md` (the commands)
- **Corrects the proof-of-concept data.** `seed --resync` is how the `kanban` card, and every card
  imported before milestones were on cards, gets corrected. The initiative's Notes ask for this
  rather than a hand edit.
- **Not in scope**: reading and rendering for people (`board-skill-template`); workflows writing
  cards as they move an initiative (`workflow-moves-card`). The committed `BOARD.md` is untouched and
  runs beside the live board (`DEC-BOARD-ON-REMOTE-BRANCH`).
- Initiative: `kanban` · `DS-LIVE-BOARD`, `DS-RUNTIME-LESS-BOARD` · `DEC-BOARD-ON-REMOTE-BRANCH`,
  `DEC-CARD-WRITES-THROUGH-CLI`, `DEC-MILESTONE-BOARD`
