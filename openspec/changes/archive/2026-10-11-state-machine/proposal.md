## Why

`DEC-035` named the initiative states and nothing moved between them.

Audited against the code: `/opsp:backlog` wrote `exploring`, `/opsp:triage` wrote `declined`, and that was all. `/opsp:propose`'s frontmatter template **omitted `state:` entirely** — the word `proposed` appeared once, in a guardrail at the bottom of the file. Nothing wrote `building`, `attested` or `completed`. `/opsp:archive` gated its merge on `state: attested`, which no tool could produce, so the gate could never pass.

Every initiative in this project reached its state by hand-editing frontmatter. Without working transitions the surrogate cannot do the one job a project-management system exists for: say where the work is.

## What Changes

- `ready-for-attestation` — a sixth state between `building` and `attested`, for the moment the dev hat comes off and nothing has been judged
- `TRANSITIONS` — the eight legal moves, each naming the workflow that performs it and when
- `opensprint advance <initiative> --to <state>` — validates, writes the field, regenerates `BOARD.md`, reports what the record now disagrees with
- `/opsp:propose`, `/opsp:apply` (×2), `/opsp:attest`, `/opsp:archive` and `/opsp:reexplore` call it at their boundaries; none edits `state:`
- `checkInitiativeState` gains three contradictions it could not previously make: `proposed` with work done, `building` with everything done, and the handoff state with work outstanding
- `BOARD.md` gains a **Handoff** column

## Capabilities

### Modified Capabilities
- `opsp-initiative-artifact`: the state machine, and who performs each move
- `opsp-board`: work waiting on a person is its own column

## Impact

- **The archive gate now works.** `attested` is reachable, so `/opsp:archive`'s PR gate stops being a deadlock.
- **Every squad hat is guaranteed compiled at exactly one point.** `completed` is reachable only through `attested`, and `attested` only through the handoff — so the compile `/opsp:archive` runs is the one place in the lifecycle where that is true.
- **Advancing records, it does not gate.** An illegal *move* is refused. A legal move into a state the content contradicts is written with the contradiction reported beside it — gating there would be certification, which `DS-SURROGATE-SCOPE` puts out of scope.
- **This repository's own initiatives will light up.** Three sit at `building` with every milestone done; the new check reports each as a handoff that never happened. That is the rule working.
- **New**: `src/core/initiative-transitions.ts`, `src/commands/advance.ts`
