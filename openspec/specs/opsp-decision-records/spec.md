# OPSP Decision Records Specification

## Purpose

Define the decision record artifact structure for storing architectural decisions with traceability to driver specs and other decisions.
## Requirements
### Requirement: Decision record artifact structure
The system SHALL store decision records as individual markdown files in `opensprint/ADRs/` with YAML frontmatter containing `id`, `status`, `depends-on`, `created`, and `depth` fields, and optionally a `hats` field.

#### Scenario: Creating a new decision record
- **WHEN** the agent encounters ambiguity it cannot resolve autonomously and the operator provides a decision
- **THEN** the system SHALL create a file at `opensprint/ADRs/<DEC-NNN>.md`
- **AND** the YAML frontmatter SHALL contain:
  - `id`: sequential identifier in format `DEC-NNN` (e.g., `DEC-001`)
  - `status`: one of `draft`, `accepted`, `superseded`, `deprecated`
  - `depends-on`: array of driver spec IDs and/or decision IDs this decision traces to
  - `created`: ISO 8601 date
  - `depth`: integer representing position in the decision tree (0 = depends only on driver specs)
- **AND** the frontmatter MAY contain `hats`, naming the hat or hats accountable for the decision
- **AND** the file body SHALL contain structured sections as defined by the decision record template

#### Scenario: Decision record file on Windows
- **WHEN** creating a decision record on Windows
- **THEN** the system SHALL use `path.join('opensprint', 'ADRs', filename)` to construct the file path

#### Scenario: Sequential ID assignment
- **WHEN** a new decision record is created
- **THEN** the system SHALL scan existing files in `opensprint/ADRs/`
- **AND** assign the next sequential number (e.g., if DEC-003 exists, next is DEC-004)

### Requirement: Decision record hat assignment
The system SHALL allow a decision record to declare the single hat accountable for it.

#### Scenario: Decision record declares hats
- **WHEN** a decision record's frontmatter contains `hats`
- **THEN** every declared value SHALL be validated against the resolved hat registry
- **AND** one or more hats MAY be declared

#### Scenario: Decision record omits hats
- **WHEN** a decision record's frontmatter has no `hats` key
- **THEN** the record SHALL be reported as unassigned rather than rejected

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

