## Context

The proof of concept rendered the board from a hand-written skill and template in this repository's
`.claude/skills/opensprint-kanban/`. The mechanism works: list by `git ls-tree` and `git show`, and
render by splicing base64 cards into a static page that decodes them itself. What is missing is
everything that makes it a product: shipping, a template that knows the card format, columns that
come from one place, and paths that are right for whichever tool the files were generated for.

## Goals / Non-Goals

**Goals**
- Any adopter's `init` or `update` installs a board that renders from `origin/kanban`
- The playbooks stay git and a POSIX shell; the page stays a file that loads nothing
- The page's columns come from the same constant as the code

**Non-Goals**
- Continue and escalate buttons, and the launch command: that is `stage-actions`, which adds its
  data to the configuration block this change introduces
- Clicking into an initiative's milestones: that is `milestone-board`
- Writing cards: that is `workflow-moves-card`

## Decisions

**The template is an asset file, not a TypeScript string.**

The page is about four hundred lines of HTML, CSS and browser script. The script is full of template
literals, so as a TypeScript template string every backtick and `${` would need escaping, and the
file would no longer be one a person can open and read. It lives at `assets/kanban/board.html`. It is
resolved from the module's own location, the way `schemas/` is, and shipped by `package.json` `files`
and the flake's fileset.

**Two markers: configuration at generation, cards at render.**

`<!-- opensprint:config -->` is replaced once, when opensprint writes the file, with a JSON block. The
block holds the columns now, and the moves and agent table once `stage-actions` lands. Its `<` is
escaped as `<`, so no value can close the script element. `<!-- opensprint:cards -->` is
replaced every render by the playbook, with base64 cards and metadata, as in the proof of concept.
Generation-time data is whatever opensprint knows: the state machine and the tool. Render-time data
is whatever git knows: the cards.

**Columns are data in `KANBAN_COLUMNS`, matched by state and by whether the card is held.**

`DEC-CONTINUE-FORWARD-ESCALATE-BACK` splits `exploring` into Backlog and Planning by whether triage
has claimed it. A column is therefore a list of states plus an optional `held` condition, and a card
goes in the first column that matches. A test walks every state against both answers to `held`, so a
state added to the vocabulary without a column fails the suite rather than vanishing from the page.

**`/opsp:kanban`, a utility workflow.**

It changes no state and needs no hat beyond reading, like `/opsp:tree`. So it takes a bare id,
`kanban`, among the utility workflows, and the skill keeps the proof of concept's directory name,
`opensprint-kanban`.

**The render playbook names its template's exact path, substituted at generation.**

A shell cannot find the file that described it, but the generator knows where it writes the template
for each tool: `<skillsDir>/skills/opensprint-kanban/board.html`. The instructions carry a
placeholder, and the shared writer replaces it per tool. The playbook resolves the path from
`git rev-parse --show-toplevel`, so it works from any worktree whose branch carries the generated
files.

**One writer for the opsp layer, and the template is written in every delivery mode.**

`init` writes the opsp layer inline. `update` does not write it at all, so its two paths would each
need a third copy of the same loop. `writeOpspLayer` does it once: opsp skills when skills are
delivered, opsp commands when commands are, and the kanban template in both cases. In commands-only
delivery, `opensprint-kanban/` holds only `board.html`. With no `SKILL.md`, no agent reads it as a
skill, and update's cleanup never touches `opensprint-*` directories.

**This repository regenerates only its kanban files.**

Its committed `.claude/` holds generated opsp files that are already older than their templates.
Regenerating all of them belongs to whoever next runs `update` here, not to this change. Only
`opensprint-kanban/` and `/opsp:kanban` are written, replacing the hand-written proof of concept.

## Risks / Trade-offs

- **`update` now overwrites generated opsp files.** That matches what it already does to opsx files,
  and `init` already did it. A team that hand-edited a generated opsp skill loses the edit, as it
  would have on any re-`init`.
- **A board with no buttons, for one milestone.** The proof-of-concept page offered buttons this
  page does not yet have. They return in `stage-actions`, derived rather than hand-written.
- **The flake changes.** Adding `./assets` to the fileset re-runs the Nix job. The pnpm hash covers
  dependencies, not sources, so it should not move.
