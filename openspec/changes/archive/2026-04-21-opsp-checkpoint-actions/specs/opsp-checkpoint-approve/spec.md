## ADDED Requirements

### Requirement: Explicit approval at checkpoints
The checkpoint prompt SHALL include an "Approve and continue" action as the default option, creating an audit trail of operator review.

#### Scenario: Operator approves at milestone checkpoint
- **WHEN** the operator selects "Approve and continue" at a milestone checkpoint
- **THEN** the agent SHALL log the approval in the initiative descriptor under the completed milestone entry
- **AND** record the approval timestamp
- **AND** include the operator's optional note if provided
- **AND** proceed to the next milestone

#### Scenario: Operator approves at per-change checkpoint
- **WHEN** the operator selects "Approve and continue" at a per-change checkpoint
- **THEN** the agent SHALL log the approval in the initiative descriptor under the current milestone's change list
- **AND** proceed to the next change or milestone

#### Scenario: Approval with annotation
- **WHEN** the operator selects "Approve and continue" and adds a note
- **THEN** the agent SHALL store the note in the initiative descriptor alongside the approval record
- **AND** the note SHALL be visible in future `/opsp:review` output
