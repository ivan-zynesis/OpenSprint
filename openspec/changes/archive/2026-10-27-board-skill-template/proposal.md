## Why

Milestone 2 of the `kanban` initiative. `DS-LIVE-BOARD` wants anyone, human or agent, to be able to
stand the live board up in their own browser. `DEC-BOARD-READ-BY-GIT` decides how: git playbooks in
a skill list the board, and the same skill fills a static HTML template and opens it.

Both exist only as the proof of concept's hand-written files in this repository's
`.claude/skills/opensprint-kanban/`. No adopter receives them. They also hard-code Claude Code's
command names and predate milestones on cards: the page reads a card's `## Milestones` section as
part of its summary.

There is a second gap. **`opensprint update` has never written an opsp skill or command.** It
refreshes the opsx layer only, so an adopter who upgrades keeps whatever opsp workflows their first
`init` wrote. A skill shipped "through `init` and `update`" needs `update` to ship the opsp layer.

## What Changes

- **The template is a package asset**, `assets/kanban/board.html`. It needs no server, loads nothing
  from the network, and has two markers: one for configuration, filled when the file is generated,
  and one for cards, filled at render time
- **The columns are data, named once in code**: `KANBAN_COLUMNS`, Backlog · Planning · Dev ·
  Attestation · Done, per `DEC-CONTINUE-FORWARD-ESCALATE-BACK`. Generation writes them into the
  template, so the page and the code cannot disagree
- **The page reads the card format `board-store` defined**: the summary, milestones with their stage
  and progress, and history
- **A new workflow, `/opsp:kanban`**, with skill `opensprint-kanban`. It has two playbooks, list and
  render, using only git and a POSIX shell. Its render playbook names the exact template path for
  the tool it was generated for
- **One writer for the opsp layer**, used by `init` and by both of `update`'s paths. It writes every
  opsp skill and command, and always writes the kanban template, whatever the delivery mode, because
  the command's playbook needs it as much as the skill's does
- **Buttons are not in this change.** Continue, escalate and the launch command are `stage-actions`,
  which adds them to this template's configuration
- This repository's own `opensprint-kanban` skill is regenerated, replacing the hand-written one
- `docs/workflows.md` lists the twentieth workflow

## Capabilities

### New Capabilities
- `opsp-kanban-skill`: the skill and template that list and render the live board for people

### Modified Capabilities
- `opsp-live-board`: the board's columns are named in code and shipped into the template

## Impact

- **New**: `assets/kanban/board.html`, `src/core/kanban-board.ts`,
  `src/core/templates/workflows/opsp-kanban.ts`, `src/core/shared/opsp-layer.ts`
- **Modified**: `src/core/init.ts` and `src/core/update.ts` call the shared writer;
  `src/core/shared/skill-generation.ts` registers `kanban`; `package.json` `files` and `flake.nix`
  ship `assets/`
- **Adopters' `update` changes behaviour.** It now rewrites every opsp skill and command for each tool
  it updates, as `init` always has. Hand edits to generated opsp files are overwritten, as they already
  are for opsx files
- Initiative: `kanban` · `DS-LIVE-BOARD`, `DS-RUNTIME-LESS-BOARD` · `DEC-BOARD-READ-BY-GIT`,
  `DEC-CONTINUE-FORWARD-ESCALATE-BACK`
