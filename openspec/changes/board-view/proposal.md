## Why

Milestone 7 of `lifecycle-beyond-build`, and the one the operator reached for in practice before it existed — an in-repo kanban turned out to be a prerequisite for documenting at all.

`DEC-026` decides it is **compiled**, not hand-maintained: it derives entirely from initiative state, milestone completion and membership, which milestones 4 and 5 made readable. That keeps `DEC-006` intact without strain — **moving a card means changing a record's state**, and the board is never edited.

It is also load-bearing for the one interaction `DS-HATS-AS-CONTEXT` grants a non-technical stakeholder: an agent reading the compiled board on their behalf and filing an idea against it. That needs one readable place where all work is visible.

## What Changes

- New `opensprint/BOARD.md`, a compiled sibling of `DECISION-MAP.md` — cross-cutting rather than hat-scoped, so not a squad view
- Sections by state: **Backlog** (`exploring`) · **Next** (`proposed`) · **Doing** (`building`, `attested`) · **Done** (`completed`) · **Declined**
- A **Roadmap** section, forward-looking, where exposures will land once `mitigated-by` exists
- A **Problems** section carrying the state check and any orphaned milestones
- `regenerateBoard(opensprintDir)`, exported as `regenerateDecisionMap` is, plus a `compact board` subcommand
- `compact seal` regenerates the board, so the compile pass keeps it current

## Capabilities

### Added Capabilities
- `opsp-board`: a compiled view of every initiative by state, with its problems

## Impact

- **Derived, never edited.** Same contract as every other compiled artifact (`DEC-006`).
- **Not in the manifest.** Like `DECISION-MAP.md`, the board is fully deterministic with no skill in the loop, so it is regenerated rather than staleness-gated. `compact check` is unchanged.
- **The roadmap is a stub this milestone.** Exposures need `mitigated-by`, which is milestone 10. The section exists and says so rather than being absent.
- **New**: `src/core/board.ts`, `opensprint/BOARD.md`, a `compact board` subcommand
