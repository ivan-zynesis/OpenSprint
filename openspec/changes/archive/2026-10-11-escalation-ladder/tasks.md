## 1. The strategy rung
- [x] 1.1 `/opsp:repropose` workflow template
- [x] 1.2 Registered in `OPSP_WORKFLOW_IDS`, skill and command templates, re-exported
- [x] 1.3 States all three rungs and marks where it sits
- [x] 1.4 Driver-specs as the invariant; stops and hands over where one must move
- [x] 1.5 Refuses to move the bar — a strategy that cannot meet it is replaced, not lowered
- [x] 1.6 Supersede never rewrite, with the multiverse reasoning stated
- [x] 1.7 Archived work immutable; corrective milestones instead
- [x] 1.8 Returns to `proposed`, with why not `building`
- [x] 1.9 Revision log names what did *not* change

## 2. The transitions
- [x] 2.1 `building → proposed` by `/opsp:repropose`
- [x] 2.2 `ready-for-attestation → proposed` by `/opsp:repropose`
- [x] 2.3 `ready-for-attestation → building` by `/opsp:attest`
- [x] 2.4 Two entries may share from/to and differ in by, documented
- [x] 2.5 A refusal from the handoff names every way back

## 3. Apply
- [x] 3.1 `[4] This is bigger than one record`
- [x] 3.2 Routes by what has to move, mechanically
- [x] 3.3 Does not guess the rung
- [x] 3.4 Says apply stops either way, and why repropose forces a rerun

## 4. Attest
- [x] 4.1 A missed bar does not by itself stop the close
- [x] 4.2 Three exits, tabulated by what the attester found
- [x] 4.3 A change request supersedes nothing
- [x] 4.4 Refuses advancing to `attested` and then reopening
- [x] 4.5 Says why attestation sits before the merge

## 5. Reexplore
- [x] 5.1 Declares itself the plan rung
- [x] 5.2 Hands to repropose where a decision must be superseded

## 6. The record
- [x] 6.1 `DEC-ESCALATION-LADDER`
- [x] 6.2 `DECISION-MAP.md` regenerated

## 7. Documentation
- [x] 7.1 `docs/concepts.md` — the ladder, the three attestation exits, the transition table
- [x] 7.2 `docs/workflows.md` — both rungs listed

## 8. Verification
- [x] 8.1 Tests for every clause of the repropose workflow
- [x] 8.2 Tests for the four new transitions and the refusal message
- [x] 8.3 Tests for apply's fourth option and attest's three exits
- [x] 8.4 Workflow roster updated to 19
- [x] 8.5 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
