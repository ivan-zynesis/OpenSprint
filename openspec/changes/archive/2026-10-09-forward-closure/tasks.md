## 1. The forward pointer

- [x] 1.1 `mitigatedBy(exposureBlock)` in `measures.ts`, read from beside the prose
- [x] 1.2 Accept bare, bulleted and bolded forms; case-insensitive label; strip trailing punctuation
- [x] 1.3 Return null when the exposure points nowhere

## 2. The harvest rule

- [x] 2.1 `exposure-unmitigated` added to `OPEN_LOOP_KINDS`
- [x] 2.2 Fires on a populated exposure with no pointer
- [x] 2.3 Does not fire on a dangling pointer — a broken reference is a different finding

## 3. The roadmap

- [x] 3.1 `roadmapRows(opensprintDir, initiatives)` pairing each exposure with its mitigation
- [x] 3.2 Assurance resolved from live initiative state, never stored
- [x] 3.3 An explicit assurance map: exploring, proposed, building, attested, completed, declined
- [x] 3.4 A dangling pointer renders as pointing nowhere real, not as mitigated
- [x] 3.5 `declined` states that the exposure stands
- [x] 3.6 The `mitigated-by` line is stripped from the rendered exposure text
- [x] 3.7 Superseded records are excluded

## 4. Verification

- [x] 4.1 Unit tests for `mitigatedBy` across all accepted forms
- [x] 4.2 Unit tests for `exposure-unmitigated`, including the dangling-pointer case
- [x] 4.3 Unit tests for the roadmap: confession, gradient, dangling, declined, superseded, empty
- [x] 4.4 `pnpm test` green apart from the known zsh-installer failures
- [x] 4.5 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean
- [x] 4.6 Generate the board and read the roadmap

## 5. Result on this repository

- [x] 5.1 One exposure, pointing nowhere: `DS-HIGH-IMPACT-OPS` records that a corrupted surrogate degrades every downstream operation unboundedly, and nothing is planned against it. The board renders it as "a confession". Left as it is rather than inventing a mitigation to make the table look better — which is the behaviour the whole milestone exists to produce.
- [x] 5.2 Updated two tests superseded by this change: the loop-kind list (eleven → twelve) and milestone 7's roadmap-stub assertion. The e2e "no loops" fixtures gained a `mitigated-by`, keeping their intent rather than weakening the assertion.
