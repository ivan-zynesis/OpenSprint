## Context

The card has carried each milestone's stage since `board-store`, and `mirrorMilestones` already keeps
an in-progress stage across a resync. What is missing is the writer, the table it validates against,
and the page that shows the result.

## Decisions

**The stage table is data, beside the columns.**

`MILESTONE_STAGE_MOVES` lists the five moves `DEC-MILESTONE-BOARD` names. `checkStageMove` refuses
anything else and names the legal moves from where the ticket is, as `checkTransition` does for
initiatives. `superseded` is reached only through the file (`- [~]`), by seed or by the mirror, never
by a stage move. Superseding is a repropose decision, not a step of apply.

**The file decides done and order; the board decides the rest.**

The initiative file records open, done and superseded, and stays the record. So `done` is refused
unless the file checks the milestone. Leaving `todo` is refused unless every earlier live milestone
is done: apply's sequential guardrail, made a rule where the board can see it. The three stages in
between are the board's alone.

Before each write, the card's milestone list is mirrored from the file. A milestone added or
superseded by repropose then appears without a separate seed.

**Apply's instructions call it at each step, and nothing waits on it.**

`opensprint kanban stage` behaves like `advance`'s card write. No `origin` says nothing; no board is
a note; a failure is a warning. Exit is zero in all three, so a milestone is never held up by the
network. Five calls are added to apply:

- 2b, after `new change`: `specifying`;
- 2c, after the worktree: `building`;
- 2d, after the merge: `review`;
- Phase 3, after the descriptor is checked: `done`;
- the change-request flow: `specifying`.

**The milestone board is an overlay on the same page.**

Clicking a card's title opens a full-width panel holding the five columns. Escape or the close button
returns to the board. It reads only the card, so it renders with no initiative branch fetched, which
is the property `DEC-MILESTONE-BOARD` chose stage-on-the-card for. Tickets offer:

- **continue: apply**, on the next open milestone only, whatever its stage;
- **change request**, on a ticket in Review, which launches apply with the milestone named.

Escalations stay on the card: they move the initiative, not a milestone.

## Risks / Trade-offs

- **The board can lag apply.** A stage write that fails leaves the ticket where it was until the
  next write mirrors it on. The file still holds done, so nothing is lost that matters to the record.
- **Review is brief in continuous mode.** Apply's checkpoint is the only thing that holds a ticket in
  Review. Without one, a ticket passes through it on its way to Done. That is still a true picture.
