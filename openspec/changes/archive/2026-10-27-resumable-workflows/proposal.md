## Why

Milestone 5 of the `kanban` initiative. Every forward button on the board is "continue". It starts
a **fresh** agent session running the stage's workflow (`DEC-BOARD-BUTTON-LAUNCHES-SESSION`).
`DEC-CONTINUE-FORWARD-ESCALATE-BACK` names the condition that makes that honest, as its own
invalidation trigger: "if a workflow cannot resume from where it paused, 'continue' is a restart
wearing a different name."

Apply resumes already, from the milestones it has checked off. Triage, propose and attest do not:

- **Triage thinks in conversation and writes nothing of it down.** A fresh session has no
  conversation, so a paused triage starts its brainstorm over. Propose's own instructions expect "the
  strategy that triage worked out" to be handed to it, yet nothing hands it over once the session
  that did the thinking has ended.
- **Propose assumes it starts from nothing.** A propose that wrote two driver-specs and stopped
  would classify everything again, and could write duplicates.
- **Attest assumes it starts from nothing.** A pass that judged three bars of five and stopped would
  judge all five again.

## What Changes

- **Each of the three checks first whether its move has already happened, and stops if so.**
  Triage stops on a card already past `exploring`, propose on one already `proposed`, and attest on
  one already `attested`. Each names the workflow that comes next
- **Triage persists its thinking.** A `## Triage` section in the initiative records the approaches
  weighed, the one it leans toward, and the open questions. It is written before triage pauses or
  hands over, and on resume it is read before anything is thought again. It is notes, not records:
  triage still formalizes nothing
- **Propose reads what it is given from disk.** It takes the strategy from `## Triage` where
  triage left one. It treats driver-specs and ADRs already listed in the initiative as confirmed,
  because propose writes only after confirmation. It presents, and writes, only what is missing
- **Attest picks up after the bars it judged.** A posture recorded since the handoff to
  `ready-for-attestation` was judged in this pass. Git finds the handoff, so no new field is needed.
  Attest confirms the frame again, as it must in any new session, then continues with the bars that
  have no posture from this pass

## Capabilities

### Modified Capabilities
- `opsp-backlog-seam`: triage records its thinking, and resumes from it
- `opsp-propose-workflow`: propose resumes from the records an initiative already lists
- `opsp-attest-workflow`: attest resumes after the bars it already judged

## Impact

- **Modified**: `src/core/templates/workflows/opsp-triage.ts`, `opsp-propose.ts`, `opsp-attest.ts`
- **No code path changes and no new field.** The record format stays as it is. `## Triage` is a
  section of the initiative, which is a container and not a record
  (`DS-PROGRESSIVE-CRYSTALLIZATION`)
- **The board's "continue" becomes true for every workflow it launches**, which is the trigger in
  `DEC-CONTINUE-FORWARD-ESCALATE-BACK` answered rather than waived
- Initiative: `kanban` · `DS-LIVE-BOARD` · `DEC-CONTINUE-FORWARD-ESCALATE-BACK`,
  `DEC-BOARD-BUTTON-LAUNCHES-SESSION`, `DEC-039`, `DEC-043`
