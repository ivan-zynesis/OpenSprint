## Why

Milestone 6, the last of the `kanban` initiative. `DS-LIVE-BOARD`'s drill-down measure says that
opening an initiative shows its milestones as tickets, in columns that follow the opsx lifecycle.
`DEC-MILESTONE-BOARD` decides the five columns: To do, Specifying, Building, Review and Done. Forward
on any ticket is "continue: apply". The only way back is a change request, from Review. And the
stage lives on the card, written by the same command that moves the card when apply moves a
milestone, so the board renders without the initiative's branch.

`board-store` put each milestone's stage on the card, but nothing sets one beyond `todo`, `done` and
`superseded`, which seed copies from the file. Apply moves through Specifying, Building and Review
without telling the board, and the page has nowhere to show tickets.

## What Changes

- **The milestone stages form a table**, as the initiative states do:
  - todo → specifying → building → review → done;
  - review → specifying, the change request.

  Leaving `todo` is allowed only for the next open milestone, because apply runs milestones in order.
  `done` is allowed only where the initiative file has the milestone checked, because the file is the
  source of truth for done
- **`opensprint kanban stage <initiative> <milestone> <stage>`** writes one stage move to the card. It
  first brings the card's milestone list into line with the file, validates the move, appends one
  history line and pushes. Like `advance`, it never fails a workflow for the board's sake
- **Apply calls it** at each step of a milestone's cycle:
  - specifying, when the opsx change is created;
  - building, when its worktree is made;
  - review, when the change is merged and waits at the checkpoint;
  - done, once the milestone is checked off;
  - specifying again, on a change request
- **The page opens a card onto its milestone board.** It shows five columns of tickets, superseded
  milestones struck through under Done, continue on the next open milestone, and a change request on
  a ticket in Review. Buttons copy launch commands, as on cards
- The milestone columns and stage moves are data in the configuration, from the same table

## Capabilities

### Modified Capabilities
- `opsp-live-board`: milestone stages move through a validated table, written by apply
- `opsp-kanban-skill`: an initiative opens onto its milestones as tickets

## Impact

- **Modified**: `src/core/kanban-board.ts`, `src/core/kanban-sync.ts`, `src/commands/kanban.ts`,
  `src/cli/index.ts`, `assets/kanban/board.html`, `src/core/templates/workflows/opsp-apply.ts`
- **No change to the initiative file's format.** It still records only open, done and superseded.
- Initiative: `kanban` · `DS-LIVE-BOARD` · `DEC-MILESTONE-BOARD`, `DEC-CARD-WRITES-THROUGH-CLI`,
  `DEC-BOARD-BUTTON-LAUNCHES-SESSION`
