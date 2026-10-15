# Concepts

Everything here exists to answer one question: **when an agent or a new engineer asks "why is it
like this?", is there an answer, and can it be trusted?**

---

## The record and the views

```
   THE RECORD                  what a team decided, and why
   ──────────                  hand-written, source of truth
   driver-specs/               constraints — functional and non-functional
   ADRs/                       decisions, each tracing to the constraint it answers
   initiatives/                work, as containers that fill over time
        │
        │   opensprint compact
        ▼
   THE VIEWS                   what a team needs to read
   ─────────                   compiled, never hand-edited
   squad/*.md                  one per hat
   architecture.md             the whole system
   DECISION-MAP.md             the decision tree, with blast radius
   BOARD.md                    every initiative by state
```

**If a view is wrong, the system is wrong.** The fix is to change a record, never the view —
`opensprint compact check` fails the build when a view disagrees with what it was compiled from.

That is also why documentation is not a second effort here. The records are written *during* the
work, because the work cannot proceed without them; rendering them costs nothing extra.

---

## Driver specs and decisions

A **driver-spec** is a constraint that comes from outside the code: a product requirement, a legal
obligation, a reliability target, a business reality. It states what must be true, not how.

An **ADR** is a decision that answers one. It records the question, the options weighed, the choice,
and — importantly — **an invalidation trigger**: what would have to change for this to be
reconsidered.

```
DS-SOME-CONSTRAINT          "payments must settle within 2 seconds"
      ▲
      │ depends-on
DEC-QUEUE-BACKEND           "we use X, because …"   ← owned by dev or devops
```

A decision is owned by **dev** or **devops** — never by product or maintainer. Something that
genuinely belongs to those hats is a *constraint*, so it is a driver-spec. Other hats may be listed
on a decision, but that is cc, not ownership.

### They change differently, and that matters

A driver-spec and an ADR look alike on disk and have opposite relationships to time.

| | Driver-spec | ADR |
|---|---|---|
| what it is | **real-world, real-time context** | **a decision, once made** |
| when the world moves | it is edited to match | it is not edited |
| how change is recorded | in place | a **new** ADR supersedes it |
| what carries the history | the record's own revisions | `DECISION-MAP.md` and the supersedes chain |

**A driver-spec tracks reality.** A contractual RTO changes, a regulation lands, a client moves — the
constraint is now different, so the record is now different. Editing it is correct; it is supposed
to describe what is true now.

**An ADR is history, and history does not get rewritten.** This follows directly from
[pillar one](pillars.md#1--code-is-a-side-product): if the decisions are the north star that
universes are rebuilt from, then quietly editing one changes what a past universe was built against
— and the reasoning that *was* used becomes unrecoverable. So an ADR that no longer holds is
**superseded by a new ADR**, with both left standing and the chain recorded.

```
   DS-SOME-CONSTRAINT        edited in place as the world changes
         │
         ▼
   DEC-FIRST-ANSWER   ──superseded-by──▶   DEC-BETTER-ANSWER
   status: superseded                      status: active
   (left standing, still readable)
```

That is why `supersedes` exists, why a superseded record keeps its id permanently, and why the
harvest reports `decision-on-superseded` when something still rests on an ancestor that moved.

---

## Four hats

Accountability splits four ways. One person may wear all four; an agent must be told which it is
wearing. A hat is a **context boundary** — in practice, it is *what you load*.

| Hat | Owns the question | Shape of its view |
|---|---|---|
| **product** | what must it **do**? | objective · goals · strategies · measures |
| **maintainer** | what must be **true of it** while it does that? | seven objectives, each with a goal, strategy and measure |
| **dev** | how is it **built**? | tech-stack · runtime-topology · entity-schema |
| **devops** | how is it **stood up and kept running**? | infra-architecture · gitops |

### Why maintainer is different

Maintainer is the **technical product manager** — the same OGSM framework as product, with one
difference that carries everything: **its objectives are inherited, not discovered.** Every software
project worries about the same seven things, which is why the accountability was split off and given
to a specialist.

```
                          | Goal        | Strategy          | Measure
 -------------------------+-------------+-------------------+------------------
  security & access       |             |                   |
  isolation & confidential|             |                   |
  privacy, retention&legal|             |                   |
  integrity & correctness |             |                   |
  change & quality        |             |                   |
  availability&continuity |             |                   |
  cost & budget           |             |                   |
```

**An empty row is the most useful cell in the table.** It says nobody has stated what this system
does about that concern. The list is extensible — a project adds an eighth objective in
`openspec/config.yaml`.

`cost & budget` is what the system costs to run and maintain. The business model — pricing, margin —
belongs to product.

A maintainer **strategy** states a position and cites the dev/devops decisions implementing it. It
never describes the mechanism: that belongs to another hat, and the citation requirement is what
enforces it — there is no record in this hat you could cite for a mechanism claim.

---

## A measure has four parts

The same four, for every hat. They split across time, and that split is the point:

```
      ex ante — when the work is proposed        ex post — when it is attested
   ┌───────────────────────────┐              ┌──────────────────────────────┐
   │ BAR                       │              │ POSTURE   met? or, where no  │
   │   the acceptance criterion│              │           bar is set, the    │
   │   handed to the engineer  │              │           honest position    │
   │   without other detail    │              │ EVIDENCE  what asserts it    │
   │                           │              │ EXPOSURE  what remains at    │
   │                           │              │           risk, and the plan │
   └───────────────────────────┘              └──────────────────────────────┘
```

Written inside a record's `## Measures` section:

```markdown
## Measures

- **Primary**: no credential reaches a log

### Bar

- **dimension**: convenience ←→ secret hygiene
- **chosen**: scanned on every push, build fails on a hit
- **traded for**: a slower pipeline, and occasional false positives
- **neighbour**: unrecorded — nothing says what pre-commit scanning would cost

### Posture

- **verdict**: met
- **attested-by**: ivan
- **attested-on**: 2026-10-09

### Evidence

ci/secret-scan run 4821

### Exposure

Historical commits were never scanned.
mitigated-by: history-rewrite
```

**Posture is not a weaker bar.** It is the honest statement in a cell where no bar exists — because
none was set, and nothing answers where it should sit.

A `### Bar` states its **neighbour** — the position not taken. A bar stated without its trade reads
like a law of nature when it was a purchase somebody made, and the receipt is what the next
maintainer actually needs. Saying `unrecorded` is a valid answer; saying nothing is not.

---

## Three authorities

A compiled claim can rest on three different things, and a reader has to be able to tell which:

| Authority | Cited by | Says | Weakness |
|---|---|---|---|
| **decided** | a record id | it binds — departing from it is a defect | **may not be true yet** |
| **observed** | a path | it is what the code does today | may be an accident |
| **attested** | evidence · date · attester | asserted true, with an artifact behind it | ages |

**Only `attested` licenses an unqualified present-tense claim about the system.**

This distinction exists because of a real failure. A compiled view once stated *"operator-only
reconciliation — absolute, not a preference"* under **Constraints & Non-Negotiables**, while another
view, compiled in the same pass from the same records, admitted the guardrail was instruction text
no rule read. Neither was wrong. There was no third category.

A record is **attested** only when it carries both an attestation date and evidence. A verdict with
nothing asserting it is an opinion.

---

## Initiatives

An initiative is a **container, not a record** — it neither constrains nor decides. It is born at
intake and fills as the work crystallizes, which is why its state is simply how far down OGSM it
has got:

```
  /opsp:backlog  /opsp:propose   /opsp:apply ──────────┐  /opsp:attest  /opsp:archive
       │              │               │                │       │             │
       ▼              ▼               ▼                ▼       ▼             ▼
  ┌──────────┬───────────────┬────────────┬────────────────┬──────────┬───────────┐
  │OBJECTIVE │ STRATEGY      │ milestones │ every milestone│ POSTURE  │ compiled  │
  │GOAL      │ MEASURE (bar) │ executing  │ done, nothing  │ EVIDENCE │ into      │
  │          │               │            │ judged yet     │ EXPOSURE │ views     │
  └──────────┴───────────────┴────────────┴────────────────┴──────────┴───────────┘
   exploring  proposed        building      ready-for-       attested   completed
                                 ▲          attestation
                                 └──────────────┘
                              a change request — the work was not finished
```

Plus `declined` — terminal, for a candidate considered and dropped. It is kept rather than deleted,
because **why something was declined is worth more than the idea**: the same proposal returns six
months later, and one line ends the conversation. Reviving it returns it to `exploring`.

### The handoff is a state

`ready-for-attestation` means **every milestone is done and nothing has been judged**. It exists
because most hats are worn by the same engineer: `building` says work is happening and `attested`
says judgement happened, and between them is the moment the work stops being `dev`'s and becomes
`product` and `maintainer`'s. With no state for that moment it is invisible, which in practice
means it does not occur — the engineer who finished building attests what they built.

It is also the only honest thing to put on a board. Work in progress and work waiting on somebody
to put a different hat on need different responses — one needs time, the other needs a person — so
`BOARD.md` gives the handoff its own **Handoff** column rather than burying it in Doing.

Every card also names its **owner** — the person holding it, set by `opensprint claim`. An owner is
a person, not a hat: the hat says which accountability a move is made in, and the owner says who is
making it. Triage claims an item when it picks it up, and `/opsp:apply` claims it before the first
milestone. A card that is `building`, `ready-for-attestation` or `attested` with nobody named is
listed under the board's **Problems** as `owner-undeclared`.

`building ⇄ ready-for-attestation` runs both ways. A handed-over initiative goes back to `building`
when attestation finds the work simply unfinished, which makes the handoff a door rather than a
cliff. Where something above the work is wrong instead, it falls further — see the ladder below.

### Escalation has three rungs

Work does not only move forward. When something above the current work turns out to be wrong, it
falls back — and **what has to move decides how far**:

```
  the GOAL moved        a driver-spec's Statement no longer holds
      → /opsp:reexplore — /opsp:explore, later. Writes nothing.
      → returns to `exploring`, then rejoins backlog → triage → propose

  the STRATEGY moved    what was decided about reaching the goal
      → /opsp:repropose — supersedes ADRs, may amend `## Measures`,
        redraws the milestones resting on them
      → returns to `proposed`

  nothing moved         the work was simply not FINISHED
      → a change request from /opsp:attest — nothing superseded
      → returns to `building`
```

The rungs are not invented — they are the artifact hierarchy read downwards. Driver-specs hold the
objective and goal, ADRs hold the strategy, milestones hold the plan. That makes the test mechanical
rather than a judgement call: nobody has to decide whether something is "a big change", only
whether a driver-spec, an ADR or a milestone has to change. Those are three different files.

**Re-entering at `proposed` rather than `building` is the load-bearing part.** A restated strategy
has a bar nothing has been built against yet, so `/opsp:apply` must open the work again. A plan
revision needs no such reset. That difference is why the two cannot be one tool with a flag.

Both ends of the lifecycle reach the ladder. An **escalation during build** that turns out to be
bigger than one record routes to a rung instead of writing a record and carrying on. An
**attestation** that finds the change should not go forward sends it back — and distinguishes three
things that look alike:

| What the attester found | Exit | Lands at |
|---|---|---|
| A bar was missed, with an exposure and a plan | *none* — this is a complete attestation | `attested` |
| The work is missing or wrong; building it is all that is needed | request a change | `building` |
| This is not what we meant — the goal holds, the strategy does not | `/opsp:repropose` | `proposed` |

The third is the case the whole lifecycle exists to catch. Nothing is broken, every bar may pass,
and the thing still serves the goal badly. It is not a defect — it is a strategy that was
underspecified, found by the only people who could find it, at the only point they were asked to
look. Which is why attestation sits **before** the merge rather than after it.

### Transitions are performed, not described

Every move is `opensprint advance <initiative> --to <state>`, called by the workflow that owns it.
No workflow edits `state:` directly.

| From | To | By |
|---|---|---|
| exploring | proposed | `/opsp:propose` |
| exploring | declined | `/opsp:triage` |
| declined | exploring | `/opsp:triage` |
| proposed | building | `/opsp:apply`, at the first milestone |
| building | ready-for-attestation | `/opsp:apply`, when the last one closes |
| building | proposed | `/opsp:repropose`, when the strategy gives way |
| building | exploring | `/opsp:reexplore`, when the goal does |
| ready-for-attestation | building | `/opsp:attest`, the work was not finished |
| ready-for-attestation | proposed | `/opsp:repropose`, the strategy restated |
| ready-for-attestation | exploring | `/opsp:reexplore`, the goal no longer holds |
| ready-for-attestation | attested | `/opsp:attest` |
| attested | completed | `/opsp:archive` |

The reason is unglamorous: a prose instruction saying "now set `state:`" produces nothing when it is
skipped, and nothing looks exactly like nothing-to-do. For most of this project's life every
initiative's state was hand-edited, `proposed` was never written by anything, and the archive gate
required a state no tool could produce. A command leaves a trace; its absence is visible.

An illegal *move* is refused. A legal move into a state the content contradicts is **recorded, with
the contradiction reported beside it** — refusing there would make a tool that records what happened
into one that decides what may happen.

Because `completed` is reachable only through `attested`, and `attested` only through the handoff,
the compile that `/opsp:archive` runs is the one point in the lifecycle where **every squad hat is
guaranteed compiled and sealed**.

The hierarchy: an **initiative** is an epic, a **milestone** is a group of tickets or one large
ticket, and an **openspec change** is a ticket.

State is **declared by the tool and checked by code** — the check reports where a declared state is
*impossible* given the content, rather than deriving a state and demanding it match. An initiative
legitimately sits between states.

---

## Closing the loop, both ways

**Backward** — a rule fails, so you revisit the decision behind it. `driver-spec → ADR →
implementation → rule`, and back. Without that last arrow a process produces documents; with it,
drift becomes a build failure.

**Forward** — an exposure found at attestation has no backward target. Nothing went wrong upstream:
the constraint was right, the decision was right, the bar simply was not met. The only honest
response points at work not yet done:

```
  exposure ──► nothing                     a confession
  exposure ──► initiative (exploring)      we know, we are thinking
  exposure ──► initiative (proposed)       committed, with a bar
  exposure ──► initiative (building)       in flight
  exposure ──► initiative (declined)       dropped — the exposure stands
```

`BOARD.md` renders that gradient, resolving each initiative's **current** state at compile time. A
pointer at an initiative that does not exist renders as *points nowhere real*, never as mitigated —
false assurance about a known risk is worse than none.

---

## Open loops

The harvest reports twelve kinds of gap. Nothing gates on them; they are a backlog, and triage is a
judgement call:

| Kind | Means |
|---|---|
| `constraint-unanswered` | a constraint no decision answers |
| `constraint-unasserted` | answered, but no rule guards any answering decision |
| `constraint-unmeasurable` | a target with no populated `## Measures` |
| `decision-unguarded` | a decision no rule cites |
| `rule-guards-dead-record` | a rule still guarding something superseded |
| `decision-on-superseded` | a decision resting on an ancestor that moved |
| `record-unclassified` | a driver-spec with no role, in a hat that uses them |
| `record-without-objective` | a record its hat's sections cannot select |
| `measure-unasserted` | a measure with no evidence — an aspiration |
| `measure-unexposed` | a measure with no stated exposure |
| `bar-without-neighbour` | a bar that does not state the position not taken |
| `strategy-unimplemented` | an approach with no decision descending from it |
| `exposure-unmitigated` | a risk with no planned work behind it |
| `measure-unattested` | a measure nobody has judged, or a verdict nobody recognises |
| `bar-without-form` | a bar in prose, in a hat whose bars take a form |
| `evidence-unresolvable` | evidence citing nothing addressable, or a path not in the tree |
| `reversibility-unstated` | an attested change that never said whether it reverts |
| `blast-radius-unstated` | an attested change that never said what it can break |
| `raci-unassigned` | a residual risk nobody was named to hold |

The first seven are properties of the **record graph**. The next eight are properties of a
**measure** — and a process that only reports the first kind can tell you a constraint has no
measure, never that a measure went unmet. The last three are properties of a **change** rather than
of any record, so they fire only once an initiative claims to have been attested; asking who holds a
risk before anyone has judged it would be noise.
