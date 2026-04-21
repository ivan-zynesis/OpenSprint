## Context

The opsp-apply workflow currently pauses at milestone/change boundaries with three options: continue, switch review mode, or stop. When the operator spots issues during review, they have no structured way to feed corrections back into the surrogate (ADRs + driver-specs). The operator must manually intervene outside the workflow, which breaks the autonomous flow.

The surrogate is the agent's "brain" — driver-specs define external constraints, ADRs capture architectural decisions, and architecture.md reflects current state. When the agent produces wrong output, it's because the surrogate was incomplete or incorrect. A change request is fundamentally another opsx change — it should reuse existing opsx workflows rather than creating a parallel revision system.

## Goals / Non-Goals

**Goals:**
- Add "Approve" and "Raise change request" actions to checkpoint prompts
- "Raise change request" forks into: direct propose (operator knows the fix) or explore first (needs clarification)
- Reuse existing `/opsx:explore` and `/opsx:propose` workflows for the change request flow
- Support surrogate artifact updates (ADRs/driver-specs) as part of corrective changes
- After corrective change completes, resume initiative with updated surrogate

**Non-Goals:**
- Creating a separate `/opsp:revise` skill (reuse opsx workflows instead)
- Auto-detecting surrogate issues (operator must identify the problem)
- Reverting committed code (operator handles git operations manually if needed)
- Partial milestone replay (out of scope — operator can re-run `/opsp:apply` to replay)

## Decisions

### D1: "Approve" is explicit with audit trail

**Choice**: Approve is a named action in the checkpoint prompt, not just "continue". When the operator approves, the agent logs the approval in the initiative descriptor. The operator can optionally add a brief note.

**Rationale**: Making approval explicit creates a clear record. This matters for accountability — someone may ask "did anyone review milestone 2?"

**Alternatives considered**:
- Implicit approval via "continue" — loses the audit trail

### D2: Change request reuses opsx workflows, not a new skill

**Choice**: "Raise change request" delegates to existing `/opsx:explore` and `/opsx:propose` rather than creating a dedicated `/opsp:revise` skill. The opsp-apply template handles the forking logic and surrogate reload.

**Rationale**: A change request is just another opsx change. The operator already knows `/opsx:propose` and `/opsx:explore`. Reusing them means: no new concepts to learn, no parallel workflow to maintain, and the corrective change goes through the same lifecycle (propose → apply → archive) with full traceability. The only opsp-specific concern is pausing/resuming the initiative and reloading the surrogate after the correction — that logic belongs in the apply template.

**Alternatives considered**:
- Dedicated `/opsp:revise` skill — over-engineered, duplicates opsx workflow logic, adds a new concept operators must learn

### D3: Two sub-paths based on operator clarity

**Choice**: When the operator raises a change request, they choose between:
1. **"I know what needs to change"** → describe the fix → delegates to `/opsx:propose` inline
2. **"I need to explore this first"** → enters `/opsx:explore` mode → after exploration, either return to approve (no changes needed) or proceed to `/opsx:propose`

**Rationale**: Matches natural operator behavior. Sometimes you know exactly what's wrong ("use DynamoDB not PostgreSQL"). Sometimes you need to think ("something feels off about the auth flow, let me explore"). The explore path has a clean exit back to approve if the exploration concludes that the implementation was actually correct.

### D4: Surrogate updates are part of the corrective change, not a separate step

**Choice**: When the corrective opsx change involves ADR/driver-spec revisions, those updates are included in the change's tasks alongside code corrections. The opsx proposal should explicitly note which surrogate artifacts are being modified and why.

**Rationale**: Keeping surrogate updates within the opsx change means they're tracked, archived, and visible in the commit history. No special handling needed — the agent already knows how to modify files as part of an opsx change.

### D5: After corrective change, agent reloads surrogate and resumes

**Choice**: After the corrective opsx change is archived, the opsp-apply template reloads the surrogate (re-reads all driver-specs, ADRs, architecture.md, DECISION-MAP.md) and returns to the checkpoint prompt. The operator can then approve and continue, or raise another change request if needed.

**Rationale**: Simple loop: checkpoint → change request → corrective change → reload surrogate → back to checkpoint. No special "resume" logic — just re-present the same checkpoint with updated context.

## Risks / Trade-offs

**[Risk] Operator confusion about which path to choose (propose vs explore)** → Mitigation: Clear descriptions in the prompt. "I know what needs to change" vs "I need to think this through first". Default to explore if uncertain.

**[Risk] Corrective change may itself need corrections (recursive loop)** → Mitigation: After returning to the checkpoint, operator can raise another change request. This is a natural iteration loop, not a bug. The checkpoint always offers all options.

**[Trade-off] No automatic milestone replay** → The operator must manually decide whether to re-run the milestone. This is simpler but means incorrect implementations may remain if the operator doesn't replay. Acceptable because: (a) the corrected surrogate improves future milestones, (b) the operator can always re-run later.

**[Trade-off] More checkpoint options increases decision fatigue** → Mitigated by "Approve and continue" as the default/first option. Most checkpoints will be approvals.
