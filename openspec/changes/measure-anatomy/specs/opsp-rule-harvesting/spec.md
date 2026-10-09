## ADDED Requirements

### Requirement: A measure with no evidence is reported
The system SHALL report a record whose `## Measures` section states a target but carries no `### Evidence`, because a measure with nothing asserting it is an aspiration.

#### Scenario: Measures without evidence
- **WHEN** an active record has a populated `## Measures` section
- **AND** that section carries no `### Evidence` sub-block, or an empty one
- **THEN** the system SHALL report a `measure-unasserted` loop against that record's hats

#### Scenario: Measures with evidence
- **WHEN** a record's `## Measures` section carries a populated `### Evidence` sub-block
- **THEN** no `measure-unasserted` loop SHALL be reported for it
- **AND** the system SHALL NOT inspect whether the evidence is adequate, which is a judgement rather than a check

#### Scenario: A record with no measures at all
- **WHEN** a record carries no populated `## Measures` section
- **THEN** `measure-unasserted` SHALL NOT be reported for it
- **AND** `constraint-unmeasurable` SHALL remain the loop that covers it

### Requirement: A measure with no exposure is reported
The system SHALL report a record whose `## Measures` section carries no `### Exposure`, because a bar with no stated consequence has no recorded justification for sitting where it does.

#### Scenario: Measures without exposure
- **WHEN** an active record has a populated `## Measures` section
- **AND** that section carries no `### Exposure` sub-block, or an empty one
- **THEN** the system SHALL report a `measure-unexposed` loop against that record's hats

#### Scenario: Measures with exposure
- **WHEN** a record's `## Measures` section carries a populated `### Exposure` sub-block
- **THEN** no `measure-unexposed` loop SHALL be reported for it

### Requirement: A bar that does not state its neighbour is reported
The system SHALL report a `### Bar` that declares no `neighbour`, because the position not taken is what makes a future trade arguable rather than re-litigated from scratch.

#### Scenario: A bar with no neighbour label
- **WHEN** an active record carries a `### Bar` sub-block
- **AND** that block declares no `neighbour` label
- **THEN** the system SHALL report a `bar-without-neighbour` loop against that record's hats

#### Scenario: A neighbour stated as unrecorded
- **WHEN** a bar declares `neighbour` with a value saying it is unrecorded
- **THEN** no `bar-without-neighbour` loop SHALL be reported
- **AND** the reason SHALL be that stating the gap is an honest answer, and a rule punishing it would train the line to be omitted

#### Scenario: A record with no bar
- **WHEN** a record carries no `### Bar` sub-block
- **THEN** `bar-without-neighbour` SHALL NOT be reported for it

### Requirement: Open loop derivation
The system SHALL derive every open loop from the records, the decision graph and the rule index, reporting each kind from an explicit list.

#### Scenario: The loop kinds
- **WHEN** the system enumerates the kinds of open loop it can report
- **THEN** the list SHALL be exactly: `constraint-unanswered`, `constraint-unasserted`, `decision-unguarded`, `rule-guards-dead-record`, `decision-on-superseded`, `record-unclassified`, `constraint-unmeasurable`, `measure-unasserted`, `measure-unexposed`, `bar-without-neighbour`
