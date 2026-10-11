## 1. Git state
- [x] 1.1 New `src/core/initiative-git.ts`, kept separate so parsing never shells out
- [x] 1.2 `initiativeBranch(id)` following the `opsp/<id>` convention
- [x] 1.3 Trunk resolved from explicit candidates — `main`, then `master`
- [x] 1.4 `undefined` where git cannot answer; `{branchExists:false}` where it can and the branch does not exist

## 2. The check
- [x] 2.1 `checkInitiativeState(entry, git?)` — optional, additive
- [x] 2.2 Reports a merged branch against `exploring`, `proposed` or `building`
- [x] 2.3 Does not report `attested`/`completed` unmerged — the normal pre-PR state
- [x] 2.4 Never contradicts `declined`

## 3. Surfacing and the sequence
- [x] 3.1 `BOARD.md` supplies git state per initiative
- [x] 3.2 `/opsp:archive` carries the merge sequence and why the order is forced
- [x] 3.3 The PR gate, stated as consistency rather than outcome

## 4. Verification
- [x] 4.1 Git reader tested against real repositories — unmerged, merged, absent branch, no repo, `master` trunk
- [x] 4.2 Every branch of the extended check
- [x] 4.3 Tests that archive carries the sequence and the gate
- [x] 4.4 2032 tests pass, tsc clean, lint clean

## 5. Known limitation
- [x] 5.1 **A squash-merged branch reads as unmerged.** `merge-base --is-ancestor` is true for merge commits and fast-forwards, not for squashes. That under-reports rather than over-reports, which is the right direction for a check whose false positives would train people to ignore it — but it means a team that squashes will not get the dangling warning. Recorded in the design rather than hidden.
