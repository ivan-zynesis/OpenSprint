---
id: DEC-BOARD-BUTTON-LAUNCHES-SESSION
type: adr
status: active
created: 2026-10-18
depth: 5
depends-on:
  - DS-RUNTIME-LESS-BOARD
  - DEC-CONTINUE-FORWARD-ESCALATE-BACK
hats: [dev]
---

# DEC-BOARD-BUTTON-LAUNCHES-SESSION: A Board Button Copies the Command That Starts a Fresh Session — It Never Moves a Card

## Question

Each card offers continue and escalate moves ([[DEC-CONTINUE-FORWARD-ESCALATE-BACK]]), and the page
can run nothing itself ([[DS-RUNTIME-LESS-BOARD]]). What does clicking one do?

## Decision

**A button copies a short command.** It finds the card's worktree — or makes it from the
initiative's branch — and starts a **fresh** agent session there with the workflow already invoked.
The workflow loads its own hat's context and moves the card when its work is done. Pasting the
command into a terminal is the operator's consent.

Hovering a button shows the workflow, the hat or rung, where the card lands and when.

**The agent is one table**: how to start a session with a prompt, and what a workflow is called
there. It starts with Claude Code. Other agents are added through the command adapters, which
already know each tool's workflow names, by giving each an optional way to start a session with a
prompt — a CLI argument, or a URL scheme where the tool documents one — and falling back to copying
the prompt alone.

## Consideration Factors

| Factor | Weight | Copy a launch command | Button moves the card | Local helper that runs it |
|---|---|---|---|---|
| A move always carries its work | HIGH | ✓ | ✗ | ✓ |
| No client-side process | HIGH | ✓ | ✓ | ✗ |
| Fresh context per hat | HIGH | A new session ✓ | — | ✓ |
| Operator consents to what runs | MED | The paste ✓ | — | A click ✗ |
| One click to start | LOW | Copy, then paste ✗ | ✓ | ✓ |

## Rationale

A static page cannot start a process — the browser sandbox forbids it — and anything that removes the
paste needs a helper running, which [[DS-RUNTIME-LESS-BOARD]] rules out. The paste is not only the
price of that: it is the moment the operator agrees to what runs.

A fresh session is governance, not convenience. Wearing a different hat means clearing what you were
holding ([[DS-HATS-AS-CONTEXT]]), and attest must not run in the session that wrote the work
([[DEC-043]]); a new process is the cheapest guaranteed clear context, for any agent.

## Invalidation Trigger

If operators routinely paste without reading what was copied, the paste is not consent and the
command should say more about what it will do. If agents converge on a common URL scheme for starting
a session with a prompt, links can replace the copy.
