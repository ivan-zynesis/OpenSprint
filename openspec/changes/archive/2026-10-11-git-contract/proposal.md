## Why

Milestone 2 of `sdlc-operating-contract`. `DEC-024` specified git as the **third input** to the state check — declared state, filled cells, and what git says — and only the first two were implemented. `DEC-030` specified the merge sequence and the PR gate, and the archive workflow said nothing about either.

The gap is the one that motivated the whole lifecycle: a fully implemented pull request merges, and the initiative is never closed. Declared state and filled cells can agree with each other and both be wrong about reality.

## What Changes

- `readInitiativeGitState(projectRoot, id)` — does `opsp/<id>` exist, and has it merged
- `checkInitiativeState(entry, git?)` reports an initiative whose branch merged while it still declares `exploring`, `proposed` or `building`
- `BOARD.md` supplies git state, so the dangling case surfaces where it is read
- `/opsp:archive` carries the merge sequence, why the order is forced, and the PR gate

## Capabilities

### Modified Capabilities
- `opsp-initiative-artifact`: git is the third input to the state check
- `opsp-archive-workflow`: the merge sequence and its gate are stated

## Impact

- **Optional by construction.** Git state is a parameter; a caller supplying none sees exactly the checks it saw before, and reading a surrogate never shells out. That matters for a tarball, a fixture, or any environment without a git binary.
- **`undefined` means unknowable, not "not merged".** The reader distinguishes the two so the check can stay silent rather than guessing.
- **New**: `src/core/initiative-git.ts`
