---
id: DEC-BOARD-ALL-BRANCHES
type: adr
status: active
created: 2026-10-18
depth: 3
depends-on:
  - DS-BOARD-VISIBILITY
  - DEC-029
  - DEC-026
hats: [dev]
---

# DEC-BOARD-ALL-BRANCHES: The Cross-Branch Board Is Printed on Demand, Never Committed

## Question

[[DEC-029]] puts every initiative on its own `opsp/<id>` branch, and records the cost it does not
solve: the compiled board shows only what the current branch knows. [[DEC-026]] makes `BOARD.md` a
compiled artifact that `compact check` can gate. How does any checkout see every initiative without
making the committed board depend on which refs happen to be fetched?

## Decision

**`opensprint compact board --all-branches [--json]` prints the card each local and
remote-tracking `opsp/<id>` branch carries**, alongside the checkout's own, reading committed trees
with `git cat-file`. It **writes nothing**. The committed `BOARD.md` still shows the checkout alone,
and stays deterministic.

Where one initiative appears more than once, **the checkout wins**. Between a local branch and a
fetched copy, the fetched copy wins only when it is strictly ahead — someone claimed it and pushed;
where the local copy is ahead, or the two diverged, the local copy is kept. Where git cannot answer,
the board shows the checkout alone.

The workflows that look an initiative up use it, and fetch first so items others pushed are there;
none of them treats the checkout's board as listing every initiative.

## Consideration Factors

| Factor | Weight | Printed on demand from committed trees | Commit a board aggregating every branch | Backlog on `main` ([[DEC-029]]'s trigger) |
|---|---|---|---|---|
| Any checkout sees every initiative | HIGH | After a fetch ✓ | After a fetch ✓ | Yes ✓ |
| Committed board stays deterministic | HIGH | Unchanged ✓ | Depends on which refs are fetched ✗ | ✓ |
| `compact check` stays meaningful | HIGH | ✓ | Fails whenever someone pushes ✗ | ✓ |
| Keeps [[DEC-029]]'s one-branch initiative | HIGH | ✓ | ✓ | Splits the decision in two ✗ |
| A stakeholder reading `BOARD.md` sees everything | MED | No — they must run the command ✗ | Yes ✓ | Yes ✓ |

## Rationale

[[DEC-029]] already weighed moving the backlog to `main` and named it as the fallback if cross-branch
listing proved unsolvable. It is solvable: every branch's initiative file is a committed blob that
git can read without a checkout, so listing them needs no new storage and no change to where an
initiative lives.

Committing the aggregate would have made `BOARD.md` a function of the local ref set rather than of
the records in the tree — two clones of the same commit would compile different boards, and
`compact check` would fail every time someone pushed. Printing it instead keeps [[DEC-026]]'s
guarantee for the committed artifact and gives the cross-branch view to whoever asks.

The precedence rule follows from what each copy means: the checkout is what you are working on; a
fetched copy that is strictly ahead is newer work someone pushed; anything else — local ahead, or
diverged — is local work not yet shared, and showing the remote would hide it.

## Invalidation Trigger

If stakeholders who read `BOARD.md` through an agent routinely miss work on other branches because
nobody runs `--all-branches`, the committed board is the interface that matters and printing on
demand has not answered [[DS-HATS-AS-CONTEXT]]. If teams stop fetching `opsp/*` refs, the
cross-branch board is stale by construction and the backlog-on-`main` split becomes the better
answer.
