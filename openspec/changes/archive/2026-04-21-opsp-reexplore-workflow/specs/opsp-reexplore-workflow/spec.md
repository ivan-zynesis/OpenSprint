## ADDED Requirements

### Requirement: Initiative context loading
The `/opsp:reexplore` skill SHALL load the full initiative context before entering explore mode.

#### Scenario: Loading initiative and surrogate state
- **WHEN** the operator invokes `/opsp:reexplore <initiative-name>`
- **THEN** the agent SHALL read the initiative descriptor from `opensprint/initiatives/<name>.md`
- **AND** load the surrogate context: all active driver-specs, ADRs, architecture.md, and DECISION-MAP.md
- **AND** identify completed milestones with their archived opsx change names
- **AND** identify pending milestones with their current opsx change status (proposed, in-progress, or not yet created)
- **AND** identify any active (non-archived) opsx changes associated with the initiative

#### Scenario: Initiative not found
- **WHEN** the operator invokes `/opsp:reexplore <initiative-name>` and no initiative descriptor exists at `opensprint/initiatives/<name>.md`
- **THEN** the agent SHALL inform the operator and suggest running `/opsp:propose` first

### Requirement: Initiative-scoped exploration
The `/opsp:reexplore` skill SHALL present a state-of-the-initiative briefing and enter explore mode at initiative level.

#### Scenario: Presenting initiative briefing
- **WHEN** the initiative context has been loaded
- **THEN** the agent SHALL display:
  - Initiative name and description
  - Completed milestones with brief summaries of what was built
  - Pending milestones with their current status
  - Active opsx changes (if any)
  - Current surrogate summary (count of driver-specs, ADRs, key decisions)
  - Any tensions or gaps the agent identifies between the plan and current state
- **AND** enter `/opsx:explore` stance as a thinking partner at initiative level

#### Scenario: Exploration concludes with no changes
- **WHEN** the exploration concludes and the operator determines no plan changes are needed
- **THEN** the agent SHALL log the exploration in the initiative descriptor with date and summary
- **AND** exit without modifying the milestone plan

#### Scenario: Exploration concludes with changes needed
- **WHEN** the exploration concludes and the operator identifies plan changes
- **THEN** the agent SHALL proceed to the plan revision phase

### Requirement: Milestone plan revision
The `/opsp:reexplore` skill SHALL orchestrate plan changes through existing opsx workflows.

#### Scenario: Modifying a pending milestone
- **WHEN** the operator decides a pending milestone needs revision
- **AND** an opsx change already exists for that milestone
- **THEN** the agent SHALL archive the existing opsx change (marking it as superseded in the archive)
- **AND** run `/opsx:propose` inline with the revised description to create a replacement change
- **AND** update the initiative descriptor to reference the new change

#### Scenario: Modifying a pending milestone with no existing change
- **WHEN** the operator decides a pending milestone needs revision
- **AND** no opsx change exists yet for that milestone
- **THEN** the agent SHALL update the milestone description in the initiative descriptor
- **AND** the revised milestone SHALL be picked up by the next `/opsp:apply` run

#### Scenario: Adding a corrective milestone for completed work
- **WHEN** the operator determines that completed work needs correction
- **THEN** the agent SHALL add a new corrective milestone to the initiative plan
- **AND** run `/opsx:propose` inline for the corrective change
- **AND** the corrective change proposal SHALL reference the original milestone and explain what needs fixing
- **AND** if the correction involves surrogate updates (ADRs/driver-specs), those SHALL be included in the change tasks

#### Scenario: Adding a new milestone
- **WHEN** the operator identifies entirely new work needed
- **THEN** the agent SHALL add the new milestone to the initiative plan at the operator-specified position
- **AND** optionally run `/opsx:propose` inline if the operator wants to pre-propose it

#### Scenario: Reordering milestones
- **WHEN** the operator decides the milestone order should change
- **THEN** the agent SHALL update the milestone order in the initiative descriptor
- **AND** display the revised plan for operator confirmation

### Requirement: Re-exploration audit logging
The `/opsp:reexplore` skill SHALL log each re-exploration in the initiative descriptor for audit trail.

#### Scenario: Logging re-exploration
- **WHEN** a re-exploration session completes (with or without plan changes)
- **THEN** the agent SHALL add a log entry to the initiative descriptor containing:
  - Date of re-exploration
  - Summary of what was explored
  - Plan changes made (milestones added, modified, reordered)
  - Opsx changes created or archived as a result
