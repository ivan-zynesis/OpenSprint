## MODIFIED Requirements

### Requirement: Orchestrate multiple opsx cycles
The `/opsp:apply` skill SHALL read an initiative's milestone plan and execute a full opsx lifecycle (explore → propose → apply → archive) for each milestone sequentially, with git branch management, milestone pause checkpoints, and support for corrective opsx changes when the operator raises a change request.

#### Scenario: Milestone completion with pause
- **WHEN** a milestone's opsx cycle completes and the review mode is per-milestone or per-change
- **THEN** the agent SHALL present a review checkpoint with milestone summary, branch info, and operator options including "Approve and continue" and "Raise change request"
- **AND** wait for operator input before proceeding to the next milestone

#### Scenario: Operator raises change request during apply
- **WHEN** the operator selects "Raise change request" at any checkpoint
- **THEN** the agent SHALL present sub-path options: "I know what needs to change" or "I need to explore this first"
- **AND** delegate to `/opsx:propose` (direct path) or `/opsx:explore` then optionally `/opsx:propose` (explore path)
- **AND** after any corrective opsx change is archived, reload the full surrogate context
- **AND** return to the same checkpoint so the operator can approve, raise another change request, or take other actions
