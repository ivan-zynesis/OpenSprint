## 1. Writing a card from a workflow
- [x] 1.1 `boardReachability`: no `origin` remote, no board, or a board
- [x] 1.2 `moveCard`: create where missing; move where `checkTransition(card.state, to)` allows; report drift otherwise; nothing where already there
- [x] 1.3 `claimCard`: refuse a card someone else holds unless taking over; release; arbitrated inside `transact`
- [x] 1.4 Results that never throw for the board's sake: written, unchanged, drift, no-remote, no-board, failed

## 2. The commands
- [x] 2.1 `advance` moves the card after the file; `--no-board`; `board` in `--json`
- [x] 2.2 `claim` claims the card before the file; `--take-over`; `--no-board`; `board` in `--json`
- [x] 2.3 `kanban seed [initiative]`: one card; a missing board is a note when one is named
- [x] 2.4 `--remote` removed from `kanban init` and `seed`

## 3. The workflows
- [x] 3.1 Triage declines and revives through `opensprint advance`
- [x] 3.2 Backlog runs `opensprint kanban seed <initiative>`
- [x] 3.3 Apply and triage name `--take-over` where the board shows someone else
- [x] 3.4 `docs/workflows.md` and this repository's generated files

## 4. Tests
- [x] 4.1 Against a bare remote: advance moves the card with a history line; creates a missing one; leaves a drifted one and reports it
- [x] 4.2 Claim writes the card; refuses another's card and leaves the file untouched; `--take-over`; `--release`; a raced claim is refused
- [x] 4.3 No remote says nothing; no board notes init; an unreachable board warns; `--no-board` asks nothing; the move succeeds in every case
- [x] 4.4 No workflow template writes `state:` by hand for a move
