## Context

`board-skill-template` shipped a page with a configuration block and an empty `moves()` hook. The
proof of concept filled the same role with three hand-written tables: `CONTINUE`, `ESCALATE` and
`HARNESS`. The first two duplicated `TRANSITIONS`. The third hard-coded Claude Code and this
repository's command names, which are not an adopter's.

## Goals / Non-Goals

**Goals**
- Every button corresponds to a transition `opensprint advance` would accept, or to triage's pick-up
- The launch command is right for the tool the board was generated for
- A tool that cannot start a session from a command line still gets a useful button

**Non-Goals**
- Milestone tickets and their moves: that is `milestone-board`
- Making "continue" an honest resume for triage, propose and attest: that is `resumable-workflows`.
  Until it lands, continue on those cards restarts the workflow, and the workflow reads what the
  initiative already holds
- A URL scheme launcher. None of the adapters' tools is known here to document one; the field
  accepts any shell words, so one can be added per adapter

## Decisions

**Forward and backward are read off the state vocabulary's order.**

`INITIATIVE_STATES` lists the lifecycle in order, and `docs-drift.test.ts` already calls a transition
backwards when its target comes earlier. Using the same rule gives:

- a forward transition from each state, which is one per state once moves into `declined` are
  excluded;
- the escalations: `building` → repropose and reexplore; `ready-for-attestation` → attest's request
  for a change, repropose and reexplore; `declined` → triage's revive.

This is exactly the ADR's table, without restating it.

`proposed` and `attested` offer no escalation, because the table has none from them. The ADR's prose
lists repropose and reexplore for the whole Dev and Attestation columns. Where the two disagree, the
board follows the table, which is the ADR's own rule: "the board offers no move the state machine
does not allow".

**Backlog's continue is the one move that is not a transition.**

Triage picking a card up writes an owner, not a state (`DEC-INITIATIVE-OWNER`), so no row of
`TRANSITIONS` describes it. It is declared once, `TRIAGE_PICKUP`, with the hat of triage's own
transitions, and marked as claiming, so the page can show the card landing in Planning.

**Labels are an explicit lookup.**

An escalation's button reads as the rung it opens: Repropose, Reexplore, "Request a change" for
attest, Revive for triage. It is a four-entry map keyed by workflow, not text derived from the
transition's wording.

**The agent is configuration, built per tool from its adapter.**

`ToolCommandAdapter` gains two optional fields:

- `sessionLauncher`: the shell words that start an interactive session with a prompt as the next
  argument, `['claude']` for Claude Code;
- `commandReference(id)`: how a person invokes a generated command, `/opsx:<id>` for Claude Code.
  The opsp layer maps it as it maps paths, `opsx` → `opsp`.

The writer builds an agent block for each tool: its display name, its launcher or null, and a prompt
form for every opsp workflow. That form is the command reference where the adapter has one and
commands are delivered, and the skill's name otherwise. Only Claude Code is filled in. Guessing
another tool's syntax would ship a button that types the wrong thing; the skill-name prompt is right
everywhere.

**The launch script is the proof of concept's, unchanged.**

It changes to the main checkout and fetches. It finds the worktree whose branch is the card's from
`git worktree list --porcelain`. Where there is none, it adds one beside the main checkout, from the
local branch, or else from `origin/<branch>` as a new local branch. Then it starts the session. The
paths come from the render-time metadata, because only the render knows where the main checkout is.

## Risks / Trade-offs

- **Continue restarts triage, propose and attest** until `resumable-workflows`. The hover says
  "resumes", and for apply it does. The ADR's invalidation trigger names exactly this, and the
  milestone that answers it is already planned.
- **One launcher.** Every tool but Claude Code copies a prompt and leaves opening the session to the
  operator. That is the decided fallback, not a gap in it.
