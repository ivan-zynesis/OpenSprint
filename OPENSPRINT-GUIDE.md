# The OpenSprint Guide

**How a whole software development lifecycle runs inside a repository — dev, sec and ops — when the
participants are human, agent, or both.**

This is the walkthrough. For *why* the tool is shaped this way, read
[the three pillars](docs/pillars.md). For definitions, [concepts](docs/concepts.md). For the command
reference, [workflows](docs/workflows.md).

---

## The mental model

Two hierarchies, and they do not line up by accident.

```
  WORK                              KNOWLEDGE
  ────                              ─────────
  initiative   (an epic)            driver-specs    constraints from outside
    └ milestone  (a big ticket)     ADRs            decisions that answer them
        └ change   (a ticket)       ─────────────────────────────────────────
                                    compiled into one surrogate
```

Work moves left to right through five stages. Knowledge accumulates and is compiled. The two meet at
exactly two moments: **a bar is written when work is proposed, and attested before it merges.**
Everything else is in service of those two.

### The surrogate

The surrogate is what an agent loads instead of asking you. It is the accumulated record —
constraints, decisions, what was tried, what was rejected and why — condensed to a size that fits in
a session alongside real work.

It is also why an agent can execute a multi-milestone initiative without a person at every step: when
it hits ambiguity, it asks the surrogate first. Only when the surrogate cannot answer does it
escalate — and then the answer becomes part of the surrogate, so the question is never asked twice.

---

## The five stages

```
   REAL WORLD ── clients · regulators · incidents · cost · the market
        │
        │   /opsp:driver  (external truth)    /opsp:knockdown  (brownfield)
        ▼
  ╔══════════════════════════════════════════════════════════════════╗
  ║ 1  IDEATE                         /opsp:explore · /opsp:backlog  ║
  ║    product / maintainer                                          ║
  ╚══════════════════════════════════════════════════════════════════╝
        ▼
  ╔══════════════════════════════════════════════════════════════════╗
  ║ 2  TRIAGE · BRAINSTORM · PROPOSE   /opsp:triage · /opsp:propose  ║
  ║    tech lead · architect · scrum master        >> THE BAR <<     ║
  ╚══════════════════════════════════════════════════════════════════╝
        ▼
  ╔══════════════════════════════════════════════════════════════════╗
  ║ 3  BUILD                                /opsp:apply → opsx       ║
  ║    dev / devops                                                  ║
  ╚══════════════════════════════════════════════════════════════════╝
        ▼
  ╔══════════════════════════════════════════════════════════════════╗
  ║ 4  MEET THE BAR                                  /opsp:attest    ║
  ║    product / maintainer            >> DID WE ACTUALLY? <<        ║
  ╚══════════════════════════════════════════════════════════════════╝
        ▼
  ╔══════════════════════════════════════════════════════════════════╗
  ║ 5  COMPILE                      /opsp:archive · /opsp:compact    ║
  ╚══════════════════════════════════════════════════════════════════╝
        ▼   compact check — drift fails the build
        └──► harvested open loops land in the backlog, triaged at (2)
```

Most processes have stages 1, 2, 3 and 5. **Stage 4 is the one that is usually missing**, and its
absence is why "done" is a matter of opinion in most teams.

---

## 1 · Ideate

An idea arrives — a new business need, a trend worth riding, an operation worth optimising, or an
open loop the last compile reported.

```
/opsp:explore
```

Architect-level thinking. **It writes nothing.** That is deliberate: most exploration should not
survive, and a tool that saves everything fills the backlog with noise.

When something crystallises:

```
/opsp:backlog
```

This flushes the in-memory brainstorm to disk as an initiative at `state: exploring`, holding an
**Objective** and a **Goal**. It can fire mid-conversation, as a checkpoint.

A backlog item is a complete artifact at its own altitude. It may sit for weeks. It may never be
picked up — and that is a legitimate outcome, not a failure.

> **For a non-technical stakeholder**, this is the entire interaction. They ask their agent to read
> the board and describe what is in flight, then give it a few sentences of real-world context. The
> agent drafts the objective and goal on their behalf; they never see OGSM. Everything past this
> point is an engineer stepping up for accountability.

---

## 2 · Triage, brainstorm, propose

```
/opsp:triage
```

Pick up a backlog item and decide: advance it, decline it, or send it back for more exploration.

Declining is first-class. A declined initiative keeps its objective and records **why** — because
the same proposal returns in six months, and one recorded line ends that conversation in a minute.

Where it advances, triage is also the **strategy brainstorming**: how we would go about it, what the
alternatives are, what each would cost.

```
/opsp:propose
```

Formalise it. This is where the conversation becomes artifacts:

```
## Proposed Initiative: multi-region-failover

### Driver Specs (external truth)
- DS-RTO: recovery time objective of 15 minutes, contractual
- DS-DATA-RESIDENCY: EU customer data must not leave the EU

### ADRs (decisions)
- DEC-ACTIVE-PASSIVE: active-passive over active-active (depends on DS-RTO)
  Rationale: active-active doubles the consistency surface for a 15-minute RTO
             that passive already meets
- DEC-REGION-PAIR: eu-west-1 / eu-central-1 (depends on DEC-ACTIVE-PASSIVE,
                                             DS-DATA-RESIDENCY)

### Milestones
1. replicate-datastore
2. standby-infrastructure
3. failover-runbook-and-drill

Does this look right?
```

**The bar is written here, ex ante.** Each driver-spec gets a `## Measures` section stating its
acceptance criterion in BDD form — `given / when / then` for a maintainer bar, `as-a / I-want / for`
for a product one — so that a pipeline can be pointed at it later.

Nothing is written until you confirm.

### The two hierarchies meet

The initiative now carries O, G, S and M. State advances to `proposed`. What the engineer receives is
**the bar and nothing else** — not the discussion, not the alternatives weighed. That is progressive
discovery working: they can open any record they need, and they are not made to.

---

## 3 · Build

```
/opsp:apply multi-region-failover
```

The agent loads the full surrogate, creates the initiative worktree if the planning stage has not
already, and runs one complete change cycle per milestone:

```
opsx:explore → opsx:propose → opsx:apply → opsx:verify → opsx:archive
```

Each change gets its own worktree, merges back into the initiative branch, and is pruned. The branch
ref is kept, so detail survives a squash merge.

### Surrogate resolution — the part that matters

When the agent hits ambiguity mid-implementation, it does **not** ask you first. It asks the
surrogate:

```
  Can a driver-spec answer this?      an external constraint
  Can an existing ADR answer this?    a decision already made
  Can architecture.md answer this?    current state
```

Resolved silently where the answer exists, noting *"resolved via DEC-REGION-PAIR"*.

Where it does not, the agent escalates — and it reformulates the question so the answer is worth
keeping:

```
BAD:   "Should I use pgBouncer or RDS Proxy for the standby?"

GOOD:  "Standby needs connection pooling. The primary uses pgBouncer on EC2.
        Should we standardise on pgBouncer across both regions, or use the
        managed proxy in the standby to reduce what we operate during a
        failover? This affects the runbook milestone and any future region."
```

The answer becomes an ADR. The surrogate grows. The question is never asked again.

### Review modes

| Mode | Pauses |
|---|---|
| per-milestone | after each milestone (default) |
| per-change | after each opsx change is archived |
| continuous | only for escalations |

At a checkpoint you can approve, raise a change request, switch mode, or stop and resume later. A
change request is not just a code fix — it traces back to **why the agent decided wrongly**, which
is usually a missing or incorrect record. Corrective changes update the root cause, then the
surrogate is reloaded before returning to the checkpoint.

---

## 4 · Meet the bar

Every milestone is done. The initiative's state advances to **ready for attestation**.

```
/opsp:attest multi-region-failover
```

This runs **on the open pull request, before the merge** — not after, on staging.

### Clear your context first

In most teams today the same engineer wore every hat on the way here. Attestation is therefore
usually self-assessment, and an agent that just wrote the code has every argument for why it works
already in context.

So the tool arrives narrow and stays narrow:

```
  LOADS                                DOES NOT LOAD
  ──────────────────────────────       ─────────────────────────────
  the objective and goals              the implementation diff
  the bars (given / when / then)       the design discussion
  the maintainer rows in scope         the ADR rationales
  the CI evidence artifacts            the conversation that built it
```

Excluding the ADR rationales is the part that feels wrong and is right. **The bar is the contract.**
A rationale is an argument for the thing that was built.

Invoked in the session that wrote the implementation, it says so and stops.

### Evidence is a CI artifact

A coverage report. A recorded end-to-end run. A `terraform plan`. A cost diff. A scan result.
Something the pipeline produced, addressable from the pull request.

Prose describing a belief is not evidence. Neither is reading the code — it may not.

```markdown
### Posture
- **verdict**: met
- **attested-by**: ivan
- **attested-on**: 2026-10-09

Failover drill completed in 11m42s against the 15m objective.

### Evidence
ci/dr-drill run 118 — recording and timings attached

### Exposure
The drill ran against synthetic load, not production traffic shape.
mitigated-by: production-shadow-traffic
```

**If the evidence cannot answer the bar, that is a finding about the evidence** — record
`cannot assess`, name what is missing, and stop looking. That is a complete attestation, and it
produces exactly the backlog item that makes the next one possible.

### It never gates

It always exits zero. An unmet bar is recorded as an exposure with a forward pointer, never as a
failure. The moment it gained a pass/fail exit it would be **certification** — and certification
drags change management and release management in behind it.

The system insists you answer. It never grades the answer.

---

## 5 · Compile and close

```
/opsp:archive multi-region-failover
```

Archive consumes the compile. The views regenerate from the records — one hop, never from each
other — and the initiative closes.

```
opensprint/
  squad/product.md       objective · goals · strategies · measures
  squad/maintainer.md    posture + seven inherited objectives
  squad/dev.md           tech-stack · runtime-topology · entity-schema
  squad/devops.md        infra-architecture · gitops
  architecture.md        the whole system
  DECISION-MAP.md        the decision tree, with blast radius
  BOARD.md               every initiative by state, and the roadmap
```

**Nothing here is hand-edited.** If a view is wrong, the system is wrong — change a record and
recompile. `opensprint compact check` fails the build when a view disagrees with its sources.

Then the single pull request merges, in this order:

```
  opsp/<initiative> ──rebase──●──attest──●──archive──●──▶ main
```

See [git workflow](docs/git-workflow.md) for why that order is forced.

---

## Covering dev, sec and ops

The claim in the first line of this guide is that the whole lifecycle fits here. Here is where each
part actually lands.

| Concern | Where it lives | Who owns it |
|---|---|---|
| what it must do | product objective, goals, strategies | product |
| security & access | maintainer objective i | maintainer |
| isolation & confidentiality | maintainer objective ii | maintainer |
| privacy, retention & legal | maintainer objective iii | maintainer |
| integrity & correctness | maintainer objective iv | maintainer |
| change & quality | maintainer objective v | maintainer |
| availability & continuity | maintainer objective vi | maintainer |
| cost & budget | maintainer objective vii | maintainer |
| how it is built | dev: tech-stack, topology, schema | dev |
| how it is run | devops: infra, gitops | devops |
| was any of it true | attestation, against every bar | product / maintainer |
| can we roll it back | attestation — one-way or two-way door | product / maintainer |
| what does it affect | attestation — blast radius | product / maintainer |
| who holds it after merge | attestation — RACI, where no system handles it | product / maintainer |
| what outsiders are told | attestation — documentation reviewed, not assumed | product / maintainer |

**The seven maintainer objectives are inherited, not discovered.** Every software project worries
about the same seven things, which is why that accountability was split off from product and given
to a specialist. An objective with nothing recorded against it **still renders** — and an empty row
is the most useful cell in the view, because it says nobody has stated what this system does about
that concern.

That is how "sec" and "ops" stop being someone else's problem: they are rows that cannot be hidden.

The last four rows are the handoff. A pull request closing ends `dev`'s accountability — past that
point the change lives in security and operations, and attestation is where it is handed over
rather than assumed. For anything no system handles automatically, a human is named.

---

## Brownfield

An existing codebase has decisions in it that nobody wrote down.

```
/opsp:knockdown
```

Progressive compaction over the real code, producing inferred driver-specs, ADRs and an
`architecture.md`.

**What it produces is `observed`, not `decided` and not `attested`** — an account of what the code
does, not of what anyone chose. That is an accurate description of what reverse-engineering can
yield, and the distinction is load-bearing: a knocked-down surrogate makes no claim that anything is
intentional.

Review it, correct it, promote the inferences that were real decisions into proper ADRs, then
proceed as greenfield. Compaction is deliberately **not** run automatically at the end, because
whether you are satisfied with an inferred surrogate is a judgement call, and judgement calls do not
belong inside a compile.

---

## Mid-lifecycle interventions

**The plan was wrong.**

```
/opsp:reexplore multi-region-failover
```

Re-brainstorm at initiative level and revise the milestone plan. Completed milestones are preserved.

**A decision is needed outside a cycle.**

```
/opsp:decide
```

Records an ADR with its tradeoff analysis and invalidation trigger.

**A constraint changed.**

```
/opsp:rebuild-assess DS-RTO
```

Walks the decision tree from that driver-spec, finds every decision that depended on it, and
minimises what you are asked by reusing decisions the change did not touch.

**Two initiatives diverged.**

Each initiative is a worktree with its own surrogate, so two can run concurrently and disagree.

```
/opsp:rebase     bring one universe's work into another — soft fork, consensus
/opsp:abandon    declare a winner, migrate what is compatible, archive the loser
```

Both are **operator-invocable only** — never from a pipeline, a sub-agent, or another skill. A
corrupted surrogate degrades every downstream agent operation and the damage is unbounded, so a
false escalation costs one prompt while a false auto-accept costs the surrogate.

---

## What the system does that a PM would

| A PM would | The system does |
|---|---|
| keep the backlog | `BOARD.md`, compiled from initiative state |
| chase what is blocked | open loops, harvested from the record graph |
| ask "is this done?" | `/opsp:attest`, against the bar, with evidence |
| track known risks | the roadmap — each exposure beside its mitigation's state |
| notice drift | `compact check`, as a build failure |

What is deliberately not automated is judgement. The board reports; you decide. See
[pillar three](docs/pillars.md#3--the-sdlc-lives-in-the-repository).

---

## Where to go next

| | |
|---|---|
| [Three pillars](docs/pillars.md) | why the tool is shaped this way |
| [Concepts](docs/concepts.md) | driver-specs, hats, measures, authorities, states |
| [Workflows](docs/workflows.md) | all fifteen, and the CLI beneath them |
| [Git workflow](docs/git-workflow.md) | fitting this to your branching and CI |
| [Installation](docs/installation.md) | setting it up |
