## MODIFIED Requirements

### Requirement: Unclassified records are reported as an open loop
The system SHALL report a **driver-spec** that carries no role, where the record belongs to a hat that declares roles. Decisions SHALL be exempt from role classification.

#### Scenario: A driver-spec with no role in a hat that declares roles
- **WHEN** an active driver-spec belongs to a hat declaring roles
- **AND** the driver-spec declares no role
- **THEN** the system SHALL report a `record-unclassified` loop against that record's hats

#### Scenario: A decision is never unclassified
- **WHEN** an active decision declares no role
- **THEN** the system SHALL NOT report `record-unclassified` for it
- **AND** this SHALL hold whichever hats it declares, including a hat that declares roles
- **AND** the reason SHALL be that role classification is a driver-spec concept: `dev` and `devops` run no framework to classify against

#### Scenario: A hat that declares no roles
- **WHEN** a record belongs only to hats declaring no roles
- **THEN** the system SHALL NOT report `record-unclassified` for it
- **AND** a project not using roles SHALL NOT see its whole surrogate reported as a backlog

#### Scenario: A classified record
- **WHEN** a driver-spec declares at least one role its hat accepts
- **THEN** no `record-unclassified` loop SHALL be reported for it

### Requirement: A target with no measure is reported
The system SHALL report a record that states a target without a way to tell whether it is met, because a constraint nothing can check is a constraint written badly.

#### Scenario: A goal with no measures
- **WHEN** any of an active record's roles is among the measurable roles
- **AND** its body contains no `## Measures` section
- **THEN** the system SHALL report a `constraint-unmeasurable` loop against that record's hats
- **AND** SHALL report it once for that record, not once per measurable role

#### Scenario: Measurable roles
- **WHEN** the system decides whether a record should carry measures
- **THEN** it SHALL use an explicit list: `goal` and `bar`
- **AND** SHALL NOT demand measures of an `objective`, which is qualitative by definition
- **AND** SHALL NOT demand measures of a `strategy`, which is an approach rather than a target

#### Scenario: A goal with measures
- **WHEN** a record with a measurable role contains a `## Measures` section with content
- **THEN** no `constraint-unmeasurable` loop SHALL be reported for it

#### Scenario: An empty measures section
- **WHEN** a record contains a `## Measures` heading with no content beneath it
- **THEN** the record SHALL still be reported as unmeasurable
- **AND** a heading alone SHALL NOT satisfy the requirement
