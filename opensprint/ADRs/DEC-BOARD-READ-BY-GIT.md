---
id: DEC-BOARD-READ-BY-GIT
type: adr
status: active
created: 2026-10-18
depth: 1
depends-on:
  - DS-RUNTIME-LESS-BOARD
  - DEC-BOARD-ON-REMOTE-BRANCH
hats: [dev]
---

# DEC-BOARD-READ-BY-GIT: The Board Is Read With Git Playbooks and Rendered From a Static Template

## Question

[[DS-RUNTIME-LESS-BOARD]] allows the git CLI, the installed skill and an HTML renderer, and nothing
else on the client. How is the board on `origin/kanban` ([[DEC-BOARD-ON-REMOTE-BRANCH]]) listed and
shown?

## Decision

**Reads are git playbooks in a skill.** Listing is `git fetch` of the board branch, then
`git ls-tree` and `git show` over `cards/` — no checkout.

**Rendering fills a static HTML template.** The template ships with opensprint; the playbook writes
each card into it as **base64**, so no card text can break the page, plus a metadata block naming the
ref, the commit and the main checkout. The page decodes and parses the cards itself, loads nothing
from the network, and is opened in a browser. Refreshing is rendering again.

There is no script and no server: the first proof of concept's node script and local server are
rejected.

## Consideration Factors

| Factor | Weight | Git playbook + static template | Node script and local server | Page fetching from the forge's API |
|---|---|---|---|---|
| No client-side process | HIGH | ✓ | A server to start and keep up ✗ | ✓ |
| Dependencies | HIGH | git, the skill, a browser ✓ | node too ✗ | Forge credentials in a browser ✗ |
| Works on any git remote | HIGH | ✓ | ✓ | One forge's API ✗ |
| Card text cannot break the page | MED | base64 ✓ | Escaped in code ✓ | ✓ |
| Live updates | LOW | Re-render ✗ | Polls ✓ | Polls ✓ |

## Rationale

The data is already plain files on a branch, and git can read a branch without checking it out, so
listing needs nothing git does not have. The only hard part of filling a template from a shell is
escaping, and base64 removes it — every git install has `base64`, and the browser decodes it with
`atob` and `TextDecoder`.

A page that fetches the board itself would need a server, or a forge's API and credentials in the
browser; both are dependencies [[DS-RUNTIME-LESS-BOARD]] rules out.

## Invalidation Trigger

If boards grow large enough that rendering every card into one file is slow to produce or to open,
the page needs paging or the playbook needs filtering. If an adopter's environment has no POSIX shell
for the playbook, the playbook needs a second form for that shell.
