# opsp-reideate-workflow Specification

## Purpose
TBD - created by archiving change hat-handoffs. Update Purpose after archive.
## Requirements
### Requirement: The goal rung thinks and writes nothing
The system SHALL provide a workflow for reconsidering an initiative's objective and goal that produces no artifacts, mirroring the exploration workflow, so that re-ideation rejoins the forward path rather than running beside it.

#### Scenario: It writes nothing
- **WHEN** an agent re-ideates an initiative
- **THEN** the instruction SHALL forbid writing driver-specs, ADRs or milestones
- **AND** it SHALL state that this is the symmetry with the exploration workflow

#### Scenario: Rejoining the forward path
- **WHEN** the goal has moved
- **THEN** the instruction SHALL return the initiative to `exploring`
- **AND** it SHALL direct the operator through backlog, triage and propose as for an original idea

#### Scenario: Which rung
- **WHEN** the agent decides whether this is the right workflow
- **THEN** the test SHALL be whether a driver-spec's Statement must change
- **AND** a change confined to `## Measures` SHALL be handed to the strategy rung

#### Scenario: The hat changes first
- **WHEN** re-ideation begins
- **THEN** the instruction SHALL state which hats are set down and which are picked up
- **AND** it SHALL forbid loading the implementation

#### Scenario: Work already done
- **WHEN** the goal has moved
- **THEN** milestones that served the old goal SHALL be marked superseded
- **AND** they SHALL be kept rather than deleted

#### Scenario: Concluding that the goal holds
- **WHEN** re-ideation finds the goal still right
- **THEN** the instruction SHALL state that this is a result rather than a failure
- **AND** the initiative's state SHALL NOT change

