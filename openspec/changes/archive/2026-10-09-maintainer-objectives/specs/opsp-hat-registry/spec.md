## ADDED Requirements

### Requirement: The maintainer hat ships seven inherited objectives
The system SHALL ship a default section list for the `maintainer` hat consisting of seven objectives, so that a project gains a maintainer shape without authoring one.

#### Scenario: The shipped objectives
- **WHEN** a project declares no sections for `maintainer`
- **THEN** its sections SHALL be `security-access`, `isolation-confidentiality`, `privacy-retention-legal`, `integrity-correctness`, `change-quality`, `availability-continuity`, `cost-budget`, followed by `open-loops`
- **AND** each objective section SHALL take `driver-specs` filtered to roles `goal` and `strategy`
- **AND** each objective section SHALL select on its own `objective`

#### Scenario: An objective with no records
- **WHEN** no record declares a given objective
- **THEN** that section SHALL still resolve, with no inputs
- **AND** SHALL NOT be omitted, because an empty objective is a finding

#### Scenario: A project extends the list
- **WHEN** a project declares its own `maintainer` sections in `openspec/config.yaml`
- **THEN** the declared sections SHALL be used in place of the shipped seven
- **AND** a project MAY declare an eighth objective without modifying the tool

#### Scenario: Default roles for maintainer
- **WHEN** a project declares no roles for `maintainer`
- **THEN** the accepted roles SHALL be `goal` and `strategy`

### Requirement: A record declares one or more roles
The system SHALL accept a record's `role` as either a string or a list, normalised to a list, so that a record stating both a goal and its strategy can declare both.

#### Scenario: Both spellings normalise
- **WHEN** a record declares `role: strategy` or `role: [goal, strategy]`
- **THEN** both SHALL normalise to a list
- **AND** duplicates SHALL be removed with order preserved

#### Scenario: A malformed role
- **WHEN** `role` is present but is not a non-empty string or a non-empty list of non-empty strings
- **THEN** it SHALL be treated as absent rather than failing the command

#### Scenario: Validation against the union of a record's hats
- **WHEN** a record declares several hats
- **THEN** each of its roles SHALL be checked against the union of those hats' accepted roles
- **AND** a role accepted by any one of them SHALL be legitimate

### Requirement: A record declares the objective it serves
The system SHALL accept an optional `objective` on a record, naming which of its hat's objectives it serves.

#### Scenario: Declaring an objective
- **WHEN** a record declares `objective: security-access`
- **THEN** it SHALL be selected by the section of that name
- **AND** SHALL NOT be selected by any other objective's section

#### Scenario: A record with no objective
- **WHEN** a record declares no `objective`
- **THEN** it SHALL be excluded from every objective-filtered section
- **AND** SHALL be unaffected in sections that do not filter on objective

#### Scenario: Validation against the hat's resolved sections
- **WHEN** a record declares an `objective`
- **THEN** it SHALL be validated against the objectives declared by its hats' resolved sections
- **AND** a project that added an eighth objective SHALL be able to use it immediately
