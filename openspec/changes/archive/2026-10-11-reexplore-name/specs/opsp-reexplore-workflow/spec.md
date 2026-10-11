## REMOVED Requirements

### Requirement: Milestone plan revision

**Reason**: Revising the milestone plan is `/opsp:repropose`'s work (`DEC-HAT-HANDOFFS`). Superseding a strategy redraws the milestones that rested on it, and there is no case where milestones change and nothing above them did — so the two overlapped almost entirely. `/opsp:reexplore` moved up to the goal rung, where it writes nothing.

**Migration**: Use `/opsp:repropose`, whose spec covers superseding ADRs, amending `## Measures` and redrawing the milestones beneath them. Work that is simply unfinished is a change request from `/opsp:attest`, which needs no plan revision at all.

### Requirement: Initiative-scoped exploration

**Reason**: Replaced by the goal-rung requirement below. The old version entered explore mode and then revised the plan in the same session, which is what collapsed two rungs into one tool.

**Migration**: `/opsp:reexplore` still presents the initiative and enters explore stance; it now concludes by returning the initiative to `exploring` and handing to `/opsp:backlog`, rather than editing the plan in place.

### Requirement: Initiative context loading

**Reason**: The loading rule changed rather than being dropped. The goal rung deliberately does **not** load the implementation or the milestone plan in detail, because an objective rethought while holding a diff rationalises it.

**Migration**: See "The goal rung thinks and writes nothing" — the hat changes before loading, and the load list is bounded.

### Requirement: Re-exploration audit logging

**Reason**: Absorbed into the goal-rung requirement, which requires recording the conclusion including the case where the goal holds after all.

**Migration**: The conclusion is recorded in the initiative either way; "no change" is explicitly a result rather than a failure.

## ADDED Requirements

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
