# dev — how is it built?

Describes **the system**, citing decisions where they explain a choice and paths where they were
observed. Thirty-seven decisions feed this hat; none of them are enumerated here, because a list of
condensed ADRs tells a reader nothing about what was built (`DS-BIG-PICTURE`).

**Nothing below is attested.** Claims citing a path are *observed* — true of the code today, and
possibly accidental. Claims citing a record are *decided* — binding, and not necessarily true yet
(`DS-ATTESTED-TRUTH`).

## Tech Stack

**TypeScript on Node ≥20.19.0, ESM, distributed via npm as `@ivan-lee/opensprint`**
(`package.json`, `tsconfig.json`). The binary is `opensprint`.

Commander.js for the CLI, Zod for validation, chalk and ora for terminal output, fast-glob for file
matching, `yaml` for parsing (`package.json`). Vitest for tests, with `pool: 'forks'` for process
isolation and at most four workers (`vitest.config.ts`).

**No server and no persistent store.** The CLI runs once per invocation; durable state is markdown
with YAML frontmatter, read from the working tree. That is what makes the surrogate diffable,
mergeable and reviewable by the same tools as the code (`DEC-001`).

Two GitHub Actions workflows: a full gate on pull request and push, and changesets release
preparation (`.github/workflows/`).

## Runtime Topology

**The deterministic/synthetic split is the load-bearing structure.** Grouping, hashing, staleness,
gating and harvesting live in code so they can be verified without a model; condensing prose lives
in a skill. Neither half computes the other's answer (`DEC-010`, `DEC-014`).

```
  RECORDS                     src/core/
  driver-specs/ ADRs/           decision-map.ts      parses records, builds the tree
  initiatives/                  initiatives.ts       parses initiatives and their state
        │                       hats.ts              registry, roles, objectives, validation
        │
        ▼                     src/core/compact/
  DETERMINISTIC                 records.ts   sections.ts   measures.ts
  stage · hash · gate           manifest.ts  status.ts     rules.ts
        │                       loops.ts     edges.ts      amend.ts
        │                     src/core/board.ts            renders BOARD.md
        ▼
  SYNTHETIC                   src/core/templates/workflows/
  condense prose                15 OPSP workflows + the opsx cycle
        │
        ▼
  COMPILED ARTIFACTS          squad/*.md  architecture.md  DECISION-MAP.md  BOARD.md
```

`DECISION-MAP.md` and `BOARD.md` are generated entirely by code — no skill in the loop — which is
why they are regenerated rather than sealed and staleness-gated (`DEC-026`). The hat views and
`architecture.md` are rendered by a skill and therefore carry a provenance manifest that fails the
build on drift (`DEC-010`).

**One compile engine.** `/opsp:compact` is the only thing that compiles a view, and `/opsp:archive`
consumes it rather than reimplementing it (`DEC-014`, `DEC-031`). A compacted view is always **one
hop from the record** — no derived artifact compiles from another (`DEC-011`).

**Three write modes** (`DEC-027`): *create* a record (`/opsp:decide`, `/opsp:driver`,
`/opsp:propose`), *derive* an artifact (`/opsp:compact`, `/opsp:archive` — which never write a
record, `DEC-006`), and *amend* one named section (`/opsp:attest`, bounded to `## Measures` and
checked by `amend.ts`).

**Parallelism is git.** An initiative is a worktree with its own copy of `opensprint/`, so two can
run concurrently and disagree; reconciliation traverses depth-first with the initiative as the unit
of commitment, behind a mandatory read-only planning phase (`DEC-001`, `DEC-003`, `DEC-004`).

## Entity Schema

No database. The durable entities are files, and their schema is frontmatter plus named sections.

| Entity | Lives in | Identified by | Carries |
|---|---|---|---|
| driver-spec | `driver-specs/*.md` | `id`, semantic | `type`, `status`, `hats`, `role` (list), `objective`, `depends-on` |
| decision | `ADRs/*.md` | `id` | `status`, `depth`, `depends-on`, `supersedes`, `hats` — **never a role** (`DEC-028`) |
| initiative | `initiatives/*.md` | `id`, resolved before filename | `status`, `state`, `depends-on`, milestones, membership |
| measure | a record's `## Measures` | — | `### Bar` · `### Posture` · `### Evidence` · `### Exposure` |

**The relationships are the schema.** `depends-on` forms the decision tree, which is what makes
blast radius computable (`DEC-009`). A record declares one or more hats (`DEC-016`); a decision is
*owned* by `dev` or `devops` and may cc others (`DEC-028`).

**Identity is deliberately decoupled from filename.** Both readers take `id` from frontmatter and
use the filename only to sort — which is what lets decisions adopt semantic ids and initiatives
carry date prefixes without touching a single caller (`DEC-036`). Existing `DEC-001`–`DEC-039` keep
their numbers permanently; an id that changes is not an id.

**Everything optional is additive.** `role` accepts a string or a list; `objective`, `heading` and
every measure sub-block may be absent. A record written by an earlier release still parses
(`DS-BACKWARD-COMPAT`).

## Open Loops

**Harvested:** `decision-unguarded` — **DEC-005**, **DEC-008**, **DEC-013**, **DEC-015**,
**DEC-017**, **DEC-029**, **DEC-030**, **DEC-031**, **DEC-032**, **DEC-034**, **DEC-035**,
**DEC-037**, **DEC-038**, **DEC-039**. Fourteen decisions no rule cites.

**Structural:**

- **Eleven of the fourteen unguarded decisions were written in one initiative.** They describe
  behaviour that was built, but no test cites them by id — so the loop that would catch their
  implementation being removed is open.
- **Every decision in the project routes here or to `devops`.** That is `DEC-028` working as
  intended, and it means this hat answers questions it did not ask.
- **The three sections share an input set.** `tech-stack`, `runtime-topology` and `entity-schema`
  all take every decision this hat owns, so any new ADR restages all three. Granularity that
  `DEC-010` exists to provide is not being used here.
