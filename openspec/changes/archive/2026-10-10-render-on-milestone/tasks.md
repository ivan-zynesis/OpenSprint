## 1. plan --hat

- [x] 1.1 `compactPlanCommand({ hats })` filtering staged sections
- [x] 1.2 `compact plan --hat <name>` on the CLI, repeatable, mirroring `seal --hat`
- [x] 1.3 Filtering applies to both text and `--json`
- [x] 1.4 An unknown hat warns and is ignored
- [x] 1.5 Open loops are not filtered — a loop belongs to the records, not to a section

## 2. The apply workflow

- [x] 2.1 A compile step in Phase 3, after the milestone is marked done and the change branch merged
- [x] 2.2 Plan scoped to dev and devops; render only what is stale; seal scoped
- [x] 2.3 Say nothing when nothing is stale
- [x] 2.4 Offer product and maintainer when stale, naming the hat
- [x] 2.5 Accepting is a context switch — set down the diff, load the hat's records, compile, return
- [x] 2.6 Declining leaves it stale and reported
- [x] 2.7 Neither the compile nor the offer gates the milestone

## 3. Verification

- [x] 3.1 e2e: `plan --hat` filters sections in text and JSON
- [x] 3.2 e2e: `plan --hat` leaves open loops unfiltered
- [x] 3.3 e2e: unknown hat warns and exits zero
- [x] 3.4 Tests that the apply instructions carry the compile step and the offer
- [x] 3.5 Test that the instructions require a context switch rather than a render
- [x] 3.6 `pnpm test` green apart from the known flaky zsh-installer file
- [x] 3.7 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 4. Result on this repository

- [x] 4.1 `compact plan` reports 12 stale sections; `--hat dev --hat devops` reports 7, `--hat product` reports 3, and an unknown hat warns and falls back to all 12. The filter is doing what the apply step needs.
- [x] 4.2 The stale sections are left stale — this repository is the migration fixture, and the boundary compile is not run here.

## 5. Discovered during implementation

- [x] 5.1 **The hat filter wanted sharing, not duplicating.** `seal --hat` already had the unknown-hat warning inline; adding the same to `plan` would have been a second copy of a rule that must stay identical. Factored out as `requestedHats(requested, registry)`, used by both — so a change to how an unknown hat is treated cannot apply to one command and not the other.
