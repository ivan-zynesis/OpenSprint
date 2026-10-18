---
name: opensprint-kanban
description: Proof of concept — read the live board from the remote kanban branch with plain git, list every backlog item, and render the board in a browser from a static template. No server, no script.
license: MIT
compatibility: Requires git and a POSIX shell (Git Bash on Windows). Experimental.
metadata:
  author: opensprint
  version: "0.0.2-poc"
---

Read the live board and show it. The board lives on **one branch of the remote** — `origin/kanban` —
as one Markdown file per card, so every checkout, branch and pull request reads the same cards.

**This is a proof of concept** for the `kanban` backlog item, on branch `opsp/kanban`. It reads and
renders only. Writing — backlog, claim, advance, ready, complete — is meant to go through
`opensprint kanban …` commands that enforce the state machine (`DEC-STATE-MACHINE`); in this proof of
concept those buttons are placeholders that say what they would run.

## How the board is stored

```
origin/kanban
  README.md
  cards/<id>.md      frontmatter: id, title, state, owner, created, updated, branch
                     then a summary, then a "## History" list, one line per move
```

| Column | States |
|---|---|
| Backlog | `exploring` |
| Planning | `proposed` |
| Dev | `building` |
| Attestation | `ready-for-attestation`, `attested` |
| Done | `completed`, `declined` |

## Playbook 1 — list the backlog (triage)

Always fetch first: the remote is the board, and a stale copy is not.

```bash
git fetch --quiet origin kanban
for f in $(git ls-tree --name-only origin/kanban cards/); do
  git show "origin/kanban:$f" | awk '
    /^---$/ { n++; next }
    n == 1 && /^(id|state|owner):/ { sub(/^[a-z]+: */, ""); printf "%-36s", $0 }
    END { print "" }'
done
```

That prints `id  state  owner` for every card. To read one card in full:

```bash
git show origin/kanban:cards/<id>.md
```

Backlog items are the cards at `exploring`. If a card names someone else as its owner, ask the
operator before picking it up.

## Playbook 2 — render the board

Fill the static template with the cards and open it. Each card goes in **base64**, so no card text
can break the page; the page decodes and parses the cards itself.

```bash
git fetch --quiet origin kanban
REF=origin/kanban
TPL=.claude/skills/opensprint-kanban/board.html
OUT="${TMPDIR:-/tmp}/opensprint-kanban.html"
MARK='<!-- opensprint:cards -->'
MAIN=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")   # the main checkout
{
  sed "/$MARK/,\$d" "$TPL"
  printf '<script type="text/plain" id="board-meta">%s</script>\n' "$(
    printf 'ref=%s\nsha=%s\nat=%s\nrepo=%s\nmain=%s\nparent=%s\n' \
      "$REF" "$(git rev-parse --short "$REF")" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      "$(basename "$MAIN")" "$MAIN" "$(dirname "$MAIN")" | base64 | tr -d '\n')"
  for f in $(git ls-tree --name-only "$REF" cards/); do
    printf '<script type="text/plain" class="card">%s</script>\n' \
      "$(git show "$REF:$f" | base64 | tr -d '\n')"
  done
  sed "1,/$MARK/d" "$TPL"
} > "$OUT"
echo "$OUT"
```

Then open `$OUT` — in your own browser pane if you have one, otherwise `open` (macOS), `xdg-open`
(Linux) or `start` (Windows). To refresh, run the playbook again; nothing keeps running in between.

## What the page shows

Five columns, each card with its owner, state, branch, last change and history. A card in Dev or
Attestation with no owner is marked in red.

**A card offers only the moves the state machine allows, each owned by one workflow** — backward on
the left, work in place in the middle, forward on the right:

| Column | ← back | stays | forward → |
|---|---|---|---|
| Backlog | Decline (`triage`) | Triage | Propose |
| Planning | | | Apply |
| Dev | Reexplore, Repropose | Continue (`apply` — moves itself once the last milestone closes) | |
| Attestation | Reexplore, Repropose, Request a change (`attest`) | | Attest, then Archive |
| Done (declined) | Revive (`triage`) | | |

**A button never moves a card.** Hovering shows the workflow, the hat it is done in, the move and
when it applies. Clicking copies a short script that opens the card's worktree — finding it, or
making it from the branch — and starts a **fresh** agent session there with the workflow already
invoked. The workflow loads its hat's context itself, and moves the card when its work is done.
Pasting it into a terminal is the operator's consent; the page itself can run nothing.

## Guardrails

- **Read-only.** This skill never writes to `origin/kanban`, and never touches the working tree or
  the current branch.
- **Fetch before you read.** Do not act on a list you made earlier; read again.
- **Never edit a card by hand.** Moves belong to the tool that enforces the state machine.
