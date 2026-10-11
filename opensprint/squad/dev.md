# dev — how is it built?

Describes **the system**, citing decisions where they explain a choice and paths where they were
observed. Thirty-seven decisions feed this hat; none of them are enumerated here, because a list of
condensed ADRs tells a reader nothing about what was built (`DS-BIG-PICTURE`).

**Nothing below is attested.** Claims citing a path are *observed* — true of the code today, and
possibly accidental. Claims citing a record are *decided* — binding, and not necessarily true yet
(`DS-ATTESTED-TRUTH`).

## Tech Stack

OpenSprint is a TypeScript command-line tool published as `@ivan-lee/opensprint` 0.0.9, exposing one binary, `opensprint`, which runs `bin/openspec.js` (`package.json`). Everything below is **observed** from the manifests unless a record id is cited. No record explains why the project uses TypeScript or Node; the stack was never decided in a record, and this view does not supply a reason.

| Layer | What is used | Authority |
|---|---|---|
| Language | TypeScript 5.9, `strict`, target ES2022, `module`/`moduleResolution` NodeNext, compiled from `src/` to `dist/` with declarations and source maps | observed — `tsconfig.json`, `package.json` |
| Runtime | Node `>=20.19.0`, ES modules (`"type": "module"`) | observed — `package.json` |
| Package manager | pnpm 8.15 (`packageManager`). Both `pnpm-lock.yaml` and `package-lock.json` are checked in; no record says which one is authoritative | observed — `package.json`, `pnpm-lock.yaml`, `package-lock.json` |
| CLI framework | `commander` 14 | observed — `package.json`, `src/cli/index.ts` |
| Validation | `zod` 4 | observed — `package.json`, `src/core/schemas/` |
| Record format | Markdown with YAML frontmatter, parsed with `yaml` 2 | observed — `package.json`, `opensprint/ADRs/`, `opensprint/driver-specs/` |
| Terminal UX | `chalk`, `ora`, `@inquirer/prompts` + `@inquirer/core` | observed — `package.json` |
| File discovery | `fast-glob` | observed — `package.json` |
| Telemetry | `posthog-node`, under `src/telemetry/` | observed — `package.json`, `src/telemetry/` |
| Build / test / lint | `node build.js`; `vitest` 3; `eslint` 9 with `typescript-eslint` | observed — `package.json`, `build.js` |
| Release | `@changesets/cli`, gated by `check:pack-version` | observed — `package.json` |

**The product surface.** The product is the CLI plus the skill and command files it generates into a downstream project. There is no GUI, and the tool ships no CI/CD product of its own (`DEC-017`). Those generated files are written by per-tool adapters: 26 of them, matching the count `DEC-017` records, plus an index (observed — `src/core/command-generation/adapters/`).

**The CLI command surface** (observed — `src/cli/index.ts`) falls into two groups:

- *Inherited OpenSpec commands*: `init`, `update`, `list`, `view`, `change {show,list,validate}`, `archive`, `validate`, `show`, `status`, `instructions`, `templates`, `schemas`, `new change`, `completion`, `feedback`.
- *OpenSprint's deterministic half*: `compact {plan, seal, check, loops, board}`, `advance`, `frame` and `migrate`. Each one answers a decision:
  - `compact`: the single compile engine (`DEC-014`), with its manifest and gate (`DEC-010`). `seal` takes a repeatable `--hat` (`DEC-SCOPED-SEAL`).
  - `advance`: initiative transitions are performed by a command, never by prose (`DEC-STATE-MACHINE`). It takes `--hat`, which a handoff requires (`DEC-HAT-HANDOFFS`).
  - `frame`: the change frame attest resolves before it reads a bar, with `--base` as the first rule in base resolution (`DEC-ATTEST-CHANGE-FRAME`).
  - `migrate`: detects records that the current hat shapes can no longer select (`DEC-MIGRATE-SEPARATE-TOOL`).

**A naming difference to note.** `DEC-010` writes the gate as `opensprint compact --check`. The observed surface is a `check` subcommand (`src/cli/index.ts`), which is the form `DEC-023` and `DEC-030` use. This view does not decide which spelling is correct.

## Runtime Topology

OpenSprint has no server, daemon or hosted component. It runs as a short-lived CLI process alongside a coding agent in the operator's terminal (`DEC-017`). There are no agent-to-agent network calls; the only outbound traffic observed is usage telemetry (`src/telemetry/`). How each part is labelled below:

- A claim citing a record id is **decided**.
- A claim citing a path is **observed**.
- Nothing in this section is **attested**.

### Two halves, one process boundary

```
  operator (wearing one hat at a time) + coding agent, in a terminal
          |
          | invokes generated skills: /opsp:* and /opsx:*        (DEC-017)
          v
  +-------------------- synthetic half: a model ---------------------+
  | explore, backlog, triage, propose, apply, attest, archive,       |
  | compact rendering: drafts records, judges bars, condenses views  |
  +------------------------------------------------------------------+
          |  shells out to
          v
  +------------- deterministic half: `opensprint` CLI ---------------+
  | compact plan | seal | check | loops | board,  advance,  frame,   |
  | migrate: hashing, staleness, transitions, harvest. No model.     |
  +------------------------------------------------------------------+
          |  reads and writes plain files
          v
  opensprint/  +  openspec/   in the current git worktree (= one universe)
```

**The split is decided.** Grouping, hashing, staleness and gating live in code, so they can be verified without a model. Condensing prose lives in a skill (`DEC-022`).

**Consequences of the split:**

- CI can run `compact check`, but it can never render a view, because rendering needs a model and a hat (`DEC-COMPILE-ON-MILESTONE`, `DEC-010`).
- Attestation is a human judgement, so it sits outside the compile engine as its own tool (`DEC-022`).
- Observed: the compact skill drives the CLI through `opensprint compact plan --json` and `seal` (`.claude/skills/opensprint-compact/SKILL.md`).

**What explore and apply load.** They still load the full driver-specs and ADRs, not these views. Switching the read path to the views is deferred until the views are proven against real work (`DEC-015`).

### Universes are worktrees, and an initiative is one branch

```
  main  <---- one PR per initiative, gated on state consistency:          (DEC-030)
   ^          initiative `attested`  AND  compiled views fresh
   |          never gated on whether a bar was met                         (DEC-023)
   |
   |   rebase onto main -> attest -> archive (consumes compact) -> merge
   |
  opsp/<initiative>   worktree created by /opsp:backlog, triage or propose  (DEC-029)
   ^
   |   change branch merges in at each milestone boundary;
   |   dev + devops sections recompiled there, scoped seal       (DEC-COMPILE-ON-MILESTONE)
  change branch ...
```

- **Worktrees are universes.** Each worktree is a universe, and `opensprint/` travels inside its branch with no separate storage layer (`DEC-001`).
- **Planning starts in the worktree.** Planning happens in the initiative's own worktree from the first persisted thought. The planning tools create or switch to that worktree themselves (`DEC-029`).
- **One known cost is unsolved.** The backlog is scattered across branches, so the board shows only what the current branch knows (`DEC-029`).
- **Conflicts in derived files are never hand-merged.** A conflict in a derived artifact is resolved by rebasing and recompiling. Concurrent initiative merges therefore serialize on the compiled files (`DEC-030`).

### Compile occasions

`compact` is the single compile engine. `architecture.md` is a sibling output of it, not an input (`DEC-014`). It never writes a record (`DEC-006`). It runs on these occasions:

| Occasion | What compiles | Record |
|---|---|---|
| Each milestone boundary inside `/opsp:apply` | `dev` and `devops` sections that `plan` reports stale, without asking. `product` and `maintainer` are offered, and accepting the offer is a context switch | `DEC-COMPILE-ON-MILESTONE` |
| An approved escalation | Only the hat the escalation was classified into, only on approval, only stale sections | `DEC-COMPILE-ON-APPROVAL` |
| `/opsp:archive` | Everything. Archive consumes compact | `DEC-031` |
| Operator, at any time | Legitimate mid-initiative, because unattested claims render as decided | `DEC-031`, `DEC-021` |
| `/opsp:rebase`, `/opsp:abandon` | Post-reconciliation rebuild | `DEC-014` |
| After `/opsp:knockdown` | Not embedded: the operator judges the inferred surrogate first. A knockdown then yields all five views, all `observed` | `DEC-031`, `DEC-KNOCKDOWN-ALL-VIEWS` |

**Staleness is per section.** It is tracked by a content-hash manifest:

- Changed inputs make a section **stale**.
- A changed output makes it **tampered**.

`check` fails on anything that is not fresh (`DEC-010`). A stale section is re-rendered from its full inputs, never patched from the previous rendering (`DEC-011`). Seal is scopeable by hat, and it never blesses a section it did not just render (`DEC-SCOPED-SEAL`).

### Write modes

Every tool that touches the record set falls into one of three modes:

| Mode | Tools | May touch | Record |
|---|---|---|---|
| create | `/opsp:decide`, `/opsp:driver`, `/opsp:propose`, `/opsp:repropose` | a record's own content, at the altitude of the hat writing it | `DEC-027`, `DEC-BAR-AT-PROPOSE` |
| derive | `/opsp:compact`, `/opsp:archive` | compiled artifacts only | `DEC-027`, `DEC-006` |
| amend | `/opsp:attest` | `## Measures` in a record; `## Attestation` on the initiative | `DEC-027`, `DEC-042`, `DEC-044` |

**The records disagree about `/opsp:repropose`.** `DEC-HAT-HANDOFFS` recorded it as using `amend` mode. `DEC-BAR-AT-PROPOSE` reclassifies it as `create`, because repropose wears the hat that owns the bar. The table follows the later record. Both records agree on the guard: the Statement is out of bounds, and a bar that got easier is a goal that moved.

**Attest has a second write target.** It may also write freely to the project's documentation directory: `docs/` by default, configurable as `docsDir`. It writes there only after the operator confirms (`DEC-044`). Nothing checks what lands there.

### The initiative lifecycle

Transitions happen as a side effect of tools. `opensprint advance` validates each move against an explicit table, writes `state:` and regenerates `BOARD.md`. It **records rather than gates**: an illegal move is refused, but a legal move into a state the content contradicts is written, with the contradiction reported (`DEC-STATE-MACHINE`).

```
  explore --> backlog ......... triage --> propose                       (DEC-034, DEC-039)
                 |                 |
                 v                 v
  forward:   exploring --propose--> proposed --apply*--> building --apply*--> ready-for-attestation
                                                                                     |
                                                                                  attest
                                                                                     v
                                                         completed <--archive*-- attested

  * = handoff: `advance` refuses the move until --hat names an accepted accountability
```

| Backward or side edge | By | Rung | Record |
|---|---|---|---|
| exploring <-> declined | `/opsp:triage` | n/a | `DEC-035`, `DEC-STATE-MACHINE` |
| building -> proposed (handoff) | `/opsp:repropose` | strategy moved | `DEC-ESCALATION-LADDER`, `DEC-HAT-HANDOFFS` |
| building -> exploring (handoff) | `/opsp:reexplore` | goal moved | `DEC-HAT-HANDOFFS`, `DEC-REEXPLORE-NAME` |
| ready-for-attestation -> building | `/opsp:attest` | change request: the plan holds, the work does not | `DEC-ESCALATION-LADDER`, `DEC-HAT-HANDOFFS` |
| ready-for-attestation -> proposed | `/opsp:repropose` | strategy moved | `DEC-ESCALATION-LADDER`, `DEC-HAT-HANDOFFS` |
| ready-for-attestation -> exploring | `/opsp:reexplore` | goal moved | `DEC-HAT-HANDOFFS`, `DEC-REEXPLORE-NAME` |

**Where `/opsp:reexplore` now sits.** `DEC-STATE-MACHINE` and `DEC-ESCALATION-LADDER` placed it at the plan rung, as `ready-for-attestation -> building`. `DEC-HAT-HANDOFFS` moved it to the goal rung under the name `/opsp:reideate`, and `DEC-REEXPLORE-NAME` restored the name `/opsp:reexplore`. The transition table in code agrees with this latest position, including the hats and handoff flags (observed — `src/core/initiative-transitions.ts`).

### Escalation and attestation at runtime

**Escalation** inside `/opsp:apply` works like this:

- It is a stage boundary, not a mid-flow prompt. Apply pauses, the dev hat is set down, and the hat being worn for the answer is named (`DEC-ESCALATION-IS-A-STAGE`).
- It carries its own classification: a draft record, the inferred hat and the blast radius, all presented for approval. There is no separate "which hat?" prompt (`DEC-CLASSIFY-IN-QUESTION`).
- What has to move decides the rung: goal, strategy or plan (`DEC-ESCALATION-LADDER`, as revised by `DEC-HAT-HANDOFFS`).

**`/opsp:attest`** runs between apply/review and archive (`DEC-022`):

1. It first resolves and shows the change frame: source and base, commit subjects, a file stat. The operator must confirm the frame (`DEC-ATTEST-CHANGE-FRAME`).
2. It then reads the bars, the test files and the CI evidence. It never reads the implementation source, the design or the ADR rationales (`DEC-040`, which supersedes `DEC-033`).
3. It refuses to run in a session that wrote the implementation or its tests (`DEC-043`).
4. It always exits zero and never gates (`DEC-023`).

### Reconciliation across universes

`/opsp:rebase` and `/opsp:abandon` reconcile one universe with another:

1. **Planning first.** Each opens with a read-only planning phase that produces a conflict manifest, and waits for the operator to confirm (`DEC-004`).
2. **Depth-first traversal.** They walk initiative, then its ADRs, then its active changes. Every citizen is classified MIGRATE, CONFLICT, REDUNDANT or SUPERSEDED, and processing pauses at initiative boundaries (`DEC-003`).
3. **Narrow auto-accept.** A change is accepted without the operator only when it is purely additive or identical (`DEC-002`).
4. **The loser is archived.** Abandon preserves the losing universe under `opensprint/abandoned/{name}/` (`DEC-005`). That directory is not present in this tree (observed — `opensprint/`).

## Entity Schema

There is **no database and no runtime persistent state**. The durable data model is a set of Markdown files with YAML frontmatter, versioned, branched and merged by git like source code (`DEC-001`). Those files fall into three groups:

- **Records**: the source of truth.
- **Compiled artifacts**: derived from records, never hand-edited (`DEC-006`).
- **An inherited OpenSpec layer**: specs and changes.

### Relationships

```
                       depends-on                      depends-on
   driver-spec  <------------------------  ADR  <---------------------  ADR
   DS-*                                    DEC-*  ---supersedes--->  DEC-* (older)
     |  ## Measures                          ^
     |    ### Bar / Posture /                |  cites id (harvested from code)
     |        Evidence / Exposure            |
     |              |                     rule = a test or check file
     |              | mitigated-by
     |              v
     +-------->  initiative  <---depends-on---  initiative
                 (state:, milestones, ## Attestation)
                       |
                       | all of the above feed, by id + content hash
                       v
   compiled:  squad/<hat>.md   architecture.md   BOARD.md   DECISION-MAP.md
                       ^
                       |
              squad/.manifest.json  (per section: input ids + hashes, output hash)
```

### The record entities

**Driver-spec** (`opensprint/driver-specs/DS-*.md`). This is a constraint: the external truth.

- *Observed frontmatter*: `id`, `type`, `status`, `created`, `hats`, `role`, `objective`, `depends-on` (`opensprint/driver-specs/DS-ATTEST-AS-REVIEW.md`).
- *`hats`* accepts a string or a list, normalised to a list (`DEC-016`).
- *`role`* is `goal` and/or `strategy`, and likewise widens to a list (`DEC-018`).
- *`objective`* names one of the maintainer objectives a section selects on (`DEC-018`).
- *Who writes the hat, role and bar*: `/opsp:propose` and `/opsp:driver` write them when they create the record. Where no bar can be stated yet, they write `- **Primary**: unstated` (`DEC-BAR-AT-PROPOSE`).

**The measure** is not an entity of its own. It is a property of the goal that owns it (`DEC-019`). It lives inside the driver-spec's `## Measures` as four optional sub-blocks (`DEC-019`):

- `### Bar`, written in BDD form, which depends on the hat: product writes a user story, maintainer writes given/when/then (`DEC-038`).
- `### Posture`, `### Evidence` and `### Exposure`. `Exposure` may carry `mitigated-by: <initiative-id>`.

How the sub-blocks relate to one another (`DEC-041`):

- Posture is the judgement.
- `met` requires evidence.
- `partially met`, `not met` and `cannot assess` require exposure.
- Evidence must reference a CI artifact, not prose (`DEC-032`).

**ADR** (`opensprint/ADRs/DEC-*.md`). This is a decision.

- *Observed frontmatter*: `id`, `type`, `status`, `created`, `depth`, `depends-on`, `hats`, and optionally `supersedes` (`opensprint/ADRs/`).
- *Observed body*: Question, Decision, Consideration Factors (a weighted table), Rationale, Invalidation Trigger (`opensprint/ADRs/`). A maintainer strategy cell is compiled from that table and trigger (`DEC-037`).
- *Hats*: a decision is owned by `dev` and/or `devops`. Any other hat it lists is CC (`DEC-028`).
- *Role*: a decision carries no `role` (`DEC-028`).
- *Ids*: new ids are semantic, and `DEC-001` to `DEC-039` keep their numbers (`DEC-036`).
- *Supersession*: superseding a decision never rewrites the old one; it adds a new record (`DEC-ESCALATION-LADDER`).

**Initiative** (`opensprint/initiatives/YYYYMMDD-<id>.md`). This is a unit of work, and the only artifact that spans from proposal to production (`DEC-042`).

- *Filename*: date-prefixed, while the `id:` stays unprefixed (`DEC-036`). Observed in `opensprint/initiatives/`.
- *Observed frontmatter*: `id`, `status`, `state`, `created`, `depends-on` (`opensprint/initiatives/20261009-sdlc-operating-contract.md`).
- *`state` and `status` are separate fields*. `state` is the lifecycle position, which only initiatives have; `status` is liveness, which every record has (`DEC-STATE-MACHINE`, `DEC-024`).
- *Values of `state`*: `exploring`, `proposed`, `building`, `ready-for-attestation`, `attested`, `completed`, `declined` (`DEC-024`, `DEC-035`, `DEC-STATE-MACHINE`). The same seven are observed in `INITIATIVE_STATES` (`src/core/initiatives.ts`).
- *`## Attestation`*, written by attest, carries:
  - `door`, which is `one-way` or `two-way`
  - `blast-radius`
  - a RACI table that names a system for each automated concern, and at least R and A for each human one (`DEC-042`).

**Rule.** A rule is any test or check file that cites a record id. The link is harvested from code and never declared in the record (`DEC-013`). The harvest pattern accepts both numeric and semantic `DEC-` ids and `DS-` ids (observed — `src/core/compact/rules.ts`, `RECORD_ID_PATTERN`). `DEC-036` named widening that pattern as the blocker for semantic decision ids, and it is observed widened.

### Compiled entities (derived, never edited)

| Artifact | Derived from | Record |
|---|---|---|
| `opensprint/squad/<hat>.md` | driver-specs and ADRs, per section | `DEC-006`, `DEC-009` |
| `opensprint/architecture.md` | the same records, as a sibling output | `DEC-014` |
| `opensprint/BOARD.md` | initiative state, milestone completion, change status. Moving a card means changing a record's state | `DEC-026` |
| `opensprint/squad/.manifest.json` | per hat and section: input record ids with content hashes, plus the output hash | `DEC-010` |
| `opensprint/abandoned/{name}/` | `snapshot/` of the loser's `opensprint/`, plus `migration-manifest.md` | `DEC-005` |

`docsDir` (default `docs/`) is deliberately **not** an entity. Nothing cites it, compiles from it or parses it (`DEC-044`).

### The inherited OpenSpec layer

`openspec/specs/` and `openspec/changes/` are validated by Zod schemas (observed — `openspec/`, `src/core/schemas/`):

- A **Spec** has `name`, `overview` and `requirements`.
- A **Change** has `name`, `why`, `whatChanges` and `deltas`.
- A **Delta** has `spec`, an `operation` (one of ADDED, MODIFIED, REMOVED or RENAMED), `description` and optional `requirement(s)` or `rename`.
- A **Requirement** has `text`, which must contain SHALL or MUST, and at least one **Scenario** (`rawText`).

No record in this view's inputs governs these schemas.

### Where an observation and a record disagree

These are surfaced rather than resolved.

- **`abandoned` and `superseded` states.** `DEC-024` keeps both available to `/opsp:abandon`. Neither appears in `INITIATIVE_STATES`, and no transition reaches them (observed — `src/core/initiatives.ts`, `src/core/initiative-transitions.ts`).
- **Numbered decision ids.** `DEC-036`, created 2026-10-09, says the tool stops allocating numbered decision ids after `DEC-039`. Yet `DEC-040` through `DEC-044` exist with numbered ids, created 2026-10-10 (observed — `opensprint/ADRs/DEC-040.md` … `DEC-044.md`). On that same day, semantic ids were also being allocated, for example `DEC-SCOPED-SEAL` and `DEC-CLASSIFY-IN-QUESTION` (observed — `opensprint/ADRs/`).

## Open Loops

The harvest reports eight `decision-unguarded` loops for this hat. Each one is a decision that no test or check cites by id, so nothing would fail if the system departed from it (`DEC-013`). They are backlog items, to be triaged through `/opsp:explore` → `/opsp:propose` (`DEC-007`).

| Record | Also CC'd to | What is decided but unguarded |
|---|---|---|
| `DEC-005` | | Abandon preserves the losing universe as `opensprint/abandoned/{name}/` with a snapshot and `migration-manifest.md` |
| `DEC-008` | | A hat's charter compiles from governance records, never hand-authored |
| `DEC-013` | | Rule links are harvested from code, not declared in records |
| `DEC-015` | | v1 does not change what `/opsp:explore` and `/opsp:apply` load |
| `DEC-017` | | The product surface is the CLI plus generated agent files: no GUI, no CI/CD product |
| `DEC-020` | maintainer | A maintainer strategy cites its implementing decisions instead of describing the mechanism |
| `DEC-031` | | Archive consumes compact; compact stays safe to run mid-initiative and is not embedded in knockdown |
| `DEC-032` | devops | Evidence is a CI artifact reference; a pipeline-only bar is attested `pending` and re-attested by the next initiative touching the area |

The loop list says nothing about the record/observation disagreements surfaced under **Entity Schema** and **Tech Stack**. Those appear here only through this note, not as harvested loops.
