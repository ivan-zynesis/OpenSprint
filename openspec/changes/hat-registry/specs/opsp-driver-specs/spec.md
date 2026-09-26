## MODIFIED Requirements

### Requirement: Driver spec artifact structure
The system SHALL store driver specs as individual markdown files in `opensprint/driver-specs/` at the project root, each with YAML frontmatter containing `id`, `type`, `status`, and `created` fields, and optionally a `hat` field.

#### Scenario: Creating a new driver spec
- **WHEN** operator instructs the agent to create a driver spec
- **THEN** the system SHALL create a file at `opensprint/driver-specs/<DS-ID>.md`
- **AND** the file SHALL contain YAML frontmatter with:
  - `id`: unique identifier in format `DS-<KEBAB-NAME>` (e.g., `DS-PRICING`)
  - `type`: one of `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
  - `status`: one of `active`, `superseded`, `deprecated`
  - `created`: ISO 8601 date
- **AND** the frontmatter MAY contain `hat`, naming the hat accountable for the spec
- **AND** the file body SHALL contain the driver spec content in operator's own words

#### Scenario: Driver spec file on Windows
- **WHEN** creating a driver spec on Windows
- **THEN** the system SHALL use `path.join('opensprint', 'driver-specs', filename)` to construct the file path
- **AND** SHALL NOT hardcode forward-slash separators

### Requirement: Driver spec types
The system SHALL support categorized driver spec types to distinguish the source and nature of external constraints, validated mechanically rather than by instruction alone.

#### Scenario: Listing driver spec types
- **WHEN** the system validates a driver spec type field
- **THEN** it SHALL accept exactly the following values by explicit list lookup: `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
- **AND** reject any value not in this list

#### Scenario: Type validation is enforced in code
- **WHEN** a driver spec declares a `type` outside the accepted list
- **THEN** validation SHALL fail rather than relying on agent instructions to prevent the value

## ADDED Requirements

### Requirement: Driver spec hat assignment
The system SHALL allow a driver spec to declare the single hat accountable for it.

#### Scenario: Driver spec declares a hat
- **WHEN** a driver spec's frontmatter contains `hat`
- **THEN** the value SHALL be validated against the resolved hat registry
- **AND** exactly one hat SHALL be declared

#### Scenario: Driver spec omits a hat
- **WHEN** a driver spec's frontmatter has no `hat` key
- **THEN** the spec SHALL be reported as unassigned rather than rejected
