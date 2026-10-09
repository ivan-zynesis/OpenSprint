## 1. The generator

- [x] 1.1 New `src/core/board.ts` with `renderBoard(initiatives)` returning the markdown
- [x] 1.2 `regenerateBoard(opensprintDir)` writing `BOARD.md`, mirroring `regenerateDecisionMap`
- [x] 1.3 Header states derived-do-not-edit and that moving a card means changing a record's state
- [x] 1.4 Deterministic: same inputs produce byte-identical output

## 2. Grouping

- [x] 2.1 Explicit state-to-section map, tracked by name in a constant — no pattern matching
- [x] 2.2 Backlog / Next / Doing / Done / Declined
- [x] 2.3 An initiative with no state is placed by `status`
- [x] 2.4 Milestone progress as done over total, with the next incomplete milestone named
- [x] 2.5 An empty section renders and says so

## 3. Problems and roadmap

- [x] 3.1 Problems section carrying `checkInitiativeState` output
- [x] 3.2 Problems section carrying orphaned milestones with their heading
- [x] 3.3 Problems says so when there are none
- [x] 3.4 Roadmap section, stating what will land there once `mitigated-by` exists

## 4. Wiring

- [x] 4.1 `compact board` subcommand
- [x] 4.2 `compact seal` regenerates the board as part of the compile pass
- [x] 4.3 `compact check` unchanged — the board is not staleness-gated

## 5. Verification

- [x] 5.1 Unit tests for grouping, progress, empty sections, problems, determinism
- [x] 5.2 Test the no-initiatives case
- [x] 5.3 Generate the board for this repository and read it
- [x] 5.4 `pnpm test` green apart from the known zsh-installer failures
- [x] 5.5 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 6. Discovered during implementation

- [x] 6.1 **The `[~]` marker was a silent drop.** Milestone 6 of this initiative was marked `- [~]` as superseded by `DEC-034`, and the parser recognised only `[ ]` and `[x]` — so that line vanished entirely, and the board reported 5/9 where it should have said 5/9 of ten with one dropped. Exactly the class of bug `orphanedMilestones` was added to prevent, caused by a convention introduced in the same session. `[~]` is now first-class: a superseded milestone parses, is listed, and is excluded from progress rather than holding an initiative open.
