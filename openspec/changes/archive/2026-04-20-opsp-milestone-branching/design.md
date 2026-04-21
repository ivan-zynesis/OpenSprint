## Context

OpenSprint's `opsp-apply` workflow currently executes milestones sequentially without pause. The agent runs explore → propose → apply → archive for each milestone back-to-back, producing a linear commit history on whatever branch the operator started from. This works for autonomous execution but makes human review impractical for non-trivial initiatives.

The current opsp-apply skill template lives at `src/core/templates/workflows/opsp-apply.ts` and issues agent instructions — it does not execute git commands directly. All changes happen through the agent following the skill instructions.

## Goals / Non-Goals

**Goals:**
- Pause at milestone boundaries so operators can review completed work
- Create a navigable git branch structure: one initiative branch, one sub-branch per opsx change
- Let operators choose review granularity (per-change, per-milestone, continuous)
- Provide a review navigation skill that shows the commit/branch graph for an initiative
- Merge opsx change branches into the initiative branch upon archive

**Non-Goals:**
- Cherry-picking support (explicitly out of scope per user direction)
- PR creation automation (operators manage their own PR workflow)
- Squash/rebase strategies (keep merge commits for traceability)
- CI/CD integration (operators handle their own pipelines)
- Conflict resolution tooling (standard git merge; escalate to operator on conflict)

## Decisions

### D1: Branch naming convention

**Choice**: `opsp/<initiative-name>` for initiative branches, `opsx/<initiative-name>/<change-name>` for change branches.

**Rationale**: Namespaced prefixes make branches discoverable via `git branch --list "opsp/*"` and `git branch --list "opsx/*"`. Including initiative name in the change branch path creates a clear parent-child relationship. Avoids collision with user branches.

**Alternatives considered**:
- Flat naming (`opsx-<change-name>`) — loses initiative grouping
- Nested deeper (`opsp/<init>/milestone-N/<change>`) — over-structured, milestone is metadata not identity

### D2: Milestone pause is a skill instruction, not a code feature

**Choice**: The pause behavior is implemented entirely within the opsp-apply skill template instructions. The agent uses AskUserQuestion to present the checkpoint. No new CLI commands or runtime code.

**Rationale**: OpenSprint skills are agent instructions — the agent follows them to orchestrate work. Adding pause logic as instructions keeps it in the same layer as all other opsp/opsx behavior. No new abstractions needed.

### D3: Review mode selection at initiative start

**Choice**: Before processing the first milestone, the agent asks the operator to select a review mode:
- **Per-change** — pause after each opsx change is archived
- **Per-milestone** (default) — pause after each milestone completes
- **Continuous** — run all milestones without pause, operator reviews at the end

The operator can change mode at any pause checkpoint.

**Rationale**: Different initiatives need different review intensity. A quick 2-milestone initiative may use continuous. A critical refactor needs per-change. Defaulting to per-milestone balances review frequency with flow.

### D4: Branch creation and merge in skill instructions

**Choice**: The opsp-apply instructions direct the agent to run git commands:
- Create initiative branch at start: `git checkout -b opsp/<init>` from current branch
- Create change branch before each opsx-apply: `git checkout -b opsx/<init>/<change>` from initiative branch
- Merge change branch after opsx-archive: `git checkout opsp/<init> && git merge opsx/<init>/<change>`
- On initiative complete: leave on initiative branch, operator decides when/how to merge to main

**Rationale**: The agent already runs shell commands during opsx-apply. Git branching is just more shell commands in the skill instructions. No library dependencies. Cross-platform compatible (git CLI works everywhere).

### D5: Review navigation as a separate skill

**Choice**: New `/opsp:review` skill template that:
- Runs `git log --graph --oneline opsp/<init>` to show commit structure
- Lists opsx change branches and their merge status
- Shows which milestones are complete vs pending
- Reads initiative descriptor for milestone-to-change mapping

**Rationale**: Separating review from apply keeps skills focused. Operator can invoke review at any time, not just at pause points. The skill is read-only — no mutations.

## Risks / Trade-offs

**[Risk] Agent may not reliably execute git branch commands** → Mitigation: Skill instructions include verification steps (check branch exists after creation, check merge succeeded). On failure, pause and escalate to operator.

**[Risk] Merge conflicts when merging change branch back to initiative branch** → Mitigation: Instructions direct agent to pause on conflict and present the conflict to the operator. Agent does not auto-resolve merge conflicts.

**[Risk] Operator forgets to merge initiative branch to main** → Mitigation: The review skill shows the initiative branch status relative to main. The opsp-archive skill can remind/prompt about final merge.

**[Trade-off] Branch proliferation** → Many small branches for large initiatives. Mitigated by the review skill showing what's merged vs pending, and operators can prune merged branches.

**[Trade-off] Per-change pause may feel slow for experienced operators** → The continuous mode option addresses this. Default per-milestone is the middle ground.
