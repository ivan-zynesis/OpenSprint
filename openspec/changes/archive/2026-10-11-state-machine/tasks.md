## 1. The vocabulary
- [x] 1.1 `ready-for-attestation` between `building` and `attested`
- [x] 1.2 `READY_FOR_ATTESTATION` named once, in code
- [x] 1.3 The reason documented where the vocabulary is defined

## 2. The transition table
- [x] 2.1 `TRANSITIONS` — eight moves, each with the workflow and the trigger
- [x] 2.2 `checkTransition` refuses an illegal move and attaches the legal ones
- [x] 2.3 A non-state is refused, listing the vocabulary
- [x] 2.4 No state is a repair: any state reachable
- [x] 2.5 `nextStates` tolerates a state outside the vocabulary
- [x] 2.6 `writeState` rewrites one line, inserts where absent, touches no prose

## 3. The command
- [x] 3.1 `opensprint advance [initiative] --to <state>`
- [x] 3.2 Writes the field and regenerates `BOARD.md`
- [x] 3.3 Reports contradictions beside the move rather than refusing
- [x] 3.4 `--dry-run` and `--json`
- [x] 3.5 Lists open initiatives when none is named; lists legal moves when `--to` is missing

## 4. The check
- [x] 4.1 `proposed` with milestones done
- [x] 4.2 `building` with every milestone done — the handoff that did not happen
- [x] 4.3 `ready-for-attestation` with milestones outstanding, and with none at all

## 5. The workflows
- [x] 5.1 `/opsp:propose` — the template gains `state: proposed`; advance at the end
- [x] 5.2 `/opsp:apply` — `building` at the first milestone
- [x] 5.3 `/opsp:apply` — `ready-for-attestation` at the last, with the handoff banner
- [x] 5.4 `/opsp:apply` — borrowing a hat distinguished from handing it over
- [x] 5.5 `/opsp:attest` — `attested` at the close, and `reexplore` where work is missing
- [x] 5.6 `/opsp:archive` — `completed`, and why that guarantees the compile
- [x] 5.7 `/opsp:reexplore` — the backwards edge

## 6. The board
- [x] 6.1 A `Handoff` column, between Doing and Done
- [x] 6.2 Its blurb says it waits on a person, not on work
- [x] 6.3 The assurance gradient covers the new state

## 7. The record
- [x] 7.1 `DEC-STATE-MACHINE`
- [x] 7.2 `DECISION-MAP.md` regenerated

## 8. Documentation
- [x] 8.1 `docs/concepts.md` — the lifecycle diagram, the handoff, the transition table
- [x] 8.2 `docs/workflows.md` — `opensprint advance` listed

## 9. Verification
- [x] 9.1 Unit tests for the table, the refusals and `writeState`
- [x] 9.2 Tests for all three new contradictions
- [x] 9.3 A test that every transition the table assigns appears in that workflow's instructions
- [x] 9.4 End-to-end tests for the command
- [x] 9.5 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
