## ADDED Requirements

### Requirement: A strategy nobody implemented is reported
The system SHALL report an active driver-spec whose roles include `strategy` when no active decision descends from it, because a stated approach with nothing building it is intent rather than work.

#### Scenario: A strategy with no descending decision
- **WHEN** an active driver-spec declares `strategy` among its roles
- **AND** no active decision has that driver-spec among its transitive `depends-on` ancestors
- **THEN** the system SHALL report a `strategy-unimplemented` loop against that driver-spec's hats

#### Scenario: A strategy implemented directly
- **WHEN** an active decision names the strategy in its `depends-on`
- **THEN** `strategy-unimplemented` SHALL NOT be reported for it

#### Scenario: A strategy implemented transitively
- **WHEN** an active decision reaches the strategy through another decision's `depends-on`
- **THEN** `strategy-unimplemented` SHALL NOT be reported for it
- **AND** the reasoning SHALL match `constraint-unasserted`, which is transitive for the same reason

#### Scenario: A record that is not a strategy
- **WHEN** an active driver-spec declares no `strategy` role
- **THEN** `strategy-unimplemented` SHALL NOT be reported for it

#### Scenario: A record declaring several roles
- **WHEN** a driver-spec declares `strategy` among several roles
- **THEN** it SHALL be evaluated for `strategy-unimplemented`
- **AND** SHALL be reported at most once

#### Scenario: The rule names no hat
- **WHEN** the system decides whether a strategy is implemented
- **THEN** it SHALL NOT restrict the check to any named hat
- **AND** the reason SHALL be that every decision is owned by `dev` or `devops`, so any descending decision is an implementing one
- **AND** `DS-SQUAD-HATS` makes the hat set a property of the project rather than of the tool

#### Scenario: A cycle in depends-on
- **WHEN** the ancestry walk encounters a record it has already visited
- **THEN** it SHALL terminate rather than looping
