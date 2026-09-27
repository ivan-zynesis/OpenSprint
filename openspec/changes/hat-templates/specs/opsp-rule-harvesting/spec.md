## ADDED Requirements

### Requirement: A target with no measure is reported
The system SHALL report a record that states a target without a way to tell whether it is met, because a constraint nothing can check is a constraint written badly.

#### Scenario: A goal with no measures
- **WHEN** an active record's role is among the measurable roles
- **AND** its body contains no `## Measures` section
- **THEN** the system SHALL report a `constraint-unmeasurable` loop against that record's hats

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

#### Scenario: A record with no role
- **WHEN** a record carries no role
- **THEN** `constraint-unmeasurable` SHALL NOT be reported for it
- **AND** `record-unclassified` SHALL cover it instead
