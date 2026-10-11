# Architecture

> **How to read this document.** It is compiled from 26 active driver-specs and 54 active ADRs
> (57 ADR files, three of them superseded). Every claim cites the record it derives from, inline.
>
> **Nothing here is attested.** Thirteen driver-specs carry a `### Posture` verdict recorded on
> 2026-10-11 by Ivan Lee: ten **partially met**, two **cannot assess**, one **not met**, and none
> **met**. So no record is `attested`, and no sentence below is a present-tense claim about how the
> running system behaves. A sentence citing a record id states what was **decided** (`DEC-021`,
> `DS-ATTESTED-TRUTH`). Where a record carries a posture, that posture is given next to the decision,
> because the gap between the two is the information.

---

## System Overview

OpenSprint is decided to be an engineering harness that supports a whole engineering team, human or
agent, across dev, sec and ops (`DS-AGENTIC-SDLC`). Its premise is that code became cheap, and that
the lasting work is building the context and the knowledge base around it (`DS-AGENTIC-SDLC`). The
stated goal is coverage of all four accountabilities. Specifications cover functional intent
(product) and non-functional intent (maintainer). Delivered results cover application code (dev) and
infrastructure (devops) (`DS-FULL-COVERAGE`, `DS-SQUAD-HATS`).

The design is built on one split: **records are the source of truth, and everything else is
compiled from them.**

- **Records.** Driver-specs hold constraints about the world, and ADRs hold the decisions that
  answer them (`DS-LOOP-CLOSURE`). They are created by `/opsp:propose`, `/opsp:driver`, `/opsp:decide`
  and `/opsp:repropose`, and amended only within bounded sections by `/opsp:attest` (`DEC-027`,
  `DEC-BAR-AT-PROPOSE`).
- **Containers.** An initiative is decided to be a container rather than a record. It neither
  constrains nor decides; it tracks work, and its state records how far down OGSM it has
  crystallized (`DS-PROGRESSIVE-CRYSTALLIZATION`, `DEC-024`).
- **Derived artifacts.** Per-hat views, `architecture.md` and `BOARD.md` are compiled by one engine,
  `compact`, and are never edited by hand (`DEC-006`, `DEC-014`, `DEC-026`). Documentation is meant to
  come out of work already done rather than be a second effort (`DS-DOCUMENTATION-AS-OUTPUT`).

The loop is decided to close mechanically. A constraint is answered by a decision, the decision is
implemented, and a rule checks the implementation. When the rule fails, the decision is revisited
(`DS-LOOP-CLOSURE`). An exposure found at attestation closes the loop *forward* instead, by pointing
at the initiative that will mitigate it (`DS-FORWARD-CLOSURE`).

Scope is deliberately bounded. OpenSprint is a self-use tool. It does not compete with model
providers, it has no GUI, and it ships no CI/CD product (`DS-SELF-USE-SCOPE`, `DEC-017`).
Certification, the governing half of change management, and release management are all out of
scope. The recording half of change management was brought into scope on 2026-10-10
(`DS-SURROGATE-SCOPE`, as amended; `DS-ATTEST-AS-REVIEW`).

---

## Driver Specs

The driver-specs are grouped by the role they play in the product hat's OGSM chain. Hats and verdicts
are taken from each record. "—" means the record carries no `### Posture` verdict.

### Objective

| Record | Requires | Verdict |
|---|---|---|
| `DS-AGENTIC-SDLC` | support a whole engineering team, human or agent, to dev/sec/ops standard, at a scale beyond one change | — |

### Goals

| Record | Requires | Verdict |
|---|---|---|
| `DS-FULL-COVERAGE` | specification and result cover product, maintainer, dev and devops | — |
| `DS-DOCUMENTATION-AS-OUTPUT` | the compacted surrogate *is* the documentation; no second effort | — |
| `DS-SURROGATE-BUDGET` | loading the surrogate must not consume the session budget; a compacted second tier of progressive discovery | — |
| `DS-ATTESTED-TRUTH` | a compiled claim is present-tense only when a human asserted it with evidence | **partially met** |

### Posture

| Record | States | Verdict |
|---|---|---|
| `DS-SELF-USE-SCOPE` | a self-use tool, evolved quickly for our own use; not a competitor | — |

### Strategies — hats and ownership

| Record | Requires | Verdict |
|---|---|---|
| `DS-SQUAD-HATS` | accountability partitions into four hats; a hat is a context boundary | — |
| `DS-SME-OWNERSHIP` | each hat has one human owner: reviewer, escalation target, triage owner | — |
| `DS-HATS-AS-CONTEXT` | a hat is what you load, not who you are; switching hats clears context | **partially met** |
| `DS-MAINTAINER-INHERITED` | maintainer's seven objectives are inherited, not discovered | **partially met** |
| `DS-STRATEGY-ALTITUDE` | a maintainer strategy states a position and cites its dev/devops implementers | **cannot assess** |
| `DS-VIEW-AUTHORSHIP` | a view is compiled only while an accountable author for that hat is present | **partially met** |

### Strategies — compilation and its limits

| Record | Requires | Verdict |
|---|---|---|
| `DS-BIG-PICTURE` | a view selects; it is a picture, not an index | — |
| `DS-LOOP-CLOSURE` | driver-spec → ADR → implementation → rule, closed by skills and hooks | — |
| `DS-SURROGATE-SCOPE` | compaction stops at the surrogate; recording change facts is in scope, governing them is not | — |

### Strategies — measures and attestation

| Record | Requires | Verdict |
|---|---|---|
| `DS-MEASURE-ANATOMY` | every measure has a bar (ex ante) plus posture, evidence and exposure (ex post) | **partially met** |
| `DS-CI-ATTESTATION` | evidence is a pipeline artifact; pipeline changes are attested post-merge and ride the next initiative | **partially met** |
| `DS-ATTEST-AS-REVIEW` | attestation reviews the implementation against the strategy, reads tests but not source, and answers door, blast radius and RACI | **partially met** |
| `DS-DOCUMENTATION-REVIEWED` | attestation judges documentation adequacy and urges an external account into `docs/` | **partially met** |
| `DS-FORWARD-CLOSURE` | every exposure names the planned work that mitigates it | **partially met** |

### Strategies — lifecycle and git

| Record | Requires | Verdict |
|---|---|---|
| `DS-PROGRESSIVE-CRYSTALLIZATION` | an initiative is born at intake and fills through the lifecycle | **partially met** |
| `DS-ESCALATION-HANDOFF` | an escalation is a visible hat handoff with an inferred hat, a draft record, and explicit approval | **cannot assess** |
| `DS-PARALLEL-EXEC` | initiatives run concurrently in independent worktrees, each carrying its own surrogate | — |
| `DS-SURROGATE-GIT-CONTRACT` | one PR per initiative, attested before it merges; `main` is production grade | **not met** |

### Strategies — maintainer constraints with a stated bar

| Record | Requires | Posture |
|---|---|---|
| `DS-HIGH-IMPACT-OPS` | `/opsp:rebase` and `/opsp:abandon` are operator-invocable only | no verdict. The record says the bar is "stated as absolute rather than as a preference" and cites no evidence |
| `DS-BACKWARD-COMPAT` | best-effort compatibility: a new release works with a project written by an older one | no verdict. The prose posture is "below what a product sold to strangers would hold, and deliberately so" |

---

## Architectural Decisions

The decisions are grouped by what they shape. Where one decision supersedes or amends another, both
are cited.

### 1. The record and its derived artifacts

- **Views are compiled and never hand-edited** (`DEC-006`). The stated invariant is *if the document
  is wrong, the system is wrong*, and the fix path runs through `/opsp:explore` → `/opsp:propose`
  (`DEC-007`). The charter is compiled from governance records too, and is thin when none exist
  (`DEC-008`). `DEC-006` has the largest blast radius in the tree: 29 descendants (`DECISION-MAP.md`).
- **One compile engine.** `compact` is decided to produce the hat views and `architecture.md` as
  sibling outputs of the same records. Archive, knockdown and post-reconciliation rebuilds are meant
  to call it rather than synthesise on their own (`DEC-014`). `BOARD.md` is a further compiled
  sibling of `DECISION-MAP.md`. It is built from initiative state, and moving a card means changing a
  record's state (`DEC-026`).
- **Provenance.** A per-section manifest records the input hashes and the output hash, giving two
  failure states: *stale* means recompile, and *tampered* means stop. `compact check` is meant to fail
  CI on anything that is not fresh (`DEC-010`). A stale section is re-rendered from its full inputs,
  never from the previous rendering plus a delta (`DEC-011`). Seal is decided to be scopeable by hat
  and never to bless a section it did not render (`DEC-SCOPED-SEAL`, amending the unscoped seal of
  `DEC-010`).
- **Citation and authority.** Every compiled claim carries its record ids inline (`DEC-009`). A
  third authority, `attested`, sits beside `decided` and `observed`, and only it licenses the
  present tense (`DEC-021`, extending `DEC-009`; `DS-ATTESTED-TRUTH`). Because of that third
  authority, compact is decided to be safe to run mid-initiative. Archive is decided to consume
  compact, and knockdown is not (`DEC-031`).
- **Open loops are the backlog.** Compact reports and triage decides, with no remediation workflow
  of its own (`DEC-007`). Rule links are harvested from code that cites record ids, not declared in
  the records (`DEC-013`).
- **Read path deferred.** v1 does not change what `/opsp:explore` or `/opsp:apply` load. The
  rule is to use the view to find your way and read the record before acting on it (`DEC-015`,
  `DS-SURROGATE-BUDGET`).

### 2. Hats, classification and view authorship

- **Multi-hat records, four hats.** A record declares one or more hats, and the `agreements` hat is
  removed (`DEC-016`, superseding `DEC-012`). A decision is owned by `dev` or `devops`. Any other hat
  it lists is CC, and decisions carry no `role` (`DEC-028`).
- **Maintainer shape.** The seven inherited objectives are decided to be maintainer's shipped,
  extensible section list, selected by an `objective:` field. `role` widens to a list (`DEC-018`,
  `DS-MAINTAINER-INHERITED`). A maintainer strategy cites its implementers instead of describing them,
  enforced by the existing citation rule. `strategy-unimplemented` reports the inverse gap (`DEC-020`,
  `DS-STRATEGY-ALTITUDE`). The strategy cell renders SWOT-like, with *Opportunity* deliberately
  redefined as the alternatives weighed, compiled from the cited ADRs (`DEC-037`).
- **Schema migration** is its own tool, `/opsp:migrate`, kept separate from `/opsp:rebuild-assess`.
  Migrate asks where a record belongs now that the schema moved. Rebuild-assess asks whether a
  decision still holds now that the world moved (`DEC-MIGRATE-SEPARATE-TOOL`).
- **When a view may be compiled** (`DS-VIEW-AUTHORSHIP`):
  - Apply compiles `dev`/`devops` at each milestone boundary, only for stale sections and sealed by
    scope. Product and maintainer are offered as a real context switch, never compiled silently
    (`DEC-COMPILE-ON-MILESTONE`).
  - An approved escalation permits compiling the one hat it was classified into
    (`DEC-COMPILE-ON-APPROVAL`).
  - Knockdown produces all five artifacts, with the empty ones rendered as the finding and everything
    marked `observed` (`DEC-KNOCKDOWN-ALL-VIEWS`).

### 3. Measures and attestation

- **Measure anatomy in the record.** Bar, posture, evidence and exposure are optional `###`
  sub-blocks under `## Measures`, with `mitigated-by` inside `### Exposure` (`DEC-019`). Posture is
  the judgement, and evidence and exposure depend on it:
  - `met` requires evidence.
  - Any other verdict requires exposure.
  - No posture at all is reported as `measure-unattested`.

  These rules amend `DEC-019`'s unconditional harvest rules (`DEC-041`).
- **Bar form.** A product bar is a user story and a maintainer bar is given/when/then; posture,
  evidence and exposure stay prose (`DEC-038`). The bar is written at propose by the hat that owns
  the goal. `- **Primary**: unstated` is the honest placeholder (`DEC-BAR-AT-PROPOSE`).
- **Attest is its own tool**, outside compact, between apply/review and archive (`DEC-022`). It
  **writes a record and never gates**: it exits zero and approves, blocks and promotes nothing
  (`DEC-023`).
- **Write bounds.** Amendment is a third write mode beside create and derive (`DEC-027`). Its bound
  was later widened in three directions:
  - an initiative's `## Attestation` section (`DEC-042`)
  - a configurable documentation directory, `docs/` by default, written only on operator
    confirmation (`DEC-044`)
  - repropose reclassified from amend to create, because it wears the hat that owns the bar
    (`DEC-BAR-AT-PROPOSE`, correcting `DEC-HAT-HANDOFFS`)
- **What counts as evidence.** An `### Evidence` block references a pipeline artifact. A
  pipeline-change bar is attested later and rides the next initiative that touches the area
  (`DEC-032`, `DS-CI-ATTESTATION`).
- **What the attester reads.** The attester reads objective, goals, bars, **test files**, in-scope
  maintainer rows and CI artifacts. It never reads source, design discussion or ADR rationales
  (`DEC-040`, superseding `DEC-033`). The session that wrote the implementation *or its tests* may not
  attest (`DEC-043`). Attest first resolves and presents the change frame (source, base, subjects,
  stat, never patch or bodies), and the operator confirms it before any bar is read
  (`DEC-ATTEST-CHANGE-FRAME`).
- **The change questions** (door, blast radius and RACI for whatever no system handles) live on the
  initiative (`DEC-042`, `DS-ATTEST-AS-REVIEW`).

### 4. Initiative lifecycle and escalation

- **State.** State is declared by the tool and checked by code (`DEC-024`), with `declined` added
  as a revivable terminal state (`DEC-035`). Transitions are performed by `opensprint advance`
  against an explicit table, which also inserts `ready-for-attestation` as the named handoff. A legal
  move into a contradicted state is written and the contradiction reported; an illegal move is
  refused (`DEC-STATE-MACHINE`, amending `DEC-024`).
- **Intake.** `/opsp:explore` writes nothing, and `/opsp:backlog` is the deliberate flush to an
  `exploring` initiative (`DEC-034`, superseding `DEC-025`). `/opsp:triage` picks a candidate up and
  advances, declines or returns it. That leaves two think/persist pairs: explore→backlog and
  triage→propose (`DEC-039`).
- **Naming.** New decisions get semantic ids, and initiatives get date-prefixed filenames with
  unchanged ids (`DEC-036`).
- **Escalation inside apply** renders as a stage boundary: the dev hat is set down and picked back
  up visibly (`DEC-ESCALATION-IS-A-STAGE`). The escalation carries its own classification as an
  inferred hat and a draft record, plus the blast radius. There is never a separate "which hat?"
  prompt (`DEC-CLASSIFY-IN-QUESTION`).
- **The escalation ladder.** The escalation ladder was decided in three steps, and all three records
  are needed to read the current position:
  - `DEC-ESCALATION-LADDER` set three rungs at the OGSM altitudes (goal, strategy, plan), introduced
    `/opsp:repropose`, and added the transition by which attest sends a change request back to
    `building`.
  - `DEC-HAT-HANDOFFS` moved the explore-again tool to the **goal** rung, writing nothing and
    returning to `exploring`. It merged the plan rung into `/opsp:repropose`, let repropose change
    `## Measures` under the rule that a bar which got easier is a goal that moved, and required
    `--hat` on every transition marked as a handoff.
  - `DEC-REEXPLORE-NAME` kept the name `/opsp:reexplore` for that goal-rung tool, reverting the
    rename to `/opsp:reideate` while keeping the new definition.

### 5. Git, universes and reconciliation

- **A universe is a worktree.** The surrogate travels with its branch, with no separate storage
  (`DEC-001`, `DS-PARALLEL-EXEC`).
- **Planning happens in the initiative's worktree**, which the planning tools create themselves.
  The cost, stated as unsolved, is that no branch sees every backlog item (`DEC-029`,
  `DS-SURROGATE-GIT-CONTRACT`).
- **Closing order.** The order is rebase, attest, archive, merge, as one PR. The PR is gated on
  state consistency, never on whether a bar was met, and a derived-artifact conflict is resolved by
  recompiling (`DEC-030`, reconciled with `DEC-023`).
- **Reconciliation** (`/opsp:rebase`, `/opsp:abandon`):
  - The agent reasons and the operator confirms. Auto-accept is allowed only for purely additive or
    identical content (`DEC-002`).
  - Traversal is depth-first, initiative → ADRs → changes, with the initiative as the unit of
    commitment (`DEC-003`).
  - A read-only planning phase and conflict manifest come before any write (`DEC-004`).
  - The losing universe is archived under `opensprint/abandoned/<name>/` (`DEC-005`).

### 6. Product surface

- The surface is the `opensprint` CLI plus the skill and command files it generates, with no GUI
  and no pipeline product. Discoverability is the accepted cost (`DEC-017`, `DS-SELF-USE-SCOPE`).

### Supersession chains

| Superseded | By | What moved |
|---|---|---|
| `DEC-012` | `DEC-016` | one primary hat plus an `agreements` hat → one or more hats, four hats |
| `DEC-025` | `DEC-034` | explore persists the initiative → explore writes nothing; `/opsp:backlog` persists |
| `DEC-033` | `DEC-040` | attester loads bar and CI evidence only → test files admitted; source, design and rationales still excluded |

The next table lists amendments without a `superseded-by` field. Read each pair together.

| Earlier | Amended by | Clause |
|---|---|---|
| `DEC-010` | `DEC-SCOPED-SEAL` | seal becomes scopeable and output-compared |
| `DEC-019` | `DEC-041` | `measure-unasserted`/`measure-unexposed` become conditional on posture |
| `DEC-024` | `DEC-035`, `DEC-STATE-MACHINE` | `declined` added; `ready-for-attestation` added; transitions by command |
| `DEC-027` | `DEC-042`, `DEC-044`, `DEC-BAR-AT-PROPOSE` | write bound widened to `## Attestation` and `docs/`; repropose moved to create mode |
| `DEC-STATE-MACHINE` | `DEC-ESCALATION-LADDER`, `DEC-HAT-HANDOFFS` | transitions added; hat and handoff declared per transition |
| `DEC-ESCALATION-LADDER` | `DEC-HAT-HANDOFFS`, `DEC-REEXPLORE-NAME` | the explore-again tool moved to the goal rung; repropose absorbed the plan rung; name kept |
| `DEC-HAT-HANDOFFS` | `DEC-BAR-AT-PROPOSE`, `DEC-REEXPLORE-NAME` | repropose is create mode, not amend; the tool is `/opsp:reexplore`, not `/opsp:reideate` |
| `DS-SURROGATE-SCOPE` | its own 2026-10-10 amendment, `DS-ATTEST-AS-REVIEW` | the recording half of change management is in scope |

### Where the records disagree

These conflicts are reported, not resolved. Resolving any of them is a record change through
`/opsp:decide` or `/opsp:driver`.

- **`pending` posture.** `DEC-032` attests a pipeline-exempt bar as `posture: pending`. The posture
  vocabulary in `DEC-041` and `DS-ATTEST-AS-REVIEW` is `met`, `partially met`, `not met` or
  `cannot assess`, and has no `pending`.
- **Explore persistence.** `DS-PROGRESSIVE-CRYSTALLIZATION` still states, as its Primary measure,
  that explore leaves an initiative behind, and it cites `DEC-025` in its Implications. `DEC-034`
  superseded that. The record's own posture says the bar "has drifted from what shipped and needs
  revising through `/opsp:decide`".
- **Superseded citations.** `DS-HATS-AS-CONTEXT` and `DS-CI-ATTESTATION` cite `DEC-033` in their
  Implications. Their attester-context clause is now governed by `DEC-040`.
- **Declined items on `main`.** `DEC-035` says `DEC-029` "already accepts declined candidates living
  on `main`". `DEC-029` as recorded puts all planning in the initiative's worktree, and its rationale
  says an earlier, planning-on-`main` version was refuted.
- **Numbered ids.** `DEC-036` says the tool stops allocating numbered ids after `DEC-039`. Yet
  `DEC-040` through `DEC-044` are numbered.
- **Tool name.** `DEC-BAR-AT-PROPOSE` and `DEC-HAT-HANDOFFS`' transition table name the goal-rung
  tool `/opsp:reideate`. `DEC-REEXPLORE-NAME` reverts it to `/opsp:reexplore`.
- **Leaving `ready-for-attestation`.** `DEC-STATE-MACHINE` and `DEC-ESCALATION-LADDER` give
  `ready-for-attestation → building` to `/opsp:reexplore`. `DEC-HAT-HANDOFFS`' table gives that move
  only to `/opsp:attest`, and sends the explore-again tool to `exploring` instead.
- **Driver-specs under repropose.** `DEC-ESCALATION-LADDER` makes driver-specs repropose's
  invariant. `DEC-HAT-HANDOFFS` lets repropose change a driver-spec's `## Measures`.
- **Six or seven objectives.** `DS-MAINTAINER-INHERITED` and `DEC-018` decide seven maintainer
  objectives, but parts of both records still say "six", including `DEC-018`'s title.
- **The devops hat.** `DS-SELF-USE-SCOPE` says the `devops` hat is legitimately empty for this
  project. `DEC-029`, `DEC-030`, `DEC-032` and `DEC-COMPILE-ON-MILESTONE` declare `devops` among
  their hats.
- **Do agents read views during apply?** `DEC-015` decides that apply does not load the views.
  `DS-VIEW-AUTHORSHIP` and `DEC-COMPILE-ON-MILESTONE` justify milestone-boundary compiles on the
  premise that agents read `dev`/`devops` views mid-initiative.
- **Stakeholder entry point.** `DS-HATS-AS-CONTEXT` requires that a stakeholder without repository
  access can file a backlog item. `DEC-029` has `/opsp:backlog` create a worktree. `DEC-029` and
  `DS-SURROGATE-GIT-CONTRACT` both record this as unsolved.
- **Status vocabulary.** `DEC-ATTEST-CHANGE-FRAME`, `DEC-BAR-AT-PROPOSE`, `DEC-ESCALATION-LADDER`,
  `DEC-HAT-HANDOFFS`, `DEC-REEXPLORE-NAME` and `DEC-STATE-MACHINE` carry `status: accepted`. Every
  other live record carries `status: active`.

---

## System Structure

These are the shapes the records decide. Nothing here is attested.

### Records, engine and outputs

```
                         RECORDS  (source of truth)
   opensprint/driver-specs/*.md         opensprint/ADRs/*.md
   constraints, OGSM roles, hats        decisions, owned by dev/devops (DEC-028)
            │      ▲                              │
            │      │ amend: ## Measures only      │
            │      │ (DEC-027, DEC-041)           │
            │   /opsp:attest ──► initiative ## Attestation (DEC-042)
            │      │           └─► docs/  external account, on confirmation (DEC-044)
            ▼      │                              ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  compact — the single compile engine (DEC-014)                  │
   │    plan  → which sections are stale (DEC-010)                   │
   │    render from FULL inputs, never the last rendering (DEC-011)  │
   │    seal  → manifest; scopeable by hat (DEC-SCOPED-SEAL)         │
   │    check → fails on stale / tampered (DEC-010)                  │
   └───────┬──────────────┬───────────────┬──────────────┬───────────┘
           ▼              ▼               ▼              ▼
   squad/<hat>.md   architecture.md   BOARD.md      squad/.manifest.json
   per-hat views    (this document)   state board   provenance
   (DEC-006)        (DEC-014)         (DEC-026)     (DEC-010)

   opensprint/initiatives/YYYYMMDD-<id>.md — containers, not records
   (DS-PROGRESSIVE-CRYSTALLIZATION, DEC-024, DEC-036)
```

The write modes are decided as follows (`DEC-027`, `DEC-BAR-AT-PROPOSE`, `DEC-044`):

| Mode | Tools | May touch |
|---|---|---|
| create | `/opsp:decide`, `/opsp:driver`, `/opsp:propose`, `/opsp:repropose` | a record's own content, at the altitude of the hat writing it |
| derive | `/opsp:compact`, `/opsp:archive` | compiled artifacts only, never a record (`DEC-006`) |
| amend | `/opsp:attest` | a record's `## Measures`; an initiative's `## Attestation`; free prose under `docs/` |

### Hats

```
   product      what must it DO?            functional driver-specs   ┐ record clock:
   maintainer   what must be TRUE of it?    non-functional DS         ┘ backlog · propose · attest
   dev          how is it BUILT?            code, ADRs                ┐ code clock:
   devops       how is it STOOD UP / RUN?   IaC, ADRs                 ┘ continuous through apply
```

The hats and their questions come from `DS-SQUAD-HATS`. The two clocks come from
`DS-VIEW-AUTHORSHIP`. The decision is that one engineer may wear every hat and that switching hats is
a context load (`DS-HATS-AS-CONTEXT`). Maintainer's sections are its seven inherited objectives
(`DS-MAINTAINER-INHERITED`, `DEC-018`).

### Initiative lifecycle

```
   /opsp:backlog
        │
        ▼
    exploring ◄──── /opsp:triage ────► declined        product · maintainer
        │
        │ /opsp:propose                                all four
        ▼
    proposed
        │ /opsp:apply                                  dev · devops      [handoff]
        ▼
    building
        │ /opsp:apply, last milestone closes           dev · devops      [handoff]
        ▼
    ready-for-attestation
        │ /opsp:attest                                 product · maintainer
        ▼
    attested
        │ /opsp:archive                                all four          [handoff]
        ▼
    completed

   back-edges                                                             rung
     building              ──/opsp:repropose──►  proposed     [handoff]   strategy
     ready-for-attestation ──/opsp:repropose──►  proposed                 strategy
     ready-for-attestation ──/opsp:attest─────►  building                 change request
     building              ──/opsp:reexplore──►  exploring    [handoff]   goal
     ready-for-attestation ──/opsp:reexplore──►  exploring                goal
```

The states, transitions, hats and handoff markers come from `DEC-STATE-MACHINE`,
`DEC-ESCALATION-LADDER` and `DEC-HAT-HANDOFFS`; the tool name comes from `DEC-REEXPLORE-NAME`. The
diagram follows the latest transition table, `DEC-HAT-HANDOFFS`. An earlier record gives
`ready-for-attestation → building` to `/opsp:reexplore` (`DEC-STATE-MACHINE`); that edge is left out
here (see *Where the records disagree*). A move marked `[handoff]` is decided to be refused by
`opensprint advance` unless `--hat` names an accepted accountability (`DEC-HAT-HANDOFFS`).

### Git topology

```
   opsx/<change>  ──merge──►  opsp/<initiative>  ──rebase──●──attest──●──archive──●──►  main
   dev/devops sub-PRs,        created by backlog/triage/    one PR; gated on state consistency,
   no product involvement     propose (DEC-029)             never on whether a bar was met (DEC-030)
```

This topology is decided by `DS-SURROGATE-GIT-CONTRACT`, `DEC-029` and `DEC-030`. Its posture is
**not met**; see Constraints below. Parallel initiatives are parallel worktrees, each a self-contained
universe (`DEC-001`, `DS-PARALLEL-EXEC`). They converge through `/opsp:rebase` or `/opsp:abandon`
(`DEC-002`–`DEC-005`).

---

## Constraints & Non-Negotiables

Each item says what was decided and what the record says about whether it holds. **None is
attested.** A constraint here is a decision that binds. It does not report the running system.

1. **Reconciliation is decided to be operator-invocable only.** `/opsp:rebase` and `/opsp:abandon`
   must not be invoked by a pipeline, a sub-agent or another skill (`DS-HIGH-IMPACT-OPS`). They open
   with a read-only planning phase and auto-accept only additive or identical content (`DEC-004`,
   `DEC-002`).
   *Posture:* no verdict. The record calls the bar "absolute rather than a preference" and cites no
   evidence. `DS-ATTESTED-TRUTH` and `DEC-021` record that the guardrail is instruction text in a
   skill and that no rule reads it. Compaction is explicitly exempt from this bar (`DEC-006`), and so
   is attest's bounded amendment (`DEC-027`).

2. **Views are decided never to be hand-edited.** A wrong view means a wrong system (`DEC-006`). A
   section is decided to be sealed only once it has just been rendered (`DEC-SCOPED-SEAL`,
   `DEC-010`).
   *Posture:* `DS-VIEW-AUTHORSHIP` is **partially met**. "Just rendered" is approximated as "the
   output bytes changed", so a hand edit can be sealed. The manifest records no authoring hat, so
   authorship cannot be audited.

3. **Compact is decided never to write a record** (`DEC-006`, `DEC-022`). Attestation, the one
   tool that amends records, is bounded to named sections (`DEC-027`, `DEC-042`, `DEC-044`).
   *Posture:* no record carries a verdict on either bound.

4. **The present tense is decided to require attestation**, and every compiled claim is decided to
   cite its record inline (`DS-ATTESTED-TRUTH`, `DEC-021`, `DEC-009`).
   *Posture:* `DS-ATTESTED-TRUTH` is **partially met**. Record-level classification is tested. The
   tense of compiled claims and the visible decided/observed/attested distinction in rendered
   output are not.

5. **Attestation is decided to precede merge, as one PR per initiative.** `main` is production grade
   by definition (`DS-SURROGATE-GIT-CONTRACT`), and the `opsp/*` PR is decided to be gated on state
   consistency (`DEC-030`).
   *Posture:* `DS-SURROGATE-GIT-CONTRACT` is **not met**. No gate prevents an unattested merge, and
   the record's exposure says so of its own branch ("this one included"). `opensprint advance --to attested` succeeds with no
   `## Attestation` and no posture. `compact check` exits zero with open loops. The view-freshness
   half of the guardrail is real; the git half is wired into no check. `DEC-030` says dangling is
   "structurally impossible — the gate prevents it", and that rests on a gate this posture says does
   not exist.

6. **Attest is decided to record, never to gate.** It exits zero and approves, blocks and promotes
   nothing. An unmet bar becomes an exposure, not a failure (`DEC-023`, `DS-SURROGATE-SCOPE`).
   Requiring that a question be *answered* is decided to be state consistency, not grading
   (`DEC-030`). Transitions likewise record and do not gate (`DEC-STATE-MACHINE`).
   *Posture:* the "never a block" guardrail in `DS-ATTEST-AS-REVIEW` is **partially met** and rests
   on instruction text only.

7. **The attester is decided to read tests, not source.** Implementation source, design discussion
   and ADR rationales stay out (`DEC-040`, superseding `DEC-033`). The session that authored the
   implementation or its tests may not attest (`DEC-043`).
   *Posture:* `DS-ATTEST-AS-REVIEW` is **partially met**. Its record says the Scope bar is
   "unassertable by any test in the suite" and that "an attester that reads source is not detected".
   `DS-HATS-AS-CONTEXT` is **partially met**, because excluding the implementation is instruction
   text. `DEC-043` itself records that it is enforced "by instruction only".

8. **A view is decided to be compiled only by an author who holds that hat.** That means apply for
   `dev`/`devops`, an approved escalation for the hat it touched, and archive or knockdown for
   everything (`DS-VIEW-AUTHORSHIP`, `DEC-COMPILE-ON-MILESTONE`, `DEC-COMPILE-ON-APPROVAL`,
   `DEC-KNOCKDOWN-ALL-VIEWS`).
   *Posture:* **partially met**. Neither the Primary bar nor the Currency bar has a test that could
   fail.

9. **An escalation is decided to need explicit approval** before a product or maintainer record
   changes during apply. The blast radius is shown first (`DS-ESCALATION-HANDOFF`,
   `DEC-CLASSIFY-IN-QUESTION`, `DEC-ESCALATION-IS-A-STAGE`).
   *Posture:* **cannot assess**. Hat inference is unit-tested. Nothing runs apply and checks that a
   declined escalation leaves records unchanged.

10. **Evidence is decided to be a pipeline artifact.** A reference that does not resolve is meant to
    be harvested, and `cannot assess` is meant to be a recorded outcome, never a silent pass
    (`DS-CI-ATTESTATION`, `DEC-032`).
    *Posture:* **partially met**. A `../` path is silently accepted, and any file in the tree counts
    as evidence whether or not a pipeline produced it.

11. **Every exposure is decided to point forward** at the work that mitigates it
    (`DS-FORWARD-CLOSURE`, `DEC-026`).
    *Posture:* **partially met**. `exposure-unmitigated` is never shown to fire, and any string
    satisfies `mitigated-by`.

12. **A maintainer strategy is decided to state a position and cite its implementers**
    (`DS-STRATEGY-ALTITUDE`, `DEC-020`, `DEC-037`).
    *Posture:* **cannot assess**. No test fires or clears `strategy-unimplemented`.

13. **Every maintainer objective is decided to render, empty or not**
    (`DS-MAINTAINER-INHERITED`, `DEC-018`).
    *Posture:* **partially met**. Routing by `objective` is tested. No test shows that an empty row
    renders in the compiled view, or that an off-list objective is reported.

14. **A measure is decided never to state a bar without stating whether it was met**
    (`DS-MEASURE-ANATOMY`, `DEC-019`, `DEC-041`).
    *Posture:* **partially met**. The guarantee is tested at record level only, and no test inspects a
    compiled measure cell.

15. **Initiative state is decided to agree with its content** (`DS-PROGRESSIVE-CRYSTALLIZATION`,
    `DEC-024`, `DEC-STATE-MACHINE`).
    *Posture:* **partially met**. An initiative declaring `attested` with no `## Attestation`
    section passes the check. The record's Primary bar is contradicted by `DEC-034`.

16. **Documentation quality is decided to be judged at attestation** (`DS-DOCUMENTATION-REVIEWED`,
    `DEC-044`).
    *Posture:* **partially met**. Only the `docs/` location is tested. An attested initiative with no
    documentation judgement is invisible to every compile.

17. **Decisions are decided to belong to `dev` or `devops`.** A concern owned by product or
    maintainer is a driver-spec (`DEC-028`).
    *Posture:* none recorded.

18. **Scope is decided to exclude certification, the governing half of change management, and
    release management** (`DS-SURROGATE-SCOPE` as amended, `DEC-023`). It is also decided to exclude
    a GUI and a CI/CD product (`DEC-017`, `DS-SELF-USE-SCOPE`). Revisiting either is a product
    decision.
    *Posture:* none recorded.

19. **Backward compatibility is decided to be best-effort.** It is scoped to one surface: a new
    release meeting a project written by an older one. New fields must be optional
    (`DS-BACKWARD-COMPAT`, `DEC-018`, `DEC-019`).
    *Posture:* no verdict. The prose posture is "below what a product sold to strangers would hold,
    and deliberately so", and the neighbour position is unrecorded.
