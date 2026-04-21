# Driver Specs Specification

## Purpose

Define the structure, lifecycle, and access control for driver spec artifacts that capture external constraints provided by the operator.

## Requirements

### Requirement: Driver spec artifact structure
The system SHALL store driver specs as individual markdown files in `opensprint/driver-specs/` at the project root, each with YAML frontmatter containing `id`, `type`, `status`, and `created` fields.

#### Scenario: Creating a new driver spec
- **WHEN** operator instructs the agent to create a driver spec
- **THEN** the system SHALL create a file at `opensprint/driver-specs/<DS-ID>.md`
- **AND** the file SHALL contain YAML frontmatter with:
  - `id`: unique identifier in format `DS-<KEBAB-NAME>` (e.g., `DS-PRICING`)
  - `type`: one of `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
  - `status`: one of `active`, `superseded`, `deprecated`
  - `created`: ISO 8601 date
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
The system SHALL support categorized driver spec types to distinguish the source and nature of external constraints.

#### Scenario: Listing driver spec types
- **WHEN** the system validates a driver spec type field
- **THEN** it SHALL accept exactly the following values by explicit list lookup: `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
- **AND** reject any value not in this list

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
