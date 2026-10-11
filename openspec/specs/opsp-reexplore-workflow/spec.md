# opsp-reexplore-workflow Specification

## Purpose

The goal rung of the escalation ladder: a workflow for reconsidering an initiative's objective and goal once work has been done against them.

It is `/opsp:explore` run later, and it produces no artifacts for the same reason explore does not — the thinking is persisted by `/opsp:backlog`, the same tool that persists an original idea. That symmetry is what lets a re-explored goal rejoin the forward path rather than run beside it.

It exists because an implementation is the only thing that can disprove a goal, and nothing in the lifecycle carried that evidence back up to the altitude where the goal was set. Revising the milestone plan, which this capability once covered, belongs to `/opsp:repropose` (`DEC-HAT-HANDOFFS`).
## Requirements
### Requirement: The goal rung thinks and writes nothing
The system SHALL provide a workflow for reconsidering an initiative's objective and goal that produces no artifacts, mirroring the exploration workflow, so that re-exploration rejoins the forward path rather than running beside it.

#### Scenario: It writes nothing
- **WHEN** an agent re-explores an initiative
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
- **WHEN** re-exploration begins
- **THEN** the instruction SHALL state which hats are set down and which are picked up
- **AND** it SHALL forbid loading the implementation

#### Scenario: Work already done
- **WHEN** the goal has moved
- **THEN** milestones that served the old goal SHALL be marked superseded
- **AND** they SHALL be kept rather than deleted

#### Scenario: Concluding that the goal holds
- **WHEN** re-exploration finds the goal still right
- **THEN** the instruction SHALL state that this is a result rather than a failure
- **AND** the initiative's state SHALL NOT change

