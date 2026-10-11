# devops — how is it stood up and kept running?

**This hat was empty until recently, and is no longer.** Four decisions now route here — all of
them about how work reaches `main` rather than about infrastructure, because this project still
ships none of its own (`DEC-017`).

**Nothing below is attested** (`DS-ATTESTED-TRUTH`).

## Infra Architecture

**Observed:** the repository provisions no infrastructure of its own. It holds no Dockerfile,
Terraform, Compose or cluster manifest; the only build definitions besides the npm package are a
Nix flake (`flake.nix`, `flake.lock`, `scripts/update-flake.sh`) and an `act` config for running
the workflows locally (`.actrc`, `.github/workflows/README.md`). What it ships is one npm package,
`@ivan-lee/opensprint`, exposing the `opensprint` binary, published with public access, requiring
Node `>=20.19.0` (`package.json`). Its "infrastructure" is a git forge and a package registry.

What the decisions do shape is **where work lives while it is being done**. That is a topology of
branches and worktrees, not of servers:

```
  /opsp:backlog ─┐
  /opsp:triage  ─┼─ create or switch to ──►  worktree  opsp/<initiative>     (DEC-029)
  /opsp:propose ─┘                               │
                                                 │  /opsp:apply, per milestone:
                                                 │    change branch merges in
                                                 │    compact plan → render dev+devops
                                                 │    compact seal --hat dev …   (DEC-COMPILE-ON-MILESTONE)
                                                 ▼
                              rebase ─► attest ─► archive ─► merge             (DEC-030)
                                                                │
                                                     one PR     ▼
                                                              main
```

- **Planning is decided to happen in the initiative's worktree**, which the planning tools create or
  switch to themselves; an initiative is one branch from first persisted thought to merge
  (`DEC-029`). The accepted cost is that backlog items are scattered across branches, so a board
  shows only what the current branch knows (`DEC-029`).
- **Compilation is decided to run where an agent is, never in a pipeline.** Rendering a view needs a
  model and a hat, so CI was ruled out as a compile site; `/opsp:apply` compiles the stale `dev` and
  `devops` sections at each milestone boundary with a hat-scoped seal, and offers — does not silently
  run — product and maintainer compiles (`DEC-COMPILE-ON-MILESTONE`). Archive still compiles
  everything (`DEC-COMPILE-ON-MILESTONE`, `DEC-030`).
- **Evidence is decided to live in the pipeline**, as a reference to a CI-produced artifact
  addressable from the pull request, not as prose (`DEC-032`). **Observed:** the only artifacts this
  repository's CI produces are coverage reports — `coverage-report-pr` on pull requests and
  `coverage-report-main` on the Linux push run — each retained for 7 days (`.github/workflows/ci.yml`).
  No record addresses how long an evidence reference must stay resolvable.

**Observed, unexplained by any record:** the Nix flake builds a binary named `openspec`
(`flake.nix` `pname`/`mainProgram`, and the CI check for `result/bin/openspec` in
`.github/workflows/ci.yml`), while the npm package exposes `opensprint` (`package.json` `bin`).

## GitOps

Two workflows exist (`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`). Neither
reaches a deployed environment — there is none to reach. Nothing publishes from this fork.

```
  pull_request / merge_group (→ main)
     ├─ test_pr        ubuntu · Node 20 · build · test ─┐
     ├─ lint           build · tsc · eslint · dist/ ────┼─► "All checks passed"
     ├─ nix-flake-validate   only if nix paths changed ─┘    (required aggregate)
     └─ validate-changesets  not in the aggregate

  push (main)
     ├─ test_matrix    linux-bash · macos-bash · windows-pwsh ─┐
     ├─ lint ──────────────────────────────────────────────────┼─► "All checks passed"
     └─ nix-flake-validate   only if nix paths changed ────────┘

  workflow_dispatch ──► lint · nix-flake-validate only (no tests, no aggregate)

  push (main) ──► Release (prepare)
                    job guarded: github.repository == 'Fission-AI/OpenSpec'
                    → on this fork: skipped, nothing publishes
```

**CI** (`.github/workflows/ci.yml`, observed):

- Triggers on `pull_request` and `merge_group` targeting `main`, on `push` to `main`, and on manual
  dispatch; concurrent runs on one ref cancel each other. The test jobs and the aggregate are
  conditioned on the event name, so a manual dispatch runs only lint and the Nix check.
- On pull requests and the merge queue: one Linux test job (pnpm 9, Node 20, `pnpm install
  --frozen-lockfile` → `pnpm run build` → `pnpm test`), uploading coverage.
- On push to `main`: the same steps as a matrix across Linux/bash, macOS/bash and Windows/PowerShell.
- Always: build, `tsc --noEmit`, `pnpm lint`, and a check that `dist/cli/index.js` exists.
- When `flake.nix`, `flake.lock`, `package.json`, `pnpm-lock.yaml`, `scripts/update-flake.sh` or
  `ci.yml` change: a Nix build, a run of the built binary, and a run of the flake update script.
- `validate-changesets` runs `changeset status --since=origin/main` only if a `changeset` binary is
  on the runner's `PATH`, and otherwise prints that changesets are not configured and passes. It is
  not among the jobs the "All checks passed" aggregate requires. No `.changeset/` directory exists in
  the repository.
- Observed version skew, unexplained by any record: CI pins pnpm 9 (`ci.yml`) while `package.json`
  declares `packageManager: pnpm@8.15.0`.

**Release** (`.github/workflows/release-prepare.yml`, observed): on push to `main`, a changesets job
opens or updates a version PR and, when that merges, runs `pnpm run release:ci` —
`check:pack-version` then `changeset publish` (`package.json`) — over npm OIDC trusted publishing.
The job is guarded by `github.repository == 'Fission-AI/OpenSpec'`, the upstream this project forked
from; in this repository it never runs. **Publishing `@ivan-lee/opensprint` is therefore manual**,
and no record decides how or by whom.

**How an initiative is decided to reach `main`** (`DEC-030`): rebase onto `main`, attest on the open
PR, archive — which compiles against the rebased record set — then merge, all in **one** pull
request. A conflict in a derived artifact is decided to be resolved by rebasing and recompiling,
never by hand-merging (`DEC-030`). Pipeline-only bars that cannot be assessed before merge are
attested `posture: pending` and re-attested by the next initiative touching the area — never by a
pull request of their own (`DEC-032`).

**Disagreement — decided gate vs. observed pipeline.** `DEC-030` decides that a pull request merging
`opsp/*` into `main` **is gated on state consistency**: the initiative must be `attested` and the
compiled views fresh. **Observed:** no workflow in this repository runs `opensprint compact check`
or checks initiative state (`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`).
`docs/git-workflow.md` *recommends* exactly such a required check, supplies a minimal
`opensprint.yml` for it, and states that no command performs the attested-state check yet, leaving
it to the reviewer. The decision and the pipeline disagree; this view does not resolve which moves.

## Open Loops

- **`decision-unguarded` — `DEC-032`** (shared with `dev`). No rule cites the decision that evidence
  is a CI artifact reference and that pipeline-only bars ride the next initiative, so nothing would
  fail if an `### Evidence` block held prose or a pending bar acquired a pull request of its own.
