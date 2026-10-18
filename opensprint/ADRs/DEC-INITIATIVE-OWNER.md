---
id: DEC-INITIATIVE-OWNER
type: adr
status: active
created: 2026-10-18
depth: 3
depends-on:
  - DS-BOARD-VISIBILITY
  - DS-HATS-AS-CONTEXT
  - DEC-026
hats: [dev]
---

# DEC-INITIATIVE-OWNER: An Initiative Names Its Owner, and the Workflows Claim It on Pick-Up

## Question

An initiative records its state but not who holds it. [[DS-HATS-AS-CONTEXT]] says that past the
board, everything is an engineer stepping up for accountability — yet nothing records who stepped
up, and two people can start the same card without either knowing. Where does ownership live, who
writes it, and when?

## Decision

**An optional `owner:` field in the initiative's frontmatter.** A file without it behaves exactly as
before.

**`opensprint claim <initiative> [--owner <name>] [--release]` writes it** — git's `user.name` by
default, or the name `--owner` gives; `--release` removes it. Claim regenerates `BOARD.md` and
**never moves the state**: that stays `advance`'s ([[DEC-STATE-MACHINE]]). It refuses an initiative
that is `completed` or `declined`, where there is no work left to hold.

**The board shows it.** Every column gains an Owner column, and a card at `building`,
`ready-for-attestation` or `attested` with no owner is listed as `owner-undeclared` under Problems.
A backlog item nobody has picked up, or a proposal waiting for whoever starts it, is unowned by
definition and is not a problem.

**The workflows claim at the moment of commitment:**

- `/opsp:backlog` never claims — filing an idea is not committing to build it.
- `/opsp:triage` claims the item once it is in the item's worktree, asks before taking a card
  someone else holds, commits the claim and offers to push it, and releases the card when the item
  is returned.
- `/opsp:apply` claims before `advance --to building`, asks before taking a card someone else
  holds, and commits the claim on the initiative branch.

## Consideration Factors

| Factor | Weight | `owner:` in frontmatter, claimed by the workflows | No owner field | Owner derived from git authorship |
|---|---|---|---|---|
| Says who holds work in flight | HIGH | Named, and visible on the board ✓ | Nobody ✗ | Whoever committed last ✗ |
| Travels with the initiative | HIGH | In the record, on its branch ✓ | — | Recomputed from history ✓ |
| Cannot move the lifecycle | HIGH | Claim never touches `state` ✓ | ✓ | ✓ |
| Visible to others before merge | MED | Only once the claim is pushed ✗ | — | Only once pushed ✗ |
| One more command to learn | LOW | `claim` ✗ | None ✓ | None ✓ |

## Rationale

Ownership is a declaration, not a by-product. Deriving it from authorship would name whoever touched
the file last — an agent filing the backlog item, or someone fixing a typo — which is exactly the
person [[DS-HATS-AS-CONTEXT]] says is *not* necessarily accountable. A field written deliberately,
at the moment someone picks the card up, says what it means.

Keeping claim apart from `advance` keeps the state machine's guarantees intact: a card can change
hands without changing state, and no state change silently assigns an owner.

The workflows claim where commitment happens — triage picking the item up, apply starting to build
— and never at backlog, because filing an idea commits nobody. Reporting an unowned card only once it
is in flight keeps the Problems list to cards where the gap matters.

## Invalidation Trigger

If two people routinely claim the same card on different branches before either pushes, a claim
that is local until pushed is not ownership, and the claim needs to reach a shared place first. If
`owner-undeclared` is routinely silenced with a placeholder name, the board is asking a question
nobody wants to answer and the owned states are wrong.
