# devops — how is it stood up and kept running?

## Infrastructure Architecture

**None, and that is a decision rather than a gap.**

Nothing is provisioned. The infrastructure globs match no file in this repository — no terraform,
no terragrunt, no compose, no Dockerfile. OpenSprint orchestrates work inside other people's
repositories, and those repositories already have infrastructure; shipping one would mean owning a
deployment story for projects we do not control (`DEC-017`).

The absence follows from not competing with provider tooling and optimising instead for speed of
evolution (`DS-SELF-USE-SCOPE`). If this repository ever acquires infrastructure of its own, this
section stops being correct and becomes a real gap.

## GitOps

Two workflows, both on GitHub Actions (`.github/workflows/`).

```
   feature branch                main
        │                          │
        ├──► pull_request ────────►│   ci.yml
        │      full gate           │     install · build · test · typecheck · lint
        │                          │     changed-file detection gates the Nix job
        │                          │
        └──── merge ──────────────►│
                                   │
                                   ├─► ci.yml            again, on push
                                   │
                                   └─► release-prepare.yml
                                         changesets prepares the version bump
```

| Workflow | Triggers | Does |
|---|---|---|
| `ci.yml` | `pull_request` to main, `push` to main | the full gate, with concurrency cancelling superseded runs |
| `release-prepare.yml` | `push` to main | prepares a release via changesets |

**No environments and no deploys.** There is nothing to promote to: the artifact is an npm
package, and a published package is static (`DS-BACKWARD-COMPAT`). The pipeline's job ends at
preparing a version, not at moving bytes into a running system.

The CI matrix runs ubuntu, macOS and Windows, which is what `DS-SQUAD-HATS`' cross-platform
requirement is actually enforced by — every path constructed with `path.join`, every hash sorted
and line-ending normalised so a manifest written on one platform matches another.

## Open Loops

**This hat has no records.** Both sections above are observation with nothing decided behind them
except `DEC-017`, which explains the absence of infrastructure rather than describing a pipeline.

- **No decision records the CI design.** Which gates run, why the matrix covers three platforms,
  why release is changesets-based — all observed from `.github/workflows/`, none recorded.
- **No `devops` record exists at all**, so this hat has no owner, no charter, and nothing to
  escalate to. For a project that ships an npm package and nothing else, that is proportionate —
  but it is the seat at the table nobody sits in.
