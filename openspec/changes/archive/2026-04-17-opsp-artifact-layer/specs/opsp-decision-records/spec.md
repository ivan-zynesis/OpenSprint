## ADDED Requirements

### Requirement: Decision record artifact structure
The system SHALL store decision records as individual markdown files in `opensprint/decisions/` with YAML frontmatter containing `id`, `status`, `depends-on`, `created`, and `depth` fields.

#### Scenario: Creating a new decision record
- **WHEN** the agent encounters ambiguity it cannot resolve autonomously and the operator provides a decision
- **THEN** the system SHALL create a file at `opensprint/decisions/<DEC-NNN>.md`
- **AND** the YAML frontmatter SHALL contain:
  - `id`: sequential identifier in format `DEC-NNN` (e.g., `DEC-001`)
  - `status`: one of `draft`, `accepted`, `superseded`, `deprecated`
  - `depends-on`: array of driver spec IDs and/or decision IDs this decision traces to
  - `created`: ISO 8601 date
  - `depth`: integer representing position in the decision tree (0 = root)
- **AND** the file body SHALL contain structured sections as defined by the decision record template

#### Scenario: Decision record file on Windows
- **WHEN** creating a decision record on Windows
- **THEN** the system SHALL use `path.join('opensprint', 'decisions', filename)` to construct the file path

### Requirement: Decision record body structure
The system SHALL enforce a structured body format for decision records that captures the full context of operator judgment.

#### Scenario: Validating decision record sections
- **WHEN** a decision record body is created
- **THEN** it SHALL contain the following sections:
  - `## Question` — the ambiguity the agent raised, in the agent's words
  - `## Operator Decision` — the operator's chosen direction
  - `## Consideration Factors` — a table of factors, their weights (HIGH/MED/LOW), and how each option scored
  - `## Rationale` — the operator's reasoning linking the decision to the driver specs it depends on
  - `## Invalidation Trigger` — conditions under which this decision should be re-evaluated
- **AND** the Consideration Factors table SHALL have columns: Factor, Weight, and one column per option considered

### Requirement: Decision records are agent-facilitated operator-decided
The system SHALL create decision records only when the agent encounters ambiguity it cannot resolve from driver specs, industry best practices, or existing ADRs — and the operator provides a decision.

#### Scenario: Agent resolves ambiguity autonomously
- **WHEN** the agent can determine the answer from driver specs, best practices, or existing decisions
- **THEN** the agent SHALL NOT create a decision record
- **AND** SHALL proceed with implementation

#### Scenario: Agent encounters genuine ambiguity
- **WHEN** the agent encounters a choice where multiple options are valid and the right answer depends on operator judgment or organizational context
- **THEN** the agent SHALL present the ambiguity to the operator with the options it has identified
- **AND** SHALL ask the operator to decide
- **AND** upon receiving the operator's answer, SHALL create a decision record

### Requirement: Decision dependency tracking
The system SHALL track which driver specs and prior decisions each ADR depends on, forming an explicit dependency chain.

#### Scenario: Linking a decision to driver specs
- **WHEN** a decision record is created
- **THEN** the `depends-on` frontmatter field SHALL list every driver spec ID whose content was a factor in the decision
- **AND** SHALL list every prior decision ID that this decision builds upon

#### Scenario: Tracing a decision's full dependency chain
- **WHEN** the system resolves dependencies for a decision
- **THEN** it SHALL follow the `depends-on` chain recursively until reaching driver specs (which have no upward dependencies)

### Requirement: Decision lifecycle transitions
The system SHALL support status transitions for decision records as the project evolves.

#### Scenario: Superseding a decision
- **WHEN** operator decides to change a previously accepted decision
- **THEN** the system SHALL update the original record's status to `superseded`
- **AND** add a `superseded-by` field referencing the new decision ID
- **AND** create a new decision record with updated content
- **AND** the new record SHALL reference the original via a `supersedes` field

#### Scenario: Sequential ID assignment
- **WHEN** a new decision record is created
- **THEN** the system SHALL scan existing files in `opensprint/decisions/`
- **AND** assign the next sequential number (e.g., if DEC-003 exists, next is DEC-004)

### Requirement: Decision depth calculation
The system SHALL calculate and maintain the depth of each decision in the decision tree, where depth indicates distance from driver specs.

#### Scenario: Root decision depth
- **WHEN** a decision depends only on driver specs (no other decisions)
- **THEN** its depth SHALL be 0

#### Scenario: Nested decision depth
- **WHEN** a decision depends on another decision at depth N
- **THEN** its depth SHALL be N + 1
- **AND** if it depends on multiple decisions at different depths, its depth SHALL be max(depths) + 1
