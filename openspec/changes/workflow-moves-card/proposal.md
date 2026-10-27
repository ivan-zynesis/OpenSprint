## Why

Milestone 4 of the `kanban` initiative. Until now, nothing moves a card on `origin/kanban`. Every
workflow moves its initiative through `opensprint advance` or `opensprint claim`, and both write only
the checkout's file and `BOARD.md`. So the live board shows whatever was last seeded.
`DS-LIVE-BOARD`'s primary measure says a move pushed from one checkout appears in another's next
render, and it cannot be met while workflows do not write the board.

`DEC-CARD-WRITES-THROUGH-CLI` decides how a card moves: through an opensprint command that
validates the move against the same table as `advance`, appends a history line, and pushes as a
fast-forward. `claim` refuses a card someone else holds unless told to take it over.

Two workflows also move state outside those commands. Triage declines by telling the agent to write
`state: declined` into the file, which is exactly what `DEC-STATE-MACHINE` exists to stop. Backlog
creates an initiative and never touches the board, so a new idea is missing from it.

## What Changes

- **`opensprint advance` moves the card.** After writing the initiative, it moves the card from the
  state the card shows to the target state, if the table allows that move. It appends one history
  line naming the workflow and the hat. Where the card is missing, it is created first. Where the
  card disagrees with the move, the card is left alone and the drift is reported
- **`opensprint claim` claims the card first.** The board decides between two people claiming at
  once: claim refuses a card someone else holds, and leaves the file untouched, unless given
  `--take-over`. `--release` puts the card down
- **The board never blocks a move.** With no `origin` remote, nothing is said. With no board on
  `origin`, a note says how to create one. Where the remote cannot be reached, a warning says the
  card was not updated. In every case the initiative still moves. `--no-board` skips the board for
  offline work
- **`opensprint kanban seed <initiative>`** adds one card. Backlog runs it after writing the item,
  and where there is no board it says so and succeeds
- **Triage declines and revives through `opensprint advance`**, never by editing the field
- `--remote` leaves `opensprint kanban init` and `seed`. The board is `origin/kanban` for every
  command and every playbook, so a board written somewhere else cannot be one the skill never reads
- The `--json` output of `advance` and `claim` gains a `board` result

## Capabilities

### Modified Capabilities
- `opsp-live-board`: workflows move cards through the commands that move initiatives

## Impact

- **New**: `src/core/kanban-sync.ts`
- **Modified**: `src/commands/advance.ts`, `src/commands/claim.ts`, `src/commands/kanban.ts`,
  `src/cli/index.ts`, and the workflow templates for backlog, triage and apply (claim's take-over)
- **Every `advance` and `claim` against a project with an `origin` now talks to the network.** On a
  project with a board, that is a fetch and a push per move. On one without, it is a single
  `ls-remote`. `--no-board` is the way out
- Initiative: `kanban` · `DS-LIVE-BOARD` · `DEC-CARD-WRITES-THROUGH-CLI`, `DEC-STATE-MACHINE`,
  `DEC-INITIATIVE-OWNER`, `DEC-BOARD-ON-REMOTE-BRANCH`
