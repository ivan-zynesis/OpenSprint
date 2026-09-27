# Driver Specs Specification

## Purpose

Define the structure, lifecycle, and access control for driver spec artifacts that capture external constraints provided by the operator.
## Requirements
### Requirement: Driver spec artifact structure
The system SHALL store driver specs as individual markdown files in `opensprint/driver-specs/` at the project root, each with YAML frontmatter containing `id`, `type`, `status`, and `created` fields, and optionally a `hats` field.

#### Scenario: Creating a new driver spec
- **WHEN** operator instructs the agent to create a driver spec
- **THEN** the system SHALL create a file at `opensprint/driver-specs/<DS-ID>.md`
- **AND** the file SHALL contain YAML frontmatter with:
  - `id`: unique identifier in format `DS-<KEBAB-NAME>` (e.g., `DS-PRICING`)
  - `type`: one of `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
  - `status`: one of `active`, `superseded`, `deprecated`
  - `created`: ISO 8601 date
- **AND** the frontmatter MAY contain `hats`, naming the hat or hats accountable for the spec
- **AND** the file body SHALL contain the driver spec content in operator's own words

#### Scenario: Driver spec file on Windows
- **WHEN** creating a driver spec on Windows
- **THEN** the system SHALL use `path.join('opensprint', 'driver-specs', filename)` to construct the file path
- **AND** SHALL NOT hardcode forward-slash separators

### Requirement: Driver specs are operator-only writable
The system SHALL create or modify driver spec files only when the operator explicitly instructs the agent to do so. The agent MUST NOT autonomously create, edit, or delete driver specs.

#### Scenario: Agent encounters information that could be a driver spec
- **WHEN** the agent identifies external constraints during exploration or implementation
- **THEN** the agent SHALL surface the finding to the operator
- **AND** SHALL ask the operator whether to record it as a driver spec
- **AND** SHALL NOT write the file until operator confirms

#### Scenario: Operator dictates a driver spec
- **WHEN** the operator instructs "add a driver spec for X"
- **THEN** the agent SHALL create the driver spec file using the operator's stated content
- **AND** the agent SHALL act as a scribe, faithfully recording operator intent without embellishment

### Requirement: Driver spec types
The system SHALL support categorized driver spec types to distinguish the source and nature of external constraints, validated mechanically rather than by instruction alone.

#### Scenario: Listing driver spec types
- **WHEN** the system validates a driver spec type field
- **THEN** it SHALL accept exactly the following values by explicit list lookup: `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
- **AND** reject any value not in this list

#### Scenario: Type validation is enforced in code
- **WHEN** a driver spec declares a `type` outside the accepted list
- **THEN** validation SHALL fail rather than relying on agent instructions to prevent the value

### Requirement: Driver spec lifecycle
The system SHALL support driver spec status transitions to track how external truth evolves over time.

#### Scenario: Superseding a driver spec
- **WHEN** operator instructs that a driver spec has changed
- **THEN** the system SHALL update the original spec's status to `superseded`
- **AND** add a `superseded-by` field referencing the new spec ID
- **AND** create a new driver spec with the updated content
- **AND** the new spec SHALL reference the original via a `supersedes` field

#### Scenario: Deprecating a driver spec
- **WHEN** operator instructs that a driver spec is no longer relevant
- **THEN** the system SHALL update the spec's status to `deprecated`
- **AND** add a `deprecated-reason` field with the operator's explanation

### Requirement: Driver spec listing
The system SHALL provide a way to list all active driver specs for agent and operator consumption.

#### Scenario: Listing active driver specs
- **WHEN** the list operation is invoked
- **THEN** the system SHALL read all files in `opensprint/driver-specs/`
- **AND** return specs with `status: active`
- **AND** include the `id`, `type`, and first line of body content as summary

### Requirement: Driver spec hat assignment
The system SHALL allow a driver spec to declare the single hat accountable for it.

#### Scenario: Driver spec declares hats
- **WHEN** a driver spec's frontmatter contains `hats`
- **THEN** every declared value SHALL be validated against the resolved hat registry
- **AND** one or more hats MAY be declared

#### Scenario: Driver spec omits hats
- **WHEN** a driver spec's frontmatter has no `hats` key
- **THEN** the spec SHALL be reported as unassigned rather than rejected

### Requirement: Driver specs may declare dependencies on other driver specs
The system SHALL allow a driver spec to record that it exists because of another, using the same `depends-on` field the decision layer already uses.

#### Scenario: Declaring a dependency
- **WHEN** a driver spec's frontmatter contains `depends-on`
- **THEN** the value SHALL be an array of driver-spec ids
- **AND** the field SHALL be optional, so a spec written before it existed still parses

#### Scenario: A dependency on a record that does not exist
- **WHEN** a driver spec depends on an id matching no driver spec
- **THEN** the system SHALL report the dangling reference, naming both records
- **AND** SHALL NOT fail the command

#### Scenario: A dependency on a decision record
- **WHEN** a driver spec depends on an id belonging to a decision record
- **THEN** the system SHALL report it as an invalid edge
- **AND** the reason SHALL be that a constraint does not exist because of a decision — the dependency runs the other way

#### Scenario: A cycle among driver specs
- **WHEN** driver-spec dependencies form a cycle
- **THEN** the system SHALL report the cycle naming the records involved
- **AND** SHALL treat the records in the cycle as having no edges
- **AND** SHALL continue compiling everything else

#### Scenario: Causal ordering is not enforced
- **WHEN** a driver spec declares a dependency
- **THEN** the system SHALL NOT require the edge to respect any particular ordering of roles
- **AND** validation SHALL be limited to existence, record type, and acyclicity

#### Scenario: The decision map is unaffected
- **WHEN** `DECISION-MAP.md` is regenerated
- **THEN** it SHALL build edges from decision `depends-on` only
- **AND** driver-spec edges SHALL NOT appear in it

