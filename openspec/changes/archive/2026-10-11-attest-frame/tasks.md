## 1. Resolving the frame
- [x] 1.1 `BASE_BRANCH_CANDIDATES` — `main`, `master`, `develop`, `trunk`, by explicit list
- [x] 1.2 `BASE_ORIGINS` — `explicit`, `remote-head`, `candidate`
- [x] 1.3 `resolveBase` tries them in that order and reports which fired
- [x] 1.4 `resolveChangeFrame` reports source, base, fork point, commits, files
- [x] 1.5 Commit **subjects** via `--format=%h %s` — the body is never fetched
- [x] 1.6 File-level stat via `--numstat`; binary files counted as zero
- [x] 1.7 Initiative ids read from frontmatter, not filenames; deleted files skipped
- [x] 1.8 Archived change names read from the directory shape
- [x] 1.9 `undefined` where git cannot answer; null source in a detached HEAD

## 2. The command
- [x] 2.1 `opensprint frame`, with `--base` and `--json`
- [x] 2.2 Prints how the base was chosen, in words
- [x] 2.3 Prints initiatives touched and changes archived
- [x] 2.4 States in its own output that it carries no patch
- [x] 2.5 Fails with a usable message where no frame can be resolved

## 3. The skill
- [x] 3.1 Step 1 establishes the frame, ahead of reading any bar
- [x] 3.2 "Do not ask the operator what the change is — git knows"
- [x] 3.3 Requires an explicit confirmation, not an acknowledgement
- [x] 3.4 Says the frame scopes the review, and a missing initiative is a finding
- [x] 3.5 Stops on an empty range
- [x] 3.6 LOAD / DO NOT LOAD box gains the frame and the two exclusions
- [x] 3.7 Says why the frame is not a widening of `DEC-040`
- [x] 3.8 Remaining steps renumbered, including `5b` → `6b`
- [x] 3.9 Input line: with no argument, the frame decides the scope

## 4. The record
- [x] 4.1 `DEC-ATTEST-CHANGE-FRAME` — semantic id per `DEC-036`
- [x] 4.2 States the resolution order and that the choice is reported
- [x] 4.3 States the scope/rationale line and why it holds
- [x] 4.4 Invalidation trigger covers both failure modes
- [x] 4.5 `DECISION-MAP.md` regenerated

## 5. Documentation
- [x] 5.1 `docs/workflows.md` — the lifecycle diagram and a section on framing
- [x] 5.2 `opensprint frame` listed among the utilities

## 6. Verification
- [x] 6.1 Unit tests against real repositories — every tier, fork point, detached HEAD, no repo
- [x] 6.2 A test asserting a commit body never reaches the frame
- [x] 6.3 A test asserting no patch content reaches the frame
- [x] 6.4 End-to-end tests for the command, including `--json` and the failure path
- [x] 6.5 Skill tests for every clause of Step 1
- [x] 6.6 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
