# dev — how is it built?

Describes **the system**, citing decisions where they explain a choice and paths where they were
observed. Sixty-four decisions feed this hat; none of them are enumerated here, because a list of
condensed ADRs tells a reader nothing about what was built (`DS-BIG-PICTURE`).

**Nothing below is attested.** Claims citing a path are *observed* — true of the code today, and
possibly accidental. Claims citing a record are *decided* — binding, and not necessarily true yet
(`DS-ATTESTED-TRUTH`, `DEC-021`).

## Tech Stack

A TypeScript command-line tool, published as `@ivan-lee/opensprint` with one binary, `opensprint`,
pointing at `bin/openspec.js`; an ES module package requiring Node `>=20.19.0` (`package.json`).
`tsc` compiles `src/` to `dist/` at ES2022 with `NodeNext` modules, `strict`, declarations and source
maps (`tsconfig.json`); `build` runs `node build.js` (`package.json`).

**No decision in this hat chooses a package.** The stack below is observed, not decided. The project
is a fork of Fission AI's OpenSpec (`CLAUDE.md`), and the npm lockfile still names the upstream
package (see below).

| Package | Declared | Resolved | Seen in |
|---|---|---|---|
| `commander` | `^14.0.0` | 14.0.3 | the command tree (`src/cli/index.ts`) |
| `zod` | `^4.0.17` | 4.3.6 | the OpenSpec schemas (`src/core/schemas/`) and config parsing (`src/core/project-config.ts`) |
| `yaml` | `^2.8.2` | 2.8.3 | record frontmatter and config (`src/core/decision-map.ts`, `src/core/project-config.ts`) |
| `fast-glob` | `^3.3.3` | 3.3.3 | file matching (`src/utils/file-system.ts`, `src/core/artifact-graph/outputs.ts`) |
| `chalk` · `ora` | `^5.5.0` · `^8.2.0` | 5.6.2 · 8.2.0 | terminal output and failure lines (`src/commands/kanban.ts`, `src/cli/index.ts`) |
| `@inquirer/core` · `@inquirer/prompts` | `^10.2.2` · `^7.8.0` | 10.3.2 · 7.10.1 | interactive prompts, imported dynamically by convention (`CLAUDE.md`) |
| `posthog-node` | `^5.20.0` | 5.29.2 | usage telemetry (`src/telemetry/index.ts`) |

Development: TypeScript 5.9.3, Vitest 3.2.4 with `@vitest/ui`, ESLint 9.39.4 with
`typescript-eslint` 8.58.2, `@types/node` 24.12.2, and Changesets 2.30.0 with its GitHub changelog
0.5.2 (`package.json`, `pnpm-lock.yaml`).

**The live board added no dependency.** `src/core/kanban.ts` imports only `node:child_process`,
`node:fs`, `node:os` and `node:path`, and does all of its work by running the `git` executable.
That is the decided shape: card writes go through the CLI because it is the tool that installed the
skills, so it adds nothing (`DEC-CARD-WRITES-THROUGH-CLI`), and the reading client needs only git,
the installed skill and a browser — node is explicitly ruled out there (`DEC-BOARD-READ-BY-GIT`,
answering `DS-RUNTIME-LESS-BOARD`).

### Package manager and lockfiles

- **pnpm is the declared manager** — `packageManager: pnpm@9.15.9` (`package.json`) — and CI
  installs with `pnpm install --frozen-lockfile` (`CLAUDE.md`).
- **`pnpm-lock.yaml` is `lockfileVersion: '6.0'`** (`pnpm-lock.yaml`), an older format than the one
  pnpm 9 writes.
- **A second lockfile is present and stale.** `package-lock.json` names `@fission-ai/openspec`
  1.2.0 with a binary called `openspec` (`package-lock.json`) — the upstream package, not this one.
  Its dependency ranges match `package.json`; nothing records why it is kept.

### What the stack is used to generate

The product surface is the CLI plus the skill and command files it writes into a downstream project;
there is no GUI and the tool ships no CI/CD product (`DEC-017`). Workflow content is TypeScript
template strings, one file per workflow (`src/core/templates/workflows/`), formatted per agent tool
by the command adapters (`src/core/command-generation/adapters/`).

**The board's skill and template are not generated yet.** Decided: the template ships with
opensprint (`DEC-BOARD-READ-BY-GIT`), and each agent's launch command comes from the command adapters
(`DEC-BOARD-BUTTON-LAUNCHES-SESSION`). Observed: the only copy is a hand-written proof of concept in
this repository's own agent directory (`.claude/skills/opensprint-kanban/SKILL.md`,
`.claude/skills/opensprint-kanban/board.html`), and no workflow template under
`src/core/templates/` mentions the board. Shipping it through `init` and `update` is the open
`board-skill-template` milestone (`opensprint/initiatives/20261018-kanban.md`).

## Runtime Topology

### Two halves, one process boundary

```
   operator
      │  invokes a workflow, or pastes a command copied from the board
      ▼
   agent session ── skill text (src/core/templates/workflows/)      synthetic: needs a model
      │  runs
      ▼
   opensprint ───── one command, then exits                          deterministic: no model
      │
      ├── opensprint/          records, squad views, manifest, BOARD.md   (this checkout's tree)
      ├── openspec/            opsx changes, specs, config.yaml
      ├── git: opsp/* refs     other initiatives' committed trees, read without a checkout
      └── git: origin/kanban   one card per initiative; fetched and read, written by fast-forward
```

Grouping, hashing, staleness and gating live in code so they can be verified without a model;
condensing prose lives in a skill (`DEC-022`). That split is why rendering cannot run in CI — a
pipeline has no agent and no hat (`DEC-COMPILE-ON-MILESTONE`). Nothing stays running: the CLI runs
one command and exits (`DEC-CARD-WRITES-THROUGH-CLI`), and the board page runs nothing at all
(`DEC-BOARD-BUTTON-LAUNCHES-SESSION`).

`compact` is the single compile engine, and `architecture.md` is a sibling output of it rather than
an input (`DEC-014`). Views are compiled and never hand-edited — if a view is wrong, the system is
wrong (`DEC-006`). A per-section manifest records the inputs and the rendered output, and
`compact check` fails on anything stale or tampered (`DEC-010`); a stale section is rebuilt from its
full inputs, never patched (`DEC-011`). The engine's commands — `plan`, `seal`, `board`, `check`,
`loops` — are registered under `compact` (`src/cli/index.ts`, `src/commands/compact.ts`,
`src/core/compact/`).

Whether a decision is guarded is harvested from code: a test or check that cites a record id is a
rule, and the record says nothing about its rules (`DEC-013`). The id pattern matches both numbered
and semantic ids (`src/core/compact/rules.ts`), which was the prerequisite for semantic decision ids
(`DEC-036`).

### Universes are worktrees, and an initiative is one branch

Each git branch or worktree is a universe; `opensprint/` lives in the branch and travels with the
code, with no copy and no synchronisation daemon (`DEC-001`). Planning happens in the initiative's
own worktree, which `/opsp:backlog`, `/opsp:triage` and `/opsp:propose` create or switch to, so an
initiative is one `opsp/<initiative>` branch from first thought and reaches `main` exactly once
(`DEC-029`). New decisions take semantic ids and initiative files take a date prefix, so two
worktrees cannot allocate the same name (`DEC-036`).

The cost `DEC-029` recorded — a board compiled in one checkout shows only that branch — has been
answered twice, and the second answer amends the first:

1. **Printed on demand.** `opensprint compact board --all-branches` reads every local and
   remote-tracking `opsp/*` branch's initiative from committed trees and writes nothing; the
   checkout wins, and a fetched copy wins only when strictly ahead (`DEC-BOARD-ALL-BRANCHES`).
   Observed: refs are listed with `for-each-ref` and blobs read in one `cat-file --batch`
   (`src/core/initiative-git.ts`).
2. **A central store.** In-flight state moves to a dedicated remote branch, which amends the rejected
   neighbour of `DEC-BOARD-ALL-BRANCHES` and runs beside the compiled `BOARD.md` rather than
   replacing it (`DEC-BOARD-ON-REMOTE-BRANCH`, `DEC-026`). See *The boards* below.

### Reconciliation across universes

When two universes' surrogates diverge, the agent reasons and the operator confirms; only purely
additive or identical content is auto-accepted (`DEC-002`). Citizens are traversed depth-first —
initiative, then its ADRs, then its active changes — and each is classed MIGRATE, CONFLICT,
REDUNDANT or SUPERSEDED, pausing at the initiative boundary on any conflict (`DEC-003`). Both
`/opsp:rebase` and `/opsp:abandon` open with a read-only planning phase that produces a conflict
manifest and waits for confirmation (`DEC-004`). An abandoned universe is preserved as a snapshot
plus a migration manifest, and only then is its worktree removed (`DEC-005`). The post-reconciliation
rebuild calls `compact` rather than synthesising independently (`DEC-014`).

### The initiative lifecycle

```
  explore ──► backlog ──► triage ───────► propose ──► apply ─────────────────► attest ──► archive
  (writes     exploring   claims, or      proposed    building, then           attested   completed
   nothing)               declines                    ready-for-attestation
```

Explore writes nothing; `/opsp:backlog` is the deliberate flush to an initiative at `exploring`
(`DEC-034`). `/opsp:triage` is its own tool — advance, decline or return — so that `/opsp:propose`
is purely the formalizer (`DEC-039`). State is declared by the tool and checked by code (`DEC-024`),
`declined` is terminal but revivable (`DEC-035`), and every transition is made by
`opensprint advance`, which validates the move, writes the field and regenerates `BOARD.md`; a legal
move into a state the content contradicts is written and reported, not refused
(`DEC-STATE-MACHINE`). Observed: `advance` writes the state and regenerates the board
(`src/commands/advance.ts`).

The table is twelve moves. Each names the hat it must be made wearing, and a handoff refuses the
move until `--hat` names an accepted accountability (`DEC-HAT-HANDOFFS`). The backward rungs come
from `DEC-ESCALATION-LADDER`, with the goal rung's tool named `/opsp:reexplore` (`DEC-REEXPLORE-NAME`,
which corrects the `/opsp:reideate` of `DEC-HAT-HANDOFFS`):

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

Observed: the same twelve rows, with the same handoff flags, are `TRANSITIONS`
(`src/core/initiative-transitions.ts`), and `advance` takes `--hat` (`src/cli/index.ts`).

**Surfaced, not resolved.** `DEC-024` keeps `abandoned` and `superseded` available to
`/opsp:abandon`. The code's state list is the seven above and no transition reaches either
(`src/core/initiatives.ts`, `src/core/initiative-transitions.ts`).

**Who holds a card** is an optional `owner:` field, written by `opensprint claim` — git's
`user.name` by default — which never moves the state; `/opsp:triage` and `/opsp:apply` claim at the
moment of commitment, `/opsp:backlog` never does (`DEC-INITIATIVE-OWNER`). Observed: `claim` writes
the initiative's owner and regenerates `BOARD.md`, and refuses a terminal initiative
(`src/commands/claim.ts`). It does not touch `origin/kanban`.

### The boards — compiled, printed, live

Three artifacts answer "where is everything", and they run side by side:

| | What it shows | Written by | Status |
|---|---|---|---|
| `BOARD.md` | the checkout's initiatives by state, with the roadmap | regenerated by `compact seal`, `advance` and `claim`; never edited (`DEC-026`) | observed (`src/commands/compact.ts`, `src/commands/advance.ts`, `src/commands/claim.ts`) |
| `compact board --all-branches` | every `opsp/*` branch's card, after a fetch | writes nothing (`DEC-BOARD-ALL-BRANCHES`) | observed (`src/cli/index.ts`) |
| `origin/kanban` | one card per initiative, the same from every checkout | only `opensprint kanban …` (`DEC-CARD-WRITES-THROUGH-CLI`) | store built; reads, buttons and workflow writes decided only |

**The live board is a dedicated remote branch** holding nothing but a README and `cards/<id>.md`.
Every move is a commit, so `git log` of the branch is the board's history; the branch is never
checked out to read and never edited by hand; a completed initiative's card stays as a static
record (`DEC-BOARD-ON-REMOTE-BRANCH`). One file per card keeps concurrent moves on different cards
from conflicting at all (`DEC-BOARD-ON-REMOTE-BRANCH`).

**What the first milestone built** (`board-store`, `opensprint/initiatives/20261018-kanban.md`):

```
  transact — up to 8 attempts                                         src/core/kanban.ts
  ┌───────────────────────────────────────────────────────────────────────────────┐
  │ ls-remote <remote> refs/heads/kanban     exact ref: a pattern would match      │
  │                                          refs/heads/opsp/kanban too            │
  │ fetch → refs/remotes/<remote>/kanban     nothing checked out                   │
  │ ls-tree cards/ + cat-file --batch        every card, parsed                    │
  │ decide(board)                            nothing to write? → return            │
  │ throwaway GIT_INDEX_FILE                 read-tree parent, update-index,       │
  │                                          write-tree, commit-tree               │
  │                                          (no parent on the first write: orphan)│
  │ push <commit>:refs/heads/kanban          no --force                            │
  │   accepted → move the tracking ref; done                                       │
  │   rejected → ask the remote where the board is:                                │
  │                moved     → lost a race: back off (≤ 2s, jittered), re-read     │
  │                unmoved   → throw git's own reason                              │
  └───────────────────────────────────────────────────────────────────────────────┘
  after 8 lost races: give up, nothing written
```

A lost race is told apart from a failed push by asking the remote, not by parsing git's message
(`src/core/kanban.ts`). Two commands sit on it — `opensprint kanban init` creates the board and seeds
it in one commit, and does nothing where one exists; `opensprint kanban seed` adds missing cards and
reports cards that disagree with their initiative, rewriting them with `--resync`. Both take
`--remote` (default `origin`), `--dry-run` and `--json` (`src/commands/kanban.ts`,
`src/cli/index.ts`). Seeding collects every initiative this machine knows with
`DEC-BOARD-ALL-BRANCHES`'s precedence (`src/commands/kanban.ts`). All of it runs in tests against a
real bare remote with a second clone as the competing writer (`test/core/kanban.test.ts`).

**Decided and not yet built** — open milestones in `opensprint/initiatives/20261018-kanban.md`:

- **Reading is a git playbook, rendering a static template.** List with `git fetch`, `ls-tree` and
  `show` over `cards/`; fill a template shipped with opensprint, each card as base64 plus a metadata
  block naming the ref, the commit and the main checkout; the page loads nothing from the network,
  and refreshing is rendering again. No script, no server (`DEC-BOARD-READ-BY-GIT`). Observed only as
  the proof of concept — a POSIX-shell playbook, and a page decoding with `atob` and `TextDecoder`
  (`.claude/skills/opensprint-kanban/SKILL.md`, `.claude/skills/opensprint-kanban/board.html`).
- **Every move writes its card through the CLI**, validated against `advance`'s table, with a
  history line, as a fast-forward; `claim` refuses a card someone else holds unless told to take it
  over (`DEC-CARD-WRITES-THROUGH-CLI`). Today no workflow writes a card: a card catches up with its
  initiative only when someone runs `kanban seed --resync` (`src/commands/kanban.ts`,
  `src/commands/claim.ts`).
- **Each column is a stage with one workflow.** Backlog is `exploring` and unowned, Planning is
  `exploring` and claimed, Dev is `proposed` and `building`, Attestation is `ready-for-attestation`
  and `attested`, Done is `completed` and `declined`. Forward is always "continue"; backward is an
  escalation up the ladder; no drag-and-drop, and no move the state machine does not allow
  (`DEC-CONTINUE-FORWARD-ESCALATE-BACK`, `DEC-ESCALATION-LADDER`, `DEC-INITIATIVE-OWNER`). Per state,
  the backward edges that exist leave only `building` and `ready-for-attestation`
  (`src/core/initiative-transitions.ts`), so a `proposed` or `attested` card offers continue alone —
  which the proof-of-concept page already does (`.claude/skills/opensprint-kanban/board.html`).
- **A button copies a command and never moves a card.** The command finds or makes the card's
  worktree and starts a **fresh** agent session there with the workflow invoked; pasting it is the
  operator's consent. The agent is one table — how to start a session with a prompt, and what a
  workflow is called — starting with Claude Code (`DEC-BOARD-BUTTON-LAUNCHES-SESSION`). The fresh
  session is governance: attest may not run where the work was written (`DEC-043`).
- **An initiative opens onto its milestones** in five columns that follow the opsx cycle — To do,
  Specifying, Building, Review, Done. Only the next open milestone offers "continue: apply"; Review
  offers a change request back to Specifying; escalation stays on the initiative's card
  (`DEC-MILESTONE-BOARD`). Observed: cards already carry each milestone and its stage
  (`src/core/kanban.ts`); nothing renders them yet.

**Surfaced, not resolved:**

- **Is the board page a GUI?** `DEC-017` records that there is no GUI, because a tool evolved this
  fast cannot carry a graphical surface redesigned every time a workflow changes.
  `DEC-BOARD-READ-BY-GIT` renders the board as an HTML page in a browser, and
  `DEC-BOARD-BUTTON-LAUNCHES-SESSION` puts per-workflow buttons on it. Neither new record cites
  `DEC-017`.
- **A card move that does not consult the table.** `DEC-CARD-WRITES-THROUGH-CLI` says a card moves
  only through a command that validates against `advance`'s table. `kanban seed --resync` rewrites a
  card's state from its initiative without consulting that table — the code calls it a repair, on
  the ground that `advance` validated the state where it was set (`src/core/kanban.ts`).
- **A board field no record holds.** `DEC-026`'s invalidation trigger says a field the board needs
  that is not derivable from record state belongs on the record. `DEC-MILESTONE-BOARD` puts a
  milestone's in-progress stage on the card only, and the code writes it "to the card and nowhere
  else" (`src/core/kanban.ts`). `DEC-026` was written about `BOARD.md`, and `DEC-MILESTONE-BOARD` does
  not cite it.
- **The proof-of-concept skill disagrees with itself.** Its storage table maps Planning to `proposed`
  and Dev to `building`; its own later table, its page, and `DEC-CONTINUE-FORWARD-ESCALATE-BACK` put
  claimed `exploring` in Planning and `proposed` in Dev (`.claude/skills/opensprint-kanban/SKILL.md`,
  `.claude/skills/opensprint-kanban/board.html`).

### Compile occasions

| Occasion | Compiles | Seals | Record |
|---|---|---|---|
| any time, on demand | whatever the operator asks; mid-initiative is legitimate | as rendered | `DEC-031` |
| each milestone boundary inside `/opsp:apply` | stale `dev` and `devops` sections, without asking; product and maintainer are offered, and accepting is a context switch | `--hat dev --hat devops` | `DEC-COMPILE-ON-MILESTONE` |
| an approved escalation | the one hat the escalation was classified into | scoped | `DEC-COMPILE-ON-APPROVAL` |
| `/opsp:archive` | everything — archive consumes compact | unscoped | `DEC-031`, `DEC-SCOPED-SEAL` |
| `/opsp:knockdown` | the records disagree — see below | — | `DEC-014`, `DEC-031`, `DEC-KNOCKDOWN-ALL-VIEWS` |

Seal is scopeable and must never bless a section it did not just render (`DEC-SCOPED-SEAL`). An
initiative closes as one pull request — rebase onto `main`, attest, archive, merge — gated on the
initiative being `attested` and the views fresh, never on whether a bar was met (`DEC-030`).

**Surfaced, not resolved — does knockdown compile?** `DEC-014` has knockdown's final phase call
`compact`. `DEC-031`, which depends on `DEC-014`, says compact is **not** embedded in knockdown: the
operator judges the inferred surrogate first, then decides when to compact. `DEC-KNOCKDOWN-ALL-VIEWS`,
written after both and citing neither, has knockdown produce all five views as "a full compile with
every hat in scope". Observed: the knockdown skill's last step invokes `/opsp:compact` and says all
five views are produced (`src/core/templates/workflows/opsp-knockdown.ts`).

**Surfaced, not resolved.** `DEC-SCOPED-SEAL` speaks of a *section's* rendered output. The manifest
hashes the whole view file, and seal carries a hat forward only when the file is byte-identical to
what every entry records; otherwise every section of that hat is resealed against current inputs
(`src/commands/compact.ts`, `src/core/compact/status.ts`). A stale section left untouched in a file
where another section was re-rendered is therefore blessed with it, and a section re-rendered to
identical bytes cannot be sealed on its own.

Workflows orient on the views rather than every record: each load step runs
`opensprint compact plan --hat <hat> --json`, reads around anything stale, unsealed or tampered, and
opens a full record only for the decision it is about to act on (`DEC-VIEWS-FIRST-LOAD`, which
supersedes `DEC-015`; `DEC-009`). `architecture.md` and `DECISION-MAP.md` leave the default load; the
map is opened only for a blast radius and each edge is confirmed against the record's `depends-on`
(`DEC-NO-DEFAULT-ARCHITECTURE-LOAD`). Records whose hat shapes moved are backfilled by its own tool,
`/opsp:migrate`, not by `/opsp:rebuild-assess` (`DEC-MIGRATE-SEPARATE-TOOL`; `src/commands/migrate.ts`).

### Write modes

| Mode | Tools | Touches | Record |
|---|---|---|---|
| **create** | `/opsp:decide`, `/opsp:driver`, `/opsp:propose`, `/opsp:repropose` | a record's own content, at the altitude of the hat writing it | `DEC-027`, `DEC-BAR-AT-PROPOSE` |
| **derive** | `/opsp:compact`, `/opsp:archive` | compiled artifacts only, never a record | `DEC-027`, `DEC-006` |
| **amend** | `/opsp:attest` | `## Measures` of a record it does not own, and `## Attestation` on the initiative | `DEC-027`, `DEC-042`, `DEC-044` |

`DEC-HAT-HANDOFFS` recorded `/opsp:repropose` as borrowing **amend**; `DEC-BAR-AT-PROPOSE` reclassified
it as **create**, because repropose wears the hat that wrote the bar. Repropose may change ADRs, a
driver-spec's `## Measures` and the milestones resting on them, never a Statement; a bar that got
easier is a goal that moved and goes to `/opsp:reexplore` (`DEC-HAT-HANDOFFS`, `DEC-BAR-AT-PROPOSE`,
`DEC-REEXPLORE-NAME`). `/opsp:propose` and `/opsp:driver` write the hat, the role and the bar when
they create a driver-spec, recording `unstated` rather than inventing one (`DEC-BAR-AT-PROPOSE`).

Attest's bound on records is checked by `checkAmendment` (`src/core/compact/amend.ts`). It also has a
second, unchecked write target: the documentation directory, `docs/` by default and configurable as
`docsDir`, written only on the operator's confirmation (`DEC-044`; parsed in
`src/core/project-config.ts`).

The card writes on `origin/kanban` touch no record and are not a compile; no record places them in
this table (`DEC-CARD-WRITES-THROUGH-CLI`, `DEC-027`).

### Escalation and attestation at runtime

**An escalation is a stage boundary**: apply announces the pause, sets the dev hat down, names the
hat being worn for the answer, and resumes as a distinct step (`DEC-ESCALATION-IS-A-STAGE`). The
question carries its own classification and a draft record with its blast radius; there is never a
separate "which hat?" prompt (`DEC-CLASSIFY-IN-QUESTION`). What has to move decides the rung — the
goal, the strategy, or the plan beneath it (`DEC-ESCALATION-LADDER`) — with the plan rung absorbed by
`/opsp:repropose` and the goal rung given to `/opsp:reexplore`, which writes nothing
(`DEC-HAT-HANDOFFS`, `DEC-REEXPLORE-NAME`).

**Attest is a separate, human-in-the-loop tool** between apply and archive (`DEC-022`). It always
exits zero and never blocks, approves or releases anything (`DEC-023`). What it may read is narrow:

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

(`DEC-040`, which supersedes `DEC-033`; `DEC-ATTEST-CHANGE-FRAME`; `DEC-ATTEST-OWNING-SECTION`.) The
frame's base is `--base`, then `refs/remotes/origin/HEAD`, then the first of `main`, `master`,
`develop`, `trunk`, reported with the rule that fired and confirmed before any bar is read
(`DEC-ATTEST-CHANGE-FRAME`; observed in `src/core/change-frame.ts`, behind `opensprint frame`). The
session that wrote the implementation or its tests may not attest them (`DEC-043`). Posture is the
judgement; evidence is required for `met`, exposure for anything less (`DEC-041`). Evidence is a
reference to a pipeline artifact, and a bar that cannot be assessed before merge is `pending` and
re-attested by the next initiative in that area (`DEC-032`).

## Entity Schema

All durable data is plain text in git; there is no database. Records and compiled artifacts live in
`opensprint/` on the branch (`DEC-001`), opsx changes in `openspec/` (`CLAUDE.md`), and in-flight
board state on `origin/kanban` (`DEC-BOARD-ON-REMOTE-BRANCH`).

### Relationships

```
                        ┌───────────── supersedes ─────────────┐
                        ▼                                      │
  driver-spec ◄── depends-on ── decision ◄── depends-on ── decision
  (DS-*)                        (DEC-*)
       ▲                           ▲
       │                           │ cites the id
       │                       rule (a test file)
       │
  initiative ── lists ──► its driver-specs, its decisions
  (state, owner)    └──► milestones ──► one opsx change each (openspec/changes/)
       │
       └── mirrored by ──► card  origin/kanban:cards/<id>.md
                           + where each open milestone is in the opsx cycle  (card only)

  manifest entry (hat · section) ── hashes ──► its records, its observed files, the view file
```

A decision depends on the constraints and decisions it answers, and a supersession replaces rather
than edits (`DEC-ESCALATION-LADDER`). Whether a constraint is asserted is answered by following the
graph: a rule cites a decision, and the decision depends on the constraint (`DEC-013`). The card
mirrors its initiative, which stays the source of truth for which milestones are done
(`DEC-MILESTONE-BOARD`).

### The record entities

**Driver-spec (`DS-*`).** Declares one or more `hats` — a string or a list, normalised to a list
(`DEC-016`); a `role` of `goal` and/or `strategy`, and for maintainer an `objective` naming one of the
seven inherited objectives (`DEC-018`). Its `## Measures` takes optional `### Bar`, `### Posture`,
`### Evidence` and `### Exposure` sub-blocks, with `mitigated-by:` inside Exposure (`DEC-019`). A bar
is BDD — a user story for product, given/when/then for maintainer (`DEC-038`).

**Decision (`DEC-*`).** Frontmatter `id`, `type: adr`, `status`, `created`, `depth`, `depends-on`,
optional `supersedes`, and `hats`; a body of Question, Decision, Consideration Factors, Rationale and
Invalidation Trigger, whose weighted table and trigger are what a maintainer strategy cell is compiled
from (`DEC-037`). A decision is owned by `dev` or `devops`, may CC other hats, and carries no `role`
(`DEC-028`). Both `active` and `accepted` count as current (`src/core/compact/sections.ts`).

New decisions take semantic ids, and `DEC-001` to `DEC-039` keep their numbers with no new ones
allocated (`DEC-036`). **Surfaced:** `DEC-040` to `DEC-044`, created the day after `DEC-036`, are
numbered (`opensprint/ADRs/`).

**Initiative.** A date-prefixed filename with the id in frontmatter (`DEC-036`); `state`, written only
by `advance` (`DEC-STATE-MACHINE`), beside the older `status`, kept so earlier files still parse
(`DEC-024`); an optional `owner` (`DEC-INITIATIVE-OWNER`). Milestones are a checklist — `[ ]` open,
`[x]` done, `[~]` superseded (`DEC-MILESTONE-BOARD`; parsed in `src/core/initiatives.ts`). Attest
writes an `## Attestation` section: `door` (one-way or two-way), `blast-radius`, and a RACI table
that names a system or at least R and A (`DEC-042`).

**Card (`origin/kanban:cards/<id>.md`).** Frontmatter `id`, `title`, `state`, `owner`, `created`,
`updated`, `branch`, then a summary and a `## History` list, one line per move
(`DEC-BOARD-ON-REMOTE-BRANCH`), plus the initiative's milestones with the stage each is at
(`DEC-MILESTONE-BOARD`). Observed:

```
  ---
  id: <initiative id>
  title: <the id, at import>
  state: <initiative state>
  owner: <omitted when nobody holds it>
  created: <date>
  updated: <ISO time>
  branch: opsp/<id>
  ---

  <summary: the initiative's first paragraph>

  ## Milestones

  - [todo|specifying|building|review|done|superseded] <name>: <description>

  ## History

  - <ISO time>  <what happened>  by <who>[ — <note>]
```

(`src/core/kanban.ts`.) Parsing is line-based because the page that renders cards loads no libraries;
a card written before milestones were on cards reads as having none, an unknown stage reads as `todo`,
and a card round-trips byte for byte (`src/core/kanban.ts`, `test/core/kanban.test.ts`). `done` and
`superseded` come from the initiative file; `specifying`, `building` and `review` exist only on the
card. A card is compared with its initiative on `state`, `owner`, `summary` and `milestones`;
`title`, `created` and `branch` are fixed at import (`src/core/kanban.ts`).

**Abandoned universe.** `opensprint/abandoned/<name>/` holds a `snapshot/` of the loser's
`opensprint/` and a `migration-manifest.md` classifying every citizen (`DEC-005`).

**Rule.** Not a record: a test or check that cites a record id (`DEC-013`).

### Compiled entities (derived, never edited)

| Artifact | Compiled from | Checked by | Record |
|---|---|---|---|
| `opensprint/squad/<hat>.md` + `index.md` | the records each hat's sections select, plus observed files | `.manifest.json`, via `compact check` (`index.md` is not covered) | `DEC-006`, `DEC-010`, `DEC-VIEWS-FIRST-LOAD` |
| `opensprint/architecture.md` | the same records, as a peer of the views | the same compile | `DEC-014` |
| `opensprint/BOARD.md` | initiative state, milestones, change status, exposures | regenerated deterministically | `DEC-026` |
| `opensprint/DECISION-MAP.md` | driver-specs and decisions | nothing | `DEC-NO-DEFAULT-ARCHITECTURE-LOAD` |
| `docs/` (or `docsDir`) | attest's prose, on confirmation | nothing | `DEC-044` |

A manifest entry is `hat`, `section`, `inputs` (record id → hash), `observed` (path → hash),
`inputHash` and `outputHash` (`src/core/compact/manifest.ts`).

### The inherited OpenSpec layer

The Zod schemas for opsx specs and changes come from the upstream, and no decision in this hat covers
them (`src/core/schemas/`):

- **Spec** — `name`, `overview`, at least one requirement, optional metadata with format `openspec`
  (`src/core/schemas/spec.schema.ts`).
- **Change** — `name`, a bounded-length `why`, `whatChanges`, one to a maximum number of deltas, each
  `ADDED`, `MODIFIED`, `REMOVED` or `RENAMED` against a spec, optional metadata with format
  `openspec-change` (`src/core/schemas/change.schema.ts`).
- **Requirement** — text containing `SHALL` or `MUST`, with at least one scenario
  (`src/core/schemas/base.schema.ts`).

## Open Loops

Only what the harvest reported for this hat. Open loops are the backlog, and `/opsp:explore` →
`/opsp:propose` is the triage that turns them into work (`DEC-007`).

### `decision-unguarded` — a decision no rule cites

Fifteen decisions. A rule is a test or check that cites the record id (`DEC-013`).

| Area | Decisions |
|---|---|
| the live board | `DEC-BOARD-READ-BY-GIT`, `DEC-CONTINUE-FORWARD-ESCALATE-BACK`, `DEC-BOARD-BUTTON-LAUNCHES-SESSION` |
| ownership and the cross-branch board | `DEC-INITIATIVE-OWNER`, `DEC-BOARD-ALL-BRANCHES` |
| what a workflow loads | `DEC-VIEWS-FIRST-LOAD`, `DEC-NO-DEFAULT-ARCHITECTURE-LOAD`, `DEC-ATTEST-OWNING-SECTION` |
| compile and harvest | `DEC-008`, `DEC-013`, `DEC-031` |
| surface and reconciliation | `DEC-017`, `DEC-005` |
| shared with another hat | `DEC-020` (maintainer), `DEC-032` (devops) |

The three live-board decisions here are the ones whose milestones are still open — the read
playbook and template, the stage buttons, the launch command (`opensprint/initiatives/20261018-kanban.md`).
The three the first milestone built against — `DEC-BOARD-ON-REMOTE-BRANCH`,
`DEC-CARD-WRITES-THROUGH-CLI`, `DEC-MILESTONE-BOARD` — are absent because `test/core/kanban.test.ts`,
new since the last compile, cites them; for `DEC-MILESTONE-BOARD` what it asserts is the stage
vocabulary on a card, not the milestone board. `src/commands/kanban.ts` names
`DEC-BOARD-READ-BY-GIT` in a comment, which is source rather than a rule, so it guards nothing
(`DEC-013`).
