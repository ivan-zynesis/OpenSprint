# dev — how is it built?

Describes **the system**, citing decisions where they explain a choice and paths where they were
observed. Fifty-four decisions feed this hat; none of them are enumerated here, because a list of
condensed ADRs tells a reader nothing about what was built (`DS-BIG-PICTURE`).

**Nothing below is attested.** Claims citing a path are *observed* — true of the code today, and
possibly accidental. Claims citing a record are *decided* — binding, and not necessarily true yet
(`DS-ATTESTED-TRUTH`).

## Tech Stack

OpenSprint is a TypeScript command-line tool on Node, published as `@ivan-lee/opensprint` at
version `0.1.0`, ESM throughout (`"type": "module"`), requiring Node `>=20.19.0`
(`package.json`). Its one binary is `opensprint`, which points at `bin/openspec.js` — a two-line
shim importing the compiled `dist/cli/index.js` (`package.json`, `bin/openspec.js`). The entry file
keeps the upstream OpenSpec name while the binary does not; no record explains the split.

That the product is a CLI at all is decided: the surface is the `opensprint` CLI plus the skill and
command files it generates into a downstream project, with no GUI and no shipped CI/CD product
(`DEC-017`). Everything below is what that decision is built with, and it is all **observed** —
no record chooses a language, a runtime, a library or a package manager.

| Layer | What is used | Observed in |
|---|---|---|
| Language | TypeScript `^5.9.3`, `strict`, target `ES2022`, `NodeNext` modules and resolution, `src/` → `dist/` with declarations and source maps | `tsconfig.json`, `package.json` |
| CLI framework | `commander` `^14`; every command and subcommand is registered in one file | `package.json`, `src/cli/index.ts` |
| Schema validation | `zod` `^4` | `package.json` |
| Interactive prompts | `@inquirer/core`, `@inquirer/prompts`, plus one local searchable multi-select | `package.json`, `src/prompts/` |
| Terminal output | `chalk` `^5`, `ora` `^8` | `package.json` |
| Files and config | `fast-glob` `^3`, `yaml` `^2` | `package.json` |
| Telemetry | `posthog-node` `^5` | `package.json`, `src/telemetry/` |
| Build | `build.js` deletes `dist/` and runs the locally installed `tsc` | `build.js` |
| Test | `vitest` `^3.2.4`, `pool: 'forks'`, at most four workers unless `VITEST_MAX_WORKERS` says otherwise | `vitest.config.ts` |
| Lint | `eslint` `^9` with `typescript-eslint` `^8`, over `src/` only | `package.json` |
| Release | Changesets; `release:ci` runs a pack-version check, then `changeset publish` | `package.json` |

The source tree is `cli/` (the entry), `commands/` (command implementations), `core/` (the logic,
including `compact/` and `command-generation/`), `utils/`, `prompts/`, `ui/` and `telemetry/`,
with `src/index.ts` exported as the package's library entry (`src/`, `package.json`).

### Package manager and lockfiles

The package manager is **pnpm 9**, pinned in exactly one place: `packageManager: pnpm@9.15.9`
(`package.json`). CI's `pnpm/action-setup@v4` steps pass no `version:`, so the pnpm version reaching
CI comes only from that field; each job then runs `pnpm install --frozen-lockfile` on Node `20`
(`.github/workflows/ci.yml`). The Nix flake builds with `pnpm_9` and names its program `opensprint`
(`flake.nix`). The scripts assume pnpm too — `prepare`, `dev:cli` and `release` all call it
(`package.json`).

`pnpm-lock.yaml` is in lockfile format `6.0`, an older format than pnpm 9 writes; CI installs it
frozen under pnpm 9, so it is read and never rewritten (`pnpm-lock.yaml`,
`.github/workflows/ci.yml`).

**Two lockfiles are tracked, and they disagree about which package this is.** Beside
`pnpm-lock.yaml` sits `package-lock.json`, an npm lockfile (format 3) whose root package is
`@fission-ai/openspec` at `1.2.0` — the upstream fork parent's name and version, not
`@ivan-lee/opensprint` at `0.1.0` (`package-lock.json`, `package.json`). Nothing in CI or the
scripts reads it. This is reported, not resolved: no record decides the package manager, so
nothing says whether the npm lockfile is a leftover or is kept on purpose.

### What the stack is used to generate

Most of what the tool produces is **text for a language model**. Workflow content is written as
TypeScript template functions (`src/core/templates/workflows/`) and formatted per agent tool by an
adapter — 26 of them, the count `DEC-017` cites (`src/core/command-generation/adapters/`). The
generated files are text because their consumer is a model (`DEC-017`). Artifact schemas and
templates ship in the package beside `dist/` and `bin/` (`package.json` `files`).

The rest is the **deterministic half**: grouping, hashing, staleness and the gate are code, so they
re-run without a model, while condensing prose stays in a skill (`DEC-022`). That code is the
`compact` engine — `plan`, `seal`, `check`, `loops`, `board` (`src/core/compact/`,
`src/core/board.ts`, `src/cli/index.ts`) — the single compile engine behind every compiled artifact (`DEC-014`), with
`check` decided to fail CI on anything not fresh (`DEC-010`). Where a record found that prose was
not enough, the stack gained a command rather than an instruction: initiative state moves through
`opensprint advance` (`DEC-STATE-MACHINE`; `src/commands/advance.ts`), who holds a card through
`opensprint claim` (`src/commands/claim.ts`), and attest's change frame is resolved by
`opensprint frame` (`DEC-ATTEST-CHANGE-FRAME`; `src/commands/frame.ts`).

## Runtime Topology

There is no server, daemon or service. At runtime there is an operator, an agent reading generated
skill files, the `opensprint` CLI it calls, and a git worktree holding `opensprint/` as plain files
(`DEC-017`, `DEC-001`).

### Two halves, one process boundary

```
  operator ──── wears a hat ────┐
                                v
  ┌──────────────────────────────────────────┐
  │ agent + generated skills (/opsp:*)       │   synthetic half: reads views,
  │   explore · backlog · triage · propose   │   asks the operator, renders prose
  │   apply · attest · archive · compact     │
  │   reexplore · repropose · rebase · ...   │
  └───────────────────┬──────────────────────┘
                      │ shells out
                      v
  ┌──────────────────────────────────────────┐
  │ opensprint CLI (Node, one process/call)  │   deterministic half: parse, hash,
  │   compact plan|seal|check|loops|board    │   check, refuse, regenerate
  │   advance   claim   frame   migrate      │
  └───────────────────┬──────────────────────┘
                      │ reads / writes files
                      v
        opensprint/  in the current git worktree
```

The split is decided. Hashing, staleness, state checks and gating live in code so they can run
without a model, and judgement and condensation live in skills (`DEC-022`). Rendering a view is the
synthetic part. It needs a model and an agent wearing a hat, which is why no pipeline can render a
view (`DEC-COMPILE-ON-MILESTONE`). The commands on the deterministic side are registered in
`src/cli/index.ts`; the skill content is in `src/core/templates/workflows/opsp-*.ts`.

The planning and build skills orient on the per-hat views and open a full record only for the
decision they act on (`DS-SURROGATE-BUDGET`). `compact plan --hat <hat> --json` tells them which
sections to trust; where one is stale, unsealed or tampered they read its records instead, and they
fall back to every record where none declares a hat (observed in `opsp-apply.ts`, `opsp-explore.ts`,
`opsp-triage.ts` and `opsp-propose.ts` under `src/core/templates/workflows/`).

The CLI has one outbound network call: PostHog telemetry of the command path and version, which can
be turned off with `OPENSPEC_TELEMETRY=0` or `DO_NOT_TRACK=1` (`src/telemetry/index.ts`,
`src/cli/index.ts`). No record covers telemetry.

The Commander program still names itself `openspec` internally (`src/cli/index.ts`), while the
installed binary is `opensprint` (`package.json`). No record explains this.

### Universes are worktrees, and an initiative is one branch

```
  main ─────────────────────────────────────────────●─────────>
         \                                          ^  one PR, gated on
          opsp/<initiative>  (its own worktree)     │  state consistency
            backlog → triage → propose → apply ──rebase──attest──archive
```

Each branch or worktree is a universe, and `opensprint/` travels with the code in it. There is no
separate storage layer (`DEC-001`). The planning tools create or switch to the initiative's worktree
themselves, so an initiative lives in one branch from its first persisted thought (`DEC-029`).
Branches are named `opsp/<initiative-id>` (`src/core/initiative-git.ts`).

The branch reaches `main` through a single pull request in a fixed order: rebase, attest, archive,
merge. The gate checks that the initiative is `attested` and that the views are fresh. It never
checks whether a bar was met (`DEC-030`, `DEC-023`). A conflict in a derived artifact is resolved by
rebasing and recompiling, never by hand-merging (`DEC-030`, `DEC-006`).

`DEC-029` records one cost it does not solve. A backlog that lives on branches cannot be read in one
place, so the board shows only what the current branch knows. Observed since: the committed
`BOARD.md` still shows the checkout, and `opensprint compact board --all-branches` prints the card each local and remote-tracking `opsp/<id>` branch carries
— committed work only, never written to disk (`src/core/board.ts`, `src/core/initiative-git.ts`).

Parallel worktrees can no longer collide on decision ids. New decisions take semantic ids, and
initiatives take a date prefix on the filename while their `id:` stays the same (`DEC-036`). Both
prerequisites `DEC-036` named are observed in place. `RECORD_ID_PATTERN` now matches
`DEC-<WORDS>` and `DS-<WORDS>` alongside `DEC-\d{3}` (`src/core/compact/rules.ts`), and
`resolveInitiative` resolves by frontmatter `id` before filename (`src/core/initiatives.ts`). All
five initiative files carry the date prefix (`opensprint/initiatives/`).

### Reconciliation across universes

`/opsp:rebase` (soft fork) and `/opsp:abandon` (hard fork) are the only operations that merge one
universe's surrogate into another's.

- **Plan first.** Both start with a read-only planning phase that produces a conflict manifest, and
  the operator confirms it before any file changes (`DEC-004`).
- **Traversal.** The walk is depth-first, initiative → its ADRs → its active changes. The
  initiative is the unit of commitment, and every citizen is classified MIGRATE, CONFLICT,
  REDUNDANT or SUPERSEDED (`DEC-003`).
- **Auto-accept.** A citizen is auto-accepted only if it is purely additive or identical. Anything
  else escalates (`DEC-002`).
- **Abandon's output.** Abandon preserves the losing universe under `opensprint/abandoned/{name}/`
  as a snapshot plus a migration manifest (`DEC-005`). No such directory exists in this repository
  (`opensprint/`).
- **Rebuild.** The rebuild after reconciliation goes through the single compile engine (`DEC-014`).

### The initiative lifecycle

State is a frontmatter field that tools write and code checks (`DEC-024`). It moves only through
`opensprint advance <initiative> --to <state>`. That command validates the move against an explicit
table, writes the field, regenerates `BOARD.md`, and reports any contradiction with the content
instead of refusing the move (`DEC-STATE-MACHINE`; observed in `src/commands/advance.ts`).

Who holds a card is a second field, `owner`, written only by `opensprint claim`, which never moves
the state. The board shows it in every column and lists a card that is `building`,
`ready-for-attestation` or `attested` with nobody named as `owner-undeclared` (observed in
`src/commands/claim.ts`, `src/core/board.ts`, `src/core/initiatives.ts`).

```
  /opsp:backlog creates it
          │
          v
      exploring ──triage──> declined ──triage──> (back to exploring)
          │ propose
          v
      proposed
          │ apply *
          v
      building
          │ apply *
          v
      ready-for-attestation
          │ attest
          v
      attested
          │ archive *
          v
      completed

  falling back                       by                from building   from ready-for-attestation
  ---------------------------------  ----------------  --------------  --------------------------
  the goal moved      -> exploring   /opsp:reexplore   yes *           yes
  the strategy moved  -> proposed    /opsp:repropose   yes *           yes
  the work unfinished -> building    /opsp:attest      --              yes

  * = a handoff: `advance` refuses the move until --hat names an accepted accountability
```

The table that encodes this is `TRANSITIONS` in `src/core/initiative-transitions.ts`: twelve moves,
each with its tool, its hat and whether it is a handoff. It matches the table in `DEC-HAT-HANDOFFS`,
using the tool name `/opsp:reexplore` (`DEC-REEXPLORE-NAME`).

**The rung of a fallback is the OGSM altitude that has to move** (`DEC-ESCALATION-LADDER`, as
amended by `DEC-HAT-HANDOFFS` and `DEC-REEXPLORE-NAME`):

- **The goal moved.** `/opsp:reexplore` writes nothing and returns the initiative to `exploring`.
  The work then rejoins backlog → triage → propose.
- **The strategy moved.** `/opsp:repropose` supersedes ADRs, may restate `## Measures`, and redraws
  the milestones that rested on them. Driver-spec Statements are its invariant.
- **The work is unfinished.** `/opsp:attest` sends a change request back to `building` and
  supersedes nothing.

A bar that got easier means the goal moved, so it goes to `/opsp:reexplore` and not to repropose
(`DEC-HAT-HANDOFFS`, `DEC-BAR-AT-PROPOSE`).

How the lifecycle reached this shape across records:

- **Explore and backlog.** `DEC-024`'s original table has `/opsp:explore` write `exploring`.
  `DEC-034` makes explore write nothing and gives that write to `/opsp:backlog`.
- **Added states.** `DEC-035` adds `declined`. `DEC-STATE-MACHINE` adds `ready-for-attestation` as
  the named handoff from dev to product and maintainer.
- **The `ready-for-attestation → building` edge.** `DEC-STATE-MACHINE` assigns it to
  `/opsp:reexplore`. `DEC-ESCALATION-LADDER` adds `/opsp:attest` as a second owner.
  `DEC-HAT-HANDOFFS` moves reexplore to the goal rung and leaves the edge with attest only, which
  is what the code holds (`src/core/initiative-transitions.ts`).
- **Triage.** `/opsp:triage` sits between backlog and propose to advance, decline or return an
  item (`DEC-039`).

**A difference worth knowing.** `DEC-024` says `abandoned` and `superseded` "remain available to
`/opsp:abandon`". `INITIATIVE_STATES` in `src/core/initiatives.ts` lists `exploring`, `proposed`,
`building`, `ready-for-attestation`, `attested`, `completed` and `declined`, and nothing else.
`checkTransition` reports any other value as "not a state" (`src/core/initiative-transitions.ts`).
The record and the code use different state vocabularies, and no record says how they relate.

### Compile occasions

```
  occasion                    hats rendered                 seal
  ------------------------    ---------------------------   ----------------------
  /opsp:compact (any time)    whatever plan reports stale   compact seal
  apply, milestone boundary   dev + devops; product and     compact seal --hat dev
                                maintainer only if the        --hat devops
                                operator accepts the offer
                                and the context switches
  apply, approved escalation  only the hat it was           scoped
                                classified into
  /opsp:archive               every hat                     compact seal (unscoped)
  CI                          none; check only              never
```

- **Compact.** Compact can be invoked on its own at any time, and running it mid-initiative is
  legitimate. Archive consumes it (`DEC-031`).
- **Apply.** Apply compiles `dev` and `devops` at each milestone boundary without asking. It offers
  `product` and `maintainer` only as an explicit change of hat (`DEC-COMPILE-ON-MILESTONE`). An
  approved escalation may compile the one hat it touched (`DEC-COMPILE-ON-APPROVAL`).
- **Seal.** Seal can be scoped by hat and never blesses a section it did not render
  (`DEC-SCOPED-SEAL`; `--hat` is observed on `compact seal` in `src/cli/index.ts`).
- **Rendering.** Stale sections are re-rendered from their full inputs and never from the previous
  rendering (`DEC-011`).
- **CI.** `compact check` fails on anything that is not fresh (`DEC-010`).
- **Outputs.** Compact is the single compile engine. `architecture.md` is a sibling output (`DEC-014`),
  and so is `BOARD.md` (`DEC-026`), which `compact board` and `advance` also regenerate
  (`src/cli/index.ts`, `src/commands/advance.ts`).

**Where knockdown and compact disagree.** `DEC-031` says compact "is not embedded in
`/opsp:knockdown`", so that the operator judges knockdown's output before anything is compiled. The
knockdown skill's Step 5 does compile: it invokes `/opsp:compact` and then `compact check`, and
expects all five views (`src/core/templates/workflows/opsp-knockdown.ts`). That step follows
`DEC-014`, which lists knockdown's final phase as a compact caller, and `DEC-KNOCKDOWN-ALL-VIEWS`,
which has knockdown produce all five views. This view does not decide which reading holds.

### Write modes

```
  mode     tools                                         touches
  -------  --------------------------------------------  ----------------------------------
  create   /opsp:decide  /opsp:driver  /opsp:propose     a record's own content
           /opsp:repropose
  derive   /opsp:compact  /opsp:archive                  compiled artifacts only
  amend    /opsp:attest                                  ## Measures in a record it does not
                                                         own; ## Attestation on the initiative;
                                                         docs/ (docsDir) on confirmation
```

- **The three modes.** Amendment is a separate, bounded write mode (`DEC-027`). `DEC-HAT-HANDOFFS`
  first filed repropose's `## Measures` write under amend. `DEC-BAR-AT-PROPOSE` reclassifies it as
  create, because repropose wears the hat that wrote the bar.
- **The bar at creation.** `/opsp:propose` and `/opsp:driver` write the hat, the role and the bar
  when they create a driver-spec (`DEC-BAR-AT-PROPOSE`).
- **Attest's record bound.** The record bound is checked by `checkAmendment`
  (`DEC-044`; `src/core/compact/amend.ts`).
- **Attest's documentation target.** The documentation directory is a second write target. Nothing
  checks it, and it is configured as `docsDir` (`DEC-044`).
- **Compact.** Compact never writes a record (`DEC-006`).

### Escalation and attestation at runtime

**Escalation.** Inside `/opsp:apply`, an escalation is a stage boundary, not an inline prompt. The
dev hat is set down, the hat that answers is named, and resuming is a separate step
(`DEC-ESCALATION-IS-A-STAGE`). The question carries its own classification and a draft record with
its blast radius. There is no separate "which hat?" prompt (`DEC-CLASSIFY-IN-QUESTION`).

**Attestation.** `/opsp:attest` runs in this order:

1. **Frame.** It resolves the change frame (source → base) and the operator confirms it before any
   bar is read. The base is resolved from `--base`, then `origin/HEAD`, then `main`, `master`,
   `develop`, `trunk`, and the rule that fired is reported (`DEC-ATTEST-CHANGE-FRAME`;
   `opensprint frame` and `BASE_BRANCH_CANDIDATES` are observed in `src/cli/index.ts` and
   `src/core/change-frame.ts`).
2. **Read.** It reads the bars, the test files and the CI evidence. It never reads the
   implementation source, the design discussion or the ADR rationales (`DEC-040`, which supersedes
   `DEC-033`). It refuses to run in a session that wrote the implementation or its tests
   (`DEC-043`).
3. **Judge.** It records a posture, then either evidence (`met`) or exposure (anything else)
   (`DEC-041`). Evidence must be a CI artifact reference, and a bar that cannot be assessed before
   merge is attested `pending` and left for the next initiative that touches the area (`DEC-032`).
4. **Never gate.** It always exits zero and never blocks anything (`DEC-023`).

## Entity Schema

OpenSprint has no database. Its durable data is markdown files with YAML frontmatter, versioned,
branched and merged by git along with the code (`DEC-001`). The schema is the frontmatter fields and
the section headings that code parses. Records are authored, and everything else in `opensprint/` is
compiled from them (`DEC-006`, `DEC-014`).

### Relationships

```
                    depends-on                       depends-on
  driver-spec  <──────────────────  decision (ADR)  <──────────  decision (ADR)
  DS-*.md                           DEC-*.md                         │
     │  ## Measures                    ^      ^                      │ supersedes
     │    ### Bar / Posture /          │      └──────────────────────┘
     │        Evidence / Exposure      │ cites the id
     │          mitigated-by ───┐   rule (a test or check in the codebase)
     │                          │
     │  claimed by              v
     └──────────────────>  initiative  ── ## Milestones ──>  opsx change
                           YYYYMMDD-<id>.md                  openspec/changes/<name>/
                             ## Attestation
```

- **Decisions to constraints.** A decision answers a constraint, or another decision, through
  `depends-on`, and `depth` places it in the tree (`DEC-036`).
- **Rules to records.** A rule says what it guards by citing a record id in the code. The record
  never lists its rules, and the link is harvested (`DEC-013`). The harvest recognises numbered and
  semantic ids alike (`RECORD_ID_PATTERN`, `src/core/compact/rules.ts`).
- **Exposures to initiatives.** An exposure points forward to the initiative that mitigates it
  through `mitigated-by` (`DEC-019`), and the board renders that target's live state (`DEC-026`).
- **Initiatives to changes.** An initiative claims driver-specs and ADRs, and its milestones are
  opsx changes (`DEC-003`; `## Driver Specs`, `## ADRs` and `## Milestones` are parsed in
  `src/core/initiatives.ts`).

### The record entities

**Driver-spec** (`opensprint/driver-specs/DS-*.md`). This is a constraint from outside the system.

- **Read fields.** `id`, `type`, `status`, `hats`, `role`, `objective` and `depends-on` are read
  (`src/core/decision-map.ts`, `src/core/compact/records.ts`).
- **`type`.** One of `product`, `legal`, `compliance`, `reliability`, `architecture` or `business`
  (`DRIVER_SPEC_TYPES`, `src/core/hats.ts`).
- **`hats`.** One or more hats, given as a string or a list and normalised to a list (`DEC-016`).
- **`role` and `objective`.** `role` takes the same string-or-list form, and `objective` names the
  maintainer objective the record serves (`DEC-018`).
- **Measure anatomy.** A measure lives under `## Measures` as optional `### Bar`, `### Posture`,
  `### Evidence` and `### Exposure` sub-blocks (`DEC-019`).
- **Bar form.** The bar is a user story for product and given/when/then for maintainer (`DEC-038`).
  It is written when the record is created, or recorded as `unstated` (`DEC-BAR-AT-PROPOSE`).
- **Evidence and exposure.** Which of the two a measure needs depends on its posture (`DEC-041`).
  Evidence is a reference to a CI artifact (`DEC-032`).

**Decision** (`opensprint/ADRs/DEC-*.md`). This is a choice made in answer to a constraint.

- **Read fields.** `id`, `status`, `depth`, `depends-on` and `hats` are read (`DecisionEntry`,
  `src/core/decision-map.ts`). `supersedes` also appears in frontmatter (`DEC-016`, `DEC-034`,
  `DEC-040`).
- **Owner and role.** A decision is owned by `dev` or `devops`, other hats are CC only, and it
  carries no `role` (`DEC-028`).
- **Body.** The body is a Question, a Decision, a weighted Consideration Factors table, a Rationale
  and an Invalidation Trigger. The strategy cell's SWOT-like parts are compiled from that table and
  trigger (`DEC-037`).
- **Ids.** `DEC-001` to `DEC-044` keep their numbers, and every new decision takes a semantic id
  (`DEC-036`).
- **Status values.** Three values appear across the ADRs: `active` on most, `accepted` on six of
  the semantic ones, and `superseded` on the three that were replaced (`opensprint/ADRs/`). No
  record defines `accepted` or says whether it differs from `active`. `DEC-STATE-MACHINE` defines
  `status` only as whether a record is live.

**Initiative** (`opensprint/initiatives/YYYYMMDD-<id>.md`). This is a container that tracks work. It
is not a record that constrains or decides (`src/core/initiatives.ts`).

- **Frontmatter.** `id`, `status`, `state`, `created`, `completed` and `depends-on` are read
  (`InitiativeEntry`, `src/core/initiatives.ts`). `state` holds the lifecycle position and `status`
  stays a separate field (`DEC-STATE-MACHINE`). Older files without `state` still parse (`DEC-024`).
  Two of the five initiatives in this repository carry only `status` (`opensprint/initiatives/`).
- **`## Milestones`.** This is a checkbox list where `[ ]` is open, `[x]` is done and `[~]` is
  superseded. Superseded items are kept and excluded from progress (`src/core/initiatives.ts`).
- **`## Attestation`.** Attest writes this section. `door` is `one-way` or `two-way`, there is a
  `blast-radius`, and the RACI table names R and A only where no system handles the concern
  (`DEC-042`; `DOORS` in `src/core/initiatives.ts`).
- **Declined items.** A declined initiative keeps its Objective and Goal and the reason it was
  declined (`DEC-035`).

**Abandoned universe** (`opensprint/abandoned/{name}/`). This holds a `snapshot/` of the losing
`opensprint/` and a `migration-manifest.md` (`DEC-005`). None exists here (`opensprint/`).

### Compiled entities (derived, never edited)

```
  opensprint/
    squad/<hat>.md         per-hat views                     DEC-006, DEC-016
    squad/index.md         router                            src/core/compact/manifest.ts
    squad/.manifest.json   provenance: per hat and section   DEC-010
    architecture.md        sibling output of compact         DEC-014
    BOARD.md               initiatives by state, roadmap     DEC-026
    DECISION-MAP.md        decision tree, blast radius       DEC-026; src/core/decision-map.ts
```

The manifest records, for each section, the content hashes of its records and its observed files,
a combined input hash, and the hash of the rendered output. A changed input means the section is
stale, and a changed output means it was tampered with (`DEC-010`). The observed fields are
`version: 1` and entries holding `inputs`, `observed`, `inputHash` and `outputHash`
(`src/core/compact/manifest.ts`). `DEC-010` names record ids and hashes. The `observed` map of file
paths is code only, and no record mentions it.

### The inherited OpenSpec layer

Beneath the surrogate sits the upstream spec-and-change model. It covers `openspec/specs/` and
`openspec/changes/<name>/`, validated by Zod schemas (`src/core/schemas/`):

- **Spec.** A `name`, an `overview` and one or more requirements (`src/core/schemas/spec.schema.ts`).
- **Requirement.** Its text must contain `SHALL` or `MUST`, with at least one scenario
  (`src/core/schemas/base.schema.ts`).
- **Change.** A `name`, a `why` and a `whatChanges`, plus deltas whose operation is `ADDED`,
  `MODIFIED`, `REMOVED` or `RENAMED` (`src/core/schemas/change.schema.ts`).

No record decides anything about this layer. It is described here only as observed.

## Open Loops

8 loops the harvest reports for this hat, grouped by kind. Each is reported by `opensprint compact plan`, not inferred here; the record cited is where it closes.

### `decision-unguarded` — a decision no rule cites

- `DEC-005`
- `DEC-008`
- `DEC-013`
- `DEC-015`
- `DEC-017`
- `DEC-020`
- `DEC-031`
- `DEC-032`

_No rule cites this decision._
