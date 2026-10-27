# product — what must it do?

**Two records are attested; everything else here rests on a decision** (`DS-ATTESTED-TRUTH`).
`/opsp:attest` first ran on 2026-10-11: thirteen measures carry a posture from then, none of them
`met` and none with evidence, so none of those is attested — each records what remains exposed
instead. `DS-SURROGATE-BUDGET` (**partially met**) and `DS-BOARD-VISIBILITY` (**met**) were attested
on 2026-10-18 with evidence (`DS-SURROGATE-BUDGET`, `DS-BOARD-VISIBILITY`).

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

What must be true to reach the objective, each stated so you could tell whether it is. Six records
carry `role: goal`. Every goal below is a decision; how far each is borne out, and by what, is under
**Measures**.

The chain follows the records' `depends-on` edges. The two board goals do not descend from the
objective. `DS-BOARD-VISIBILITY` rests on `DS-SURROGATE-GIT-CONTRACT` and `DS-HATS-AS-CONTEXT`, and
`DS-LIVE-BOARD` rests on `DS-BOARD-VISIBILITY` (`DS-BOARD-VISIBILITY`, `DS-LIVE-BOARD`).

```
 DS-AGENTIC-SDLC  (objective)
  |
  +-- DS-FULL-COVERAGE              all four accountabilities
  +-- DS-DOCUMENTATION-AS-OUTPUT    documentation is compiled
  |     +-- DS-ATTESTED-TRUTH       nothing is true until it is attested
  +-- DS-SURROGATE-BUDGET           loading must not consume the session budget

 DS-SURROGATE-GIT-CONTRACT + DS-HATS-AS-CONTEXT
  +-- DS-BOARD-VISIBILITY           every initiative visible, every card in flight owned
        +-- DS-LIVE-BOARD           one live board, seen the same from anywhere
```

### Cover all four accountabilities

Spec-driven development must cover **functional** intent (product) and **non-functional** intent
(maintainer), and delivered results must cover **application** (dev) and **infrastructure**
(devops). A practice covering only some of those is not engineering, and this is the goal the four
hats exist to serve (`DS-FULL-COVERAGE`).

You can tell it landed when every hat in a project's registry has records, or a recorded decision
explaining why it does not. A hat with no records is a reportable state, not an oversight to hide,
and coverage is claimed only where something checks it (`DS-FULL-COVERAGE`).

Why it is a goal: spec-driven development as commonly practised covers the product and dev halves.
What must stay true while the system runs, and how it is stood up and kept running, are left to
convention. That is how an implementation can satisfy every stated requirement and still be unfit
(`DS-FULL-COVERAGE`).

### Documentation is compiled, never a second effort

**The compacted surrogate is the documentation.** It is compiled from work already done and never
authored alongside it (`DS-DOCUMENTATION-AS-OUTPUT`).

You can tell it landed when no documentation artifact is hand-authored where a compiled one would
serve. Narrative documents that really are authored, such as an origin story or an entry point,
stay authored and say so (`DS-DOCUMENTATION-AS-OUTPUT`).

Why it is a goal: documentation fails for a structural reason, not a discipline one. It is written
after the fact, by someone with no remaining incentive, about decisions whose reasoning has faded.
The records are made *during* the work, because the work cannot proceed without them, so rendering
them costs nothing extra. A compiled document cannot drift from its sources without the compile
reporting it (`DS-DOCUMENTATION-AS-OUTPUT`). Drift between the records and reality is a separate
problem, and the next goal covers it (`DS-ATTESTED-TRUTH`).

### Nothing is documented as true until it is attested

**A compiled claim may be stated as present-tense fact only when a human has asserted it with
evidence.** Anything else is intent wearing the grammar of state (`DS-ATTESTED-TRUTH`).

| Authority | Cited by | Says | Weakness |
|---|---|---|---|
| **decided** | a record id | it binds | may not be true yet |
| **observed** | a path | it is true now | may be an accident |
| **attested** | evidence ref · date · attester | asserted true, with an artifact behind it | ages |

Only **attested** licenses the present tense (`DS-ATTESTED-TRUTH`).

You can tell it landed when no compiled claim is in the present tense without an attestation behind
it, a compiled view visibly separates the three authorities, and every attestation carries a date,
so its staleness can be computed (`DS-ATTESTED-TRUTH`).

Why it is a goal: the project's own output showed the gap. `architecture.md` listed operator-only
reconciliation as a non-negotiable, while a squad view admitted that the guardrail was instruction
text no rule reads. Both came from the same records in the same pass, and neither was wrong, because
the compiler could not tell a decision that binds from a property that holds (`DS-ATTESTED-TRUTH`).
Compilation closes drift from the records. Attestation closes drift between the records and reality,
which is the drift a reader cares about (`DS-ATTESTED-TRUTH`, `DS-DOCUMENTATION-AS-OUTPUT`). An
attestation ages, which is a far better failure than a claim that was never true
(`DS-ATTESTED-TRUTH`).

### Loading the surrogate must not consume the session budget

An agent must be able to work from the compacted surrogate rather than load every driver-spec and
ADR. Progressive discovery goes one layer further than it did (`DS-SURROGATE-BUDGET`).

You can tell it landed when the load steps of `/opsp:apply`, `/opsp:explore`, `/opsp:triage` and
`/opsp:propose` name the views they read, and load every record only as the fallback where
`opensprint compact` cannot run or the records predate hats. An agent still opens the full record
for the decision it is about to act on: **the budget is saved on orientation, not on judgement**
(`DS-SURROGATE-BUDGET`).

Why it is a goal: three projects in production use were measured, in bytes divided by 4
(`DS-SURROGATE-BUDGET`):

| Project | `/opsp:apply` loads | `/opsp:explore` loads |
|---|---|---|
| cashier | ~106K | ~157K |
| overheard | ~94K | ~129K |
| ai-gateway | ~93K | ~127K |

ADRs are 61–74% of every load, so they are the layer worth condensing. `architecture.md` was loaded
alongside the ADRs it summarises, so it saved nothing at load time. Completed initiatives were loaded
on every explore, about 47K of cashier's 157K, although their durable output already lives in the
records (`DS-SURROGATE-BUDGET`).

### Every initiative is visible from any checkout, and work in flight names its owner

Any checkout must be able to see every initiative, on whichever branch it lives, and every card in
flight must name the person who holds it (`DS-BOARD-VISIBILITY`).

You can tell it landed when a checkout can list the card that every `opsp/*` branch carries, local
or fetched, and a card at `building`, `ready-for-attestation` or `attested` with no owner is
reported on the board (`DS-BOARD-VISIBILITY`).

Why it is a goal: each initiative lives on its own branch from its first persisted thought, at a
cost recorded as deliberate and unsolved: no branch can see every backlog item
(`DS-BOARD-VISIBILITY`, `DS-SURROGATE-GIT-CONTRACT`). Reading the board is the one thing a
non-technical stakeholder does, and everything past it is an engineer stepping up for
accountability (`DS-BOARD-VISIBILITY`, `DS-HATS-AS-CONTEXT`). A board that shows only its own
branch fails the first. A card in flight with nobody's name on it fails the second, because nothing
says who stepped up (`DS-BOARD-VISIBILITY`).

Where this goal stopped: the committed board shows the checkout alone, and every other branch is
printed on demand, only as current as the last fetch (`DS-BOARD-VISIBILITY`). The next goal is
written against exactly that position. The record has not been revised since. Its answering
decision `DEC-BOARD-ALL-BRANCHES` is amended by `DEC-BOARD-ON-REMOTE-BRANCH`, and the per-checkout
board runs beside the live one until the live board is proven (`DEC-BOARD-ON-REMOTE-BRANCH`).

### One live board, seen the same from anywhere, that starts the next step

**In-flight initiative state lives in one central place that every agent and every human reads the
same way**, whichever worktree, branch or pull request their work sits in. The board is where the
next step of any card is started from (`DS-LIVE-BOARD`).

In the operator's terms, a completed initiative can be static. In-flight state is a store on the
remote, touched only through the opensprint tool and rendered as HTML, so anyone can stand the board
up in their own browser. Opening an initiative shows the same kind of board one level down, with its
milestones as tickets (`DS-LIVE-BOARD`).

You can tell it landed when two checkouts on different branches render the same board from the
remote without fetching each other's branches, and a move pushed from one shows up in the other's
next render (`DS-LIVE-BOARD`).

Why it is a goal: the previous goal left the board an instantaneous state, compiled from whatever one
machine had fetched (`DS-BOARD-VISIBILITY`). Meanwhile the tool is gaining tracker capability and
the backlog is scattered across worktrees, branches and remote pull requests. Moving the board onto
`main` would rely on each adopter's discipline, which OpenSprint cannot enforce, so the board wants a
single place of its own (`DS-LIVE-BOARD`).

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

For each goal: what measures it, and what actually asserts that measure. This is where "we said this
matters" meets "something checks it".

| Goal | Bar | Posture | Evidence | Authority |
|---|---|---|---|---|
| all four accountabilities | prose only | none | none | decided (`DS-FULL-COVERAGE`) |
| documentation is compiled | prose only | none | none | decided (`DS-DOCUMENTATION-AS-OUTPUT`) |
| nothing is true until attested | prose only | partially met, 2026-10-11 | none | decided (`DS-ATTESTED-TRUTH`) |
| loading must not consume the budget | as a / I want / for | partially met, 2026-10-18 | one test file | **attested** (`DS-SURROGATE-BUDGET`) |
| every initiative visible, owner named | as a / I want / for | **met**, 2026-10-18 | five test files | **attested** (`DS-BOARD-VISIBILITY`) |
| one live board | as a / I want / for | none | none | decided (`DS-LIVE-BOARD`) |

**Two goals are attested, and both attestations carry a waiver.** Each was attested by the session
that wrote its bar, with the operator overriding `DEC-043`. That ADR rules that the agent that wrote
the tests may not attest them, because the author cannot grade their own assertion
(`DS-SURROGATE-BUDGET`, `DS-BOARD-VISIBILITY`, `DEC-043`). One further goal has a verdict with no
evidence behind it, which makes it an opinion rather than an attestation (`DS-ATTESTED-TRUTH`).
Nobody has judged the other three.

### Cover all four accountabilities

- **Primary**: every hat in a project's registry has records, or a recorded decision explaining why
  it does not (`DS-FULL-COVERAGE`)
- **Guardrail**: no hat accumulates records that no rule asserts (`DS-FULL-COVERAGE`,
  `DS-LOOP-CLOSURE`)

```
bar:        no `### Bar` recorded; measures in prose
posture:    none recorded
```

No posture, so nobody has judged whether this goal landed. It is decided, not true
(`DS-FULL-COVERAGE`).

### Documentation is compiled, never a second effort

- **Primary**: no documentation artifact is hand-authored where a compiled one would serve
  (`DS-DOCUMENTATION-AS-OUTPUT`)
- **Guardrail**: a compiled artifact that disagrees with its sources fails the build
  (`DS-DOCUMENTATION-AS-OUTPUT`, `DEC-010`)

```
bar:        no `### Bar` recorded; measures in prose
posture:    none recorded
```

No posture, so nobody has judged whether this goal landed. It is decided, not true
(`DS-DOCUMENTATION-AS-OUTPUT`).

### Nothing is documented as true until it is attested

- **Primary**: no compiled claim is stated in the present tense without an attestation behind it
- **Guardrail**: a compiled view visibly distinguishes decided, observed and attested claims
- **Freshness**: an attestation carries a date, so staleness is computable rather than assumed
  (`DS-ATTESTED-TRUTH`)

```
bar:        no `### Bar` recorded; measures in prose
posture:    partially met — Ivan Lee, 2026-10-11
evidence:   no `### Evidence` block
exposure:   recorded, with no mitigated-by
```

The posture records what is asserted: a record is classified as decided or attested, an attestation
needs both a date and evidence, and the date carries without expiring
(`test/core/compact-measures.test.ts`). It also records what is not asserted (`DS-ATTESTED-TRUTH`):

- **Primary**: the tense of compiled claims.
- **Guardrail**: the `observed` authority in compiled output. The test titled "three authorities"
  checks two, and neither is `attested`.
- **Freshness**: that a verdict with evidence but no `attested-on` is downgraded.

The verdict has no evidence block behind it, so this goal is **decided, not attested**, under its own
rule (`DS-ATTESTED-TRUTH`).

Exposure as recorded: a compiled view may state present-tense claims with no attestation behind
them, and the decided / observed / attested distinction is unverified in rendered output
(`DS-ATTESTED-TRUTH`).

### Loading the surrogate must not consume the session budget

- **Primary**: every load step in `/opsp:apply`, `/opsp:explore`, `/opsp:triage` and
  `/opsp:propose` names the views it reads and never loads every record. Every record appears only
  as the fallback where `opensprint compact` cannot run, or where the records predate hats.
- **Guardrail**: an agent opens a full record for the decision it is about to act on, and
  `/opsp:apply` reads the initiative's own driver-specs and ADRs in full.
- **Trust**: each load step asks `opensprint compact plan` whether the views can be trusted, and
  says what to do with every section state that is not fresh (`DS-SURROGATE-BUDGET`).

```
bar:        as a    developer running /opsp:apply, /opsp:explore, /opsp:triage or
                    /opsp:propose on a mature surrogate
            I want  the agent to orient on the compiled per-hat views and open a full
                    record only for the decision it acts on
            for     the session budget to go to the work rather than to loading every record

            dimension — orientation cost against grounding in the record
            chosen    — views first, the full record on demand: for the four load steps,
                        and for /opsp:attest's read of the owning hat's section
            traded for— between compiles a view can be wrong; this relies on compact plan
                        reporting it, and on the agent reading around what it reports
            neighbour — loading every record, as DEC-015 deferred to
posture:    PARTIALLY MET — attested 2026-10-18 by Claude Opus 5.5 for Ivan Lee, the
            session that edited these tests and wrote this bar; the operator overrode DEC-043
evidence:   test/core/opsp-load-views.test.ts
exposure:   recorded, with no mitigated-by
```

**Attested partially met, as of 2026-10-18** (`DS-SURROGATE-BUDGET`). The frame was
`feat/opsp-load-hat-views` against `origin/main` (`e52f3a7..3dadf45`), plus the uncommitted working
tree that lands in the same pull request. The operator confirmed it. **Primary** and **Guardrail**
are asserted for all four load steps. **Trust** is partly asserted: each step calls `compact plan`
and answers `open-loops` from `openLoops`. Propose's rule for a `stale` section goes unchecked,
because the test returns early. For `unsealed` and `tampered`, the test checks only that the words
appear (`DS-SURROGATE-BUDGET`). Evidence: `test/core/opsp-load-views.test.ts`, 80 tests, green in a
local run of the full suite on the frame (104 files, 2406 tests) (`DS-SURROGATE-BUDGET`).

Exposure as recorded: what each load step says to do with an `unsealed` or `tampered` section, and
propose's `stale` rule, could be reworded away with the suite still green. Every assertion is on
instruction text. **Nothing measures what an agent actually loads, or the tokens it saves, which is
what this goal is for** (`DS-SURROGATE-BUDGET`).

### Every initiative is visible from any checkout, and work in flight names its owner

- **Primary**: `opensprint compact board --all-branches` lists the card that every local and
  remote-tracking `opsp/*` branch carries, alongside the checkout's own. Where two copies differ it
  picks the one that is ahead, and it writes nothing.
- **Guardrail**: a card at `building`, `ready-for-attestation` or `attested` with no owner is
  reported `owner-undeclared` on the board.
- **Workflow**: `/opsp:triage` claims an item when it picks it up and releases it when it returns
  it, `/opsp:apply` claims before it starts building, and `/opsp:backlog` never claims
  (`DS-BOARD-VISIBILITY`).

```
bar:        as a    lead picking up backlog work, in any checkout
            I want  to see every initiative on every branch, and who holds each card in flight
            for     nobody to build what someone else already holds, or to miss what was filed
                    elsewhere

            dimension — cross-branch visibility against a committed board that stays
                        deterministic
            chosen    — the committed BOARD.md shows the checkout alone; the cross-branch board
                        is printed on demand from committed trees, only as current as the last
                        fetch
            traded for— a stakeholder's agent reading BOARD.md still sees one branch; an owner
                        is self-declared with `claim`, and nothing stops two people claiming on
                        different branches before either pushes
            neighbour — the backlog on main while proposals stay on branches, the split
                        DEC-029's Invalidation Trigger names
posture:    MET — attested 2026-10-18 by Claude Opus 5.5 for Ivan Lee, the session that
            removed two citations from these templates and wrote this bar; the operator
            overrode DEC-043
evidence:   five test files, below
exposure:   none recorded
```

**Attested met, as of 2026-10-18** (`DS-BOARD-VISIBILITY`). The frame was `feat/opsp-board-owners`
against `origin/main` (`492492b..634670f`), plus the uncommitted working tree that lands in the same
pull request. The operator confirmed it. The attestation found each measure asserted
(`DS-BOARD-VISIBILITY`):

- **Primary**, in the library and through the CLI. The covered cases are the checkout's card, local
  branches and remote-tracking branches. The checkout wins, and between two copies the fetched one is
  shown only where it is strictly ahead. The suite covers same commit, fetched ahead, local ahead,
  diverged, and a remote with no local branch. It also covers that `BOARD.md` stays byte-identical.
- **Guardrail**, for exactly the three in-flight states, and its absence for the rest.
- **Workflow**, as instruction text, in order. **Nothing measures whether an agent follows those
  instructions.**

Evidence (`DS-BOARD-VISIBILITY`):

- `test/core/board-branches.test.ts`: collection, precedence between copies, and that `BOARD.md` is
  never touched
- `test/cli-e2e/compact.test.ts`: `compact board --all-branches`, its `--json`, and that it writes
  nothing
- `test/core/board.test.ts`: the Owner column, and `owner-undeclared` by state
- `test/core/opsp-board-owners.test.ts`: the triage, apply and backlog instructions
- `test/cli-e2e/claim.test.ts`: `opensprint claim`, `--owner`, `--release`, and that it never moves
  the state

**The attestation is ageing.** Two of the five evidence files have changed since it was made
(`test/core/opsp-board-owners.test.ts`, `test/cli-e2e/claim.test.ts`). They still carry the
assertions the posture names: triage claims after the worktree exists, commits the claim and
releases it on return; apply claims before it advances; backlog never claims. Nobody has re-judged
the verdict against them. The position the bar chose has also moved: its answering decision
`DEC-BOARD-ALL-BRANCHES` is amended by `DEC-BOARD-ON-REMOTE-BRANCH`, under the next goal
(`DS-BOARD-VISIBILITY`, `DEC-BOARD-ON-REMOTE-BRANCH`).

### One live board, seen the same from anywhere, that starts the next step

- **Primary**: two checkouts on different branches render the same board from the remote, without
  fetching each other's branches, and a move pushed from one appears in the other's next render
- **Guardrail**: a card offers only the moves the state machine allows. Forward continues the
  stage's workflow, backward escalates, and a button never moves a card itself.
- **Drill-down**: opening an initiative shows its milestones as tickets, in columns that follow the
  opsx lifecycle (`DS-LIVE-BOARD`)

```
bar:        as a    member of the team, human or agent, on any branch or machine
            I want  to see the same live board, and start any card's next step from it
            for     nobody to work from a stale or partial picture of the work

            dimension — one central copy of in-flight state against each branch carrying its
                        own
            chosen    — a single remote branch holds in-flight state; completed initiatives
                        stay static records
            traded for— reading needs a network round trip to the remote, and the board must
                        never be edited by hand
            neighbour — the compiled, per-checkout BOARD.md (DEC-026), with --all-branches
                        printing the rest (DEC-BOARD-ALL-BRANCHES)
posture:    none recorded
```

No posture, so nobody has judged this bar. **Every measure here is decided, not true** of the
running system (`DS-LIVE-BOARD`). The record carries no evidence and no exposure.

Its neighbour is the chosen point of the previous goal, which remains active and unrevised
(`DS-LIVE-BOARD`, `DS-BOARD-VISIBILITY`). The two do not conflict in practice: the live board runs
beside the per-checkout `BOARD.md` rather than replacing it, until it is proven
(`DEC-BOARD-ON-REMOTE-BRANCH`).

## Open Loops

These are only the loops the harvest reported for this hat (`opensprint compact plan`), 25 of them
across six kinds. Nothing here is inferred from a record's content.

### `constraint-unanswered` — a constraint no active decision answers

- `DS-AGENTIC-SDLC`: no active decision answers this constraint.
- `DS-BIG-PICTURE`: no active decision answers this constraint.
- `DS-DOCUMENTATION-AS-OUTPUT`: no active decision answers this constraint.

### `constraint-unasserted` — answered, but no rule cites any answering decision

- `DS-BOARD-VISIBILITY`: answered by `DEC-BOARD-ALL-BRANCHES` and `DEC-INITIATIVE-OWNER`, but no
  rule cites either.
- `DS-STRATEGY-ALTITUDE`: answered by `DEC-020`, but no rule cites it. This loop is shared with
  `maintainer`.

### `strategy-unimplemented` — an approach with no decision descending from it

- `DS-BIG-PICTURE`: it states an approach that no decision descends from, which is intent nobody
  built.

### `measure-unattested` — a measure nobody has judged, or judged with an unrecognised verdict

Each of these goals states a measure with no `### Posture`, so nobody has judged whether its bar was
met:

- `DS-FULL-COVERAGE`
- `DS-DOCUMENTATION-AS-OUTPUT`
- `DS-LIVE-BOARD`, the goal this compile adds

### `exposure-unmitigated` — an exposure with no `mitigated-by`

Each of these records states an exposure and no planned work to close it. A risk with no planned
work is a confession.

- Goals in this view: `DS-ATTESTED-TRUTH`, `DS-SURROGATE-BUDGET`
- Shared with `maintainer`: `DS-ATTEST-AS-REVIEW`, `DS-CI-ATTESTATION`,
  `DS-DOCUMENTATION-REVIEWED`, `DS-ESCALATION-HANDOFF`, `DS-MEASURE-ANATOMY`,
  `DS-STRATEGY-ALTITUDE`, `DS-SURROGATE-GIT-CONTRACT`, `DS-VIEW-AUTHORSHIP`
- Product only: `DS-FORWARD-CLOSURE`, `DS-HATS-AS-CONTEXT`, `DS-MAINTAINER-INHERITED`,
  `DS-PROGRESSIVE-CRYSTALLIZATION`

### `bar-without-form` — a bar stated in prose rather than in its hat's form

A product bar is written `as a / I want / for`, which is already a test specification. These records
state theirs in prose:

- `DS-ATTEST-AS-REVIEW`
- `DS-VIEW-AUTHORSHIP`
