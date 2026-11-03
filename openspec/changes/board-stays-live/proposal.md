## Why

Milestone 7 of the `kanban` initiative: the change requested at attestation on 2026-11-03. The
initiative's `## Attestation` section lists the work. Building it is all that is needed; the
strategy and the ADRs stand.

Three workflows leave the live board stale even though `DEC-CARD-WRITES-THROUGH-CLI` says every
move goes through a command:

- `/opsp:archive` runs `opensprint advance <initiative-name> --to completed` with no `--hat`.
  `attested → completed` is a handoff, so the CLI refuses it, and neither the initiative nor its
  card moves. It also removes the initiative's worktree before it advances, so the command would
  have no initiative to find.
- `/opsp:repropose` runs `opensprint advance <initiative-name> --to proposed` with no `--hat`, which
  is refused from `building`.
- `/opsp:propose`, started from explore, writes `state: proposed` into the new descriptor, so its own
  `advance --to proposed` is refused as "Already 'proposed'", and no card exists until apply claims.

Hand-edited milestones lag the card too. Repropose and reexplore edit milestones in the file, and
`advance` copies only the state onto the card. Both templates also mark a superseded milestone
`- [x] ~~name~~`, which the parser reads as **done**, not superseded (`[~]`).

The existing rule, "no workflow writes `state:` by hand", passes while all of this is refused. And
three bars have no test that asserts them: `DS-LIVE-BOARD`'s primary measure (both test clones are
on `main`), its drill-down (nothing opens a card), and `DS-RUNTIME-LESS-BOARD` (the playbooks run
with node on `PATH`). `docs/` does not describe the live board.

## What Changes

- **Archive closes the initiative before it cleans up**, with `--hat <product|maintainer|dev|devops>`,
  from the initiative's worktree, and commits it there.
- **Repropose passes `--hat <product|maintainer>`.**
- **Propose writes the descriptor at `exploring`** and moves it to `proposed` only through
  `advance`, which also puts its card on the board.
- **Repropose and reexplore mark superseded milestones `- [~] name: … (superseded …)`**, and
  reexplore marks them before it advances.
- **`opensprint advance` carries the file's milestones onto the card**, as `kanban stage` already
  does, so a milestone a repropose added or superseded reaches the board with the move.
- **A rule that runs every workflow's advance**: for each row of `TRANSITIONS`, the owning
  workflow's template must contain the command, with a `--hat` the row accepts where the row is a
  handoff, and that command must move an initiative at the row's `from` state.
- **Tests that assert the three bars**: two checkouts on different branches, neither fetching the
  other's, render the same board, and a move from either appears in the other's next render;
  clicking a card's title opens its milestones in the five columns; both playbooks run with a
  `PATH` that holds only git and the shell's utilities.
- **`docs/`** describes the live board: what the workflows run, and the two commands a person types
  (`kanban init` once, and `claim --take-over`).

## Capabilities

### Modified Capabilities
- `opsp-live-board`: advance mirrors milestones; every workflow's advance is one the CLI accepts

## Impact

- **Modified**: `src/core/kanban-sync.ts`; the workflow templates for archive, repropose, propose
  and reexplore; `docs/git-workflow.md`, `docs/known-limitations.md`, `docs/workflows.md`; this
  repository's generated `.claude/` files for those workflows
- **New tests**: in `test/core/kanban-sync.test.ts`, `test/core/kanban-skill.test.ts`,
  `test/core/kanban-milestones.test.ts`, with a small DOM stand-in in `test/helpers/` so the page
  runs under Node with no new dependency
- No new package. No change to the card format, the transition table or the page
- Initiative: `kanban` · `DS-LIVE-BOARD`, `DS-RUNTIME-LESS-BOARD` · `DEC-CARD-WRITES-THROUGH-CLI`,
  `DEC-STATE-MACHINE`, `DEC-HAT-HANDOFFS`, `DEC-MILESTONE-BOARD`, `DEC-BOARD-READ-BY-GIT`
