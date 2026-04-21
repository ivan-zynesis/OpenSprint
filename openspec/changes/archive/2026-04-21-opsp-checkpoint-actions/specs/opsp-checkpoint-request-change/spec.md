## ADDED Requirements

### Requirement: Raise change request at checkpoints
The checkpoint prompt SHALL include a "Raise change request" action that forks into two sub-paths based on operator clarity.

#### Scenario: Operator selects raise change request
- **WHEN** the operator selects "Raise change request" at a milestone or change checkpoint
- **THEN** the agent SHALL present two options:
  1. "I know what needs to change" — proceed directly to propose
  2. "I need to explore this first" — enter interactive exploration
- **AND** the agent SHALL provide context about the current milestone and surrogate state to inform the operator's choice

#### Scenario: Direct propose path (operator knows the fix)
- **WHEN** the operator selects "I know what needs to change"
- **THEN** the agent SHALL ask the operator to describe the needed changes
- **AND** delegate to the `/opsx:propose` workflow inline with the operator's description
- **AND** the corrective opsx change proposal SHALL explicitly note which surrogate artifacts (ADRs/driver-specs) need updating if applicable
- **AND** after the corrective opsx change completes (propose → apply → archive), reload the surrogate and return to the checkpoint

#### Scenario: Explore-first path (operator needs clarification)
- **WHEN** the operator selects "I need to explore this first"
- **THEN** the agent SHALL enter an `/opsx:explore` session inline, acting as a thinking partner to investigate the issue
- **AND** the exploration SHALL have access to the full surrogate context and the current milestone's artifacts

#### Scenario: Exploration concludes with no changes needed
- **WHEN** the explore session concludes and the operator determines no changes are needed
- **THEN** the agent SHALL return to the checkpoint with the "Approve and continue" action
- **AND** the exploration notes SHALL be preserved in the initiative descriptor for context

#### Scenario: Exploration concludes with changes needed
- **WHEN** the explore session concludes and the operator identifies specific changes
- **THEN** the agent SHALL proceed to the `/opsx:propose` workflow with the findings from exploration
- **AND** after the corrective opsx change completes, reload the surrogate and return to the checkpoint

### Requirement: Surrogate reload after corrective change
The opsp-apply workflow SHALL reload the operator surrogate after any corrective opsx change completes at a checkpoint.

#### Scenario: Reloading surrogate after correction
- **WHEN** a corrective opsx change has been archived during a checkpoint change request
- **THEN** the agent SHALL re-read all surrogate artifacts:
  - `opensprint/driver-specs/*.md`
  - `opensprint/ADRs/*.md`
  - `opensprint/architecture.md`
  - `opensprint/DECISION-MAP.md`
- **AND** return to the same checkpoint with updated surrogate context
- **AND** the operator SHALL be able to approve, raise another change request, or take any other checkpoint action
