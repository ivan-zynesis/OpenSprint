## Context

The proof of concept proved the store and then deleted its writer. `origin/kanban` holds eight cards
imported by a node script (`9984194`), removed when reading moved to git playbooks (`f08e045`). The
`kanban` card says `building` because the prototype moved it there as a demonstration. The
initiative was `proposed` then, and is `building` now only because apply has since opened it.

`DEC-CARD-WRITES-THROUGH-CLI` makes the replacement an opensprint command. This change builds the part
every later milestone stands on: the layout, the card format, and one write path. It also adds the two
commands that use the write path before any workflow does: create the board, and seed it.

## Goals / Non-Goals

**Goals**
- The branch, its files and the card format are named once, in code
- One transactional write: read, change, fast-forward, retry
- Onboarding is one command, and the proof-of-concept data can be corrected without a hand edit

**Non-Goals**
- Rendering, or a read command for people. Reads are git playbooks (`DEC-BOARD-READ-BY-GIT`);
  that is `board-skill-template`
- Workflows moving cards, and `claim` on the board. That is `workflow-moves-card`; the write path
  here is what it will call
- Replacing `BOARD.md`. It runs beside the live board until the live board is proven
  (`DEC-BOARD-ON-REMOTE-BRANCH`)

## Decisions

**Plumbing in a temporary index, which is the proof of concept's write path, unchanged.**

`read-tree` the board commit into a throwaway `GIT_INDEX_FILE`, `hash-object` and `update-index` each
changed card, `write-tree`, `commit-tree` with the board commit as parent, and push
`<commit>:refs/heads/kanban` without `--force`. Git rejects anything that is not a fast-forward of what
was read, so a lost race is detected by the remote, not inferred. The loop re-fetches and re-applies
the same mutation, with a bounded number of attempts and jittered backoff. The operator's worktree,
index and branches are never touched; only the remote-tracking ref `refs/remotes/<remote>/kanban`
moves.

**`init` is create and seed in one commit.**

The goal names onboarding "in one simple step". A board with a README and no cards is a step nobody
needs to see, and two commits would let another writer land between them. Where the board already
exists, `init` changes nothing and points at `seed`. A race between two `init`s settles the same way:
the loser's push is rejected, its retry finds the board, and it reports instead of writing.

**Seed reads what `compact board --all-branches` reads.**

The checkout's initiatives, then each `opsp/<id>` branch's own card, with the same precedence
(`collectAllBranches`, `DEC-BOARD-ALL-BRANCHES`). Seeding is the one moment the live board is built
from "latest known", so it uses the most complete "latest known" this machine has. After that, cards
move only through writes.

**Drift is reported by default and rewritten only with `--resync`.**

Until `workflow-moves-card` lands, initiatives move through `opensprint advance`, which validates
against `TRANSITIONS`, and the card lags behind. `seed` says which cards lag and in which fields.
`--resync` copies the initiative's fields onto the card, which the initiative's Notes ask for in
place of a hand edit.

A resync is a repair, not a move. It is the same case `checkTransition` makes for a record with no
state: the state it writes was already validated where it was set, on the initiative. That is why it
is behind an explicit flag and leaves a history line naming every field it changed. Once workflows
write cards, resync becomes the tool for a card that was written wrong.

The fields compared are `state`, `owner`, `summary` and the milestone list. `title`, `created` and
`branch` are fixed at import. `history` and `updated` belong to the board.

**Milestone stage on the card, and a resync that keeps what only the board knows.**

`DEC-MILESTONE-BOARD` puts each milestone's stage on the card, so the board renders without the
initiative's branch. The initiative file knows three things, open, done and superseded, and the board
knows five. A resync therefore maps done to `done` and superseded to `superseded`. It keeps an open
milestone's `specifying`, `building` or `review` where the card already has one, and writes `todo`
otherwise.

**The line formats are the simplest a static page can parse.**

The page that renders cards has no libraries (`DS-RUNTIME-LESS-BOARD`), so card syntax is line-based.
Frontmatter is `key: value`, with the value being the rest of the line. A milestone is
`- [<stage>] <name>: <description>`; the bracket holds a word, so it cannot be mistaken for a
checkbox. A history line is `- <ISO time>  <what>  by <who>`, optionally followed by ` — <note>`. One
parser serves the CLI and the page.

**Commands under `opensprint kanban`.**

The branch's README already names "the opensprint kanban tool", and `opensprint compact board`
already means the compiled `BOARD.md`. `--remote` defaults to `origin`. The branch name is a
constant: one name every checkout agrees on is the whole point of the store.

## Risks / Trade-offs

- **A push needs network and permission.** `init` and `seed` fail with git's own message where the
  remote refuses. That is `DEC-BOARD-ON-REMOTE-BRANCH`'s invalidation trigger, and it is reported
  rather than worked around.
- **Resync can move a card backwards.** Where the initiative file a machine reads is older than what
  the board shows, `--resync` writes the older state, with a history line. The default `seed` never
  does this, and the report shows the difference before anyone asks for a resync.
- **Line-based frontmatter.** A value cannot span lines. Every value opensprint writes is one line,
  and the card is never edited by hand.
