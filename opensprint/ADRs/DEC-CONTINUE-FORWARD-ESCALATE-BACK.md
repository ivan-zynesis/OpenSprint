---
id: DEC-CONTINUE-FORWARD-ESCALATE-BACK
type: adr
status: active
created: 2026-10-18
depth: 4
depends-on:
  - DS-LIVE-BOARD
  - DEC-STATE-MACHINE
  - DEC-ESCALATION-LADDER
  - DEC-INITIATIVE-OWNER
hats: [dev]
---

# DEC-CONTINUE-FORWARD-ESCALATE-BACK: Each Column Is a Stage With One Workflow; Forward Continues It, Backward Escalates

## Question

A card on the live board ([[DS-LIVE-BOARD]]) has to offer its next steps. A kanban usually lets a
card be dragged anywhere; [[DEC-STATE-MACHINE]] allows only certain moves, each owned by one
workflow. What columns does the board have, and what may a card do from each?

## Decision

**Each column is a stage, and each stage has one workflow that does it.** A card's column follows
from its state — and before propose, from whether triage has claimed it ([[DEC-INITIATIVE-OWNER]]):

| Column | Cards | Continue → | ← Escalate |
|---|---|---|---|
| Backlog | `exploring`, unowned | triage — the only way forward | — |
| Planning | `exploring`, claimed | propose — how a plan completes | — |
| Dev | `proposed`, `building` | apply — on to Attestation once the last milestone closes | repropose, reexplore |
| Attestation | `ready-for-attestation`, `attested` | attest, then archive | request a change, repropose, reexplore |
| Done | `completed`, `declined` | — | revive a declined idea |

**Forward is always "continue"**: it resumes the stage's workflow from where it paused, and that
workflow moves the card when its work is done.

**Backward is an escalation**: work goes up a rung — from dev/devops to product/maintainer
(repropose), and from there to the operator (reexplore) — and jumps straight to the state that rung
reopens ([[DEC-ESCALATION-LADDER]]). Attest's request for a change sends the work back down to dev.
Declining is one of triage's outcomes, not a separate button.

The board offers no move the state machine does not allow, and no drag-and-drop.

## Consideration Factors

| Factor | Weight | One workflow per stage; continue / escalate | Free drag between columns | A button per state-machine edge |
|---|---|---|---|---|
| Cannot make an illegal move | HIGH | ✓ | ✗ | ✓ |
| A move always carries its work | HIGH | The workflow moves the card ✓ | A card moves with no work done ✗ | ✓ |
| Reads as the lifecycle | HIGH | Stages, and one way on ✓ | ✓ | A list of edges ✗ |
| Planning needs no new state | MED | Claimed `exploring` ✓ | — | — |
| Familiar kanban gesture | LOW | Buttons, not drag ✗ | ✓ | ✗ |

## Rationale

Most of the time forward work is the same act: picking the work up where it paused. Naming it
"continue" on every column makes the board read as the lifecycle rather than a set of transitions.
Backward is different in kind — it reopens a decision at a higher altitude — and the ladder already
says which rung reopens which state, so the board shows those and nothing else.

Planning as a claimed `exploring` card uses the owner field triage already writes, so the board adds a
column without adding a state.

## Invalidation Trigger

If a workflow cannot resume from where it paused, "continue" is a restart wearing a different name,
and that workflow needs a resume path before its button is honest. If teams routinely need a move the
ladder does not have, the state machine is missing an edge — the board should not add it.
