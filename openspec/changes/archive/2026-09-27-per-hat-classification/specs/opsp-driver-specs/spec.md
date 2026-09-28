## ADDED Requirements

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
