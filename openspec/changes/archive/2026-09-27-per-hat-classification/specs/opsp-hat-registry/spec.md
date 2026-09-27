## ADDED Requirements

### Requirement: A hat may declare the roles its records can take
The system SHALL allow a hat to declare a set of roles, so that a record can be classified within its hat without the engine knowing what those roles mean.

#### Scenario: Declaring roles
- **WHEN** a hat's configuration declares `roles`
- **THEN** the value SHALL be a non-empty array of non-empty strings
- **AND** those SHALL be the only roles records of that hat may take

#### Scenario: Default roles
- **WHEN** no project configuration declares roles
- **THEN** `product` SHALL default to, by explicit list: `objective`, `goal`, `strategy`
- **AND** every other default hat SHALL default to no roles

#### Scenario: measure is not a role
- **WHEN** the default product roles are resolved
- **THEN** `measure` SHALL NOT be among them
- **AND** a measure SHALL be a property of a goal rather than a record of its own

#### Scenario: Malformed roles
- **WHEN** `roles` is present but is not a non-empty array of non-empty strings
- **THEN** the hat SHALL resolve to its default roles
- **AND** a warning SHALL name the hat and the `roles` key
- **AND** the command SHALL NOT fail

### Requirement: Role validation by explicit list lookup
The system SHALL validate a record's role against the roles declared by each hat the record belongs to, by explicit membership lookup.

#### Scenario: A valid role
- **WHEN** a record declares a role its hat also declares
- **THEN** validation SHALL succeed

#### Scenario: A role the hat does not declare
- **WHEN** a record declares a role absent from every hat it belongs to
- **THEN** validation SHALL report the record, the role, and the accepted roles

#### Scenario: A role on a hat that declares none
- **WHEN** a record belongs only to hats declaring no roles
- **AND** the record declares a role
- **THEN** validation SHALL report it as unexpected rather than silently accepting it

#### Scenario: Role comparison is case-sensitive
- **WHEN** a record declares `Objective` and the hat declares `objective`
- **THEN** the declared value SHALL be reported as unaccepted
