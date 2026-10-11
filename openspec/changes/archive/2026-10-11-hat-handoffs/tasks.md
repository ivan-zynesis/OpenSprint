## 1. Reideate
- [x] 1.1 `opsp-reexplore.ts` → `opsp-reideate.ts`, rewritten as the goal rung
- [x] 1.2 Registered under `opsp-reideate`; every reference moved
- [x] 1.3 States the symmetry with `/opsp:explore` and that it writes nothing
- [x] 1.4 Tests the driver-spec's **Statement**; hands `## Measures` to repropose
- [x] 1.5 Declares the hat change before thinking, and refuses to load the implementation
- [x] 1.6 Rejoins `backlog → triage → propose`
- [x] 1.7 Supersedes the milestones that served the old goal
- [x] 1.8 Treats "the goal holds after all" as a result

## 2. Repropose
- [x] 2.1 Absorbs the plan rung; the three rungs restated
- [x] 2.2 MAY CHANGE / MUST NOT CHANGE, bounded at `## Measures` (`DEC-027`)
- [x] 2.3 A bar that got easier routes to `/opsp:reideate`
- [x] 2.4 The Statement, not the whole record, is the invariant

## 3. Hats on transitions
- [x] 3.1 `Transition` gains `hat` and `handoff`
- [x] 3.2 All twelve transitions declare both
- [x] 3.3 `transitionFor(from, to, by?)` resolves a move
- [x] 3.4 `advance --hat`, refused on a handoff when absent or wrong
- [x] 3.5 The hat printed on every move; `--json` carries it
- [x] 3.6 No exit from `ready-for-attestation` is a handoff

## 4. The record
- [x] 4.1 `DEC-HAT-HANDOFFS`
- [x] 4.2 `DECISION-MAP.md` regenerated

## 5. Documentation
- [x] 5.1 `docs/workflows.md` — the ladder corrected, reideate explained, the hat table
- [x] 5.2 `docs/concepts.md` — the rungs and the transition table
- [x] 5.3 The drift check extended to the hats

## 6. Verification
- [x] 6.1 Tests for every clause of reideate and repropose
- [x] 6.2 Tests for the hat on every transition and for which are handoffs
- [x] 6.3 End-to-end: refused without a hat, refused with the wrong one, performed with the right one
- [x] 6.4 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
