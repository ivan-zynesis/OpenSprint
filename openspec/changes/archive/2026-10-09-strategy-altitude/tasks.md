## 1. The ancestry walk

- [x] 1.1 `driverSpecAncestorsOf(decision, byDecision)` — walks `depends-on` to driver-spec roots, breadth-first, guarding against cycles
- [x] 1.2 Reuse the guard pattern from `defaultHatsForDecision`: a visited set, and a dangling reference contributes nothing rather than failing the walk

## 2. The rule

- [x] 2.1 Add `strategy-unimplemented` to `OPEN_LOOP_KINDS`
- [x] 2.2 Build the set of driver-spec ids reached by any active decision, transitively
- [x] 2.3 Report an active driver-spec with `strategy` among its roles that is not in that set
- [x] 2.4 Report at most once per record, whatever its other roles
- [x] 2.5 No hat name appears in the implementation

## 3. The rendering contract

- [x] 3.1 State the altitude rule in `opsp-compact.ts`: position plus citation, never mechanism
- [x] 3.2 State why it needs no new guard — a mechanism claim has no citable record in the hat
- [x] 3.3 State what to render for a strategy with nothing to cite

## 4. Verification

- [x] 4.1 Unit tests: direct descent, transitive descent, no descent, non-strategy record, multi-role record
- [x] 4.2 Unit test for a `depends-on` cycle terminating
- [x] 4.3 Unit test that a dangling `depends-on` reference does not fail the walk
- [x] 4.4 `pnpm test` green apart from the known zsh-installer failures
- [x] 4.5 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean
- [x] 4.6 `compact loops` on this repository reports the strategies nothing implements

## 5. Discovered during implementation

- [x] 5.1 **The skill template still described the pre-milestone-1 maintainer shape.** `opsp-compact.ts` documented `bars · posture · evidence · exposure` and a seven-kind loop table while the engine had moved to seven objectives and eleven kinds. Milestones 1 and 2 should have updated it; left unfixed, the rendering half would have contradicted the engine — the drift `DEC-006` exists to prevent. Rewrote the maintainer section with the grid, the posture preamble, the strategy altitude and the measure anatomy, and corrected the loop table.
- [x] 5.2 On this repository exactly one strategy reports unimplemented — `DS-BIG-PICTURE` — which matches the finding `squad/product.md` already carried. 16 strategies, 1 gap: transitive descent is not over-reporting.
