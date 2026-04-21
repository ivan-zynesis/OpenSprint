## MODIFIED Requirements

### Requirement: Decision record artifact structure
The system SHALL store decision records as individual markdown files in `opensprint/ADRs/` with YAML frontmatter containing `id`, `status`, `depends-on`, `created`, and `depth` fields.

#### Scenario: Creating a new decision record
- **WHEN** the agent encounters ambiguity it cannot resolve autonomously and the operator provides a decision
- **THEN** the system SHALL create a file at `opensprint/ADRs/<DEC-NNN>.md`
- **AND** the YAML frontmatter SHALL contain:
  - `id`: sequential identifier in format `DEC-NNN` (e.g., `DEC-001`)
  - `status`: one of `draft`, `accepted`, `superseded`, `deprecated`
  - `depends-on`: array of driver spec IDs and/or decision IDs this decision traces to
  - `created`: ISO 8601 date
  - `depth`: integer representing position in the decision tree (0 = root)
- **AND** the file body SHALL contain structured sections as defined by the decision record template

#### Scenario: Decision record file on Windows
- **WHEN** creating a decision record on Windows
- **THEN** the system SHALL use `path.join('opensprint', 'ADRs', filename)` to construct the file path

#### Scenario: Sequential ID assignment
- **WHEN** a new decision record is created
- **THEN** the system SHALL scan existing files in `opensprint/ADRs/`
- **AND** assign the next sequential number (e.g., if DEC-003 exists, next is DEC-004)
