---
name: opensprint-kanban
description: Proof of concept — the live board, kept on a remote branch as one file per card. Backlog an item, list every item on the remote, claim, advance, mark ready for attestation, complete, and render the board as HTML in a browser.
license: MIT
compatibility: Requires git and node >= 18. Experimental.
metadata:
  author: opensprint
  version: "0.0.1-poc"
---

Work with the live board. It lives on **one branch of the remote** — `origin/kanban` by default — not
in any worktree, so every checkout, branch and pull request sees the same cards the moment they are
pushed.

**This is a proof of concept**, on branch `opsp/kanban`, for the `kanban` backlog item. It runs
beside the compiled `BOARD.md`, not instead of it.

## How the board is stored

```
origin/kanban
  README.md
  cards/<id>.md      one card: frontmatter (id, title, state, owner, created, updated, branch),
                     a summary, and a History list appended on every move
```

Nothing is checked out. The tool reads cards with `git show`, writes them through a temporary index,
and pushes **as a fast-forward only**. When two people write at once, git rejects the second push;
the tool re-fetches, re-applies the change and pushes again. A state change is a text change with a
commit, and `git log origin/kanban` is the audit trail.

## The tool

Run it from anywhere inside the repository:

```bash
node .claude/skills/opensprint-kanban/kanban.mjs <command>
```

Below, `kanban` stands for that command.

| Step | Command | Moves the card |
|---|---|---|
| set up, once per repository | `kanban init` | creates `origin/kanban` |
| backlog | `kanban backlog <id> --title "<title>" --summary "<one paragraph>"` | new card → **Backlog** (`exploring`) |
| triage | `kanban list` (or `--json`) | — lists every card on the remote |
| claim | `kanban claim <id> [--owner <name>] [--take-over]` | **Backlog → Planning** (`exploring` → `proposed`), and names the owner |
| advance | `kanban advance <id> --to <state>` | along the state machine, e.g. **Planning → Dev** (`--to building`) |
| ready for attestation | `kanban ready <id>` | **Dev → Attestation** (`ready-for-attestation`) |
| complete | `kanban complete <id>` | **Attestation → Done** (through `attested` to `completed`) |
| see it | `kanban render [--out <file>]` or `kanban serve [--port 4173]` | — |

`advance` refuses a move the state machine does not allow, and says which moves are legal from where
the card is. The states and moves are the initiative states `opensprint advance` uses.

## When to use which

**Backlog.** When an idea is worth keeping, add a card. Use a kebab-case id; the title and summary
are what a stakeholder will read on the board, so write them for someone who was not in the
conversation. Do not claim it — filing an idea is not committing to build it.

**Triage.** Start with `kanban list`. It always reads the remote, so it shows items filed from any
branch or machine. If a card already names someone else as its owner, ask the operator before taking
it over.

**Claim.** Claim when you pick an item up. A claim on a backlog item moves it to Planning. `claim`
refuses a card someone else holds — including when two people claim at the same moment, where the
second is told rather than overwriting the first. `--take-over` reassigns it, after asking.

**Advance.** Name the target state explicitly. Planning → Dev is `--to building`. Going back is legal
where the state machine allows it (for example `--to proposed` from `building`), and `--note` records
why in the card's history.

**Ready.** When the last milestone of the work is done, mark it ready. In time this should happen
automatically when milestones complete.

**Complete.** Attest and archive usually run together, so `complete` passes through `attested` to
`completed` in one step.

## Seeing the board

```bash
kanban render --out /tmp/kanban.html   # one self-contained HTML file
kanban serve --port 4173               # http://localhost:4173, re-read from the remote every 10s
```

Open either in a browser. Each card shows its owner, state, branch, last change, and the command
that moves it on. A card in Dev or Attestation with no owner is marked in red.

`kanban import` seeds the board from `opensprint/initiatives/*.md`, skipping any id already on it.

## Guardrails

- **Only through the tool.** Never commit to `origin/kanban` by hand and never force-push it — the
  fast-forward rule is what keeps concurrent writers from losing each other's changes.
- **The remote is the board.** Do not cache `list` output and act on it later; read again first.
- **It never touches the working tree** or the current branch.
