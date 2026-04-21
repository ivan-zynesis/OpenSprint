## Context

The opsp lifecycle currently has: explore → propose → apply → archive. Once an initiative is proposed and execution begins, there's no structured way to revise the plan at initiative level. Operators who discover plan-level issues must work around the system by manually running opsx workflows and hand-associating them to the initiative. This leads to initiative descriptor drift and broken audit trails.

The checkpoint "raise change request" flow handles *reactive, milestone-scoped* corrections during `/opsp:apply`. But `/opsp:reexplore` addresses *proactive, initiative-scoped* re-planning that can happen anytime — between milestones, mid-implementation, or when returning with fresh perspective.

## Goals / Non-Goals

**Goals:**
- Provide a structured re-planning flow invocable anytime between propose and archive
- Load full initiative context (completed work, pending plan, surrogate, active changes)
- Enter explore mode at initiative level — bigger picture thinking, not milestone-scoped
- Revise the milestone plan: modify pending milestones, add corrective milestones for completed ones
- Delegate to existing `/opsx:explore` and `/opsx:propose` — no new primitives
- Update the initiative descriptor with the revised plan
- Update surrogate (ADRs/driver-specs) as part of corrective opsx changes if needed

**Non-Goals:**
- Executing the revised plan (that's `/opsp:apply`'s job)
- Creating a new initiative (use `/opsp:propose` for that)
- Modifying completed milestones' archived changes (immutable history — add corrective milestones instead)
- Auto-detecting what needs re-exploration (operator-initiated)

## Decisions

### D1: Reexplore is an orchestrator, not a new primitive

**Choice**: `/opsp:reexplore` delegates to existing workflows — `/opsx:explore` for the brainstorm phase and `/opsx:propose` for creating/revising changes. The skill template provides the orchestration glue: loading initiative context, presenting the bigger picture, and updating the initiative descriptor after changes.

**Rationale**: The operator already knows `/opsx:explore` and `/opsx:propose`. Reusing them means no new concepts to learn. The only new behavior is initiative-scoped context loading and plan revision — that's the orchestration value.

### D2: Archive-and-repropose for pending milestones, corrective milestones for completed ones

**Choice**: When a pending milestone needs revision, archive its existing opsx change (if any) and create a fresh one via `/opsx:propose`. When a completed milestone needs correction, add a new corrective milestone to the plan rather than modifying the archived change.

**Rationale**: Pending milestones haven't been implemented — re-proposing is clean and loses nothing. Completed milestones are immutable history (their archived changes document what actually happened). Corrective milestones explicitly capture "we learned X and are fixing Y", preserving the decision trail.

### D3: Initiative-scoped explore is heavier than opsx explore

**Choice**: The explore phase in reexplore presents a "state of the initiative" briefing before entering the thinking-partner mode. This includes: completed milestones with summaries, pending milestones, current surrogate state, active opsx changes, and any tensions or gaps the agent can identify.

**Rationale**: The operator needs the bigger picture to make good re-planning decisions. A normal `/opsx:explore` is scoped to one idea. Reexplore's explore phase is scoped to "given everything we've built and learned, what should the remaining plan look like?"

### D4: Re-exploration is logged in the initiative descriptor

**Choice**: Each re-exploration adds a log entry to the initiative descriptor with: date, summary of what was explored, what plan changes were made, and which opsx changes were created/archived as a result.

**Rationale**: Audit trail. When someone asks "why did the plan change after milestone 2?", the re-exploration log answers that question.

### D5: Stop at propose, don't execute

**Choice**: `/opsp:reexplore` creates/revises opsx proposals but does not implement them. The output is an updated initiative descriptor with revised milestone plan, ready for `/opsp:apply` to pick up.

**Rationale**: Reexplore is a planning tool, not an execution tool. Keeping the separation clean means the operator reviews the revised plan before execution begins. This matches the natural flow: think → plan → execute.

## Risks / Trade-offs

**[Risk] Context window pressure from loading full initiative state** → Mitigation: Summarize completed milestones rather than loading full artifacts. Retain full surrogate context (it's always needed). Only load pending milestone proposals in detail.

**[Risk] Operator confusion about when to use reexplore vs checkpoint change request** → Mitigation: Clear guidance in skill instructions. Checkpoint change request = reactive, scoped to current milestone, inside apply loop. Reexplore = proactive, initiative-scoped, outside apply loop.

**[Trade-off] Archiving pending changes loses in-progress work** → If a pending milestone had partially-completed tasks, archiving it discards that work. Acceptable because: the operator is explicitly choosing to re-plan, and the archived change preserves the original thinking for reference.
