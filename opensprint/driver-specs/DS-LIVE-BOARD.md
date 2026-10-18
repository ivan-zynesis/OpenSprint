---
id: DS-LIVE-BOARD
type: product
status: active
created: 2026-10-18
hats: [product]
role: goal
depends-on:
  - DS-BOARD-VISIBILITY
---

# DS-LIVE-BOARD: One Live Board, Seen the Same From Anywhere, That Starts the Next Step

## Statement

The board is not an instantaneous state compiled from whatever one checkout knows. In-flight
initiative state lives in one central place that every agent and every human reads the same way,
whichever worktree, branch or pull request their work sits in — and the board is where the next step
of any card is started from.

In the operator's words: what if we do not even want a compiled board. A completed initiative can be
static. In-flight state is a store on the remote, interacted with only through the opensprint tool,
and rendered as HTML so every agent or human can stand the board up in their own browser when
working with it. Clicking into an initiative shows the same kind of board one level down: its
milestones as tickets.

## Rationale

[[DS-BOARD-VISIBILITY]] made every branch's cards visible on demand, and traded away the committed
`BOARD.md` showing them: the board stayed an instantaneous state, compiled from whatever this machine
had fetched. The tool is gaining tracker capability while the backlog lives scattered across
worktrees, branches and remote pull requests. Moving it onto `main` would rely on each adopter's
discipline, which OpenSprint cannot enforce; centralised version control at monorepo scale — one
central copy — is the model that suggests the board wants a single place of its own.

## Measures

- **Primary**: two checkouts on different branches render the same board from the remote, without fetching each other's branches, and a move pushed from one appears in the other's next render
- **Guardrail**: a card offers only the moves the state machine allows — forward continues the stage's workflow, backward escalates — and a button never moves a card itself
- **Drill-down**: opening an initiative shows its milestones as tickets, in columns that follow the opsx lifecycle

### Bar

  as a    member of the team, human or agent, on any branch or machine
  I want  to see the same live board, and start any card's next step from it
  for     nobody to work from a stale or partial picture of the work

- **dimension**: one central copy of in-flight state against each branch carrying its own
- **chosen**: a single remote branch holds in-flight state; completed initiatives stay static records
- **traded for**: reading needs a network round trip to the remote, and the board must never be edited by hand
- **neighbour**: the compiled, per-checkout `BOARD.md` ([[DEC-026]]), with `--all-branches` printing the rest ([[DEC-BOARD-ALL-BRANCHES]])

## Implications

- The board lives on its own remote branch: [[DEC-BOARD-ON-REMOTE-BRANCH]]
- Forward continues a stage's workflow; backward escalates: [[DEC-CONTINUE-FORWARD-ESCALATE-BACK]]
- A button starts a fresh session; it never moves a card: [[DEC-BOARD-BUTTON-LAUNCHES-SESSION]]
- An initiative opens onto its milestones: [[DEC-MILESTONE-BOARD]]
