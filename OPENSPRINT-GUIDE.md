# OpenSprint Command Guide

This is the practical guide to using OpenSprint commands. For design philosophy, see [PHILOSOPHY.md](PHILOSOPHY.md). For product architecture rationale, see [open-sprint-harness-design.md](open-sprint-harness-design.md).

OpenSprint orchestrates initiative-level engineering work above OPSX. Think of it as the difference between a tech lead planning milestones and a developer implementing a feature.

---

## The Mental Model

### Two-Tier Hierarchy

```
opsp (initiative / milestone)     ← tech lead / architect layer
  └── opsx (change / task)        ← squad lead / implementer layer
```

**OPSP** manages the big picture: initiatives with milestones, architectural decisions, external constraints. **OPSX** manages the execution: individual changes with proposals, specs, designs, and tasks. Each milestone in an initiative maps to one or more opsx change cycles.

### The Surrogate

The surrogate is the agent's accumulated knowledge about your project — what it consults before asking you a question. It lives in `opensprint/` and grows across initiatives:

```
opensprint/
├── driver-specs/         External constraints (product, legal, compliance, reliability)
│   ├── DS-COMPLIANCE.md
│   └── DS-LATENCY.md
├── ADRs/                 Architectural decisions with rationale and dependencies
│   ├── DEC-001.md
│   └── DEC-002.md
├── architecture.md       Compiled architectural state (narrative, rewritten per initiative)
├── DECISION-MAP.md       Visual decision tree with blast radius analysis
└── initiatives/          Initiative descriptors with milestone plans
    └── migrate-to-serverless.md
```

**Driver specs** are external truth — facts about the world the agent doesn't inherently know (SLAs, compliance rules, vendor constraints). **ADRs** capture choices between alternatives with rationale. **architecture.md** synthesizes everything into a readable document. **DECISION-MAP.md** shows how decisions relate to each other and their downstream impact.

When the agent encounters ambiguity during work, it checks the surrogate first. Only if the surrogate can't answer does it escalate to you — and when you answer, that knowledge gets captured back into the surrogate.

---

## Command Reference

| Command | Category | What It Does | When to Use |
|---------|----------|-------------|-------------|
| `/opsp:explore` | Lifecycle | Initiative-level brainstorming with full surrogate context | Starting a new initiative, thinking through architecture |
| `/opsp:propose` | Lifecycle | Classify exploration into driver-specs, ADRs, and milestones | After explore, when ideas are ready to formalize |
| `/opsp:apply` | Lifecycle | Execute initiative — orchestrate opsx cycles per milestone | When the plan is ready for implementation |
| `/opsp:archive` | Lifecycle | Compile architecture.md, mark initiative complete | After all milestones are done |
| `/opsp:review` | Lifecycle | Show commit graph, branch status, diff assistance | During or after apply, for code review |
| `/opsp:reexplore` | Lifecycle | Re-plan mid-initiative — revise milestones and proposals | When the plan needs to change (proactive) |
| `/opsp:knockdown` | Lifecycle | Reverse-engineer surrogate from existing codebase | Adopting OpenSprint on a brownfield project |
| `/opsp:driver` | Utility | Create, edit, or list driver specs | When external constraints need to be recorded |
| `/opsp:decide` | Utility | Record an ADR when genuine ambiguity requires judgment | When the agent or operator encounters a decision point |
| `/opsp:tree` | Utility | Visualize decision tree and DECISION-MAP.md | To understand how decisions relate and their blast radius |
| `/opsp:rebuild-assess` | Utility | Assess cascade impact when driver specs change | When external reality changes (compliance, vendor, SLA) |

---

## Greenfield Lifecycle

The standard lifecycle for a new initiative:

```
/opsp:explore ──→ /opsp:propose ──→ /opsp:apply ──→ /opsp:archive
                                        │
                                   (per milestone)
                                   opsx:explore
                                   opsx:propose
                                   opsx:apply
                                   opsx:archive
```

### Explore

```
/opsp:explore
```

Enter architect-level brainstorming. The agent loads the full surrogate (if any exists) and acts as a thinking partner for system-wide ideas — architecture direction, strategic decisions, cross-domain trade-offs.

No artifacts are created. This is thinking time. Use ASCII diagrams, compare approaches, challenge assumptions.

When ideas crystallize into identifiable constraints, decisions, and milestones, transition to propose:

> "This feels solid. Want me to create an initiative?"

### Propose

```
/opsp:propose <initiative-name>
```

Analyzes the exploration conversation and classifies your inputs:

- **External constraints** (things you stated as facts) → **driver specs** in `opensprint/driver-specs/`
- **Architectural decisions** (choices you made between alternatives) → **ADRs** in `opensprint/ADRs/`
- **Scope and milestones** (the work to be done) → **initiative descriptor** in `opensprint/initiatives/`

Before writing anything, the agent presents the classification for your confirmation:

```
## Proposed Initiative: migrate-to-serverless

### Driver Specs (2 candidates)
DS-COMPLIANCE: "PCI-DSS compliance required for payment processing"
DS-LATENCY: "Sub-200ms API response time for user-facing endpoints"

### ADRs (3 candidates)
DEC-001: "Use ECS over Lambda for long-running payment processing"
DEC-002: "PostgreSQL for transactional data, DynamoDB for sessions"
DEC-003: "Event-driven communication between services via SQS"

### Milestones (3)
1. extract-auth-service
2. migrate-payment-endpoints
3. deprecate-monolith-routes
```

You confirm, modify, or reject each. Then the agent writes the artifacts and creates the initiative descriptor.

### Apply

```
/opsp:apply <initiative-name>
```

The main orchestration command. Executes your initiative by running a full opsx lifecycle for each milestone.

**Phase 1: Setup**

The agent loads the initiative descriptor, loads the full surrogate, creates an initiative branch, and asks you to select a review mode:

```
Initiative: migrate-to-serverless
Branch: opsp/migrate-to-serverless
Review mode: per-milestone
Progress: 0/3 milestones complete

  → extract-auth-service (next)
    migrate-payment-endpoints
    deprecate-monolith-routes
```

See [Review Modes & Checkpoints](#review-modes--checkpoints) for details on the three modes.

**Phase 2: Milestone Execution**

For each milestone, the agent runs a full opsx cycle inline:

1. **opsx explore** — think through the milestone at feature level
2. **opsx propose** — create an opsx change with proposal, specs, design, tasks
3. **Create a change branch** — `opsx/migrate-to-serverless/extract-auth-service`
4. **opsx apply** — implement the tasks on the change branch
5. **opsx archive** — archive the completed change
6. **Merge** — merge the change branch back into the initiative branch

During implementation, the agent resolves ambiguity by checking the surrogate first. Only genuinely unresolvable questions get escalated to you — and they're reformulated at the architectural level, not the implementation level.

**Phase 3: Checkpoint**

After each milestone (or change, depending on review mode), the agent presents a checkpoint:

```
## Milestone Complete: extract-auth-service

Branch: opsp/migrate-to-serverless
Changes: extract-auth-service (archived)
Commits since last checkpoint: 12
Remaining: 2 milestones

Options:
1. Approve and continue (default)
2. Raise change request
3. Switch review mode
4. Stop here (resume later)
```

See [Review Modes & Checkpoints](#review-modes--checkpoints) for what each option does.

**Phase 4: Complete**

When all milestones are done:

```
## Initiative Complete: migrate-to-serverless

Branch: opsp/migrate-to-serverless
Milestones: 3/3 completed
OPSX Changes: extract-auth-service, migrate-payment-endpoints, deprecate-monolith-routes

Review with /opsp:review migrate-to-serverless
Archive with /opsp:archive migrate-to-serverless
```

### Archive

```
/opsp:archive <initiative-name>
```

Compiles the current architectural state into `opensprint/architecture.md` by synthesizing all active driver-specs, ADRs, and the decision tree into a narrative document. Marks the initiative as completed.

architecture.md is **rewritten, not appended**. ADRs are the version history — architecture.md always reflects the current state.

### Review

```
/opsp:review <initiative-name>
```

Shows the commit graph and branch status for an initiative. Can be invoked at any time — during apply, between milestones, or after completion. Read-only.

```
## Initiative: migrate-to-serverless
Branch: opsp/migrate-to-serverless

### Milestone 1: Extract Auth Service (completed)
  merged: opsx/migrate-to-serverless/extract-auth-service

### Milestone 2: Migrate Payment Endpoints (in progress)
  merged: opsx/migrate-to-serverless/payment-api
  open:   opsx/migrate-to-serverless/payment-webhooks

Initiative branch is 47 commits ahead of main.
```

Options: review a specific change (diff), review a full milestone, compare initiative to main.

---

## Brownfield Path

For existing codebases, bootstrap the surrogate before starting initiatives:

```
/opsp:knockdown ──→ (surrogate ready) ──→ /opsp:explore ──→ /opsp:propose ──→ ...
```

### Knockdown

```
/opsp:knockdown
```

Reverse-engineers surrogate artifacts from your existing codebase. This is **reverse system design**: implementation → tech stack → architecture → requirements.

**Important**: Knockdown requires an advanced model with extended thinking enabled and the largest available context window.

**Phase 1: TOC Build** — Walk the file system using directory and file names only (no content read). Build a table of contents in `opensprint/knockdown/toc.yaml`. Categorize files as architectural (always scan), scan-structure (sample), or skip (node_modules, dist, etc.).

**Phase 2: File Scan** — For each file, infer a summary from the filename first. Read content only when the filename is ambiguous (`utils.ts`, `index.ts`, `app.ts`). Classify each summary with the three-question classifier:

1. Is this a **driver-spec**? (external constraint) → Extract
2. Is this an **ADR**? (significant decision) → Extract
3. Will this **affect an ADR**? (traces to a decision) → Keep for compaction
4. None → Drop

**Phase 3: Bottom-Up Compaction** — Merge related sibling summaries at each directory level. Don't force unrelated merges — unrelated summaries float up unchanged. Extract ADRs and driver-specs as they emerge. Continue up the tree until the root.

**Phase 4: Architecture Extraction** — Read all findings and surviving summaries. Fill the architecture.md template using reverse system design (tech stack → architecture → requirements). Interactively confirm ADRs and driver-specs with the operator, batched by area. Generate DECISION-MAP.md.

**Small codebase escape hatch**: If the codebase is small enough to fit in context, skip phases 2-3 and analyze directly.

**Pause/resume**: All progress is persisted in `opensprint/knockdown/` (toc.yaml, summaries/, findings.md). Resume where you left off in a new session.

### After Knockdown

The surrogate is populated. Proceed with `/opsp:explore` and `/opsp:propose` as in the greenfield path. Knockdown never modifies the codebase — it only writes to `opensprint/`.

---

## Utility Commands

These commands manage individual surrogate artifacts outside the initiative lifecycle.

### Driver Specs (`/opsp:driver`)

Create, edit, or list driver specs — external constraints that the agent can't infer from code.

```
/opsp:driver add          # Create a new driver spec
/opsp:driver edit DS-001  # Edit an existing driver spec
/opsp:driver list         # List all active driver specs
```

Driver specs are operator-authored. The agent acts as a scribe — it never autonomously creates or modifies driver specs. When a driver spec is fundamentally wrong, it gets superseded (not edited), preserving the history.

Examples of driver specs: "PCI-DSS compliance required", "API latency < 200ms", "Must run on AWS (vendor contract)", "Team has no Go expertise".

### Decide (`/opsp:decide`)

Record an ADR when genuine ambiguity requires operator judgment.

The agent should only create ADRs when it encounters a real choice between alternatives that can't be resolved from driver specs or existing decisions. Each ADR captures: the question, your decision, consideration factors, rationale, and what would invalidate the decision.

ADRs track dependencies on driver specs and other ADRs. When you supersede a decision, downstream decisions may need re-evaluation.

### Decision Tree (`/opsp:tree`)

Visualize the decision tree showing driver specs as roots, decisions as nodes, with dependency edges and blast radius annotations.

```
/opsp:tree show           # Display current decision tree
/opsp:tree regenerate     # Rebuild DECISION-MAP.md from records
/opsp:tree impact DEC-003 # Analyze blast radius of a specific decision
```

### Rebuild Assessment (`/opsp:rebuild-assess`)

When a driver spec changes (external reality shifted), assess which decisions are affected.

```
/opsp:rebuild-assess DS-COMPLIANCE
```

Traces all decisions that depend on the changed driver spec (directly and transitively). Walks through each affected decision depth-first, asking you to reaffirm or change. Reaffirmed decisions skip downstream re-evaluation. Changed decisions cascade re-evaluation to dependents.

---

## Mid-Lifecycle Interventions

### Reexplore (`/opsp:reexplore`)

```
/opsp:reexplore <initiative-name>
```

Proactive, initiative-scoped re-planning. Use when:
- Between milestones, you realize the plan needs adjusting
- Mid-implementation, new information changes the approach
- Returning with fresh perspective after stepping away

The agent loads the full initiative context (completed milestones, pending plan, surrogate, active changes), presents a state-of-the-initiative briefing, and enters explore mode at initiative level.

After exploration, plan revisions are orchestrated through existing opsx workflows:
- **Modify a pending milestone**: archive the old opsx change, repropose with revised scope
- **Add a corrective milestone**: for completed work that needs fixing (immutable history — don't modify archives)
- **Add a new milestone**: entirely new work identified
- **Reorder milestones**: update the plan sequence

Reexplore stops at propose — it creates/revises proposals but does NOT implement them. Run `/opsp:apply` to continue execution with the revised plan.

### Checkpoint Change Requests (within Apply)

Reactive corrections during `/opsp:apply`. When you select "Raise change request" at a checkpoint, you choose between:

1. **"I know what needs to change"** — describe the fix, the agent runs `/opsx:propose` inline, executes the corrective change, reloads the surrogate, and returns to the checkpoint
2. **"I need to explore this first"** — enter `/opsx:explore` inline to think through the issue, then either return to approve (no changes needed) or proceed to propose

After any correction, the surrogate is reloaded and you're back at the checkpoint — you can approve, raise another change request, or take any other action.

**Reexplore vs checkpoint change requests**: Reexplore is proactive and initiative-scoped (you're rethinking the plan). Checkpoint change requests are reactive and milestone-scoped (something went wrong with the current output).

### Review During Execution

`/opsp:review` can be invoked at any time in a separate conversation — it's read-only and doesn't interfere with an active apply session.

---

## Git Branching Model

```
main
 └── opsp/migrate-to-serverless                 (initiative branch)
      ├── opsx/migrate-to-serverless/extract-auth     (change branch, merged)
      ├── opsx/migrate-to-serverless/payment-api      (change branch, merged)
      └── opsx/migrate-to-serverless/payment-webhooks (change branch, open)
```

**Initiative branch** (`opsp/<initiative-name>`): Created at the start of `/opsp:apply`. All milestone work happens on this branch or its sub-branches.

**Change branch** (`opsx/<initiative-name>/<change-name>`): Created before each opsx apply step. Implementation happens here. Merged into the initiative branch after opsx archive.

**Merge flow**: Change branches merge into the initiative branch after each opsx archive. The operator decides when to merge the initiative branch to main.

**Conflict handling**: If a merge conflict occurs, the agent pauses and presents the conflict to the operator. It never auto-resolves.

Branch names use forward slashes on all platforms (git handles this regardless of OS).

---

## Review Modes & Checkpoints

Selected at the start of `/opsp:apply`, changeable at any checkpoint.

### Three Modes

| Mode | Pauses After | Best For |
|------|-------------|----------|
| **Per-milestone** (default) | Each milestone completes | Most initiatives — review at natural boundaries |
| **Per-change** | Each opsx change is archived | High-scrutiny work — review every change |
| **Continuous** | Only for surrogate escalations | Trusted execution with well-established surrogate |

### Checkpoint Actions

At each checkpoint, the operator chooses:

1. **Approve and continue** (default) — Confirm the work is good. Approval is logged in the initiative descriptor with timestamp and optional note for audit trail.
2. **Raise change request** — Something needs correction. Fork into "I know the fix" (direct propose) or "I need to explore" (explore first). See [Mid-Lifecycle Interventions](#checkpoint-change-requests-within-apply).
3. **Switch review mode** — Change the pause granularity going forward.
4. **Stop here (resume later)** — Pause the initiative. Resume by running `/opsp:apply` again.

---

## Power User Scenarios

### Brownfield to Greenfield Transition

You have an existing codebase with no documentation. You want to adopt OpenSprint and start working on a major initiative.

```
opensprint init --tools claude       # Set up agent skills
/opsp:knockdown                      # Reverse-engineer surrogate from codebase
/opsp:explore                        # Brainstorm the initiative with surrogate context
/opsp:propose migrate-to-serverless  # Formalize into driver-specs, ADRs, milestones
/opsp:apply migrate-to-serverless    # Execute with full surrogate backing
/opsp:archive migrate-to-serverless  # Compile final architecture state
```

### Mid-Initiative Course Correction

After completing 2 of 5 milestones, you realize the authentication approach needs rethinking.

```
# Stop the current apply (select "Stop here" at checkpoint)
/opsp:reexplore migrate-to-serverless
# Explore presents: 2 completed, 3 pending, current surrogate state
# Discussion leads to: add corrective milestone, revise milestone 3
# Agent archives the old milestone 3 proposal, creates a new one
/opsp:apply migrate-to-serverless
# Resume execution with the revised plan
```

### Driver Spec Changed by External Force

A new compliance requirement drops: GDPR now requires data residency in the EU.

```
/opsp:driver add
# "DS-GDPR: All user PII must be stored in EU data centers"
/opsp:rebuild-assess DS-GDPR
# Traces impact: DEC-002 (DynamoDB for sessions) is affected
# DynamoDB global tables might need reconfiguration
# Operator reaffirms or supersedes each affected decision
# DECISION-MAP.md is regenerated
```

### Continuous Mode for Trusted Execution

Your surrogate is well-established (many driver specs, solid ADRs). You trust the agent to execute autonomously.

```
/opsp:apply migrate-to-serverless
# Select "Continuous" review mode
# Agent executes all milestones without pausing
# Only stops for genuine ambiguity the surrogate can't resolve
# Review the complete work afterwards with /opsp:review
```

---

## Artifact Reference

| Path | Created By | Purpose |
|------|-----------|---------|
| `opensprint/driver-specs/DS-*.md` | `/opsp:driver`, `/opsp:propose`, `/opsp:knockdown` | External constraints |
| `opensprint/ADRs/DEC-*.md` | `/opsp:decide`, `/opsp:propose`, `/opsp:knockdown` | Architectural decisions with rationale |
| `opensprint/DECISION-MAP.md` | `/opsp:tree` (auto-regenerated) | Decision tree with blast radius |
| `opensprint/architecture.md` | `/opsp:archive`, `/opsp:knockdown` | Compiled architectural state |
| `opensprint/initiatives/<name>.md` | `/opsp:propose` | Initiative descriptor with milestones |
| `opensprint/knockdown/toc.yaml` | `/opsp:knockdown` | File scan progress (resumable) |
| `opensprint/knockdown/summaries/` | `/opsp:knockdown` | Compacted file/directory metadata |
| `opensprint/knockdown/findings.md` | `/opsp:knockdown` | Candidate ADRs and driver-specs |
