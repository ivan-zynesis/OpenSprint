# dev — how is it built?

Describes **the system**, citing decisions where they explain a choice and paths where they were
observed. Sixty-four decisions feed this hat; none of them are enumerated here, because a list of
condensed ADRs tells a reader nothing about what was built (`DS-BIG-PICTURE`).

**Nothing below is attested.** Claims citing a path are *observed* — true of the code today, and
possibly accidental. Claims citing a record are *decided* — binding, and not necessarily true yet
(`DS-ATTESTED-TRUTH`, `DEC-021`).

## Tech Stack

The tool is a TypeScript command-line program, published as `@ivan-lee/opensprint`. It is an ES
module package with one binary, `opensprint`, which points at `bin/openspec.js`, and it needs Node
`>=20.19.0` (`package.json`). `tsc` compiles `src/` into `dist/` with these settings
(`tsconfig.json`):

- ES2022 target
- `NodeNext` modules
- `strict`
- declarations and source maps

`build` runs `node build.js` (`package.json`).

**What the package ships.** The package ships `dist`, `bin`, `schemas`, `assets` and
`scripts/postinstall.js`, without compiled tests or source maps (`package.json`). `assets` holds the
board page. The compiled code finds that page as `assets/kanban/board.html`, relative to its own
location, the same way it finds `schemas/` (`src/core/kanban-board.ts`). The Nix flake's source set
lists `./assets` too (`flake.nix`).

**No decision in this hat chooses a package.** The stack below is observed, not decided. The
project is a fork of Fission AI's OpenSpec (`CLAUDE.md`), and its npm lockfile still describes the
upstream package (see below).

| Package | Declared | Resolved | Seen in |
|---|---|---|---|
| `commander` | `^14.0.0` | 14.0.3 | the command tree (`src/cli/index.ts`) |
| `zod` | `^4.0.17` | 4.3.6 | the opsx schemas (`src/core/schemas/`) and config parsing (`src/core/project-config.ts`) |
| `yaml` | `^2.8.2` | 2.8.3 | record frontmatter and config (`src/core/decision-map.ts`, `src/core/project-config.ts`) |
| `fast-glob` | `^3.3.3` | 3.3.3 | file matching (`src/utils/file-system.ts`, `src/core/artifact-graph/outputs.ts`) |
| `chalk` · `ora` | `^5.5.0` · `^8.2.0` | 5.6.2 · 8.2.0 | terminal output and failure lines (`src/commands/kanban.ts`, `src/cli/index.ts`) |
| `@inquirer/core` · `@inquirer/prompts` | `^10.2.2` · `^7.8.0` | 10.3.2 · 7.10.1 | interactive prompts, always imported dynamically (`CLAUDE.md`) |
| `posthog-node` | `^5.20.0` | 5.29.2 | usage telemetry (`src/telemetry/index.ts`) |

For development the project uses these (`package.json`, `pnpm-lock.yaml`):

- TypeScript 5.9.3
- Vitest 3.2.4, with `@vitest/ui`
- ESLint 9.39.4, with `typescript-eslint` 8.58.2
- `@types/node` 24.12.2
- Changesets 2.30.0, with its GitHub changelog 0.5.2

**The live board added no package on any side.**

- **CLI side.** The store, the card writes, the board configuration and the opsp-layer writer
  import only Node built-ins and the project's own modules, and they do their git work by running
  the `git` executable (`src/core/kanban.ts`, `src/core/kanban-sync.ts`, `src/core/kanban-board.ts`,
  `src/core/shared/opsp-layer.ts`). This is what `DEC-CARD-WRITES-THROUGH-CLI` decides: cards are
  written through the CLI, which is already installed.
- **Reading side.** The client needs only git, the installed skill and a browser, and node is
  ruled out there (`DEC-BOARD-READ-BY-GIT`, answering `DS-RUNTIME-LESS-BOARD`).
  - The list and render playbooks use git with `awk`, `sed`, `base64`, `tr` and `date` from a POSIX
    shell (`src/core/templates/workflows/opsp-kanban.ts`).
  - The launch scripts that the page's buttons copy use git and `awk` (`assets/kanban/board.html`).
  - The page loads nothing: no script source, no stylesheet link, no fetch
    (`assets/kanban/board.html`).

`DEC-BOARD-READ-BY-GIT`'s invalidation trigger names what this depends on: a shell without POSIX
tools would need a second form of the playbook.

### Package manager and lockfiles

- **pnpm is the declared manager.** `package.json` declares `packageManager: pnpm@9.15.9`, and CI
  installs with `pnpm install --frozen-lockfile` (`CLAUDE.md`).
- **`pnpm-lock.yaml` is `lockfileVersion: '6.0'`** (`pnpm-lock.yaml`), an older format than the one
  pnpm 9 writes.
- **A second lockfile is stale.** `package-lock.json` describes `@fission-ai/openspec` 1.2.0, with a
  binary called `openspec`. That is the upstream package, not this one (`package-lock.json`). Its
  dependency ranges match `package.json`, and nothing records why the file is kept.

### What the stack is used to generate

The product surface is the CLI plus the skill and command files it writes into a downstream project.
There is no GUI, and the tool ships no CI/CD product (`DEC-017`). Workflow content is written as
TypeScript template strings, one file per workflow (`src/core/templates/workflows/`). The command
adapters format it for each agent tool (`src/core/command-generation/adapters/`).

**The opsp layer has twenty workflows**, six of them utilities, including `/opsp:kanban`
(`src/core/shared/skill-generation.ts`). One writer, `writeOpspLayer`, writes all three parts of it:

- every opsp skill;
- every opsp command;
- the board page.

(`src/core/shared/opsp-layer.ts`.) `init` calls it, and so do both of `update`'s paths
(`src/core/init.ts`, `src/core/update.ts`). This repository's own `.claude/skills/opensprint-kanban/`
and `.claude/commands/opsp/kanban.md` are that generated output (`.claude/skills/opensprint-kanban/SKILL.md`).

**The board page is filled in two passes**, which is the split `DEC-BOARD-READ-BY-GIT` decides:

```
  assets/kanban/board.html                 shipped in the package
        │  opensprint init / update: writeOpspLayer → renderBoardTemplate
        │    <!-- opensprint:config -->  →  JSON: columns, owned states, every state's moves,
        │                                    the agent, milestone columns, the change request
        ▼
  <toolDir>/skills/opensprint-kanban/board.html     one per tool, in every delivery mode
        │  /opsp:kanban render playbook (git + POSIX shell)
        │    <!-- opensprint:cards -->   →  board-meta + one base64 <script> per card
        ▼
  $TMPDIR/opensprint-kanban.html           opened in a browser; refreshing means rendering again
```

(`src/core/kanban-board.ts`, `src/core/shared/opsp-layer.ts`,
`src/core/templates/workflows/opsp-kanban.ts`.)

The page and the CLI cannot disagree, because the page's columns and moves are data generated from
the CLI's own tables (`KANBAN_COLUMNS` and `TRANSITIONS`) and from the milestone stage table, not
code in the page (`src/core/kanban-board.ts`). That follows `DEC-CONTINUE-FORWARD-ESCALATE-BACK`.

**The agent table is generated from the command adapters** (`DEC-BOARD-BUTTON-LAUNCHES-SESSION`).
`ToolCommandAdapter` has two optional fields (`src/core/command-generation/types.ts`):

- `sessionLauncher`: the shell words that start a session with a prompt;
- `commandReference`: how a generated command is invoked.

Only the Claude adapter fills them, with `claude` and `/opsx:<id>`
(`src/core/command-generation/adapters/claude.ts`). The opsp layer maps `/opsx:<id>` to `/opsp:`, and
names the skill instead wherever commands are not delivered (`src/core/shared/opsp-layer.ts`). The
page's buttons copy launch scripts built from that table. A tool with no launcher gets the prompt
alone (`assets/kanban/board.html`).

**Surfaced, not resolved.** What the tool generates now includes an interactive HTML page, with
buttons and a milestone overlay. That sharpens the `DEC-017` tension described under Runtime
Topology.

## Runtime Topology

### Two halves, one process boundary

```
   operator
      │  invokes a workflow, or pastes a script copied from the board page
      ▼
   agent session ── skill text (src/core/templates/workflows/)        synthetic: needs a model
      │  runs
      ▼
   opensprint ───── one command, then exits                            deterministic: no model
      │
      ├── opensprint/          records, squad views, manifest, BOARD.md    (this checkout's tree)
      ├── openspec/            opsx changes, specs, config.yaml
      ├── git: opsp/* refs     other initiatives' committed trees, read without a checkout
      └── git: origin/kanban   one card per initiative: fetched and read; written by fast-forward
```

Grouping, hashing, staleness and gating live in code, so they can be checked without a model.
Condensing prose lives in a skill (`DEC-022`). Because of that split, rendering cannot run in CI:
a pipeline has no agent and no hat (`DEC-COMPILE-ON-MILESTONE`). Nothing stays running. The CLI
runs one command and exits (`DEC-CARD-WRITES-THROUGH-CLI`). The board page starts no process; its
buttons only copy text (`DEC-BOARD-BUTTON-LAUNCHES-SESSION`; `assets/kanban/board.html`).

`compact` is the single compile engine. `architecture.md` is one of its outputs, beside the views,
never one of its inputs (`DEC-014`). Views are compiled and never edited by hand: if a view is
wrong, the system is wrong (`DEC-006`). A per-section manifest records each section's inputs and
its rendered output, and `compact check` fails on anything stale or tampered (`DEC-010`). A stale
section is rebuilt from its full inputs, never patched (`DEC-011`). The engine's commands are
`plan`, `seal`, `board`, `check` and `loops` (`src/cli/index.ts`, `src/commands/compact.ts`,
`src/core/compact/`). Whether a decision is guarded is harvested from code: a test or check that
cites the record's id is a rule, and the record itself says nothing about its rules (`DEC-013`).
The id pattern matches both numbered and semantic ids (`src/core/compact/rules.ts`).

### Universes are worktrees, and an initiative is one branch

Each git branch or worktree is a universe. `opensprint/` lives in the branch and travels with the
code; there is no copy and no daemon (`DEC-001`). Planning happens in the initiative's own
worktree, which the planning tools create or switch to. So an initiative is one `opsp/<initiative>`
branch from first thought, and it reaches `main` exactly once (`DEC-029`). New decisions take
semantic ids and initiative files take a date prefix, so two worktrees cannot allocate the same
name (`DEC-036`).

`DEC-029` recorded a cost: a board compiled in one checkout shows only that branch. Two answers
followed, and the second amends the first:

1. **Printed on demand.** `opensprint compact board --all-branches` reads the initiative on every
   local and remote-tracking `opsp/*` branch from committed trees, and writes nothing. The checkout
   wins; a fetched copy wins only when it is strictly ahead (`DEC-BOARD-ALL-BRANCHES`). The refs come
   from `for-each-ref`, and the blobs are read in one `cat-file --batch` (`src/core/initiative-git.ts`).
2. **A central store.** In-flight state lives on a dedicated remote branch, beside the compiled
   `BOARD.md` rather than replacing it (`DEC-BOARD-ON-REMOTE-BRANCH`, `DEC-026`). See *The boards*.

### Reconciliation across universes

When two surrogates diverge, the agent reasons and the operator confirms. Only purely additive or
identical content is accepted automatically (`DEC-002`).

- **Order.** The traversal is depth-first: an initiative, then its ADRs, then its active changes.
  Each citizen is classed as MIGRATE, CONFLICT, REDUNDANT or SUPERSEDED, and a conflict pauses the
  traversal at the initiative boundary (`DEC-003`).
- **Planning phase.** `/opsp:rebase` and `/opsp:abandon` both open with a read-only phase that
  produces a conflict manifest and waits for confirmation (`DEC-004`).
- **Abandonment.** An abandoned universe is preserved as a snapshot and a migration manifest before
  its worktree is removed (`DEC-005`).
- **Rebuild.** After reconciliation, the views are rebuilt by calling `compact` (`DEC-014`).

### The initiative lifecycle

```
  explore ──► backlog ──► triage ───────► propose ──► apply ─────────────────► attest ──► archive
  (writes     exploring   claims, or      proposed    building, then           attested   completed
   nothing)               declines                    ready-for-attestation
```

- **The front of the lifecycle.** Explore writes nothing. `/opsp:backlog` is the deliberate step
  that saves an idea as an initiative at `exploring` (`DEC-034`). `/opsp:triage` is a tool of its
  own: it advances, declines or returns an item, so `/opsp:propose` only formalizes (`DEC-039`).
- **State.** The tool declares the state and code checks it (`DEC-024`). `declined` is terminal,
  but an item can be revived (`DEC-035`).
- **`opensprint advance`.** Every transition goes through this command. It validates the move,
  writes the field and regenerates `BOARD.md`. A legal move into a state that the content
  contradicts is written and reported, not refused (`DEC-STATE-MACHINE`;
  `src/commands/advance.ts`). Triage now declines and revives through `advance` too, where it used
  to write `state:` by hand (`src/core/templates/workflows/opsp-triage.ts`).

There are twelve moves, and each names the hat it is made wearing. On a handoff, the move is
refused until `--hat` names an accepted accountability (`DEC-HAT-HANDOFFS`). The backward rungs
come from `DEC-ESCALATION-LADDER`. The goal rung's tool is named `/opsp:reexplore` by
`DEC-REEXPLORE-NAME`, which corrects the `/opsp:reideate` in `DEC-HAT-HANDOFFS`.

| From | To | By | Hat | Handoff |
|---|---|---|---|---|
| exploring | proposed | `/opsp:propose` | all four | |
| exploring | declined | `/opsp:triage` | product · maintainer | |
| declined | exploring | `/opsp:triage` | product · maintainer | |
| proposed | building | `/opsp:apply` | dev · devops | yes |
| building | ready-for-attestation | `/opsp:apply` | dev · devops | yes |
| building | proposed | `/opsp:repropose` | product · maintainer | yes |
| building | exploring | `/opsp:reexplore` | product · maintainer | yes |
| ready-for-attestation | building | `/opsp:attest` | product · maintainer | |
| ready-for-attestation | proposed | `/opsp:repropose` | product · maintainer | |
| ready-for-attestation | exploring | `/opsp:reexplore` | product · maintainer | |
| ready-for-attestation | attested | `/opsp:attest` | product · maintainer | |
| attested | completed | `/opsp:archive` | all four | yes |

The code has the same twelve rows, with the same hats and handoff flags, as `TRANSITIONS`
(`src/core/initiative-transitions.ts`).

**Ownership.** Who holds an initiative is an optional `owner:` field, written by `opensprint claim`.
The owner defaults to git's `user.name`. Claiming never moves the state. `/opsp:triage` and
`/opsp:apply` claim at the moment they commit to the work; `/opsp:backlog` never claims
(`DEC-INITIATIVE-OWNER`). `claim` refuses an initiative in a terminal state
(`src/commands/claim.ts`). It now also claims the card on the live board before writing the file;
see below.

**Resuming.** "Continue" is honest only if a workflow can pick up where it paused
(`DEC-CONTINUE-FORWARD-ESCALATE-BACK`). Three workflows now read the initiative before anything
else:

- **Triage** stops if the item is already past `exploring`. Otherwise it resumes from a
  `## Triage` section of notes (Weighed, Leaning, Open), which it revises rather than appends
  (`src/core/templates/workflows/opsp-triage.ts`).
- **Propose** stops if the item is `proposed` or later. It takes its strategy from `## Triage`, and
  it never recreates driver-specs or ADRs that are already on disk
  (`src/core/templates/workflows/opsp-propose.ts`).
- **Attest** confirms the change frame again in every session. It finds the latest handoff commit
  and skips bars already judged in this pass (`src/core/templates/workflows/opsp-attest.ts`).

**Surfaced, not resolved:**

- **Missing states.** `DEC-024` keeps `abandoned` and `superseded` available to `/opsp:abandon`.
  The code's state list is the seven states above, and no transition reaches either one
  (`src/core/initiatives.ts`, `src/core/initiative-transitions.ts`).
- **Triage now writes an artifact.** `DEC-039`'s invalidation trigger says that if triage grows
  artifacts of its own, it has become a second propose. Triage now writes `## Triage` into the
  initiative, and propose reads its strategy from that section. The template frames it as notes,
  not records: "no id, no `depends-on`, nothing a compile reads"
  (`src/core/templates/workflows/opsp-triage.ts`). No record decides the section.

### The boards — compiled, printed, live

Three artifacts answer "where is everything":

| | What it shows | Written by | Record |
|---|---|---|---|
| `BOARD.md` | this checkout's initiatives by state, with the roadmap | regenerated by `compact seal`, `advance` and `claim`; never edited | `DEC-026` |
| `compact board --all-branches` | every `opsp/*` branch's initiative, after a fetch | nothing; printed only | `DEC-BOARD-ALL-BRANCHES` |
| `origin/kanban` | one card per initiative, the same from every checkout | `advance`, `claim` and `kanban init·seed·stage` only | `DEC-BOARD-ON-REMOTE-BRANCH`, `DEC-CARD-WRITES-THROUGH-CLI` |

The first two are observed in `src/commands/compact.ts`, `src/commands/advance.ts`,
`src/commands/claim.ts` and `src/cli/index.ts`.

**The live board is a dedicated remote branch.** It holds nothing but a README and
`cards/<id>.md`. Every move is a commit, so the branch's `git log` is the board's history. The
branch is never checked out to read it and never edited by hand. A completed initiative's card stays
as a static record. One file per card means concurrent moves on different cards cannot conflict
(`DEC-BOARD-ON-REMOTE-BRANCH`).

It is always `origin/kanban`: no command takes a remote any more (`src/commands/kanban.ts`,
`src/cli/index.ts`). A project with no `origin` hears nothing from the board, and a project whose
`origin` has no board gets a note, not an error (`src/core/kanban-sync.ts`).

**Every write goes through one store.** Commands and helpers are on the left; on the right is what
each writes.

```
  opensprint advance <id> --to <s>     file first, then moveCard      state, checked against TRANSITIONS; milestones mirrored
  opensprint claim <id> [--take-over]  claimCard first, then file     owner; refused if someone else holds it
  opensprint kanban stage <id> <m> <s> stageCard                      one milestone's stage
  opensprint kanban init               planSeed                       create the board, one card each
  opensprint kanban seed [<id>]        planSeed                       add missing cards, report drift
                       [--resync]      planSeed + resyncCard          rewrite drifted cards from their file
        │
        ▼   transact, up to 8 attempts                                         src/core/kanban.ts
            ls-remote → fetch → ls-tree + cat-file → decide(board)
            → commit in a throwaway GIT_INDEX_FILE → push, no --force
            rejected?  ask the remote: moved → back off and re-read · unmoved → git's own error
  origin/kanban
```

(`src/core/kanban-sync.ts`, `src/commands/advance.ts`, `src/commands/claim.ts`,
`src/commands/kanban.ts`, `src/core/kanban.ts`.)

**A card write never blocks a move.** `advance` writes the initiative file first and the card
second. A card write that fails or finds no board does not undo or block the move; it is reported,
and `kanban seed` finds the drift later. The card also validates its own move: where the card's
current state cannot legally reach the target, the card is left alone and the drift is reported,
because writing it would invent a move nobody made (`src/core/kanban-sync.ts`). A move also carries
the file's milestones onto the card, mirrored as `kanban stage` mirrors them, so milestones a
repropose redrew reach the board with its move; where the card already shows the target state, only
the milestones are written (`src/core/kanban-sync.ts`). `--no-board` skips the card on both
`advance` and `claim` (`src/cli/index.ts`). This is the CLI write path
`DEC-CARD-WRITES-THROUGH-CLI` decides.

**A claim goes to the board first**, because the remote arbitrates between two machines. A card
someone else holds is refused before anything is written, unless `--take-over` is passed. The check
runs inside every retry, so the loser of a race reads the winner's name rather than overwriting it
(`src/core/kanban-sync.ts`, `src/commands/claim.ts`). The refusal is decided
(`DEC-CARD-WRITES-THROUGH-CLI`). The board-first order is the remedy `DEC-INITIATIVE-OWNER`'s
invalidation trigger names: a claim that reaches a shared place first.

**Milestone stages** follow an explicit table, `MILESTONE_STAGE_MOVES` (`src/core/kanban.ts`):

```
  todo ──► specifying ──► building ──► review ──► done
               ▲                         │
               └──── change request ─────┘          superseded: only through the initiative file
```

`stageCard` mirrors the file's milestones first. A milestone is `done` only where the file checks
it off. A milestone leaves `todo` only when every earlier live milestone is done. A refused move
exits non-zero; a missing or unreachable board does not (`src/core/kanban-sync.ts`,
`src/commands/kanban.ts`). `DEC-MILESTONE-BOARD` decides this.

**Who calls what:**

- `/opsp:backlog` adds its new item's card with `kanban seed <id>`
  (`src/core/templates/workflows/opsp-backlog.ts`).
- Triage claims, and declines or revives through `advance`
  (`src/core/templates/workflows/opsp-triage.ts`).
- Apply claims and advances, and moves its milestone through `specifying` at the opsx change,
  `building` at the worktree and `review` at the merge. It reaches `done` after the file is checked
  off, and goes back to `specifying` on a change request
  (`src/core/templates/workflows/opsp-apply.ts`).
- Propose writes a new initiative at `exploring` and advances it to `proposed`. Attest, repropose,
  reexplore and archive advance, naming `--hat` on a handoff; archive closes from the initiative's
  worktree before removing it, and repropose and reexplore mark superseded milestones `[~]` before
  they move (`src/core/templates/workflows/`). For every row of `TRANSITIONS`, a test runs the
  command its workflow's template writes, from the row's `from` state
  (`test/core/state-machine-workflows.test.ts`).

**Reading and rendering use git and a template** (`DEC-BOARD-READ-BY-GIT`). The `/opsp:kanban`
skill has a list playbook and a render playbook. Both use git and a POSIX shell, and neither writes
the board (`src/core/templates/workflows/opsp-kanban.ts`). The page ships as
`assets/kanban/board.html`.

`writeOpspLayer` writes the page for each tool. `init` calls it, and so do both of `update`'s
paths. It fills in a configuration block holding:

- the columns;
- the states that need an owner;
- every card's moves;
- the agent table;
- the milestone columns;
- the change-request move.

(`src/core/shared/opsp-layer.ts`, `src/core/kanban-board.ts`, `src/core/init.ts`,
`src/core/update.ts`.) The render playbook then adds the cards as base64. The page loads nothing
from the network and builds every node with `createElement` (`assets/kanban/board.html`).

**Columns and moves are data from the CLI.** The page can place no card, and offer no move, that
the CLI would not (`DEC-CONTINUE-FORWARD-ESCALATE-BACK`; `src/core/kanban-board.ts`).

- **Columns.** `KANBAN_COLUMNS` holds Backlog, Planning, Dev, Attestation and Done. Whether anyone
  holds an `exploring` card is what splits it between Backlog and Planning.
- **Continue.** The forward move is the transition to a later state, never into `declined`. An
  unheld `exploring` card goes forward by being picked up by triage, which writes an owner, not a
  state.
- **Escalate.** Every transition to an earlier state is a back move. The labels are Reexplore,
  Repropose, Request a change and Revive.

All three are derived from `TRANSITIONS` (`src/core/kanban-board.ts`):

| State | Continue → | ← Back |
|---|---|---|
| `exploring`, unheld | triage (picks it up) | — |
| `exploring`, held | propose | — |
| `proposed` | apply | — |
| `building` | apply | Repropose, Reexplore |
| `ready-for-attestation` | attest | Request a change, Repropose, Reexplore |
| `attested` | archive | — |
| `declined` | — | Revive |
| `completed` | — | — |

**A button copies a launch script and never moves a card** (`DEC-BOARD-BUTTON-LAUNCHES-SESSION`).
The script:

1. goes to the main checkout and fetches;
2. finds the worktree holding the card's branch, or adds one beside the main checkout;
3. starts the agent there with the workflow's prompt.

Hovering a button shows the prompt, the hat, the move, the landing column and when it fires
(`assets/kanban/board.html`). The agent table comes from the command adapters, through two
optional fields on `ToolCommandAdapter`: `sessionLauncher` and `commandReference`
(`src/core/command-generation/types.ts`). Only Claude Code fills them: `claude`, and generated
`/opsp:` commands (`src/core/command-generation/adapters/claude.ts`, `src/core/shared/opsp-layer.ts`).
The fallbacks:

- Where commands are not delivered, the prompt names the skill instead.
- Where an agent has no launcher, the button copies the prompt alone.
- A page generated for no tool shows no buttons.

(`src/core/shared/opsp-layer.ts`, `assets/kanban/board.html`.) Pasting the script is the operator's
consent, and the fresh session keeps attest out of the session that wrote the work
(`DEC-BOARD-BUTTON-LAUNCHES-SESSION`, `DEC-043`).

**Clicking a card opens its milestones** (`DEC-MILESTONE-BOARD`). An overlay shows the five columns
of `MILESTONE_COLUMNS`: To do, Specifying, Building, Review, and Done, with superseded milestones
struck through. It is read from the card alone, so no initiative branch is fetched. Only the next
open milestone offers "Continue: apply", and a ticket in Review offers a change request.
Escalations stay on the initiative's card (`assets/kanban/board.html`, `src/core/kanban-board.ts`).

**Surfaced, not resolved:**

- **Is the board page a GUI?** `DEC-017` records that there is no GUI, because a tool evolved this
  fast cannot carry a graphical surface that must be redesigned every time a workflow changes.
  `DEC-BOARD-READ-BY-GIT` renders the board as an HTML page. `DEC-BOARD-BUTTON-LAUNCHES-SESSION` puts
  per-workflow buttons on it, and `DEC-MILESTONE-BOARD` adds an overlay. Those buttons and that
  overlay are now built (`assets/kanban/board.html`). None of the three records cites `DEC-017`.
- **One card write skips the table.** `advance`'s card write validates against `TRANSITIONS`, but
  `kanban seed --resync` rewrites a card's state from its initiative without consulting the table.
  The code calls it a repair, on the ground that `advance` validated the state where it was set
  (`src/core/kanban.ts`). `DEC-CARD-WRITES-THROUGH-CLI` says a card moves only through a command that
  validates against the table.
- **A board field no record holds.** `DEC-026`'s invalidation trigger says that a field the board
  needs, and cannot derive from record state, belongs on the record. Under `DEC-MILESTONE-BOARD`, a
  milestone's in-progress stage lives on the card only. `stageCard` writes it there and nowhere else
  (`src/core/kanban-sync.ts`, `src/core/kanban.ts`). `DEC-026` was written about `BOARD.md`, and
  `DEC-MILESTONE-BOARD` does not cite it.
- **Back-move tooltips flatten the rungs.** On every back button, the tooltip reads "escalates to"
  the transition's hat (`assets/kanban/board.html`), and that hat comes from `TRANSITIONS`.
  - Reexplore and Repropose both read "product · maintainer", which is the hat `DEC-HAT-HANDOFFS`
    gives them. `DEC-CONTINUE-FORWARD-ESCALATE-BACK` puts reexplore on the operator's rung, as does
    the page's own legend.
  - "Request a change" reads as an escalation to product · maintainer. The same record says it sends
    the work back down to dev.

### Compile occasions

| Occasion | Compiles | Seals | Record |
|---|---|---|---|
| any time, on demand | what the operator asks for; mid-initiative is legitimate | as rendered | `DEC-031` |
| each milestone boundary inside `/opsp:apply` | stale `dev` and `devops` sections, without asking; product and maintainer are offered, and accepting means a context switch | `--hat dev --hat devops` | `DEC-COMPILE-ON-MILESTONE` |
| an approved escalation | only the hat the escalation was classified into | scoped | `DEC-COMPILE-ON-APPROVAL` |
| `/opsp:archive` | everything: archive consumes compact | unscoped | `DEC-031`, `DEC-SCOPED-SEAL` |
| `/opsp:knockdown` | the records disagree; see below | — | `DEC-014`, `DEC-031`, `DEC-KNOCKDOWN-ALL-VIEWS` |

Seal is scopeable, and it must never bless a section it did not just render (`DEC-SCOPED-SEAL`).
An initiative closes as one pull request: rebase onto `main`, attest, archive, merge. The merge is
gated on the initiative being `attested` and the views being fresh. It is never gated on whether a
bar was met (`DEC-030`).

Workflows orient on the views rather than on every record. Each load step runs
`opensprint compact plan --hat <hat> --json`, reads around anything stale, unsealed or tampered, and
opens a full record only for the decision it is about to act on (`DEC-VIEWS-FIRST-LOAD`, superseding
`DEC-015`; `DEC-009`). `architecture.md` and `DECISION-MAP.md` are not loaded by default. The map is
opened only for a blast radius, and each edge read from it is confirmed against the record's
`depends-on` (`DEC-NO-DEFAULT-ARCHITECTURE-LOAD`). When hat shapes move, records are backfilled by
`/opsp:migrate`, not by `/opsp:rebuild-assess` (`DEC-MIGRATE-SEPARATE-TOOL`;
`src/commands/migrate.ts`).

**Surfaced, not resolved:**

- **Seal is per file, not per section.** `DEC-SCOPED-SEAL` speaks of a *section's* rendered
  output. The manifest hashes the whole view file, and seal carries a hat forward only when its file
  is byte-identical to what every entry records. Otherwise every section of that hat is resealed
  against current inputs (`src/commands/compact.ts`, `src/core/compact/status.ts`). Two
  consequences:
  - A section left untouched in a file where another section was re-rendered is sealed along with
    it.
  - A section re-rendered to identical bytes cannot be sealed on its own.

  The sections no file pattern watches, this one among them, are never reported stale by code
  landing (`src/core/compact/sections.ts`).
- **Does knockdown compile?** `DEC-014` has knockdown's final phase call `compact`. `DEC-031`, which
  depends on `DEC-014`, says compact is not embedded in knockdown: the operator judges first.
  `DEC-KNOCKDOWN-ALL-VIEWS`, written after both and citing neither, has knockdown produce all five
  views as "a full compile with every hat in scope". The knockdown skill's last step invokes
  `/opsp:compact` (`src/core/templates/workflows/opsp-knockdown.ts`).

### Write modes

| Mode | Tools | Touches | Record |
|---|---|---|---|
| **create** | `/opsp:decide`, `/opsp:driver`, `/opsp:propose`, `/opsp:repropose` | a record's own content, at the altitude of the hat writing it | `DEC-027`, `DEC-BAR-AT-PROPOSE` |
| **derive** | `/opsp:compact`, `/opsp:archive` | compiled artifacts only, never a record | `DEC-027`, `DEC-006` |
| **amend** | `/opsp:attest` | `## Measures` of a record it does not own, and `## Attestation` on the initiative | `DEC-027`, `DEC-042`, `DEC-044` |

`DEC-HAT-HANDOFFS` recorded `/opsp:repropose` as borrowing **amend**. `DEC-BAR-AT-PROPOSE`
reclassified it as **create**, because repropose wears the hat that wrote the bar.

- **What repropose may change:** ADRs, a driver-spec's `## Measures`, and the milestones resting
  on them. It never changes a Statement.
- **A lowered bar.** A bar that got easier means the goal moved, so it goes to `/opsp:reexplore`
  (`DEC-HAT-HANDOFFS`, `DEC-BAR-AT-PROPOSE`, `DEC-REEXPLORE-NAME`).
- **New driver-specs.** `/opsp:propose` and `/opsp:driver` write the hat, the role and the bar when
  they create a driver-spec. Where the bar is not known, they record `unstated` rather than inventing
  one (`DEC-BAR-AT-PROPOSE`).

`checkAmendment` enforces attest's bound on records (`src/core/compact/amend.ts`). Attest also has a
second, unchecked write target: the documentation directory, `docs/` by default and configurable as
`docsDir`. It writes there only on the operator's confirmation (`DEC-044`; parsed in
`src/core/project-config.ts`).

Two kinds of write sit outside this table, and no record places either one in it:

- **The card writes.** They go to `origin/kanban` through `advance`, `claim` and `kanban`, and they
  touch no record and are not a compile (`DEC-CARD-WRITES-THROUGH-CLI`, `DEC-027`).
- **Triage's `## Triage` notes.** They are written into the initiative
  (`src/core/templates/workflows/opsp-triage.ts`).

### Escalation and attestation at runtime

**An escalation is a stage boundary.** Apply announces the pause, sets the dev hat down, names the
hat being worn for the answer, and resumes as a distinct step (`DEC-ESCALATION-IS-A-STAGE`).

- **The question.** It carries its own classification and a draft record with its blast radius.
  There is never a separate "which hat?" prompt (`DEC-CLASSIFY-IN-QUESTION`).
- **The rung.** What has to move decides it: the goal, the strategy, or the plan beneath it
  (`DEC-ESCALATION-LADDER`). `/opsp:repropose` absorbs the plan rung. The goal rung belongs to
  `/opsp:reexplore`, which writes nothing (`DEC-HAT-HANDOFFS`, `DEC-REEXPLORE-NAME`).

**Attest is a separate, human-in-the-loop tool** that runs between apply and archive (`DEC-022`). It
always exits zero, and it never blocks, approves or releases anything (`DEC-023`). What it may read
is narrow:

```
  LOADS                                     NEVER LOADS
  initiative objective and goals            the implementation source
  the bars, the test files                  the design discussion, the ADR rationales
  maintainer rows in scope                  the conversation that built it
  CI evidence artifacts                     commit bodies, the patch
  the change frame: branch, base,           any squad view's strategy blocks
    commit subjects, a file-level stat
  one view section: maintainer Posture,
    or product Measures
```

(`DEC-040`, which supersedes `DEC-033`; `DEC-ATTEST-CHANGE-FRAME`; `DEC-ATTEST-OWNING-SECTION`.)

- **The frame.** Its base is resolved in order: `--base`, then `refs/remotes/origin/HEAD`, then the
  first of `main`, `master`, `develop` and `trunk`. The base is reported with the rule that chose
  it, and the operator confirms it before any bar is read (`DEC-ATTEST-CHANGE-FRAME`;
  `src/core/change-frame.ts`, behind `opensprint frame`).
- **Authorship.** The session that wrote the implementation or its tests may not attest them
  (`DEC-043`).
- **Posture.** Posture is the judgement: evidence is required for `met`, and exposure for anything
  less (`DEC-041`).
- **Evidence.** It is a reference to a pipeline artifact. A bar that cannot be assessed before merge
  is marked `pending`, and the next initiative in that area attests it again (`DEC-032`).

## Entity Schema

All durable data is plain text in git; there is no database. It lives in three places:

- **records and compiled artifacts** in `opensprint/`, on the branch (`DEC-001`);
- **opsx changes** in `openspec/` (`CLAUDE.md`);
- **in-flight board state** on the remote branch `origin/kanban` (`DEC-BOARD-ON-REMOTE-BRANCH`).

### Relationships

```
                        ┌───────────── supersedes ─────────────┐
                        ▼                                      │
  driver-spec ◄── depends-on ── decision ◄── depends-on ── decision
  (DS-*)                        (DEC-*)
                                   ▲
                                   │ cites the id
                               rule (a test file)

  initiative ── lists ──► its driver-specs (## Driver Specs), its decisions (## ADRs)
  (state, owner)   ├────► milestones ──► one opsx change each (openspec/changes/)
       │           ├────► ## Triage   notes: weighed · leaning · open    (triage writes, propose reads)
       │           └────► ## Attestation   door · blast-radius · RACI    (attest writes)
       │
       └── mirrored by ──► card   origin/kanban:cards/<id>.md
                           + each open milestone's place in the opsx cycle   (on the card only)

  manifest entry (hat · section) ── hashes ──► its records, its observed files, the view file
```

**How the records connect:**

- A decision depends on the constraints and decisions it answers.
- A supersession replaces a record rather than editing it (`DEC-ESCALATION-LADDER`).
- To tell whether a constraint is asserted, follow the graph: a rule cites a decision, and the
  decision depends on the constraint (`DEC-013`).
- The card mirrors its initiative, and the initiative remains the source of truth for which
  milestones are done (`DEC-MILESTONE-BOARD`).

### The record entities

**Driver-spec (`DS-*`).**

- **Hats.** It declares one or more `hats`, as a string or a list, normalised to a list (`DEC-016`).
- **Role.** It declares a `role` of `goal` and/or `strategy`.
- **Objective.** For maintainer it also declares an `objective`, naming one of the seven inherited
  objectives (`DEC-018`).
- **Measures.** Its `## Measures` section takes optional `### Bar`, `### Posture`, `### Evidence`
  and `### Exposure` sub-blocks, with `mitigated-by:` inside Exposure (`DEC-019`).
- **Bar form.** A bar is written in BDD form: a user story for product, given/when/then for
  maintainer (`DEC-038`).

**Decision (`DEC-*`).**

- **Frontmatter.** `id`, `type: adr`, `status`, `created`, `depth`, `depends-on`, optional
  `supersedes`, and `hats`.
- **Body.** Question, Decision, Consideration Factors, Rationale and Invalidation Trigger. A
  maintainer strategy cell is compiled from the weighted table and the trigger (`DEC-037`).
- **Ownership.** A decision is owned by `dev` or `devops`, may CC other hats, and carries no `role`
  (`DEC-028`).
- **Status.** Both `active` and `accepted` count as current (`src/core/compact/sections.ts`).
- **Ids.** New decisions take semantic ids. `DEC-001` to `DEC-039` keep their numbers, and no new
  numbers are allocated (`DEC-036`). **Surfaced:** `DEC-040` to `DEC-044` are numbered anyway, and
  were created the day after `DEC-036` (`opensprint/ADRs/`).

**Initiative.**

- **File and id.** The filename carries a date prefix, and the id lives in frontmatter
  (`DEC-036`).
- **Frontmatter.** `id`, `status`, `state`, an optional `owner`, and `created`.
  - `state` is written only by `advance` (`DEC-STATE-MACHINE`) and takes one of seven values
    (`src/core/initiatives.ts`); see Runtime Topology for the two that `DEC-024` also names.
  - `status` is kept so that older files still parse (`DEC-024`).
  - `owner` is written by `claim` (`DEC-INITIATIVE-OWNER`).

What the parser reads from the body (`src/core/initiatives.ts`):

| Section | Read as |
|---|---|
| `## Description` | its first paragraph, folded onto one line, becomes the summary a card shows |
| `## Driver Specs`, `## ADRs` | the records the initiative claims |
| `## Milestones` | a checklist: `[ ]` open, `[x]` done, `[~]` superseded (`DEC-MILESTONE-BOARD`) |
| `## Attestation` | `door` (one-way or two-way), `blast-radius`, and a RACI table whose rows name a system or at least R and A (`DEC-042`) |

**`## Triage` is notes, not a record.** Triage writes it, and propose reads it
(`src/core/templates/workflows/opsp-triage.ts`, `src/core/templates/workflows/opsp-propose.ts`):

```
  ## Triage

  - **Weighed**: <approach> — <what it costs, what it forecloses>; <approach> — …
  - **Leaning**: <the approach, in a sentence, and why>
  - **Open**: <what must be answered before this can be formalized>
```

Triage revises the section on every resume rather than appending a second one, and commits it on
the item's branch. Propose formalizes the **Leaning** and must close each **Open** item, or record
it as `unstated` (`src/core/templates/workflows/opsp-propose.ts`). The section has no id and no
`depends-on`, and no parser or compile reads it: only the two workflow templates name it
(`src/core/templates/workflows/`).

**Surfaced, not resolved:** `DEC-039`'s invalidation trigger warns that a triage which grows
artifacts of its own has become a second propose. No record decides this section.

**Card (`origin/kanban:cards/<id>.md`).** One plain-text file per initiative. Its frontmatter,
summary and `## History` come from `DEC-BOARD-ON-REMOTE-BRANCH`. Its `## Milestones` section, with
each milestone's stage, comes from `DEC-MILESTONE-BOARD`. In code (`src/core/kanban.ts`):

```
  ---
  id: <initiative id>
  title: <the id, at import>
  state: <initiative state>
  owner: <omitted when nobody holds it>
  created: <date>
  updated: <ISO time, to the second>
  branch: opsp/<id>
  ---

  <summary: the first paragraph of the initiative's Description>

  ## Milestones

  - [todo|specifying|building|review|done|superseded] <name>: <description>

  ## History

  - <ISO time>  <what happened>  by <who>[ — <note>]
```

**How a card is written** (`src/core/kanban.ts`, `src/core/kanban-sync.ts`):

- **History.** Every write appends one history line:
  - `imported at <state> from <path>`
  - `<from> → <to>`, with the workflow and hat as its note
  - `owner <from> → <to>`, noting a takeover
  - `milestone <m>: <from> → <to>`
  - `resynced <fields> from <path>`
- **Parsing.** Cards are parsed line by line, because the page that renders them loads no
  libraries. A card written before milestones were on cards reads as having none. An unknown stage
  reads as `todo`. A card round-trips byte for byte (`src/core/kanban.ts`, `test/core/kanban.test.ts`).
- **Drift.** A card is compared with its initiative on `state`, `owner`, `summary` and `milestones`.
  `title`, `created` and `branch` are fixed at import (`src/core/kanban.ts`).

**Milestone stages.** There are six stages, in two kinds:

- `done` and `superseded` come from the initiative file.
- `specifying`, `building` and `review` exist only on the card.
- Every other open milestone is `todo`.

Stages move only along an explicit table, `MILESTONE_STAGE_MOVES` (`src/core/kanban.ts`):

| From | To | When |
|---|---|---|
| `todo` | `specifying` | its opsx change is created |
| `specifying` | `building` | its change worktree is made |
| `building` | `review` | its change is archived and merged, waiting at the checkpoint |
| `review` | `done` | the checkpoint approves it and it is checked off |
| `review` | `specifying` | a change request: a corrective opsx change |

`superseded` is reached only through the initiative file, never by a stage move
(`src/core/kanban.ts`). `stageCard` adds two rules from the file. A milestone is `done` only where
the file checks it off. A milestone leaves `todo` only when every earlier live milestone is done
(`src/core/kanban-sync.ts`). This is the cycle `DEC-MILESTONE-BOARD` decides.

**Abandoned universe.** `opensprint/abandoned/<name>/` holds a `snapshot/` of the loser's
`opensprint/` and a `migration-manifest.md` that classifies every citizen (`DEC-005`).

**Rule.** A rule is not a record. It is a test or check that cites a record's id (`DEC-013`).

### Compiled entities (derived, never edited)

| Artifact | Derived from | Checked by | Record |
|---|---|---|---|
| `opensprint/squad/<hat>.md` + `index.md` | the records each hat's sections select, plus observed files | `.manifest.json`, via `compact check`; `index.md` is not covered | `DEC-006`, `DEC-010`, `DEC-VIEWS-FIRST-LOAD` |
| `opensprint/architecture.md` | the same records, as a peer of the views | the same compile | `DEC-014` |
| `opensprint/BOARD.md` | initiative state, milestones, change status, exposures | regenerated deterministically | `DEC-026` |
| `opensprint/DECISION-MAP.md` | driver-specs and decisions | nothing | `DEC-NO-DEFAULT-ARCHITECTURE-LOAD` |
| `<toolDir>/skills/opensprint-kanban/board.html` | the shipped template plus the CLI's columns, moves and agent table | nothing; rewritten by `init` and `update` | `DEC-BOARD-READ-BY-GIT`; `src/core/shared/opsp-layer.ts` |
| `docs/` (or `docsDir`) | attest's prose, on confirmation | nothing | `DEC-044` |

A manifest entry holds these fields (`src/core/compact/manifest.ts`):

- `hat` and `section`;
- `inputs`: record id → hash;
- `observed`: path → hash;
- `inputHash` and `outputHash`.

### The inherited OpenSpec layer

The Zod schemas for opsx specs and changes come from the upstream, and no decision in this hat
covers them (`src/core/schemas/`):

- **Spec**: `name`, `overview`, at least one requirement, and optional metadata with format
  `openspec` (`src/core/schemas/spec.schema.ts`).
- **Change**: `name`, a `why` of bounded length, `whatChanges`, and from one delta up to a maximum.
  Each delta is `ADDED`, `MODIFIED`, `REMOVED` or `RENAMED` against a spec. Optional metadata has
  format `openspec-change` (`src/core/schemas/change.schema.ts`).
- **Requirement**: text containing `SHALL` or `MUST`, with at least one scenario
  (`src/core/schemas/base.schema.ts`).

## Open Loops

This section lists only what the harvest reported for this hat; nothing here is inferred. Open
loops are the backlog. Triage turns them into work through `/opsp:explore`, then `/opsp:propose`
(`DEC-007`).

### `decision-unguarded` — a decision no rule cites

Twelve decisions have no rule citing them. A rule is a test or check that cites a record's id
(`DEC-013`).

| Area | Decisions |
|---|---|
| ownership and the cross-branch board | `DEC-INITIATIVE-OWNER`, `DEC-BOARD-ALL-BRANCHES` |
| what a workflow loads | `DEC-VIEWS-FIRST-LOAD`, `DEC-NO-DEFAULT-ARCHITECTURE-LOAD`, `DEC-ATTEST-OWNING-SECTION` |
| compile and harvest | `DEC-008`, `DEC-013`, `DEC-031` |
| surface and reconciliation | `DEC-017`, `DEC-005` |
| shared with another hat | `DEC-020` (maintainer), `DEC-032` (devops) |

`DEC-INITIATIVE-OWNER` is still unguarded, even though claiming now writes the card first. The
claim tests cite no record id (`test/cli-e2e/claim.test.ts`). A test that cites nothing guards
nothing (`DEC-013`).

**Every live-board decision has at least one test citing it:**

| Test | Cites |
|---|---|
| `test/core/kanban.test.ts` | `DEC-BOARD-ON-REMOTE-BRANCH`, `DEC-CARD-WRITES-THROUGH-CLI`, `DEC-MILESTONE-BOARD` |
| `test/core/kanban-skill.test.ts` | `DEC-BOARD-READ-BY-GIT`, `DEC-CONTINUE-FORWARD-ESCALATE-BACK` |
| `test/core/kanban-actions.test.ts` | `DEC-CONTINUE-FORWARD-ESCALATE-BACK`, `DEC-BOARD-BUTTON-LAUNCHES-SESSION` |
| `test/core/kanban-sync.test.ts` | `DEC-CARD-WRITES-THROUGH-CLI`, `DEC-STATE-MACHINE`, `DEC-MILESTONE-BOARD` |
| `test/core/opsp-resume.test.ts` | `DEC-CONTINUE-FORWARD-ESCALATE-BACK`, `DEC-BOARD-BUTTON-LAUNCHES-SESSION` |
| `test/core/kanban-milestones.test.ts` | `DEC-MILESTONE-BOARD` |
| `test/core/state-machine-workflows.test.ts` | `DEC-STATE-MACHINE`, `DEC-HAT-HANDOFFS`, `DEC-043` |

`state-machine-workflows.test.ts` now runs, for every row of `TRANSITIONS`, the `advance` its
workflow's template writes, from the row's `from` state, so a handoff whose template names no
`--hat` fails it (`DEC-STATE-MACHINE`, `DEC-HAT-HANDOFFS`). `kanban-skill.test.ts` and
`kanban-milestones.test.ts` also cite `DS-LIVE-BOARD` and `DS-RUNTIME-LESS-BOARD`; a driver-spec
cited by a test is not a guarded decision (`DEC-013`), so neither changes the table above. The page
tests run the page's own script against a DOM stand-in, `test/helpers/board-dom.ts`.

All seven `kanban` milestones are checked off (`opensprint/initiatives/20261018-kanban.md`).
