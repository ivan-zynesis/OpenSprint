# devops — how is it stood up and kept running?

**This hat was empty until recently, and is no longer.** Four decisions now route here — all of
them about how work reaches `main` rather than about infrastructure, because this project still
ships none of its own (`DEC-017`).

**Nothing below is attested** (`DS-ATTESTED-TRUTH`).

## Infra Architecture

Among the files read, nothing provisions a server, a cloud resource or an environment. What this
project builds is an npm package and a Nix flake output, and what it runs on is GitHub Actions
runners and the operator's own worktrees. Nothing below is attested.

```
  [D] = decided (record id)      [O] = observed (path)

  operator machine                              GitHub Actions
  ────────────────                              ──────────────
  opsp/<initiative> worktree  [D] DEC-029        ci.yml               [O]
    planning + implementation                     test · lint · nix · changesets
    agent renders dev/devops views                (ubuntu; macOS + windows on push)
    at milestone boundaries                              │
    [D] DEC-COMPILE-ON-MILESTONE                         │ push to main
                                                         ▼
  act, ubuntu image only  [O] .actrc            release-prepare.yml  [O]
                                                  guarded to Fission-AI/OpenSpec
                                                         │
                                                         ▼
                                                npm registry, OIDC   [O]
```

### Where work and compilation run — decided

Planning and implementation are decided to happen in the initiative's own worktree, and
`/opsp:backlog`, `/opsp:triage` and `/opsp:propose` are decided to create or switch to that worktree
themselves, so an initiative is one branch from its first persisted thought (`DEC-029`). The record
names its own unsolved cost: backlog items are scattered across branches, so the board shows only
what the current branch knows (`DEC-029`).

Rendering a compiled view is decided to happen in the agent, at each milestone boundary inside
`/opsp:apply`, for the `dev` and `devops` sections `compact plan` reports stale; product and
maintainer are offered, not compiled silently (`DEC-COMPILE-ON-MILESTONE`). CI is ruled out as the
place to render, because rendering is synthesis and a pipeline has no agent and no hat
(`DEC-COMPILE-ON-MILESTONE`). The pipeline's decided role is to check views, not produce them
(`DEC-030`).

### The package — observed

- **Identity**: `@ivan-lee/opensprint` at version `0.1.0`, published with `access: public`
  (`package.json`).
- **Binary**: one, `opensprint`, mapped to `./bin/openspec.js` (`package.json`).
- **Runtime**: Node `>=20.19.0` (`package.json`).
- **Build**: `node build.js`; `prepare` and `prepublishOnly` both rebuild, and a `postinstall` runs
  `scripts/postinstall.js` (`package.json`).
- **Release script**: `release:ci` runs `check:pack-version` (`scripts/pack-version-check.mjs`) and
  then `changeset publish` (`package.json`).
- **Package manager**: `packageManager: pnpm@9.15.9` is the only place the pnpm version is stated
  for CI — no `pnpm/action-setup@v4` step in either workflow passes `version:`, so the action reads
  it from `package.json` (`package.json`, `.github/workflows/ci.yml`,
  `.github/workflows/release-prepare.yml`).
- **Lockfile**: the header reads `lockfileVersion: '6.0'` (`pnpm-lock.yaml`).

### The Nix flake — observed

- One `default` package per system for `x86_64-linux`, `aarch64-linux`, `x86_64-darwin` and
  `aarch64-darwin` (`flake.nix`).
- Version is read from `package.json`, so it follows `0.1.0` with no edit (`flake.nix`).
- Dependencies are fetched with `pkgs.pnpm_9` (`fetcherVersion = 3`) against a fixed hash, and the
  build runs `pnpm run build` under `nodejs_20` and `pnpm_9` (`flake.nix`).
- `meta.mainProgram` is `opensprint`, and the `default` app runs `.../bin/opensprint` (`flake.nix`).
- The dev shell provides `nodejs_20` and `pnpm_9` (`flake.nix`).
- The hash is maintained by `scripts/update-flake.sh`: it writes a placeholder hash, runs
  `nix build` to make it fail, extracts the `got:` hash, writes that back, and rebuilds to verify
  (`scripts/update-flake.sh`).
- Naming residue: `pname` is still `openspec`, and the description, `homepage`
  (`Fission-AI/OpenSpec`) and shell banner still say OpenSpec, while the binary is `opensprint`
  (`flake.nix`). No record read here explains either name.

### Running CI locally — observed

`.actrc` maps `ubuntu-latest` to `catthehacker/ubuntu:act-latest`, the image `act` uses (`.actrc`).
Only that label is mapped. The `macos-latest` and `windows-latest` legs of the push matrix have no
local image (`.actrc`, `.github/workflows/ci.yml`).

## GitOps

Two workflows exist (`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`). What they
run is observed. How work reaches `main` is decided. They do not fully agree, and the gaps are
listed at the end. Nothing below is attested.

### The flow to `main` — decided

```
  /opsp:backlog | /opsp:triage | /opsp:propose
        │  create or switch to the worktree                     DEC-029
        ▼
  opsp/<initiative> ── change branches merge in ──┐
        │  milestone boundary: compile stale        │           DEC-COMPILE-ON-MILESTONE
        │  dev + devops sections                    │
        ▼                                           │
  rebase onto main ──▶ attest ──▶ archive ──▶ merge             DEC-030
                                                │
        gate: initiative `attested` + views fresh
              never "was the bar met"                           DEC-030
```

- **One pull request per initiative.** An initiative is decided to reach `main` exactly once, by
  one PR, with nothing committed to `main` directly (`DEC-029`, `DEC-030`).
- **The order is decided**: rebase onto `main`, then attest, then archive, then merge. Rebasing
  first is decided so that archive compiles against the record set the merge will produce
  (`DEC-030`).
- **The gate is decided**: a PR merging `opsp/*` into `main` is gated on the initiative being
  `attested` and the compiled views being fresh. It is never gated on whether a bar was met
  (`DEC-030`).
- **Derived-artifact conflicts** are decided to be resolved by rebasing and recompiling, never by
  hand-merging, and concurrent initiative merges are decided to serialize on them (`DEC-030`).
- **Evidence** is decided to be a reference to an artifact a pipeline run produced, addressable from
  the PR. A reference that does not resolve is harvested, not assumed good (`DEC-032`).
- **The pipeline exemption**: a bar that cannot be assessed before merge is attested
  `posture: pending` with an exposure. It is re-attested by the next initiative that touches the
  area and never gets a PR of its own (`DEC-032`).
- **Views are rendered by the agent, not the pipeline** (`DEC-COMPILE-ON-MILESTONE`).

### The pipelines — observed

`ci.yml` triggers on `pull_request` and `merge_group` into `main`, on `push` to `main`, and on
`workflow_dispatch`. It runs with `contents: read` and cancels in-progress runs per ref
(`.github/workflows/ci.yml`).

| Job | Runs when | Does |
|---|---|---|
| `changes` | always | `dorny/paths-filter@v3`: `nix` is true when `flake.nix`, `flake.lock`, `package.json`, `pnpm-lock.yaml`, `scripts/update-flake.sh` or `ci.yml` change |
| `test_pr` | PR, merge group | ubuntu, Node 20: `pnpm install --frozen-lockfile`, build, `pnpm test`; uploads `coverage-report-pr`, kept 7 days |
| `test_matrix` | push | the same steps on `linux-bash`, `macos-bash` and `windows-pwsh`; uploads `coverage-report-main` from ubuntu, kept 7 days |
| `lint` | always | build, `tsc --noEmit`, `pnpm lint`, then asserts `dist/cli/index.js` exists |
| `nix-flake-validate` | `nix` changed | Determinate installer v21 and magic cache v13; `nix build`; asserts `result/bin/opensprint`; `nix run . -- --version` must be non-empty; runs `scripts/update-flake.sh`, shows any `flake.nix` diff, then restores it |
| `validate-changesets` | PR, merge group | runs `pnpm exec changeset status --since=origin/main` only if `changeset` is on `PATH`; otherwise prints a skip |
| `required-checks-pr` | PR, merge group | passes only if `test_pr` and `lint` succeeded and `nix-flake-validate` succeeded or was skipped |
| `required-checks-main` | push | the same, over `test_matrix` |

(`.github/workflows/ci.yml`)

`validate-changesets` is not among the jobs either aggregate depends on (`.github/workflows/ci.yml`).

`release-prepare.yml` triggers on `push` to `main`. It runs with `contents: write`,
`pull-requests: write` and `id-token: write`, and never cancels an in-progress run. Its one job runs
only when `github.repository == 'Fission-AI/OpenSpec'`. It mints a GitHub App token, sets up Node 24
and pnpm, installs, and runs `changesets/action@v1`. That action opens or updates a
`chore(release): version packages` PR, and when that PR merges it publishes through
`pnpm run release:ci` with npm OIDC trusted publishing (`.github/workflows/release-prepare.yml`,
`package.json`).

**The pnpm version has one source.** Every `pnpm/action-setup@v4` step in both workflows passes no
`version:`, so the action reads `packageManager: pnpm@9.15.9` (`.github/workflows/ci.yml`,
`.github/workflows/release-prepare.yml`, `package.json`). Node versions differ by purpose: 20 in
every `ci.yml` job, 24 for release because of the npm OIDC requirement, `nodejs_20` in the flake,
and `>=20.19.0` in `engines` (`.github/workflows/ci.yml`, `.github/workflows/release-prepare.yml`,
`flake.nix`, `package.json`).

No workflow renders a compiled view (`.github/workflows/ci.yml`,
`.github/workflows/release-prepare.yml`). That matches the decision that rendering does not run in
CI (`DEC-COMPILE-ON-MILESTONE`).

### Where observation and record disagree — surfaced, not resolved

- **The merge gate is decided and does not exist in CI.** `DEC-030` decides that an `opsp/* → main`
  PR is gated on state consistency: the initiative is `attested` and the views are fresh. No
  workflow runs `opensprint compact check` or any attested-state check. `required-checks-pr`
  aggregates only `test_pr`, `lint` and `nix-flake-validate` (`.github/workflows/ci.yml`,
  `.github/workflows/release-prepare.yml`). `docs/git-workflow.md` recommends `compact check` as a
  required check and says no command performs the attested-state check yet, which leaves it to the
  reviewer (`docs/git-workflow.md`). The minimal `opensprint.yml` pipeline that document suggests is
  not present in `.github/workflows/`. Branch protection cannot be observed from repository files.
- **Evidence lifetime.** `DEC-032` decides evidence is a CI artifact addressable from the PR, and
  harvests a reference that does not resolve. The only artifact a PR run uploads is
  `coverage-report-pr`, with `retention-days: 7` (`.github/workflows/ci.yml`). The record states no
  retention.

### Observed, no record explains it

- **The release job is guarded to the upstream repository.** `release-prepare.yml` runs only where
  `github.repository == 'Fission-AI/OpenSpec'`, while the package is `@ivan-lee/opensprint`
  (`.github/workflows/release-prepare.yml`, `package.json`). In any repository with another name the
  job is skipped. No record read here decides how this package is released.
- **Lockfile format against pinned pnpm.** The lockfile header is `lockfileVersion: '6.0'`, while
  `packageManager` pins `pnpm@9.15.9` and the flake uses `pnpm_9` (`pnpm-lock.yaml`, `package.json`,
  `flake.nix`). CI installs with `--frozen-lockfile` (`.github/workflows/ci.yml`).
- **Changeset validation is conditional and not required.** It runs only if `changeset` resolves on
  `PATH`, and no aggregate check depends on it (`.github/workflows/ci.yml`).

## Open Loops

- **`decision-unguarded` — `DEC-032`** (shared with `dev`). No rule cites the decision that evidence
  is a CI artifact reference and that pipeline-only bars ride the next initiative, so nothing would
  fail if an `### Evidence` block held prose or a pending bar acquired a pull request of its own.
