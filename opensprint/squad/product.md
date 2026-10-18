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

Five goals stand between the objective and the work. All five are decided. Three carry a posture:
`DS-ATTESTED-TRUTH` and `DS-SURROGATE-BUDGET` are `partially met`, and `DS-BOARD-VISIBILITY` is
`met` and attested — the one goal stated here as reached (`DS-ATTESTED-TRUTH`,
`DS-SURROGATE-BUDGET`, `DS-BOARD-VISIBILITY`).

### Cover all four accountabilities

The decision: spec-driven development must cover **functional** intent (product) and
**non-functional** intent (maintainer), and delivered results must cover **application** (dev) and
**infrastructure** (devops). A practice that covers only some of these is not engineering
(`DS-FULL-COVERAGE`).

The record names the gap this closes. Common practice specifies the product and dev halves. It
leaves what must stay true while the system runs, and how the system is stood up, to convention. That
is how an implementation can meet every stated requirement and still be unfit (`DS-FULL-COVERAGE`).

You could tell this goal had landed when every hat in a project's registry has records, or has a
recorded decision explaining why it does not. A hat with no records is meant to be reported, not
hidden (`DS-FULL-COVERAGE`).

### Documentation is compiled, never a second effort

The decision: **the compacted surrogate is the documentation**. It is compiled from work already
done and never authored alongside it (`DS-DOCUMENTATION-AS-OUTPUT`). The reasoning is that
driver-specs and decisions get made during the work, because the work cannot proceed without them.
Rendering them therefore costs nothing extra. A compiled document also cannot drift from its sources
without the compile reporting it (`DS-DOCUMENTATION-AS-OUTPUT`).

That guarantee covers drift from the *records* only. It says nothing about drift between the records
and reality, and the next goal exists to close that gap (`DS-ATTESTED-TRUTH`). Narrative that is
genuinely authored, such as an origin story or an entry point, stays authored and says so
(`DS-DOCUMENTATION-AS-OUTPUT`).

### Nothing is documented as true until it is attested

The decision: a compiled claim may be stated as present-tense fact **only when a human has asserted
it with evidence**. Anything else is intent wearing the grammar of state (`DS-ATTESTED-TRUTH`).

That gives a claim three authorities. A *decided* claim is cited by a record id, an *observed* claim
by a path, and an *attested* claim by evidence, a date and an attester. `DEC-009` recognised only the
first two. Only an attested claim may use the present tense (`DS-ATTESTED-TRUTH`). The accepted
weakness is that an attestation ages. The record judges that a better failure than a claim that was
never true (`DS-ATTESTED-TRUTH`).

Ivan Lee attested this goal on 2026-10-11 as **partially met** (`DS-ATTESTED-TRUTH`). See Measures.

### Loading the surrogate must not consume the session budget

The decision: an agent must be able to work from the compacted surrogate instead of loading every
driver-spec and ADR. This extends progressive discovery by one layer (`DS-SURROGATE-BUDGET`).

The record includes a baseline from three projects in production use. There, `/opsp:apply` loaded
about 93K to 106K tokens, `/opsp:explore` loaded about 127K to 157K, and ADRs made up 61 to 74% of
every load (`DS-SURROGATE-BUDGET`). The saving applies to orientation, not to judgement: an agent
acting on a decision still reads that decision's full record (`DS-SURROGATE-BUDGET`).

The bar was written when this work was backfilled: each planning and build skill names the views
it reads, falls back to every record only where the engine cannot run, opens a full record for the
decision it acts on, and says what to do with each section `compact plan` reports not fresh
(`DS-SURROGATE-BUDGET`). It is attested **partially met** on 2026-10-18 (`DS-SURROGATE-BUDGET`). See
Measures.

### Every initiative is visible from any checkout, and work in flight names its owner

The decision: any checkout must be able to see every initiative, on whichever branch it lives, and
every card in flight must name the person who holds it (`DS-BOARD-VISIBILITY`). It formalises the
cost `DS-SURROGATE-GIT-CONTRACT` and `DEC-029` recorded as unsolved — no branch could see every
backlog item — and gives a name to the engineer who, per `DS-HATS-AS-CONTEXT`, steps up for
accountability past the board (`DS-BOARD-VISIBILITY`).

It is attested **met** on 2026-10-18: `opensprint compact board --all-branches` prints every
branch's card and writes nothing, an unowned card in flight is reported, and the planning and build
skills claim at pick-up (`DS-BOARD-VISIBILITY`). What it traded: the committed `BOARD.md` still shows
one branch, and a claim is visible only once pushed (`DS-BOARD-VISIBILITY`). See Measures.

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

For each goal: what measures it, and what asserts that measure. The plan classifies three of the
five goal records as **decided**; `DS-SURROGATE-BUDGET` and `DS-BOARD-VISIBILITY` are `attested`.
So every other bar below is a commitment, not a property the system is known to have. Where a check
exists, it is cited by path, and that citation is **observed** (it shows what the test exercises),
not a verdict on the bar. Only `DS-SURROGATE-BUDGET` and `DS-BOARD-VISIBILITY` say what their bars
traded away; for the other three **the trade is unrecorded**.

```
goal                         record                      measures             posture
---------------------------  --------------------------  -------------------  ----------------------
all four accountabilities    DS-FULL-COVERAGE            primary, guardrail   none recorded
documentation is compiled    DS-DOCUMENTATION-AS-OUTPUT  primary, guardrail   none recorded
true only once attested      DS-ATTESTED-TRUTH           primary, guardrail,  partially met, no
                                                         freshness            evidence: decided
surrogate within budget      DS-SURROGATE-BUDGET         primary, guardrail,  partially met,
                                                         trust                attested
every branch, named owners   DS-BOARD-VISIBILITY         primary, guardrail,  met, attested
                                                         workflow
```

### Cover all four accountabilities

- **Primary**: every hat in a project's registry has records, or a recorded decision explaining
  why it has none (`DS-FULL-COVERAGE`). The record names nothing that checks this.
- **Guardrail**: no hat accumulates records that no rule asserts (`DS-FULL-COVERAGE`, which points
  to `DS-LOOP-CLOSURE`). The harvest that reports a decision no rule cites is exercised by
  `test/core/compact-loops.test.ts`. `test/cli-e2e/compact.test.ts` shows that `compact loops`
  reports an unguarded decision **and exits zero**. So the gap is reported, but nothing fails
  because of it.
- **Posture**: none recorded. The plan reports this measure as `measure-unattested`
  (`DS-FULL-COVERAGE`).

### Documentation is compiled, never a second effort

- **Primary**: no documentation artifact is hand-authored where a compiled one would serve
  (`DS-DOCUMENTATION-AS-OUTPUT`). The record names nothing that checks this.
- **Guardrail**: a compiled artifact that disagrees with its sources fails the build
  (`DS-DOCUMENTATION-AS-OUTPUT`, see `DEC-010`). `test/cli-e2e/compact.test.ts` asserts that
  `compact check` exits non-zero after a view is hand-edited or after a record changes. That covers
  the check. It does not show that the check gates a build.
- **Posture**: none recorded. The plan reports this measure as `measure-unattested`
  (`DS-DOCUMENTATION-AS-OUTPUT`).

### Nothing is documented as true until it is attested

- **Primary**: no compiled claim is stated in the present tense without an attestation behind it
  (`DS-ATTESTED-TRUTH`).
- **Guardrail**: a compiled view visibly distinguishes decided, observed and attested claims
  (`DS-ATTESTED-TRUTH`).
- **Freshness**: an attestation carries a date, so staleness can be computed instead of assumed
  (`DS-ATTESTED-TRUTH`).
- **Posture** as recorded: **partially met**, attested by Ivan Lee on 2026-10-11
  (`DS-ATTESTED-TRUTH`). Per that posture, `test/core/compact-measures.test.ts` asserts how a record
  is classified as decided or attested. That includes the rule that an attestation needs both a
  date and evidence, and that the date carries forward without expiring. According to the posture,
  three things are not asserted:
  - **Primary**: the tense of compiled claims.
  - **Guardrail**: the `observed` authority in compiled output. The test titled "three
    authorities" checks two of them, and neither is `attested`.
  - **Freshness**: that a verdict with evidence but no `attested-on` is downgraded.
- **Evidence**: the record has no `### Evidence` section, so the plan classifies it **decided**,
  not attested. The verdict above is a judgement with no artifact behind it.
- **Exposure** as recorded: a compiled view may state present-tense claims with no attestation
  behind them, and the decided / observed / attested distinction is unverified in rendered output
  (`DS-ATTESTED-TRUTH`). It names no `mitigated-by`, and the plan reports it as
  `exposure-unmitigated`.

### Loading the surrogate must not consume the session budget

```
as a    developer running /opsp:apply, /opsp:explore, /opsp:triage or /opsp:propose
        on a mature surrogate
I want  the agent to orient on the compiled per-hat views and open a full record only
        for the decision it acts on
for     the session budget to go to the work rather than to loading every record
```

- **Primary**: every load step in those four skills names the views it reads and never loads every
  record; every record appears only as the fallback where `opensprint compact` cannot run, or where
  the records predate hats (`DS-SURROGATE-BUDGET`).
- **Guardrail**: an agent opens the full record for the decision it is about to act on, and
  `/opsp:apply` reads the initiative's own driver-specs and ADRs in full (`DS-SURROGATE-BUDGET`).
- **Trust**: each load step asks `compact plan` whether the views can be trusted and says what to do
  with every section state that is not fresh (`DS-SURROGATE-BUDGET`).
- **Bar**: on the axis of orientation cost against grounding in the record, the chosen point is
  views first and the full record on demand. It trades away certainty between compiles: a view can
  be wrong, and the bar relies on `compact plan` reporting it. The neighbour is loading every
  record, which `DEC-015` deferred to and `DEC-VIEWS-FIRST-LOAD` supersedes (`DS-SURROGATE-BUDGET`).
- **Posture**: **partially met**, attested on 2026-10-18 by Claude Opus 5.5 for Ivan Lee. The
  attesting session also edited these tests and wrote this bar, and the operator overrode `DEC-043`
  to let it attest (`DS-SURROGATE-BUDGET`). Primary and Guardrail are asserted for all four skills.
  Trust is partly asserted: what a step does with an `unsealed` or `tampered` section is checked
  only by the words appearing, and propose's stale rule is not checked.
- **Evidence**: `test/core/opsp-load-views.test.ts` (`DS-SURROGATE-BUDGET`).
- **Exposure**: either unasserted rule could be reworded away with the suite still green, and every
  assertion is on instruction text, so nothing measures what an agent actually loads or the tokens
  it saves (`DS-SURROGATE-BUDGET`). It names no `mitigated-by`, and the plan reports it as
  `exposure-unmitigated`.

### Every initiative is visible from any checkout, and work in flight names its owner

```
as a    lead picking up backlog work, in any checkout
I want  to see every initiative on every branch, and who holds each card in flight
for     nobody to build what someone else already holds, or to miss what was filed elsewhere
```

- **Primary**: `opensprint compact board --all-branches` lists the card every local and
  remote-tracking `opsp/*` branch carries, alongside the checkout's own, picks the copy that is ahead
  where two differ, and writes nothing (`DS-BOARD-VISIBILITY`).
- **Guardrail**: a card at `building`, `ready-for-attestation` or `attested` with no owner is
  reported `owner-undeclared` on the board (`DS-BOARD-VISIBILITY`).
- **Workflow**: `/opsp:triage` claims an item when it picks it up and releases it when it returns
  it, `/opsp:apply` claims before it starts building, and `/opsp:backlog` never claims
  (`DS-BOARD-VISIBILITY`).
- **Bar**: on the axis of cross-branch visibility against a committed board that stays
  deterministic, the chosen point is a committed `BOARD.md` showing the checkout alone and a
  cross-branch board printed on demand, as current as the last fetch. It trades away a stakeholder
  reading `BOARD.md` seeing every branch, and enforced ownership: two people can claim one card on
  different branches before either pushes. The neighbour is the backlog on `main`, the split
  `DEC-029`'s Invalidation Trigger names (`DS-BOARD-VISIBILITY`).
- **Posture**: **met**, attested on 2026-10-18 by Claude Opus 5.5 for Ivan Lee. The attesting
  session also removed two citations from these templates and wrote this bar, and the operator
  overrode `DEC-043` (`DS-BOARD-VISIBILITY`). Primary is asserted in the library and through the
  CLI, for every combination of same, ahead and diverged copies; Guardrail for exactly the three
  owned states; Workflow as instruction text, in order. Nothing measures whether an agent follows
  those instructions.
- **Evidence**: `test/core/board-branches.test.ts`, `test/cli-e2e/compact.test.ts`,
  `test/core/board.test.ts`, `test/core/opsp-board-owners.test.ts` and
  `test/cli-e2e/claim.test.ts` (`DS-BOARD-VISIBILITY`).

## Open Loops

24 loops the harvest reports for this hat, grouped by kind. Each is reported by `opensprint compact plan`, not inferred here; the record cited is where it closes.

### `constraint-unanswered` — a constraint no active decision answers

- `DS-AGENTIC-SDLC`
- `DS-BIG-PICTURE`
- `DS-DOCUMENTATION-AS-OUTPUT`

_No active decision answers this constraint._

### `constraint-unasserted` — answered, but no rule cites any answering decision

- `DS-BOARD-VISIBILITY` — Answered by `DEC-BOARD-ALL-BRANCHES`, `DEC-INITIATIVE-OWNER`, but no rule cites any of them.
- `DS-STRATEGY-ALTITUDE` — Answered by `DEC-020`, but no rule cites any of them.

### `strategy-unimplemented` — an approach with no decision descending from it

- `DS-BIG-PICTURE`

_States an approach with no decision descending from it. Intent nobody built._

### `measure-unattested` — a measure nobody has judged, or judged with an unrecognised verdict

- `DS-DOCUMENTATION-AS-OUTPUT`
- `DS-FULL-COVERAGE`

_States a measure with no `### Posture`. Nobody has judged whether the bar was met._

### `exposure-unmitigated` — an exposure with no `mitigated-by`

- `DS-ATTEST-AS-REVIEW`
- `DS-ATTESTED-TRUTH`
- `DS-CI-ATTESTATION`
- `DS-DOCUMENTATION-REVIEWED`
- `DS-ESCALATION-HANDOFF`
- `DS-FORWARD-CLOSURE`
- `DS-HATS-AS-CONTEXT`
- `DS-MAINTAINER-INHERITED`
- `DS-MEASURE-ANATOMY`
- `DS-PROGRESSIVE-CRYSTALLIZATION`
- `DS-STRATEGY-ALTITUDE`
- `DS-SURROGATE-BUDGET`
- `DS-SURROGATE-GIT-CONTRACT`
- `DS-VIEW-AUTHORSHIP`

_States an exposure with no `mitigated-by`. A risk with no planned work is a confession._

### `bar-without-form` — a bar stated in prose rather than in its hat's form

- `DS-ATTEST-AS-REVIEW`
- `DS-VIEW-AUTHORSHIP`

_States a bar in prose. A product bar is written `as a / I want / for`, which is already a test specification._
