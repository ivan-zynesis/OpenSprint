## 1. The vocabulary

- [x] 1.1 `INITIATIVE_STATES` — explicit ordered list: exploring, proposed, building, attested, completed, declined
- [x] 1.2 `InitiativeState` type derived from it
- [x] 1.3 `isTerminalState(state)` — completed and declined
- [x] 1.4 `stateIndex(state)` for order comparisons, returning -1 for an unknown value

## 2. The check

- [x] 2.1 `StateProblem` — `{ initiative, kind, detail }` with kinds `state-unknown`, `state-contradicted`, `state-undeclared`
- [x] 2.2 `checkInitiativeState(entry)` returns the problems for one initiative
- [x] 2.3 `state-unknown` names the accepted values
- [x] 2.4 Contradiction: exploring with a done milestone
- [x] 2.5 Contradiction: attested or completed with an outstanding milestone
- [x] 2.6 Contradiction: proposed or later with no driver-specs, decisions or milestones
- [x] 2.7 Contradiction: building with no milestones
- [x] 2.8 `declined` is never contradicted
- [x] 2.9 `state-undeclared` only for an active initiative

## 3. Verification

- [x] 3.1 Unit tests for each contradiction, and for each allowed in-between case
- [x] 3.2 Unit test that a completed initiative with no state is silent
- [x] 3.3 Unit test that an active initiative with no state is reported
- [x] 3.4 Unit test that declined is never contradicted
- [x] 3.5 Run the check over this repository's four initiatives and record the result
- [x] 3.6 `pnpm test` green apart from the known zsh-installer failures
- [x] 3.7 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 4. Result on this repository

- [x] 4.1 No state problems. `compact-surrogate` and `parallel-universe-reconciliation` carry `status: completed` with no `state` and are correctly silent; `lifecycle-beyond-build` (`building`, 4/10) and `sdlc-operating-contract` (`proposed`, with members) are both consistent. The check was verified to fire by test rather than inferred from the quiet result.
