## Why

Milestone 3 of the `kanban` initiative. `DS-LIVE-BOARD` wants the board to be where a card's next
step starts. `DEC-CONTINUE-FORWARD-ESCALATE-BACK` decides which steps a card offers: forward is
"continue" with the stage's one workflow, and backward is an escalation up a rung. Both are moves
the state machine allows. `DEC-BOARD-BUTTON-LAUNCHES-SESSION` decides what a button does. It copies
a command that finds or makes the card's worktree and starts a fresh agent session there, and it
never moves the card itself.

The proof of concept had these buttons, hand-written. It held its own copy of the transitions and
one hard-coded harness: Claude Code, with this repository's command names. The template
`board-skill-template` shipped has no buttons, and is waiting for them as data.

## What Changes

- **Moves are derived from `TRANSITIONS`**, so the board and `opensprint advance` cannot disagree:
  - A card's continue move is the forward transition from its state, never into `declined`. The one
    exception is Backlog, whose way forward is triage picking the card up, which claims it
    (`DEC-INITIATIVE-OWNER`).
  - Its escalations are the backward transitions from its state, each labelled by the rung it opens.
- **Each move carries what the button's hover shows**: the workflow, the hat, the move, and when it
  fires, all from the transition. The column a card lands in is worked out on the page, from the
  same columns
- **The agent table comes from the command adapters.** `ToolCommandAdapter` gains two optional
  fields: how to start a session with a prompt, and how a person invokes a generated command. Claude
  Code fills both. A tool without a launcher gets the prompt alone. A tool without a command
  reference, or a project delivering skills only, gets a prompt naming the skill
- **The template gains the buttons**: continue on the right, escalations on the left, and two header
  actions, backlog an item and refresh. Each copies a launch script: find the card's worktree, or
  add it from the local or remote branch, then start the session
- This repository's generated kanban files are regenerated

## Capabilities

### Modified Capabilities
- `opsp-kanban-skill`: a card offers the moves the state machine allows, and a button copies the
  command that starts the workflow for that move

## Impact

- **Modified**: `src/core/kanban-board.ts` (moves and agent configuration),
  `assets/kanban/board.html` (buttons), `src/core/command-generation/types.ts`,
  `src/core/command-generation/adapters/claude.ts`, `src/core/shared/opsp-layer.ts`
- **No new state, no new transition.** A move the table does not have cannot appear on the board,
  which is that ADR's invalidation trigger, kept.
- **Buttons never write.** The page still runs nothing; the paste is the operator's consent.
- Initiative: `kanban` · `DS-LIVE-BOARD`, `DS-RUNTIME-LESS-BOARD` ·
  `DEC-CONTINUE-FORWARD-ESCALATE-BACK`, `DEC-BOARD-BUTTON-LAUNCHES-SESSION`, `DEC-STATE-MACHINE`
