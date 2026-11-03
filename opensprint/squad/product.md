# product — what must it do?

**Three records are attested; everything else here rests on a decision** (`DS-ATTESTED-TRUTH`).
`/opsp:attest` first ran on 2026-10-11: thirteen measures carry a posture from then, none of them
`met` and none with evidence, so none of those is attested — each records what remains exposed
instead. `DS-SURROGATE-BUDGET` (**partially met**) and `DS-BOARD-VISIBILITY` (**met**) were attested
on 2026-10-18 with evidence, and `DS-LIVE-BOARD` (**partially met**) on 2026-11-04
(`DS-SURROGATE-BUDGET`, `DS-BOARD-VISIBILITY`, `DS-LIVE-BOARD`).

## Objective

**Power an entire engineering team, human or agent.**

Software development becomes real engineering only when the detail across **dev, sec and ops** is
all taken care of. OpenSprint exists to hold a team to that standard regardless of whether the
participants are people or agents, at a scale beyond what a single change workflow addresses
(`DS-AGENTIC-SDLC`).

The premise has not changed since the project began: **code became cheap.** Connecting context and
building the knowledge base are the load-bearing activities now. Where every detail of the context
is recorded, rebuilding a whole application from it is easy — generating the code was never the hard
part. What was always thrown away is why it was built this way.

What this deliberately does *not* reach is in the strategies below (`DS-SURROGATE-SCOPE`).

## Goals

Six goals reach the objective. Each is a decision about what must be true; whether it is true is
the business of **Measures** below.

### Cover all four accountabilities

Spec-driven development must cover **functional** intent (product) and **non-functional** intent
(maintainer), and delivered results must cover **application** (dev) and **infrastructure** (devops)
(`DS-FULL-COVERAGE`). Covering only product and dev is half a system: an implementation can satisfy
every stated requirement and still be unfit, because nothing stated the availability bar it had to
hold, the compliance obligation it had to prove, or the topology that follows from either
(`DS-FULL-COVERAGE`).

You could tell this had landed when every hat in a project's registry has records, or a recorded
decision explaining why it does not — a hat with no records is a reportable state, not an oversight
to hide (`DS-FULL-COVERAGE`).

### Documentation is compiled, never a second effort

**The compacted surrogate is the documentation** — compiled from work already done, never authored
alongside it (`DS-DOCUMENTATION-AS-OUTPUT`). Documentation written after the fact fails for a
structural reason: nobody has an incentive left, and the reasoning has already faded. Driver-specs
and decisions are made *during* the work, because the work cannot proceed without them, so rendering
them for a person costs nothing extra (`DS-DOCUMENTATION-AS-OUTPUT`).

Narrative documents that are genuinely authored — an origin story, an entry point — stay authored,
and say so (`DS-DOCUMENTATION-AS-OUTPUT`).

### Nothing is documented as true until it is attested

A compiled claim may be stated as present-tense fact only when a human has asserted it with
evidence; anything else is intent wearing the grammar of state (`DS-ATTESTED-TRUTH`). Every claim
therefore rests on one of three authorities — **decided** (a record id: it binds, and may not be true
yet), **observed** (a path: true now, and may be an accident) or **attested** (evidence, date and
attester: asserted true, and it ages) — and only attested licenses the present tense
(`DS-ATTESTED-TRUTH`).

A compiled document cannot drift from its records without the compile reporting it
(`DS-DOCUMENTATION-AS-OUTPUT`). This goal closes the other drift, between the records and reality,
which is the one a reader actually cares about (`DS-ATTESTED-TRUTH`).

### Loading the surrogate must not consume the session budget

An agent must be able to work from a compacted surrogate rather than loading every driver-spec and
ADR (`DS-SURROGATE-BUDGET`). Measured across three projects in production use, ADRs were 61–74% of
every load, `architecture.md` was loaded alongside the ADRs it summarises — so compaction saved
nothing at load time — and completed initiatives were loaded on every explore, roughly 47K of
cashier's 157K tokens (`DS-SURROGATE-BUDGET`).

The budget is saved on orientation, never on judgement: an agent that acts on a decision still reads
that decision's full record (`DS-SURROGATE-BUDGET`).

### Every initiative is visible from any checkout, and work in flight names its owner

Any checkout must be able to see every initiative, on whichever branch it lives, and every card in
flight must name the person who holds it (`DS-BOARD-VISIBILITY`). Each initiative lives on its own
branch from its first persisted thought, which leaves no branch able to see every backlog item; this
goal answers that cost (`DS-BOARD-VISIBILITY`).

Reading the board is the one thing a non-technical stakeholder does. A board showing only its own
branch fails that; a card in flight with nobody's name on it fails the step past it, because nothing
says who stepped up (`DS-BOARD-VISIBILITY`).

### One live board, seen the same from anywhere, that starts the next step

In-flight initiative state lives in **one central place** that every agent and every human reads the
same way, whichever worktree, branch or pull request their work sits in; a completed initiative
stays a static record; and the board is where any card's next step is started (`DS-LIVE-BOARD`).

It takes up where `DS-BOARD-VISIBILITY` stopped. Making every branch's cards visible on demand left
the board an instantaneous state, compiled from whatever one machine had fetched; the tool is gaining
tracker capability while the backlog stays scattered across worktrees, branches and pull requests
(`DS-LIVE-BOARD`). Clicking into an initiative shows the same kind of board one level down — its
milestones as tickets (`DS-LIVE-BOARD`).

## Strategies

This section covers how the goals are pursued. Every strategy here is a decided position. Ivan Lee
attested twelve of them on 2026-10-11, and none was `met`. So none is stated as holding; each is
stated as what was decided, with its recorded posture at the end.

The chain below follows the records' `depends-on` edges. A record with two parents appears under one
of them and names the other.

```
 DS-AGENTIC-SDLC  (objective)
  |
  +-- DS-FULL-COVERAGE  (goal: all four accountabilities)
  |     +-- DS-SQUAD-HATS              four hats, accountabilities fixed
  |     |     +-- DS-SME-OWNERSHIP     one human owner per hat
  |     |     +-- DS-MAINTAINER-INHERITED   maintainer objectives are inherited
  |     |     +-- DS-HATS-AS-CONTEXT   a hat is what you load   (+ DS-SME-OWNERSHIP)
  |     |           +-- DS-ESCALATION-HANDOFF  escalation is a hat handoff  (+ DS-SME-OWNERSHIP)
  |     |           +-- DS-VIEW-AUTHORSHIP     only the hat present compiles (+ DS-BIG-PICTURE)
  |     +-- DS-LOOP-CLOSURE            the loop closes mechanically, backward
  |     |     +-- DS-FORWARD-CLOSURE   ... and forward, to planned work
  |     +-- DS-MEASURE-ANATOMY         bar / posture / evidence / exposure
  |
  +-- DS-DOCUMENTATION-AS-OUTPUT  (goal: documentation is compiled)
  |     +-- DS-ATTESTED-TRUTH  (goal: nothing true until attested)
  |     |     +-- DS-CI-ATTESTATION    evidence is a CI artifact
  |     |     +-- DS-ATTEST-AS-REVIEW  attest reviews against strategy   (+ DS-SURROGATE-SCOPE)
  |     |           +-- DS-DOCUMENTATION-REVIEWED  docs reviewed at attest (+ DS-DOCUMENTATION-AS-OUTPUT)
  |     +-- DS-BIG-PICTURE             a view selects, never enumerates  (+ DS-SURROGATE-BUDGET)
  |           +-- DS-STRATEGY-ALTITUDE a strategy cites, never describes (+ DS-SURROGATE-BUDGET)
  |
  +-- DS-SURROGATE-BUDGET  (goal: loading must not consume the budget)
  +-- DS-PROGRESSIVE-CRYSTALLIZATION   an initiative is a container
  +-- DS-SURROGATE-SCOPE               compaction stops at the surrogate
  +-- DS-PARALLEL-EXEC                 initiatives run in parallel worktrees
        +-- DS-SURROGATE-GIT-CONTRACT  one PR per initiative, attested before merge
```

**Coverage: four hats, each owned, each a context to load.** Accountability is split into four hats.
Product asks what the system must do. Maintainer asks what must be true of it. Dev asks how it is
built. Devops asks how it is stood up and kept running. The hats can be grouped however team size
demands, but the accountabilities do not move (`DS-SQUAD-HATS`).

QA is redistributed rather than absent. Engineers write the tests, and the product and maintainer
hats are responsible for writing constraints that a test can check (`DS-SQUAD-HATS`).

Each hat is to have one human owner, who reviews its view, takes escalations in its domain and owns
its open loops. Writing the view is not part of ownership (`DS-SME-OWNERSHIP`). One engineer usually
wears every hat, so a hat is defined as *what you load*, not *who you are*. Switching hats means
loading that hat's context and deliberately clearing the previous one (`DS-HATS-AS-CONTEXT`).

The maintainer hat is a branch of product whose objectives are inherited rather than discovered
(`DS-MAINTAINER-INHERITED`). Its strategies state a position and cite the dev or devops decisions
that implement it (`DS-STRATEGY-ALTITUDE`, answered by `DEC-020`).

> **The record contradicts itself.** `DS-MAINTAINER-INHERITED` gives *seven* objectives in its
> statement and table. Its rationale talks about "six questions", and its implications call "the
> six" a shipped section list (`DEC-018`). This view does not resolve the count. Fixing it means
> changing the record.

**Closure: backward through rules, forward through planned work.** The loop runs driver-spec, then
ADR, then implementation, then rule. It is decided to close mechanically, with each step done by a
skill or a hook, so that drift becomes a build failure (`DS-LOOP-CLOSURE`).

The loop also closes forward. Every exposure is to name the planned work that will mitigate it, and
the state of that work is the level of assurance. An exposure that points at nothing is a confession
(`DS-FORWARD-CLOSURE`). Every measure has the same four parts for every hat: a bar written at
propose, and a posture, evidence and exposure written at attest (`DS-MEASURE-ANATOMY`).

**Escalation is a handoff, not an interruption.** A spec that misses something is the normal case.
Sometimes the surrogate cannot answer a question during apply, and the question falls within a
driver-spec's scope. When that happens, the dev hat is visibly set down. The agent works out which
hat the question belongs to instead of asking, and carries a draft record in the question. Approval
is explicit and shows the blast radius (`DS-ESCALATION-HANDOFF`).

**Views: compiled, selective, and written by the hat present.** A compiled view is a big picture,
not an index. It selects what it shows, and a record may appear in no view at all
(`DS-BIG-PICTURE`).

A view is compiled only while someone accountable for that hat is present:

- dev and devops during apply
- product or maintainer during an approved escalation
- measures only at attest
- every view at archive

The reason is that the hats run on different clocks. Product and maintainer change when records
change; dev and devops change with the code (`DS-VIEW-AUTHORSHIP`, `DS-ESCALATION-HANDOFF`).

Documentation also has a second audience: external stakeholders who never open the repository. They
get a condensed account, kept in `docs/` by default. Attestation reviews whether that account is
adequate, and prompts the operator to put the answers into that directory rather than writing them
silently (`DS-DOCUMENTATION-REVIEWED`).

**Attestation: CI evidence, read against tests.** Evidence must be a CI artifact that the pipeline
produced before the merge. Changes to the pipeline itself are exempt; their attestation rides the
next initiative that touches that area (`DS-CI-ATTESTATION`). The record states this openly as a bet
that forces investment in CI rather than accommodating its absence (`DS-CI-ATTESTATION`).

Attestation reviews the implementation against the stated strategy. It reads test files, bars and
CI artifacts, but never source code, design discussion or ADR rationale. It also answers three
questions: is the change reversible, what is its blast radius, and who is responsible (RACI) for
anything no system handles. A `met` verdict needs cited evidence. Any other verdict needs an
exposure (`DS-ATTEST-AS-REVIEW`).

**The lifecycle, bound to git.** An initiative is a container, not a record. It is created at intake
and filled in down the OGSM chain, and its state is how far it has got
(`DS-PROGRESSIVE-CRYSTALLIZATION`). Initiatives run in parallel in separate git worktrees, each with
its own surrogate (`DS-PARALLEL-EXEC`). Four rules bind them to git (`DS-SURROGATE-GIT-CONTRACT`):

- planning happens in the initiative's own worktree
- each initiative gets one pull request
- attestation happens before that pull request merges
- `main` is production grade by definition

The record states the cost: no branch can see every backlog item (`DS-SURROGATE-GIT-CONTRACT`). It
is now answered without moving anything onto `main`: `opensprint compact board --all-branches`
prints the card every local and remote-tracking `opsp/<id>` branch carries, from committed work
only, and never writes `BOARD.md` (`DEC-BOARD-ALL-BRANCHES`, attested under `DS-BOARD-VISIBILITY`).
Initiatives name an owner, which triage and apply claim at pick-up (`DEC-INITIATIVE-OWNER`). The
committed board still shows the checkout alone, by decision (`DEC-BOARD-ALL-BRANCHES`).

**What this deliberately does not reach.** Compaction stops at the surrogate. Certification, the
governing half of change management (approving, gating, promoting) and release management are out
of scope (`DS-SURROGATE-SCOPE`). The *recording* half of change management was brought into scope on
2026-10-10. Attest records who holds a risk and never decides whether that risk is acceptable
(`DS-SURROGATE-SCOPE`, `DS-ATTEST-AS-REVIEW`).

> **Two strategies disagree with what was built, according to their own records.**
>
> - `DS-HATS-AS-CONTEXT` decides that a stakeholder with no repository access can file a backlog
>   item through an agent. Its own posture says the backlog skill runs `git worktree add`, which
>   needs repository access. `DS-SURROGATE-GIT-CONTRACT` also records that no branch can see every
>   backlog item; that half is now answered by `compact board --all-branches`
>   (`DEC-BOARD-ALL-BRANCHES`), though a stakeholder reading the committed `BOARD.md` still sees one
>   branch.
> - `DS-PROGRESSIVE-CRYSTALLIZATION` sets a primary bar that `/opsp:explore` leaves an initiative
>   behind. Its posture records that explore writes nothing and that this step moved to
>   `/opsp:backlog`. The record says revising the bar is a decision, not an attestation.

**Where the attested strategies stand.** Each verdict below was given by Ivan Lee on 2026-10-11, and
no exposure names a `mitigated-by`. `DS-SURROGATE-GIT-CONTRACT` and `DS-HATS-AS-CONTEXT` were
re-reviewed on 2026-10-18 and are unchanged (`DS-SURROGATE-GIT-CONTRACT`, `DS-HATS-AS-CONTEXT`). `DS-SQUAD-HATS`, `DS-SME-OWNERSHIP`, `DS-LOOP-CLOSURE`,
`DS-BIG-PICTURE`, `DS-PARALLEL-EXEC` and `DS-SURROGATE-SCOPE` have no posture.

| Strategy | Verdict | What remains exposed, as recorded |
|---|---|---|
| `DS-SURROGATE-GIT-CONTRACT` | not met | an `opsp/*` branch can merge to `main` unattested, this one included; the CI snippet in `docs/git-workflow.md` installs a package that predates `frame`, `migrate` and the new loop kinds |
| `DS-ESCALATION-HANDOFF` | cannot assess | the inferred hat can be wrong and approved quickly; the evidence could not show whether an escalation behaves as instructed |
| `DS-STRATEGY-ALTITUDE` | cannot assess | a regression in `strategy-unimplemented` would pass the test suite |
| `DS-ATTEST-AS-REVIEW` | partially met | nothing detects an attester reading source; the "or records why not" path is untested; reading tests brings back some self-assessment risk |
| `DS-CI-ATTESTATION` | partially met | evidence citing a `../` path is silently accepted; any file in the tree counts as evidence |
| `DS-DOCUMENTATION-REVIEWED` | partially met | nothing compiles or checks `docs/`; an initiative with no documentation judgement is invisible to every compile |
| `DS-FORWARD-CLOSURE` | partially met | an exposure with no pointer may go unreported, and any string satisfies the pointer |
| `DS-HATS-AS-CONTEXT` | partially met | keeping the implementation out of attest depends on the agent following instructions; there is no tested way for a stakeholder without repository access to file a backlog item |
| `DS-MAINTAINER-INHERITED` | partially met | an off-list objective may route nowhere without being reported; an empty objective row could disappear from the view without failing a test |
| `DS-MEASURE-ANATOMY` | partially met | a compiled view could state a bar with no posture and no test would fail |
| `DS-PROGRESSIVE-CRYSTALLIZATION` | partially met | the primary bar has drifted from what shipped; an initiative marked `attested` with no `## Attestation` section passes the check |
| `DS-VIEW-AUTHORSHIP` | partially met | a hand-edited view can be sealed as if rendered; no auditable record says which hat compiled a view |

## Measures

For each goal: what measures it, and what actually asserts that measure. Three of the six carry an
attested measure — a posture with evidence behind it (`DS-SURROGATE-BUDGET`, `DS-BOARD-VISIBILITY`,
`DS-LIVE-BOARD`); one has a posture with no evidence (`DS-ATTESTED-TRUTH`); two have never been
judged (`DS-FULL-COVERAGE`, `DS-DOCUMENTATION-AS-OUTPUT`). Only an attested measure is written in the
present tense below.

### Cover all four accountabilities

```
primary:    every hat in a project's registry has records, or a recorded decision explaining why not
guardrail:  no hat accumulates records that no rule asserts (DS-LOOP-CLOSURE)
bar:        no `### Bar` recorded
posture:    none
```

Nobody has judged whether either measure is met, so the goal is **decided, not true**
(`DS-FULL-COVERAGE`). Reported below as `measure-unattested`.

### Documentation is compiled, never a second effort

```
primary:    no documentation artifact is hand-authored where a compiled one would serve
guardrail:  a compiled artifact that disagrees with its sources fails the build (DEC-010)
bar:        no `### Bar` recorded
posture:    none
```

Unjudged, so **decided, not true** (`DS-DOCUMENTATION-AS-OUTPUT`). Reported below as
`measure-unattested`.

### Nothing is documented as true until it is attested

```
primary:    no compiled claim is stated in the present tense without an attestation behind it
guardrail:  a compiled view visibly distinguishes decided, observed and attested claims
freshness:  an attestation carries a date, so staleness is computable rather than assumed
bar:        no `### Bar` recorded
posture:    partially met — Ivan Lee, 2026-10-11
evidence:   none recorded
exposure:   recorded, with no mitigated-by
```

The attestation found the classification of a record as decided or attested asserted, including
that an attestation needs both a date and evidence and that the date carries without expiring
(`DS-ATTESTED-TRUTH`, `test/core/compact-measures.test.ts`). It found three things unasserted: the
tense of compiled claims (**Primary**); the `observed` authority in compiled output — the test titled
"three authorities" checks two, neither of them `attested` (**Guardrail**); and that a verdict with
evidence but no `attested-on` is downgraded (**Freshness**) (`DS-ATTESTED-TRUTH`).

With no `### Evidence`, the posture is a judgement nothing asserts: the goal stays **decided**.
Exposure as recorded: a compiled view may state present-tense claims with no attestation behind them,
and the decided / observed / attested distinction is unverified in rendered output
(`DS-ATTESTED-TRUTH`).

### Loading the surrogate must not consume the session budget

```
primary:    every load step in /opsp:apply, /opsp:explore, /opsp:triage and /opsp:propose names
            the views it reads and never loads every record, except as a named fallback
guardrail:  an agent opens a full record for the decision it acts on, and /opsp:apply reads the
            initiative's own driver-specs and ADRs in full
trust:      each load step asks `compact plan` whether the views can be trusted, and says what to
            do with every section state that is not fresh

bar:        as a    developer running /opsp:apply, /opsp:explore, /opsp:triage or /opsp:propose
                    on a mature surrogate
            I want  the agent to orient on the compiled per-hat views and open a full record only
                    for the decision it acts on
            for     the session budget to go to the work rather than to loading every record
            dimension — orientation cost against grounding in the record
            chosen    — views first, the full record on demand, for the four load steps and for
                        /opsp:attest's read of the owning hat's section
            traded for— between compiles a view can be wrong; this relies on `compact plan`
                        reporting it, and on the agent reading around what it reports
            neighbour — loading every record, as DEC-015 deferred to
posture:    partially met — Claude Opus 5.5 for Ivan Lee, 2026-10-18; the session that wrote the
            bar attested it, the operator overriding DEC-043
evidence:   test/core/opsp-load-views.test.ts
exposure:   recorded, with no mitigated-by
```

Attested as of 2026-10-18: each of the four load steps names the views it reads, no read list carries
a record glob, `architecture.md`, `DECISION-MAP.md` or `initiatives/*.md`, and the record glob appears
only after a fall-back clause (**Primary**); each step tells the agent to open the full record for
the decision it acts on, and apply reads the initiative's own records in full (**Guardrail**)
(`DS-SURROGATE-BUDGET`). **Trust** is partly asserted: each step calls `compact plan` and answers
`open-loops` from it, and the stale rule names what moved — except in propose, where the test returns
early; for `unsealed` and `tampered` only the words are checked, not what the step does with them
(`DS-SURROGATE-BUDGET`).

Every assertion is on instruction text. Exposure as recorded: what a step does with an `unsealed` or
`tampered` section, and propose's rule for a `stale` one, could be reworded away with the suite still
green, and nothing measures what an agent actually loads or the tokens it saves — which is what this
goal is for (`DS-SURROGATE-BUDGET`).

### Every initiative is visible from any checkout, and work in flight names its owner

```
primary:    `compact board --all-branches` lists the card every local and remote-tracking opsp/*
            branch carries, beside the checkout's own, picks the copy that is ahead where two
            differ, and writes nothing
guardrail:  a card at building, ready-for-attestation or attested with no owner is reported
            `owner-undeclared` on the board
workflow:   /opsp:triage claims on pick-up and releases on return, /opsp:apply claims before it
            builds, /opsp:backlog never claims

bar:        as a    lead picking up backlog work, in any checkout
            I want  to see every initiative on every branch, and who holds each card in flight
            for     nobody to build what someone else already holds, or to miss what was filed
                    elsewhere
            dimension — cross-branch visibility against a committed board that stays deterministic
            chosen    — the committed BOARD.md shows the checkout alone; the cross-branch board is
                        printed on demand from committed trees, as current as the last fetch
            traded for— a stakeholder's agent reading BOARD.md still sees one branch; an owner is
                        self-declared, and nothing stops two people claiming on different branches
                        before either pushes
            neighbour — the backlog on main while proposals stay on branches, the split DEC-029's
                        Invalidation Trigger names
posture:    met — Claude Opus 5.5 for Ivan Lee, 2026-10-18; the session that wrote the bar
            attested it, the operator overriding DEC-043
evidence:   test/core/board-branches.test.ts, test/cli-e2e/compact.test.ts, test/core/board.test.ts,
            test/core/opsp-board-owners.test.ts, test/cli-e2e/claim.test.ts
```

Attested as of 2026-10-18: `compact board --all-branches` collects the checkout's card, local
branches and remote-tracking branches; the checkout wins, and between two copies the fetched one is
shown only where it is strictly ahead; it prints local and fetched cards, leaves `BOARD.md`
byte-identical and creates none where there was none (**Primary**). `owner-undeclared` fires for
exactly `building`, `ready-for-attestation` and `attested`, and not for any other state
(**Guardrail**) (`DS-BOARD-VISIBILITY`).

**Workflow** is asserted as instruction text only, in order: triage claims after the worktree exists
and releases on return, apply claims before it advances to `building`, backlog never claims. The
`claim` command it relies on is tested end to end; nothing measures whether an agent follows the
instructions (`DS-BOARD-VISIBILITY`).

### One live board, seen the same from anywhere, that starts the next step

```
primary:    two checkouts on different branches render the same board from the remote, without
            fetching each other's branches, and a move pushed from one appears in the other's
            next render
guardrail:  a card offers only the moves the state machine allows — forward continues the stage's
            workflow, backward escalates — and a button never moves a card itself
drill-down: opening an initiative shows its milestones as tickets, in columns that follow the opsx
            lifecycle

bar:        as a    member of the team, human or agent, on any branch or machine
            I want  to see the same live board, and start any card's next step from it
            for     nobody to work from a stale or partial picture of the work
            dimension — one central copy of in-flight state against each branch carrying its own
            chosen    — a single remote branch holds in-flight state; completed initiatives stay
                        static records
            traded for— reading needs a network round trip to the remote, and the board must never
                        be edited by hand
            neighbour — the compiled, per-checkout BOARD.md (DEC-026), with --all-branches printing
                        the rest (DEC-BOARD-ALL-BRANCHES)
posture:    partially met — Claude (fresh session) for Ivan Lee, 2026-11-04; a re-attestation,
            after a change requested on 2026-11-03
evidence:   CI run 41668525609 on pull request 10, Test job green;
            test/core/kanban-skill.test.ts, test/core/kanban-milestones.test.ts,
            test/core/kanban-actions.test.ts
exposure:   recorded, with no mitigated-by
```

Attested as of 2026-11-04: two checkouts, each cloned with only its own branch, render the same board
with the playbook they ship, and a move pushed from either — `advance` from one, `claim` from the
other — appears in the other's next render, with neither ever holding a ref to the other's branch
(**Primary**). Clicking an initiative's title opens its milestones in the five opsx columns; only the
next ticket offers continue, and Review offers a change request (**Drill-down**)
(`DS-LIVE-BOARD`).

**Guardrail** is half asserted: every move the board derives is a legal transition that never
reaches `declined`, the page carries that table verbatim, and the page has no means of writing — no
URL, no `fetch`, no socket — while a ticket's continue button only copies a command. Exposure as
recorded: no test renders an initiative card and checks its buttons are exactly its state's moves,
so the page could offer a move its state does not allow, or omit one, with the suite still green;
accepted at attestation without a mitigating item (`DS-LIVE-BOARD`).

## Open Loops

Twenty-five, exactly as the harvest reports them for this hat. Triage them through `/opsp:explore`
and `/opsp:propose`; deciding which gap is worth work is a judgement call.

### `constraint-unanswered` — a constraint no active decision answers

- `DS-AGENTIC-SDLC`
- `DS-BIG-PICTURE`
- `DS-DOCUMENTATION-AS-OUTPUT`

### `constraint-unasserted` — answered, but no rule cites any answering decision

- `DS-BOARD-VISIBILITY` — answered by `DEC-BOARD-ALL-BRANCHES` and `DEC-INITIATIVE-OWNER`
- `DS-STRATEGY-ALTITUDE` — answered by `DEC-020`

### `strategy-unimplemented` — an approach with no decision descending from it

- `DS-BIG-PICTURE`

### `measure-unattested` — a measure nobody has judged, or judged with an unrecognised verdict

- `DS-DOCUMENTATION-AS-OUTPUT` — no `### Posture`
- `DS-FULL-COVERAGE` — no `### Posture`

### `exposure-unmitigated` — an exposure with no `mitigated-by`

A risk with no planned work is a confession. Fifteen records carry one: `DS-ATTEST-AS-REVIEW`,
`DS-ATTESTED-TRUTH`, `DS-CI-ATTESTATION`, `DS-DOCUMENTATION-REVIEWED`, `DS-ESCALATION-HANDOFF`,
`DS-FORWARD-CLOSURE`, `DS-HATS-AS-CONTEXT`, `DS-LIVE-BOARD`, `DS-MAINTAINER-INHERITED`,
`DS-MEASURE-ANATOMY`, `DS-PROGRESSIVE-CRYSTALLIZATION`, `DS-STRATEGY-ALTITUDE`, `DS-SURROGATE-BUDGET`,
`DS-SURROGATE-GIT-CONTRACT`, `DS-VIEW-AUTHORSHIP`.

### `bar-without-form` — a bar stated in prose rather than in its hat's form

A product bar is written `as a / I want / for`, which is already a test specification.

- `DS-ATTEST-AS-REVIEW`
- `DS-VIEW-AUTHORSHIP`
