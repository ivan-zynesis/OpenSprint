## Context

`board-store` built the write path, `transact`, and the two commands that use it before any workflow
does. This change makes it the path every workflow already walks. Workflows move initiatives through
`opensprint advance` and `opensprint claim`, so teaching those two commands to write the card moves
the card on every move, with no change to any workflow that already calls them.

## Goals / Non-Goals

**Goals**
- Every `advance` and `claim` updates the card, validated by the same table
- Two simultaneous claims cannot both win
- No move is ever lost, or blocked, because the board is unreachable

**Non-Goals**
- Milestone stages on the card, which apply writes as it moves a milestone: that is
  `milestone-board`
- Making the board the source of truth for state. The initiative file remains the record, and the
  card mirrors it, so `advance` validates against the file and the card follows

## Decisions

**The card moves after the file, and the claim goes to the card first.**

`advance` is already the authority: it validates against `TRANSITIONS` and writes the record. The
card write comes after it, and a failed card write leaves the initiative moved, with a warning. A
claim is different. The point of putting it on the board is that the remote arbitrates between two
machines, so it goes to the card first. A refused claim writes nothing anywhere, and a written claim
is then copied to the file.

**The card validates its own move.**

The card may have drifted, for example from a move made before the board existed. Its write
therefore checks `checkTransition(card.state, to)` rather than trusting the file's `from`:

- legal: the card moves;
- already at `to`: nothing is written;
- illegal: the card is left alone and the drift reported, naming `seed --resync`.

A card that is missing is created from the initiative first, using the same `cardFromInitiative`
that seed uses.

**Claim arbitration runs inside `transact`.**

The "someone else holds it" check is in the transaction's decision function, which re-runs against
the board as it is on every attempt. Of two claims racing for an unheld card, the second one's push
is rejected. Its retry reads the first claimant's name, and it refuses. Nothing is overwritten.
`--take-over` skips the check and records the previous owner in the history line.

**The board is a second write that cannot block the first.**

Whether there is a board at all is decided before anything else:

- **No `origin` remote**: the project never opted in. Nothing is said, and git is not asked a
  second time.
- **`origin` with no `kanban` branch**: a one-line note says how to create the board.
- **Anything else that fails**, such as network, permission or a board that kept moving: a warning
  says the card was not updated, and gives git's reason.

None of these changes the exit code of a move that succeeded. `--no-board` skips all of it.

**`seed <initiative>` is how backlog puts a card up.**

Backlog never claims and never advances (`DEC-INITIATIVE-OWNER`, `DEC-034`), so neither command
reaches it. `seed` already adds missing cards. Narrowed to one initiative, it adds just that one, and
with a name given it treats a missing board as a note rather than an error, because backlog runs it
on projects that never made one.

**`--remote` is removed.**

`DEC-BOARD-ON-REMOTE-BRANCH` names `origin/kanban`, and the playbooks read only that. A command that
can write another remote's board is a command whose board the skill never shows. The functions keep
a `remote` parameter, which tests use, and the CLI no longer exposes it.

**Triage's decline becomes a command.**

Triage's text told the agent to write `state: declined`, so declining was the one move left to prose.
`exploring → declined` and `declined → exploring` are both in `TRANSITIONS`, owned by triage, so the
text now runs `opensprint advance` and the card follows.

## Risks / Trade-offs

- **A move now waits on the network.** Where there is a board, `advance` and `claim` cost a fetch
  and a push. That is the price of one live copy, and `--no-board` waives it.
- **A warning can be missed.** A card that failed to update stays stale until the next move or a
  `seed`. `seed` reports exactly that drift, so the gap is visible rather than silent.
