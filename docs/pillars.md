# Three pillars

OpenSprint is not a documentation tool that happens to manage branches, nor a project manager that
happens to write markdown. It is one argument, made three times at increasing scale.

These are the ideas the design answers to. Everything mechanical —
[hats](concepts.md#four-hats), [the measure anatomy](concepts.md#a-measure-has-four-parts),
[attestation](concepts.md#three-authorities), [the git workflow](git-workflow.md) — is downstream
of them.

---

## 1 · Code is a side product

Start with an uncomfortable observation: **the same set of decisions could have produced many
different codebases.**

Pick any system. Hold its constraints fixed — what it must do, what must stay true of it, what it
costs, who it answers to. Hold its decisions fixed — the framework, the data model, the deployment
shape, the trade each one bought. Now ask how much of the actual source was *determined* by those,
and how much was the thousand small choices a person made on a Tuesday.

Most of it was Tuesday.

```
        ┌──────────────────────────────────────────────┐
        │  DRIVER-SPECS  +  ADRs                       │   the north star
        │  constraints       decisions                 │   scarce · load-bearing
        └───────────────────────┬──────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
    ┌───────────┐         ┌───────────┐         ┌───────────┐
    │ universe  │         │ universe  │         │ universe  │   side products
    │     A     │         │     B     │         │     C     │   abundant · rebuildable
    └───────────┘         └───────────┘         └───────────┘
     src · IaC             src · IaC             src · IaC
     tests · pipelines     tests · pipelines     tests · pipelines
```

**Application source, infrastructure-as-code, test cases and pipelines are side products.** Not
worthless — they are what runs — but *derivable*, in the sense that matters: given the constraints
and the decisions, a competent engineer or a competent agent could produce a working universe. Given
only the code, nobody can reconstruct why.

This is why the driver-specs and the ADRs are the only source of truth OpenSprint treats as
critical, and why every decision record carries an **invalidation trigger**: a statement of what
would have to change for it to be reconsidered. When an ADR moves, the blast radius is the set of
universes that need rebuilding — and the tool can compute it, because the dependency graph is
recorded rather than implied.

**What this is not.** It is not a claim that code does not matter, or that you can regenerate a
production system from a document. It is a claim about *what to keep when you cannot keep
everything* — and about where the compounding value sits. Code is replaced continuously; the reason
behind it is thrown away once and never recovered.

> Code became cheap. Connecting context and building the knowledge base are the load-bearing
> activities now. Where every detail of the context is recorded, rebuilding an application from it
> is easy — generating code was never the hard part. What was always thrown away is why it was
> built this way.
>
> — [`DS-AGENTIC-SDLC`](../opensprint/driver-specs/DS-AGENTIC-SDLC.md)

---

## 2 · Process is what scale demands

**A harness is overhead until it isn't.**

One engineer and one agent on a small codebase need none of this. The agent reads everything, holds
it in context, and overhauls anything on request. Ceremony at that scale is pure cost, and anyone
who has watched a two-person team adopt an enterprise process has seen what it does.

But organisations grow, and growth has a shape:

```
   small                                                           large
   ─────────────────────────────────────────────────────────────────────▶
   one context window              more participants, more handoffs
   agent reads everything          each handoff needs an artifact
   no SOP needed                   each artifact needs a schema
   overhaul anytime                each schema needs somewhere to live
```

Every handoff between people — or between a person and an agent, or between two agents, or between
the same engineer wearing two different hats on two different days — needs something to hand over.
That thing is an artifact. Once there are several, they need a shape, or each one is reinvented and
none can be checked.

This is the second pillar, and it **stands on the first**: what survives the growth is the same
thing that was load-bearing when the team was two people — **product decisions (driver-specs) and
engineering decisions made against connected context (ADRs)**. An earlier version of this project
called that record the **codex**, and the name was right about the ambition: one durable document
nothing else needed to be preserved alongside.

What changed was the scope. A codex of product and dev decisions covers half a system. What must
remain true while it runs, and how it is stood up, are left to convention — which is why an
implementation can satisfy every stated requirement and still be unfit. So the record was extended
to the whole of **dev, sec and ops**, which meant categorising what had been improvised:

| | |
|---|---|
| **process** | which stage produces what, and who owns it |
| **framework** | OGSM for product and maintainer; topology for dev and devops |
| **artifact schema** | what a driver-spec, an ADR, an initiative and a measure are made of |

And then condensing all of it back down. The point of recording everything is not to have everything
to read — nobody reads it — but to be able to **compile a surrogate**: one artefact that holds every
past context of the system and can answer for it.

> A condensed view is a surrogate of the person holding that expertise.
>
> — [`DS-SME-OWNERSHIP`](../opensprint/driver-specs/DS-SME-OWNERSHIP.md)

The surrogate is what an agent loads instead of asking you. It is measured: loading a mature
project's raw records costs 93–157K tokens, of which ADRs are 61–74%. Compacting is not tidiness, it
is what makes the knowledge affordable enough to actually be used
([`DS-SURROGATE-BUDGET`](../opensprint/driver-specs/DS-SURROGATE-BUDGET.md)).

---

## 3 · The SDLC lives in the repository

The third pillar is where the other two become operational, and it is the one with the most
practical consequences.

**Everything lives in the repo.** Not in a tracker, not in a wiki, not in a thread. The constraints,
the decisions, the work items, the board, the compiled views — all of it is committed alongside the
code it governs.

That single choice buys four things:

**The agent is always looped in.** There is no integration to configure and no context to paste. An
agent working in the repository has the full history of intent by virtue of being there, and an
agent that writes a decision has written it where the next agent will find it.

**Git becomes the collaboration substrate.** Branches are universes. A pull request is where a
decision meets review. A merge is where two universes reconcile. None of that is metaphor — it is
how the tool actually works, and it means the mechanism your team already trusts for code now
carries the reasoning too. The [git workflow](git-workflow.md) is a recommendation, not a
requirement, but the *shape* is not accidental.

**Human, machine and agent collaborate on the same objects.** A driver-spec is readable by a product
owner, parseable by code, and loadable by an agent. A hat is a context boundary whichever kind of
participant is wearing it — which matters more than it sounds, because in most teams today the same
engineer wears all four, and the boundary is **what you load**, not who you are.

**Governance is built in rather than bolted on.** Not as a gate someone can route around, but as
things that are simply true of the repository:

```
  a view that disagrees with its records        →  compact check fails the build
  a constraint nothing answers                   →  harvested as an open loop
  a decision no rule guards                      →  harvested as an open loop
  a bar with no evidence                         →  the claim cannot be stated as fact
  an exposure with no plan                       →  rendered on the board as a confession
```

### Many venues, one repository

A team's reasoning is normally scattered across tools that do not know about each other. Putting
the lifecycle in the repository consolidates the venues:

```
   WHAT A TEAM USUALLY HAS              WHERE IT LIVES HERE
   ───────────────────────              ───────────────────
   Jira · GitHub Projects        ──►    opensprint/initiatives/
   sprint board                         openspec/changes/
                                        BOARD.md  (compiled)

   Confluence · GitHub Pages     ──►    docs/   (or wherever you configure)
   published documentation              reviewed at attestation

   an ADR wiki · design docs     ──►    opensprint/ADRs/
                                        DECISION-MAP.md  (compiled)

   a risk register               ──►    the roadmap — every exposure beside
                                        the state of its mitigation

   runbook ownership             ──►    the RACI table on an initiative
   "who do we call"                     written when the change hands off
```

None of these are integrations. There is nothing to sync, nothing to fall out of date, and no tool
that holds half the story. A pull request contains the work, the reasoning behind it, the bar it was
held to, and the account written for people who will never open the repository.

### Project management as code. Documentation as code.

Infrastructure-as-code made a claim that sounded extreme and is now unremarkable: **the thing that
describes your system should live beside it, be reviewed like it, and be versioned with it.**

That claim was never specific to infrastructure. It was about what happens when a description lives
somewhere the work does not — it drifts, nobody notices, and eventually nobody trusts it. Which is
equally true of a sprint board, a design decision, a risk register and a published document.

```
   infrastructure-as-code          terraform · pulumi                 ✓ solved
   ────────────────────────────────────────────────────────────────────────
   project-management-as-code      initiatives · milestones · board   ← this
   document-as-code                docs, reviewed at attestation      ← this
   decisions-as-code               driver-specs · ADRs · the map      ← this
   ────────────────────────────────────────────────────────────────────────
                     DevSecOps-as-Code
```

Each row gets the same four properties for the same reason: **versioned, reviewed, diffable, and
unable to drift silently.** A board compiled from record state cannot disagree with reality the way
a Jira column can. A document reviewed at attestation cannot describe a release that never shipped.
A decision superseded in the repository takes its blast radius with it.

That is the whole bet of the third pillar, and it is deliberately unoriginal in form — it is the IaC
argument, applied to everything else a team writes down.

### The system is the project manager

That is the claim this pillar builds to, and it is meant literally.

The thing that tracks what is in flight, reminds you what was promised, notices when a stated goal
has nothing checking it, and asks whether the bar was actually met — that is a project manager's
job, and in OpenSprint **the repository does it**. Not by automating a person away, but by making
the state of the work a property of the record rather than of someone's attention:

| A PM would | The system does |
|---|---|
| keep the backlog | `BOARD.md`, compiled from initiative state |
| chase what is blocked | open loops, harvested from the record graph |
| ask "is this done?" | `/opsp:attest` — against the bar, with evidence |
| track known risks | the roadmap, each exposure beside the state of its mitigation |
| notice drift | `compact check`, as a build failure |

What is deliberately **not** automated is judgement. The system reports; it does not decide. It will
insist that you answer whether a bar was met — and it will never grade the answer, because that is
certification, and certification drags change management and release management in behind it
([`DS-SURROGATE-SCOPE`](../opensprint/driver-specs/DS-SURROGATE-SCOPE.md)).

---

## How they stack

```
   3 · SDLC in the repo        the system is the PM; governance is structural
            ▲                  git is the substrate; the agent is always looped in
            │
   2 · Process at scale        handoffs need artifacts; artifacts need schema
            ▲                  all of it condensed into one surrogate
            │
   1 · Code is a side product  constraints and decisions are the north star
                               everything else is rebuildable
```

Each stands on the one below. Reject the first and the second is bureaucracy. Accept the first but
not the second and you have a good idea that dissolves as the team grows. Accept both without the
third and the knowledge lives somewhere the work does not — which is where documentation has always
gone to die.
