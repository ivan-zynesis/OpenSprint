## ADDED Requirements

### Requirement: Unclassified records are reported as an open loop
The system SHALL report a record that carries no role, where the record belongs to a hat that declares roles.

#### Scenario: A record with no role in a hat that declares roles
- **WHEN** a record belongs to a hat declaring roles
- **AND** the record declares no role
- **THEN** the system SHALL report a `record-unclassified` loop against that record's hats

#### Scenario: A hat that declares no roles
- **WHEN** a record belongs only to hats declaring no roles
- **THEN** the system SHALL NOT report `record-unclassified` for it
- **AND** a project not using roles SHALL NOT see its whole surrogate reported as a backlog

#### Scenario: A classified record
- **WHEN** a record declares a role its hat accepts
- **THEN** no `record-unclassified` loop SHALL be reported for it
