# devops — how is it stood up and kept running?

**This hat was empty until recently, and is no longer.** Four decisions now route here — all of
them about how work reaches `main` rather than about infrastructure, because this project still
ships none of its own (`DEC-017`).

**Nothing below is attested** (`DS-ATTESTED-TRUTH`).

## Infra Architecture

**Nothing is provisioned.** The tree holds no infrastructure-as-code, no deploy target and no
hosted service; the only infrastructure-shaped files are two GitHub workflows, a Nix flake and an
`act` config (`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`, `flake.nix`,
`.actrc`). What ships is a CLI package. The four decisions routed here govern **where work and
synthesis run**, not anything stood up.

```
  operator machine                        GitHub                       distribution
  ────────────────                        ──────                       ────────────
  checkout of main                        PR opsp/<initiative> → main  npm  @ivan-lee/opensprint
   └─ worktree opsp/<initiative>  ─push─▶  │                            (no pipeline here
        agent + model:                     ▼                             publishes it)
        plan · render · seal          Actions: ci.yml
        views at each milestone        test · lint · nix build     Nix  flake.nix
                                       artifacts: coverage/ (7 d)        packages · apps · devShell
```

*Left column decided (`DEC-029`, `DEC-COMPILE-ON-MILESTONE`); middle and right observed
(`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`, `flake.nix`).*

### Where work runs — decided

- **An initiative is one worktree on one branch, from its first persisted thought.**
  `/opsp:backlog`, `/opsp:triage` and `/opsp:propose` create or switch to the worktree rather than
  leaving it to the operator, and the branch reaches `main` exactly once (`DEC-029`, `DEC-030`).
- **The cost is unsolved, and the record says so.** The backlog is scattered across branches, so
  the compiled board shows only what the current branch knows; cross-branch listing is recorded as
  blocking the stakeholder path, and record-id collisions widen back out (`DEC-029`).
- **Rendering a view runs where the agent is, never in a pipeline.** Rendering is synthesis and
  needs a model; CI "has no agent, and no hat", so it is ruled out as a place to compile
  (`DEC-COMPILE-ON-MILESTONE`).
- **Evidence lives in the pipeline.** An `### Evidence` block references an artifact a pipeline run
  produced, addressable from the pull request; prose is not evidence (`DEC-032`).

### The package — observed

- `@ivan-lee/opensprint` 0.0.9, ESM, one binary `opensprint` mapped to `./bin/openspec.js`,
  published with public access, Node `>=20.19.0`. It ships `dist`, `bin`, `schemas` and
  `scripts/postinstall.js`, and runs that script on install (`package.json`).
- **One pnpm major everywhere.** `packageManager` is `pnpm@9.15.9` (`package.json`); CI sets up
  pnpm `9` (`.github/workflows/ci.yml`); the flake builds with `pnpm_9` (`flake.nix`). The lockfile
  still declares `lockfileVersion: '6.0'` (`pnpm-lock.yaml`).
- **Node differs by place.** CI runs Node 20 (`.github/workflows/ci.yml`), the flake `nodejs_20`
  (`flake.nix`), the release workflow Node 24 for npm OIDC (`.github/workflows/release-prepare.yml`).

### The Nix flake — observed

- Builds `packages.default` for x86_64/aarch64 Linux and Darwin, reading its version from
  `package.json`; dependencies come from `fetchPnpmDeps` against a **fixed hash**, then
  `pnpm run build` (`flake.nix`). `scripts/update-flake.sh` recomputes that hash after a lockfile
  change (`scripts/update-flake.sh`).
- `mainProgram` and `apps.default` point at `bin/opensprint`; a dev shell provides `nodejs_20` and
  `pnpm_9` (`flake.nix`).
- **Half renamed.** The derivation's `pname` is still `openspec`, its description still reads
  "OpenSpec - AI-native system for spec-driven development", `homepage` is
  `https://github.com/Fission-AI/OpenSpec`, and the dev shell greets "OpenSpec development
  environment" (`flake.nix`). No record explains either the rename or what it left behind —
  undocumented, not wrong.

### Running CI locally — observed

- `.actrc` maps `ubuntu-latest` to `catthehacker/ubuntu:act-latest` so the workflows can be run with
  `act` (`.actrc`, `.github/workflows/README.md`).

## GitOps

### The flow to `main` — decided

```
  opsp/<initiative>  ──rebase──●──attest──●──archive──●──▶  main      one PR
        ▲
        └── each milestone: plan → render stale dev/devops sections → seal --hat
```

- **One pull request per initiative, in a fixed order:** rebase onto `main` so the compile sees the
  record set the merge will produce, attest on the open PR, archive (which consumes compact), merge
  (`DEC-030`). Planning happens on that same branch, so it arrives by PR too (`DEC-029`).
- **The `opsp/* → main` PR is gated on state consistency** — the initiative `attested`, the compiled
  views fresh — and **never on whether a bar was met** (`DEC-030`).
- **A conflict in a derived artifact is resolved by rebasing and recompiling,** never by hand-merging;
  concurrent initiative merges serialize on derived artifacts, by design (`DEC-030`).
- **Views are recompiled inside `/opsp:apply` at each milestone boundary,** after the change branch
  merges into the initiative branch: only sections `plan` reports stale, `dev` and `devops` without
  asking, sealed scoped to the hat; `product` and `maintainer` are offered, and accepting is a
  context switch (`DEC-COMPILE-ON-MILESTONE`). Archive still compiles everything (`DEC-030`,
  `DEC-COMPILE-ON-MILESTONE`).
- **Evidence is a reference to a pipeline artifact,** and one that does not resolve is harvested. A
  bar that cannot be assessed pre-merge — a change to the pipeline itself — is attested
  `posture: pending` with an exposure, and re-attested by the next initiative touching the area; it
  never earns a PR of its own (`DEC-032`).

### The pipelines — observed

```
  trigger                     job (workflow)                         produces
  ─────────────────────────   ────────────────────────────────────   ─────────────────────────
  pull_request → main         test_pr        ubuntu, Node 20         coverage-report-pr  (7 d)
  merge_group  → main         lint           tsc --noEmit + eslint
                              nix-flake-validate *
                              validate-changesets   (not required)
                              required-checks-pr ◀ test_pr·lint·nix
  push → main                 test_matrix    linux-bash ·            coverage-report-main (7 d)
                                             macos-bash ·
                                             windows-pwsh
                              lint · nix-flake-validate *
                              required-checks-main
  push → main                 prepare (release-prepare.yml)          version PR · npm publish
                              if repo == Fission-AI/OpenSpec         → never runs in this repo
  workflow_dispatch           jobs with no event condition: changes · lint · nix *

  * only when flake.nix, flake.lock, package.json, pnpm-lock.yaml,
    scripts/update-flake.sh or ci.yml changed
```

*All rows observed (`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`).*

- **CI runs only against `main`** — PRs and merge-queue entries targeting it, and pushes to it.
  Nothing runs on `opsp/*` or change branches until their PR to `main` opens
  (`.github/workflows/ci.yml`).
- **The test and lint jobs install `--frozen-lockfile` and build** with pnpm 9 and Node 20; CI
  holds `contents: read` and cancels superseded runs per ref (`.github/workflows/ci.yml`).
- **Nix validation** builds the flake, requires `result/bin/opensprint`, runs
  `nix run . -- --version`, then runs `scripts/update-flake.sh` and reports — but does not fail on —
  a changed `pnpmDeps` hash, restoring `flake.nix` afterwards. The required-checks jobs accept it as
  `skipped` (`.github/workflows/ci.yml`).
- **Changeset validation does not gate.** `validate-changesets` is outside both required-checks
  jobs' `needs`, skips itself when `changeset` is not on the path, and no `.changeset/` directory is
  tracked (`.github/workflows/ci.yml`).
- **No environment is reached.** CI's only outputs are coverage artifacts kept seven days
  (`.github/workflows/ci.yml`). The release workflow — GitHub App token, Changesets version PR,
  `pnpm run release:ci` publishing via npm OIDC — is guarded to `Fission-AI/OpenSpec` and so never
  runs for `@ivan-lee/opensprint` (`.github/workflows/release-prepare.yml`, `package.json`). No
  pipeline in the tree publishes this package.

### Where observation and record disagree — surfaced, not resolved

- **The state gate exists only on paper.** `DEC-030` decides that an `opsp/* → main` PR is gated on
  fresh views and an `attested` initiative. No workflow runs `opensprint compact check` or inspects
  initiative state, and `required-checks-pr` needs only `test_pr`, `lint` and `nix-flake-validate`
  (`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`). `docs/git-workflow.md`
  recommends `compact check` as a required check, sketches a workflow for it, and says no command
  checks `attested` state yet, leaving it to the reviewer (`docs/git-workflow.md`).
- **Evidence may outlast what it points at.** `DEC-032` makes evidence a
  reference to a pipeline artifact and harvests one that stops resolving; the only artifacts CI
  produces are coverage reports retained for seven days (`.github/workflows/ci.yml`).

## Open Loops

- **`decision-unguarded` — `DEC-032`** (shared with `dev`). No rule cites the decision that evidence
  is a CI artifact reference and that pipeline-only bars ride the next initiative, so nothing would
  fail if an `### Evidence` block held prose or a pending bar acquired a pull request of its own.
