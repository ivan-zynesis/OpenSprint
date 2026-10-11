## ADDED Requirements

### Requirement: Decision identifiers are coined, not allocated
The system SHALL instruct an authoring agent to coin a semantic identifier for a new decision record rather than allocate the next number in a sequence, so that two agents deciding different things in different worktrees cannot produce the same identifier.

#### Scenario: Coining a new identifier
- **WHEN** an agent is instructed to create a decision record
- **THEN** the instruction SHALL require a short phrase in capitals naming what was decided
- **AND** it SHALL state that a number is never acceptable

#### Scenario: The old behaviour is foreclosed
- **WHEN** the instruction is read
- **THEN** it SHALL state explicitly that the agent must not read the directory and increment
- **AND** the reason SHALL be given as collision across concurrent worktrees

#### Scenario: Existing numbered records are not renamed
- **WHEN** an agent encounters a decision record numbered `DEC-001` through `DEC-044`
- **THEN** the instruction SHALL state that these keep their numbers permanently
- **AND** no tool SHALL propose renaming them
