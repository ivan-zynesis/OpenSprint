## MODIFIED Requirements

### Requirement: An unclassified record is reported
The system SHALL report a record that carries no role in a hat that declares roles, so that a surrogate using roles does not accumulate records outside its classification. **Decisions SHALL be exempt.**

#### Scenario: A driver-spec with no role
- **WHEN** an active driver-spec declares no role and at least one of its hats declares roles
- **THEN** `record-unclassified` SHALL be reported, naming the declaring hats and their accepted roles

#### Scenario: A decision is never unclassified
- **WHEN** an active decision declares no role
- **THEN** `record-unclassified` SHALL NOT be reported, whichever hats it declares
- **AND** this SHALL hold even where one of those hats declares roles

#### Scenario: A hat declaring no roles
- **WHEN** no hat of a record declares roles
- **THEN** `record-unclassified` SHALL NOT be reported

### Requirement: A target with no measure is reported
The system SHALL report a driver-spec in a measurable role that carries no populated `## Measures` section.

#### Scenario: A record carrying several roles
- **WHEN** a driver-spec declares a list of roles
- **THEN** `constraint-unmeasurable` SHALL be evaluated if **any** of those roles is measurable
- **AND** SHALL be reported once for that record, not once per role
