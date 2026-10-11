# Workflows

OpenSprint ships nineteen agent workflows. They are invoked by name in your agent
(`/opsp:propose`), not from the shell — the CLI underneath them is in the
[reference](#cli-reference) at the bottom.

## The spine

```
   REAL WORLD ── clients · regulators · incidents · cost · the market
        │
        │   /opsp:driver  (external truth)    /opsp:knockdown  (brownfield)
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 1  IDEATE                        /opsp:explore · /opsp:backlog   │
  │    high-level ideation — what and why                            │
  │    explore writes nothing; backlog flushes the brainstorm        │
  │    PRODUCES  the initiative  (O + G)                             │
  │    state: exploring                                              │
  └──────────────────────────────────────────────────────────────────┘
        ▼                                                           ▲ c
  ┌──────────────────────────────────────────────────────────────────┐
  │ 2  TRIAGE · BRAINSTORM · PROPOSE  /opsp:triage · /opsp:propose   │
  │    pick up a backlog item, brainstorm strategy, then formalize   │
  │    PRODUCES  driver-specs · ADRs · milestones  (S + M)           │
  │    >> the BAR is written here. ex ante. <<                       │
  │    state: proposed                                               │
  └──────────────────────────────────────────────────────────────────┘
        ▼                                                           ▲ b
  ┌──────────────────────────────────────────────────────────────────┐
  │ 3  BUILD                               /opsp:apply → opsx        │
  │    per milestone: explore → propose → apply → verify → archive   │
  │    escalation pauses here — a hat handoff, not an interruption   │
  │    PRODUCES  code · tests · rules · more ADRs                    │
  │    state: building                                               │
  └──────────────────────────────────────────────────────────────────┘
        ▼                                                           ▲ a
  ┌──────────────────────────────────────────────────────────────────┐
  │ 4  HAND OVER                           /opsp:apply closes        │
  │    every milestone done · nothing judged yet                     │
  │    the dev hat comes off; product or maintainer picks one up     │
  │    state: ready-for-attestation                                  │
  └──────────────────────────────────────────────────────────────────┘
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 5  MEET THE BAR                                /opsp:attest      │
  │    frame the change first — source → base, confirmed             │
  │    posture · evidence · exposure, against each bar               │
  │    ex post · a different context · writes a record, never gates  │
  │    state: attested                                               │
  └──────────────────────────────────────────────────────────────────┘
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 6  COMPILE                    /opsp:archive · /opsp:compact      │
  │    PRODUCES  squad/*.md · architecture.md · BOARD.md             │
  │    the one point in the lifecycle every squad hat is sealed      │
  │    state: completed                                              │
  └──────────────────────────────────────────────────────────────────┘
        ▼   compact check — drift fails the build
        └──► harvested open loops land in the backlog, triaged at (2)
```

## When it is not the happy path

A forward-only SDLC describes a project that never existed. Real work discovers, late, that
something decided earlier was wrong — and **the whole value of attestation is being the place that
discovery happens before the merge, not after it.**

So the spine has back-edges. Which one you take is decided by **what has to move**, and the answer
is in a file you can point at:

```
  ┌─ c ─ the GOAL moved ───────────────────────── /opsp:reideate ───┐
  │      a driver-spec's STATEMENT no longer holds                  │
  │      this is /opsp:explore, later — thinking time with the work │
  │      in hand. WRITES NOTHING, exactly like explore.             │
  │      then rejoin: backlog → triage → propose, as the first time │
  │      building · ready-for-attestation ───────────► exploring    │
  └─────────────────────────────────────────────────────────────────┘

  ┌─ b ─ the STRATEGY moved ─────────────────── /opsp:repropose ────┐
  │      the Statement holds. What was decided about reaching it    │
  │      does not — "this is not what we meant"                     │
  │      supersedes ADRs · may amend ## Measures · redraws the      │
  │      milestones resting on them                                 │
  │      building · ready-for-attestation ───────────► proposed     │
  └─────────────────────────────────────────────────────────────────┘

  ┌─ a ─ nothing moved, the work was not FINISHED ─ a change request┐
  │      goal, strategy and plan all hold. It is simply incomplete. │
  │      nothing superseded · no ADR moves · no record changes      │
  │      ready-for-attestation ──────────────────────► building     │
  └─────────────────────────────────────────────────────────────────┘
```

**The rungs are not invented** — they are the artifact hierarchy read downwards. Driver-specs hold
the objective and goal, ADRs hold the strategy, milestones hold the plan. So "which rung" is
answered by naming which file changes, not by judging whether something is "a big change".

### Reideate is explore, later

A tool called *re*-explore that produced artifacts would not be re-exploring. `/opsp:explore`
writes nothing, and so does `/opsp:reideate` — the thinking is persisted by `/opsp:backlog`, the
same tool that persists an original idea, in the same shape.

```
  /opsp:explore  ──► /opsp:backlog ──► /opsp:triage ──► /opsp:propose ──► ...
  /opsp:reideate ──┘
        the same road, rejoined, with everything you learned building
```

That symmetry is why the goal rung needs no new vocabulary, no new artifacts and no new stage. A
fallback path that reuses the forward path is one fewer thing to learn and one fewer thing to
drift.

The work already done is not pretended away: milestones that served the old goal are marked
superseded, which is exactly what happened to them.

### What repropose may and may not touch

```
  MAY CHANGE                           MUST NOT CHANGE
  ──────────────────────────────       ─────────────────────────────
  ADRs — superseded, or added          a driver-spec's Statement
  a driver-spec's ## Measures          its objective, goal or role
  the bar, where the strategy
    changed how it is known met        anything outside ## Measures
  milestones resting on the above
```

The `## Measures` boundary is the same one `/opsp:attest` writes inside, for the same reason: a
record's *claim* never changes under a reader who cited it, while how that claim is measured is
allowed to improve. A new strategy often makes a genuinely different thing observable, and a bar
still describing the old mechanism is worse than no bar.

**A bar that got easier is a goal that moved.** If the new bar is lower rather than different, that
is `/opsp:reideate` — and lowering a target becomes a decision somebody takes at the goal altitude
rather than an edit nobody notices.

### Every handoff names its hat

A transition is not only a state change; most are a **change of accountability**. And since most
hats are worn by the same engineer, that change is invisible unless something declares it.

So each transition carries the hat it must be made wearing, and `opensprint advance` **refuses the
move** until you name it:

```
$ opensprint advance multi-region --to building
✖ 'proposed' → 'building' is a handoff. It is dev · devops work.
  Set down the hat you are wearing, then re-run with --hat <dev|devops>
  to state which accountability you are exercising.
```

| Transition | Hat | Handoff |
|---|---|---|
| exploring → proposed | all four | |
| exploring ⇄ declined | product · maintainer | |
| proposed → building | dev · devops | **yes** |
| building → ready-for-attestation | dev · devops | **yes** |
| building → proposed · exploring | product · maintainer | **yes** |
| ready-for-attestation → anywhere | product · maintainer | |
| attested → completed | all four | **yes** |

No command can verify a context was cleared. What it can do is refuse to move until somebody
states which accountability they are exercising — and the moment of stating it is the moment the
switch becomes deliberate.

**None of attestation's exits is a handoff.** Attestation is product and maintainer work, and so
are all three ways out of it. The hat change already happened, at the handoff into
`ready-for-attestation`. That is what the handoff was for.

### At the other end: escalation during build

The same ladder, reached from the other side. An escalation whose answer revises a decision or
invalidates milestones takes option `[4] This is bigger than one record` instead of writing a
record and carrying on — and both rungs out of `building` are hat changes, because the objective
and the strategy are not dev's to restate.

## Who owns what

| Stage | Owns it | Produces |
|---|---|---|
| ideate | product / maintainer | the initiative — objective and goal |
| triage · propose | tech lead · architect · scrum master | driver-specs, ADRs, milestones, the bar |
| build | dev / devops | code, and the decisions made while writing it |
| **hand over** | dev / devops → product / maintainer | nothing — it is the moment itself |
| attest | product / maintainer | posture, evidence, exposure |
| archive | everyone | the compiled views |

Most of these hats are worn by the same engineer. That is expected — the boundary is what you load,
not who you are, and `/opsp:attest` takes it seriously enough to refuse a context that wrote the
code.

**Hand over produces nothing, and is a stage anyway.** It is the one point where accountability
moves rather than work happening, and with the hats on one person that moment is invisible unless
something marks it — so `ready-for-attestation` marks it, and `BOARD.md` gives it a column of its
own. Work that needs *time* and work that needs *a person* are not the same queue.

And it is the stage the back-edges leave from. Three of the four reversals above start here,
because this is where somebody who did not build the thing looks at it for the first time.

### Attest frames the change before it reads a bar

An attester is standing in a branch, and a pull request is the unit being reviewed. Before any bar
is read, `/opsp:attest` runs `opensprint frame`, which resolves `source → base` — the base taken
from `--base`, else the remote's default branch, else the first of `main`, `master`, `develop`,
`trunk` that exists — and reports **how** it chose, so a wrong guess in a fork is visible rather
than silent. It then summarises the range back to you and waits for you to confirm it.

What the frame carries is **scope, not rationale**: commit subject lines, a file-level stat, the
initiatives the range touches and the changes it archived. Never a patch, and never a commit
message body. A subject says what moved; a body argues that it was right, and an attester holding
an argument adopts it.

## The workflows

### Lifecycle

| Workflow | Does |
|---|---|
| `/opsp:explore` | architect-level thinking. **Writes nothing.** |
| `/opsp:backlog` | flush the in-memory brainstorm to disk as an initiative |
| `/opsp:triage` | pick up a backlog item: advance, decline, or send back |
| `/opsp:propose` | formalize into driver-specs, ADRs and milestones |
| `/opsp:apply` | execute milestones, orchestrating one opsx cycle each |
| `/opsp:attest` | assess each bar against evidence — the half most processes skip |
| `/opsp:archive` | compile the surrogate and close the initiative |

**Falling back** — the rungs, by what has to move:

| Workflow | Rung | Returns the initiative to |
|---|---|---|
| a change request from `/opsp:attest` | **nothing moved** — the work was not finished | `building` |
| `/opsp:repropose` | the **strategy** — ADRs superseded, `## Measures` may be amended | `proposed` |
| `/opsp:reideate` | the **goal** — thinking time, writes nothing | `exploring` |

**Other**

| Workflow | Does |
|---|---|
| `/opsp:review` | commit graph, branch status, code review assistance |

### Utility

| Workflow | Does |
|---|---|
| `/opsp:driver` | create or edit a driver-spec directly |
| `/opsp:decide` | record an ADR when ambiguity needs operator judgement |
| `/opsp:tree` | visualize the decision tree with blast radius |
| `/opsp:rebuild-assess` | a driver-spec changed — cascade the re-evaluation |
| `/opsp:migrate` | report records the current hat shapes can no longer select |
| `opensprint frame` | what this branch changes, and against what base |
| `opensprint advance` | move an initiative to its next state |
| `/opsp:compact` | recompile the views |

### Intervention

| Workflow | Does |
|---|---|
| `/opsp:knockdown` | reverse-engineer a surrogate from an existing codebase |

### Parallel universes

Each initiative is a worktree with its own copy of the surrogate, so two can run at once and
disagree.

| Workflow | Does |
|---|---|
| `/opsp:rebase` | bring one universe's work into another — soft fork, consensus |
| `/opsp:abandon` | declare a winner, migrate what is compatible, archive the loser |

Both are **operator-invocable only** — never from a pipeline, a sub-agent, or another skill. A
corrupted surrogate degrades every downstream agent operation, and the damage is unbounded, so a
false escalation costs one prompt while a false auto-accept costs the surrogate.

## Attestation, specifically

This is the workflow that distinguishes OpenSprint, so it is worth stating what it will refuse.

**It reads narrowly.** It loads the objective, the goals, the bars and the CI evidence — and *not*
the implementation diff, the design discussion, or the ADR rationales. Excluding the rationales is
the part that feels wrong and is right: a rationale is an argument for the thing that was built, so
loading it biases you toward accepting.

**It will not self-assess.** Asked to attest in the session that wrote the implementation, it says
so and stops. A narrow context arrived at by forgetting is not a narrow context.

**It will not read the code to fill a gap.** If the evidence cannot answer the bar, that is a
finding *about the evidence*:

```markdown
### Posture
- **verdict**: cannot assess — no e2e coverage for the checkout path
```

…with an exposure naming what is missing. That is a complete attestation, and it generates exactly
the backlog item that makes the next one possible.

**It never gates.** It always exits zero. It does not block archive, a merge, or a release, and it
does not mark anything approved. An unmet bar is recorded as an exposure with a forward pointer. The
moment it gained a pass/fail exit it would be **certification**, which is deliberately out of scope —
certification drags change management and release management in behind it.

## CLI reference

The workflows above drive these. You rarely need them directly.

```bash
opensprint init                    # set up a repository
opensprint update                  # refresh generated agent instructions
opensprint config                  # global configuration: tools, delivery mode

opensprint compact plan            # which view sections need recompiling, and from what
opensprint compact plan --json     #   …as JSON, including each record's citation authority
opensprint compact seal            # record the current views in the provenance manifest
opensprint compact check           # fail when a view is stale, tampered or unsealed
opensprint compact loops           # report open loops
opensprint compact board           # regenerate BOARD.md

opensprint list                    # changes, or --specs
opensprint show <item>             # a change or a spec
opensprint validate <item>         # validate a change or spec
opensprint archive <change>        # archive a change and sync its specs
opensprint status                  # artifact completion for a change
```

`opensprint compact check` is the one to put in CI. It is the gate that makes the compiled views
trustworthy — see [Git workflow](git-workflow.md).
