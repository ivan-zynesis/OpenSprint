## Why

The current milestone/change checkpoint only offers "continue / switch review mode / stop" — but it lacks the critical path where the operator *disagrees* with what was built. When the operator identifies issues at a checkpoint, it usually means the surrogate (ADRs + driver-specs) was incomplete or incorrect, leading the agent to make wrong decisions. The operator needs a way to raise a change request that revises the surrogate and corrects the affected work. Rather than building a parallel revision system, this should compose with existing opsx workflows (`/opsx:explore` and `/opsx:propose`) — since a change request is fundamentally just another opsx change, possibly requiring surrogate updates first.

## What Changes

- **Approve and continue**: Formalize the "happy path" checkpoint action — operator confirms the changes are good, optionally adds a brief note, and the agent continues.
- **Raise change request**: New checkpoint action with two sub-paths:
  1. **Direct propose** — operator knows exactly what's wrong → delegates to `/opsx:propose` with the correction description, including surrogate artifact (ADR/driver-spec) updates as part of the change.
  2. **Explore first** — operator needs clarification → enters `/opsx:explore` mode to think through the problem interactively. After exploration concludes: either no changes needed (return to approve) or changes identified (proceed to `/opsx:propose`).
- **Surrogate update integration**: When a change request involves surrogate corrections, the opsx change should include ADR/driver-spec updates alongside code changes. After the corrective change is archived, the agent resumes the initiative with the updated surrogate.

## Capabilities

### New Capabilities
- `opsp-checkpoint-approve`: Formalized approve action at checkpoints — operator confirms changes, optional annotation, continue signal to agent.
- `opsp-checkpoint-request-change`: The "raise change request" checkpoint action — operator chooses between direct propose or explore-first, delegates to existing opsx workflows, handles surrogate updates and initiative resumption.

### Modified Capabilities
- `opsp-milestone-pause`: Add "Approve" and "Raise change request" as checkpoint actions alongside existing switch-mode/stop options.
- `opsp-apply-workflow`: Integrate the change request flow into checkpoints — when raised, pause the initiative, run the opsx workflow, then resume with updated surrogate.

## Impact

- `src/core/templates/workflows/opsp-apply.ts` — Update checkpoint options in Phases 2d and 3 to include approve and change request actions, add surrogate reload after corrective change
- No new skill template needed — reuses existing `/opsx:explore` and `/opsx:propose`
- Surrogate artifacts (`opensprint/driver-specs/`, `opensprint/ADRs/`, `opensprint/DECISION-MAP.md`) — May be modified as part of corrective opsx changes
