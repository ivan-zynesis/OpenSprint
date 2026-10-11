# Workflows

OpenSprint ships fifteen agent workflows. They are invoked by name in your agent
(`/opsp:propose`), not from the shell — the CLI underneath them is in the
[reference](#cli-reference) at the bottom.

## The spine

```
   REAL WORLD ── clients · regulators · incidents · cost · the market
        │
        │   /opsp:driver  (external truth)    /opsp:knockdown  (brownfield)
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 1  IDEATE                         /opsp:explore · /opsp:backlog  │
  │    high-level ideation — what and why                            │
  │    explore writes nothing; backlog flushes the brainstorm        │
  │    PRODUCES  the initiative, at state: exploring   (O + G)       │
  └──────────────────────────────────────────────────────────────────┘
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 2  TRIAGE · BRAINSTORM · PROPOSE   /opsp:triage · /opsp:propose  │
  │    pick up a backlog item, brainstorm strategy, then formalize   │
  │    PRODUCES  driver-specs · ADRs · milestones   (S + M)          │
  │    >> the BAR is written here. ex ante. <<                       │
  └──────────────────────────────────────────────────────────────────┘
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 3  BUILD                                /opsp:apply → opsx       │
  │    per milestone: explore → propose → apply → verify → archive   │
  │    PRODUCES  code · tests · rules · more ADRs                    │
  └──────────────────────────────────────────────────────────────────┘
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 4  MEET THE BAR                                  /opsp:attest    │
  │    frame the change first — source → base, confirmed             │
  │    posture · evidence · exposure, against each bar               │
  │    ex post · human in the loop · writes a record, never gates    │
  └──────────────────────────────────────────────────────────────────┘
        ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 5  COMPILE                      /opsp:archive · /opsp:compact    │
  │    PRODUCES  squad/*.md · architecture.md · BOARD.md             │
  └──────────────────────────────────────────────────────────────────┘
        ▼   compact check — drift fails the build
        └──► harvested open loops land in the backlog, triaged at (2)
```

Stages 1 and 2 are each a **think, then persist** pair. `explore` is to `backlog` as `triage` is to
`propose` — the thinking tool writes nothing, and the persisting tool is where you commit.

You can also go straight through: `explore → propose`, skipping the backlog, for work that never
needs to rest.

## Who owns what

| Stage | Owns it | Produces |
|---|---|---|
| ideate | product / maintainer | the initiative — objective and goal |
| triage · propose | tech lead · architect · scrum master | driver-specs, ADRs, milestones, the bar |
| build | dev / devops | code, and the decisions made while writing it |
| attest | product / maintainer | posture, evidence, exposure |
| archive | everyone | the compiled views |

Most of these hats are worn by the same engineer. That is expected — the boundary is what you load,
not who you are, and `/opsp:attest` takes it seriously enough to refuse a context that wrote the
code.

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
| `/opsp:review` | commit graph, branch status, code review assistance |

### Utility

| Workflow | Does |
|---|---|
| `/opsp:driver` | create or edit a driver-spec directly |
| `/opsp:decide` | record an ADR when ambiguity needs operator judgement |
| `/opsp:tree` | visualize the decision tree with blast radius |
| `/opsp:rebuild-assess` | a driver-spec changed — cascade the re-evaluation |
| `opensprint frame` | what this branch changes, and against what base |
| `opensprint advance` | move an initiative to its next state |
| `/opsp:compact` | recompile the views |

### Intervention

| Workflow | Does |
|---|---|
| `/opsp:reexplore` | revise an initiative's plan mid-flight |
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
