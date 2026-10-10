# devops — how is it stood up and kept running?

**This hat was empty until recently, and is no longer.** Three decisions now route here — all of
them about how work reaches `main` rather than about infrastructure, because this project still
ships none of its own (`DEC-017`).

**Nothing below is attested** (`DS-ATTESTED-TRUTH`).

## Infra Architecture

**There is none, and that is recorded rather than overlooked.**

OpenSprint is a CLI distributed via npm. It provisions nothing, deploys nothing, and holds no
credentials. Work is orchestrated in repositories that already have their own infrastructure, and
the deliberate consequence is that this section has nothing to describe (`DS-SELF-USE-SCOPE`,
`DEC-017`).

What it *does* require of a host repository is one thing: **git worktrees**. An initiative is a
branch with a worktree carrying its own copy of `opensprint/`, which is what makes two initiatives
able to run concurrently and disagree (`DEC-001`, `DS-PARALLEL-EXEC`).

```
  main
   └─● opsp/<initiative>              worktree, its own surrogate
       ├─● opsx/<initiative>/<change> worktree, pruned after merge
       └─● …
```

The planning workflows create that worktree themselves rather than assuming the operator did — a
reversal forced by practice, after a worktree built from `main` could not see the planning records
still uncommitted on it (`DEC-029`).

## GitOps

**Two workflows** (`.github/workflows/`): a full gate on pull request and push — install, build,
test, type check, lint, across ubuntu, macOS and Windows — and changesets release preparation.

**The gate that matters is `opensprint compact check`.** It fails when a compiled view disagrees
with the records it was compiled from, which is what makes the views trustworthy enough to read
instead of the records (`DEC-010`).

**`compact loops` is deliberately not a gate.** Open loops are a backlog, and deciding which gap is
worth work is a judgement call. A build that fails on an unmet target teaches people to stop
recording targets (`DEC-023`).

**The recommended merge sequence** for an initiative, and the reason each step is where it is
(`DEC-030`):

```
  opsp/<initiative> ──rebase──●──attest──●──archive──●──▶ main
```

Rebase first, because `archive` compiles against whatever records it can see — compile before
rebasing and the artifact is wrong the instant it merges. Attest before merging, because a second
pull request carrying only attestation is the one that never happens.

**The PR gate is on state consistency, never on outcome.** A bar recorded as *not met*, with an
exposure and a plan, passes. Insisting a question be answered is a consistency check; grading the
answer is certification, which `DS-SURROGATE-SCOPE` places out of scope.

**Evidence comes from CI, not CD** (`DS-CI-ATTESTATION`). A change to the pipeline itself cannot be
tested without running it, so those bars are attested post-merge and ride the next initiative that
touches the area — a named exception with no mechanism to abuse (`DEC-032`).

**Derived artifacts serialize initiative merges.** Two initiatives both rebased and archived will
conflict in `squad/*.md`, `architecture.md` and `BOARD.md`. The resolution is always rebase and
recompile; hand-merging a compiled file produces content no compile would generate (`DEC-006`).

## Open Loops

**Harvested:** `decision-unguarded` — **DEC-029**, **DEC-030**, **DEC-032**. All three, unguarded.

**Structural:**

- **Every decision in this hat is also owned by `dev`.** Nothing routes here alone, which is
  accurate: these are decisions about how code reaches `main`, and the split serves reading rather
  than ownership.
- **The merge sequence is instruction text, not a gate.** `DEC-030` recommends a PR-time check on
  state consistency; this repository does not yet run one, so the ordering holds by discipline.
- **No infrastructure means no infrastructure bars.** `availability & continuity` and
  `cost & budget` are empty in the `maintainer` view, and nothing here would populate them. If this
  project ever acquires a runtime, both hats move together.
