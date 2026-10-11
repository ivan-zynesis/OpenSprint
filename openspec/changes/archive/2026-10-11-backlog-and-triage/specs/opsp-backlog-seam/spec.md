## ADDED Requirements

### Requirement: The backlog seam has two tools
The system SHALL provide `/opsp:backlog` to persist a brainstorm and `/opsp:triage` to pick it up, so that the step from idea to proposal has a resting point.

#### Scenario: Lifecycle order
- **WHEN** the OPSP workflows are enumerated
- **THEN** `opsp-backlog` and `opsp-triage` SHALL appear between `opsp-explore` and `opsp-propose`

#### Scenario: Backlog writes one artifact
- **WHEN** `/opsp:backlog` persists a brainstorm
- **THEN** it SHALL write an initiative at `state: exploring` carrying an objective and a goal
- **AND** it SHALL NOT write driver-specs, ADRs or milestones

#### Scenario: Backlog stops
- **WHEN** the initiative is written
- **THEN** the workflow SHALL stop
- **AND** SHALL NOT offer to proceed to propose

#### Scenario: Both tools own the worktree
- **WHEN** either tool runs outside the initiative's branch
- **THEN** it SHALL create or switch to that worktree before writing
- **AND** SHALL NOT write on the default branch

#### Scenario: Triage has three outcomes
- **WHEN** `/opsp:triage` picks up a backlog item
- **THEN** it SHALL advance, decline, or return it
- **AND** declining SHALL record why

#### Scenario: Triage does not formalize
- **WHEN** triage advances an item
- **THEN** it SHALL hand to `/opsp:propose`
- **AND** SHALL NOT write driver-specs, ADRs or milestones itself

#### Scenario: Triage is not a remediation workflow
- **WHEN** the system is asked whether a remediation workflow exists
- **THEN** there SHALL be none
- **AND** triage SHALL be the thinking half of the propose stage rather than a mechanism for closing open loops

### Requirement: Propose does not duplicate an initiative
The system SHALL have `/opsp:propose` fill in an existing initiative rather than creating a second.

#### Scenario: An initiative already exists
- **WHEN** propose is given an initiative at `state: exploring`
- **THEN** it SHALL add Strategy and Measure to that initiative and advance it
- **AND** SHALL NOT create a second initiative
- **AND** SHALL NOT rewrite its Objective or Goal

#### Scenario: Arriving straight from explore
- **WHEN** no initiative exists yet
- **THEN** propose SHALL create one, as before
