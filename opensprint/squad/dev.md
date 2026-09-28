# dev — how is it built?

## Tech Stack

A **TypeScript CLI on Node**, distributed through npm. Node `>=20.19.0`, ESM modules, compiled
with `tsc` (`package.json`, `tsconfig.json`). The toolchain choice is not recorded as a decision
in this repository — it predates the surrogate.

Nine runtime dependencies, each doing one job (`package.json`):

| | |
|---|---|
| `commander` | the CLI surface — every command registers here |
| `zod` | schema validation, used for both project config and record shapes |
| `yaml` | frontmatter and schema parsing |
| `fast-glob` | rule discovery and observation, with directory pruning (`DEC-013`) |
| `chalk` · `ora` | terminal output |
| `@inquirer/*` | prompts, imported dynamically — static imports hang the pre-commit hook |
| `posthog-node` | command-name telemetry |

`pnpm` is the package manager, pinned by `pnpm-lock.yaml`. Both a `pnpm-lock.yaml` and a
`package-lock.json` are present, which is a small inconsistency rather than a decision.

## Runtime Topology

There is no server. The CLI runs once per invocation and exits; everything else is files on disk.

```
   operator / agent
         │
         ▼
   bin/openspec.js ──► dist/cli/index.js        commander registers every command
         │
         ├──► commands/          change · spec · validate · compact · workflow
         │
         └──► core/
                ├─ compact/      sections · records · manifest · status · rules · loops · edges
                ├─ hats.ts       registry, roles, validation
                ├─ decision-map  tree, blast radius
                └─ templates/    14 OPSP workflow templates, compiled into skills at init

   reads                          writes
   ─────                          ──────
   opensprint/driver-specs/       opensprint/squad/*.md        via the skill
   opensprint/ADRs/               opensprint/squad/.manifest.json  via `compact seal`
   openspec/config.yaml           opensprint/architecture.md   via the skill
   the project's source           (nothing else)
```

**The split that matters is deterministic versus synthetic.** Grouping, hashing, staleness and
gating live in code so they can be verified without a model in the loop; writing condensed prose
lives in a skill. `compact plan` reports what is stale, the skill renders, `compact seal` records,
`compact check` gates — and neither half computes the other's answer (`DEC-010`, `DEC-014`).

Universes are git worktrees, so concurrency needs no runtime of its own: `git worktree add`
produces an independent tree and the surrogate travels in the branch (`DEC-001`).

## Entity Schema

**No persistent data store.** The durable state is markdown files with YAML frontmatter, and the
only structured schemas are Zod validators over parsed content (`src/core/schemas/*.schema.ts`) —
scenario, requirement, spec and change shapes.

The one machine-written file is `opensprint/squad/.manifest.json`: per hat and per section, the
record ids and content hashes a section was compiled from, the observed files with theirs, the
combined input hash, and the rendered output hash (`DEC-010`).

The record graph is the real data model, and it has two layers that do not mix:

```
   driver-specs      depends-on ──► driver-specs        the OGSM layer (DEC-016)
        ▲
        │ depends-on
   ADRs ─────────────────────────► ADRs                 the decision layer

   DECISION-MAP.md builds from ADR edges only; driver-spec edges never appear in it.
```

## Open Loops

**Harvested** (`DEC-013`): five of sixteen active decisions have no rule citing them —
`DEC-005`, `DEC-008`, `DEC-013`, `DEC-015`, `DEC-017`.

`DEC-013` is worth noticing: the decision that harvests rule links is not itself named by one.

**Structural:**

- **The toolchain is undocumented as a decision.** TypeScript, Node, ESM, pnpm and the nine
  dependencies are all observed from manifests, and no ADR explains any of them. Not wrong — they
  predate the surrogate — but the tech stack above is almost entirely observation with nothing
  decided behind it.
- **Two lockfiles.** `pnpm-lock.yaml` and `package-lock.json` both present.
