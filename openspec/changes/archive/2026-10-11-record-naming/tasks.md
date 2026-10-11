## 1. Decisions are coined, not allocated
- [x] 1.1 `/opsp:decide` replaces "Assign sequential ID" with "Coin a semantic ID — never a number"
- [x] 1.2 The instruction names the failure it prevents: worktrees colliding under `DS-PARALLEL-EXEC`
- [x] 1.3 "Do not read the directory and increment" stated explicitly
- [x] 1.4 `DEC-001`–`DEC-044` declared permanent in both `/opsp:decide` and `/opsp:propose`
- [x] 1.5 `/opsp:propose` writes `DEC-SEMANTIC-NAME.md`

## 2. Initiatives are dated
- [x] 2.1 `/opsp:propose` writes `initiatives/<YYYYMMDD>-<name>.md`
- [x] 2.2 `/opsp:backlog` states the same path, which it previously left unsaid
- [x] 2.3 Both state that the prefix is presentation and the `id:` is the identifier

## 3. Readers resolve by id
- [x] 3.1 `/opsp:apply`, `/opsp:reexplore`, `/opsp:review`, `/opsp:archive` resolve by frontmatter `id:`
- [x] 3.2 Each is told the filename will not match the name it was given
- [x] 3.3 `openspec compact board` named as the way to list initiatives with their paths

## 4. The board survives the prefix
- [x] 4.1 `RoadmapRow.mitigationStem` carried from the resolved initiative
- [x] 4.2 The roadmap link built from the stem rather than the id
- [x] 4.3 Test: a dated mitigating initiative links to its real path

## 5. The convention applied to itself
- [x] 5.1 All five existing initiative files renamed to their `created:` date
- [x] 5.2 `BOARD.md` regenerated; every link resolves
- [x] 5.3 `sdlc-operating-contract`'s own descriptor updated — it had recorded its filename as unprefixed "until it ships"

## 6. Verification
- [x] 6.1 tsc clean, build clean
- [x] 6.2 Board and initiative suites pass
- [x] 6.3 Full suite run
