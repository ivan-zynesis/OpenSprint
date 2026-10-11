## Why

`DS-ESCALATION-HANDOFF` made escalation a hat handoff: ask with the classification in it, write a record, resume. That covers a missing fact and nothing else. An operator saying *"we decided that wrongly"* had no exit — all three offered options ended in writing one record and carrying on.

The same gap at the other end. `/opsp:attest` could record a bad posture and could not say *send this back*; its only state move was forward. And `/opsp:reexplore` had no stated boundary, so whether revising a decision was in scope was whatever the session decided.

Found during this project's own attestation, which is the point at which it would be found.

## What Changes

- `/opsp:repropose` — a new workflow for the strategy rung: supersedes ADRs, redraws the milestones beneath them, returns the initiative to `proposed`. Driver-specs are its invariant.
- `/opsp:apply` escalation gains `[4] This is bigger than one record`, routing by **what has to move**
- `/opsp:attest` gains two exits — request a change (`→ building`, nothing superseded) and repropose (`→ proposed`)
- `/opsp:reexplore` declares itself the plan rung and hands over where a decision must be superseded
- Four transitions added; the table now carries 11

## Capabilities

### Modified Capabilities
- `opsp-initiative-artifact`: the ladder's transitions, and why the strategy rung re-enters at `proposed`
- `opsp-apply-workflow`: an escalation bigger than one record
- `opsp-attest-workflow`: attestation can send work back

## Impact

- **One more tool to learn.** The alternative was folding strategy revision into `/opsp:reexplore`, which would have meant re-explore editing ADRs — and the two tools return the initiative to *different states*, which is not expressible as a flag.
- **A change request is not a repropose.** Attestation finding that something is missing, where building it is all that is needed, goes back to `building` with nothing superseded. That distinction is the one most likely to be got wrong in practice.
- **`DEC-039`'s triage is now the top rung** rather than only an intake step. A goal that moved is a conversation that starts over, and that was always triage's job.
