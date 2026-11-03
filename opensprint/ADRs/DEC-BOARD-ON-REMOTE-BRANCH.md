---
id: DEC-BOARD-ON-REMOTE-BRANCH
type: adr
status: active
created: 2026-10-18
depth: 0
depends-on:
  - DS-LIVE-BOARD
hats: [dev]
---

# DEC-BOARD-ON-REMOTE-BRANCH: In-Flight Board State Lives on a Dedicated Remote Branch, One File per Card

## Question

[[DS-LIVE-BOARD]] wants one central copy of in-flight state that every checkout reads the same way.
Where does it live — on `main`, on a dedicated branch, or still compiled into each checkout's
`BOARD.md`?

## Decision

**A dedicated remote branch, `origin/kanban`**, holding nothing but the board:

```
origin/kanban
  README.md
  cards/<id>.md     frontmatter: id, title, state, owner, created, updated, branch
                    then a summary, then a "## History" list, one line per move
```

A card is plain text and every move is a commit, so `git log origin/kanban` is the board's history.
The branch is never checked out to read it, and never edited by hand. A completed initiative's card
stays as a static record.

This **amends** [[DEC-BOARD-ALL-BRANCHES]], whose rejected neighbour was a central aggregate, and
runs beside the compiled `BOARD.md` ([[DEC-026]]) rather than replacing it until the live board is
proven.

## Consideration Factors

| Factor | Weight | Dedicated `origin/kanban` | On `main` | Compiled per checkout (`BOARD.md`) |
|---|---|---|---|---|
| One copy every checkout reads the same | HIGH | ✓ | ✓ | Depends on what was fetched ✗ |
| Enforceable without the adopter's discipline | HIGH | Nothing else lives there ✓ | Mixed with code; protection rules vary by team ✗ | ✓ |
| Moves without touching code history | HIGH | ✓ | Every move is a commit on `main` ✗ | Moves ride the initiative branch ✓ |
| Plain text, auditable with git | MED | ✓ | ✓ | ✓ |
| Readable with no network | LOW | Needs a fetch ✗ | Needs a fetch ✗ | ✓ |

## Rationale

`main` would work only where every adopter keeps it for code plus board edits and nothing else, and
OpenSprint cannot control a downstream team's git workflow. A branch that holds only the board has
no such conflict: protection rules for code do not apply to it, and a move never lands in the
product's history.

Compiling stays honest about one checkout and cannot be the central copy, which is the point of
[[DS-LIVE-BOARD]]. One file per card keeps concurrent moves on different cards from conflicting at
all.

## Invalidation Trigger

If adopters' remotes routinely reject or garbage-collect an orphan branch, or forbid pushing to
branches other than through pull requests, the remote branch is not a store and a different shared
place is needed. If moves on the same card conflict often, one file per card is too coarse.
