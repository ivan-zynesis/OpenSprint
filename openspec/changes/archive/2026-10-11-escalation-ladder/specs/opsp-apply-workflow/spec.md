## ADDED Requirements

### Requirement: An escalation bigger than one record routes to a rung
The system SHALL instruct an implementing agent that an escalation whose answer revises a decision or invalidates milestones is not resolved by writing a record, and SHALL have it route by which artifact must change.

#### Scenario: The option is offered
- **WHEN** an escalation is presented to the operator
- **THEN** an option SHALL exist for an answer that does not fit in one record

#### Scenario: Routing by what must move
- **WHEN** that option is taken
- **THEN** the instruction SHALL ask whether a driver-spec, a decision, or a milestone must change
- **AND** each answer SHALL name the workflow that handles it

#### Scenario: The agent does not choose the rung
- **WHEN** the three routes are presented
- **THEN** the instruction SHALL forbid guessing which one applies
- **AND** the reason SHALL be that the agent knows what blocked it and not whether the goal still holds

#### Scenario: Implementation stops either way
- **WHEN** any rung is taken
- **THEN** the instruction SHALL state that the current run does not simply continue
- **AND** it SHALL state which routes require the initiative to be opened again
