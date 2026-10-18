---
id: DEC-CARD-WRITES-THROUGH-CLI
type: adr
status: active
created: 2026-10-18
depth: 2
depends-on:
  - DEC-BOARD-ON-REMOTE-BRANCH
  - DEC-STATE-MACHINE
hats: [dev]
---

# DEC-CARD-WRITES-THROUGH-CLI: A Card Moves Only Through an opensprint Command That Enforces the State Machine

## Question

Reading the board is git and a template ([[DEC-BOARD-READ-BY-GIT]]). When a workflow moves an
initiative, something must update its card on `origin/kanban` ([[DEC-BOARD-ON-REMOTE-BRANCH]]). Is
that a git playbook in the workflow's skill, or an opensprint command?

## Decision

**An opensprint command.** A workflow that moves an initiative updates its card through the
`opensprint` CLI, which validates the move against the same table as `opensprint advance`
([[DEC-STATE-MACHINE]]), appends the history line, and pushes the card as a fast-forward — re-reading
and re-applying when another writer got there first, never forcing.

`claim` refuses a card someone else holds unless told to take it over, so two simultaneous claims
cannot silently overwrite each other.

Reading and rendering stay runtime-less. The CLI is the tool that installed the skills, so it adds no
dependency, and it runs for one command and exits — no process stays behind.

## Consideration Factors

| Factor | Weight | opensprint command | Git playbook in the skill |
|---|---|---|---|
| An illegal move is refused | HIGH | In code ✓ | An instruction the agent may not follow ✗ |
| Concurrent writers lose nothing | HIGH | Fast-forward and retry, in code ✓ | Depends on the agent rebasing correctly ✗ |
| Adds a dependency | HIGH | No — the CLI installed the skills ✓ | No ✓ |
| Leaves a process running | MED | No ✓ | No ✓ |
| Works with no opensprint installed | LOW | ✗ | ✓ |

## Rationale

[[DEC-STATE-MACHINE]] exists because a prose instruction to set `state:` is precisely what failed:
the field was written by hand and initiatives ended up in the wrong states. A playbook telling an
agent to edit a card's `state:` is that instruction again, on a different file. Writes are where
rules have to be code; reads are where they do not, which is why the two are split.

## Invalidation Trigger

If adopters routinely need to move cards from environments where opensprint is not installed, the
command is a dependency after all and a git-only write path needs its own enforcement. If the CLI's
transition table and `opensprint advance`'s drift apart, there are two state machines.
