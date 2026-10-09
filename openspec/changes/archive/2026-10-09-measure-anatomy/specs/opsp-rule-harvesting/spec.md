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

## MODIFIED Requirements

### Requirement: Open loop derivation
The system SHALL derive open loops from the index and the decision graph, and SHALL NOT infer them from record content — **except for the measure anatomy, which is content by definition** and is read from the record's `## Measures` section.

#### Scenario: The loop kinds
- **WHEN** the system enumerates the kinds of open loop it can report
- **THEN** the list SHALL be exactly: `constraint-unanswered`, `constraint-unasserted`, `decision-unguarded`, `rule-guards-dead-record`, `decision-on-superseded`, `record-unclassified`, `constraint-unmeasurable`, `measure-unasserted`, `measure-unexposed`, `bar-without-neighbour`, `record-without-objective`

#### Scenario: A constraint no decision answers
- **WHEN** an active driver-spec has no active decision whose `depends-on` includes it
- **THEN** the system SHALL report a `constraint-unanswered` loop against that driver-spec's hats

#### Scenario: A constraint whose decisions are unguarded
- **WHEN** an active driver-spec is answered by at least one active decision
- **AND** no rule cites any of those decisions
- **THEN** the system SHALL report a `constraint-unasserted` loop against that driver-spec's hats

#### Scenario: Constraint coverage is transitive
- **WHEN** a driver-spec is not cited by any rule directly
- **AND** a decision depending on it is cited by a rule
- **THEN** the driver-spec SHALL NOT be reported as unasserted

#### Scenario: A decision no rule cites
- **WHEN** an active decision is cited by no rule file
- **THEN** the system SHALL report a `decision-unguarded` loop against that decision's hats

#### Scenario: A rule guarding a dead record
- **WHEN** a rule file cites a record whose status is `superseded` or `deprecated`
- **THEN** the system SHALL report a `rule-guards-dead-record` loop naming both the rule file and the record

#### Scenario: A decision resting on a superseded ancestor
- **WHEN** an active decision's `depends-on` includes a record whose status is `superseded` or `deprecated`
- **THEN** the system SHALL report a `decision-on-superseded` loop
- **AND** the report SHALL direct the reader to `/opsp:rebuild-assess`

#### Scenario: Loops are routed to the accountable hat
- **WHEN** any open loop is reported
- **THEN** it SHALL be attributed to every hat the subject record declares
- **AND** a loop against an unassigned record SHALL be reported without a hat

## ADDED Requirements

### Requirement: A record its hat cannot select is reported
The system SHALL report a record that declares no `objective` where every section of one of its hats that could otherwise take it filters on one, because such a record is invisible in that view rather than merely unclassified.

#### Scenario: Every section filters on objective
- **WHEN** an active record declares no `objective`
- **AND** every section of one of its hats either filters on `objective` or accepts none of the record's roles
- **THEN** the system SHALL report a `record-without-objective` loop naming that hat

#### Scenario: An unfiltered section can take it
- **WHEN** a hat has a section that filters on no objective
- **AND** that section's roles accept the record
- **THEN** `record-without-objective` SHALL NOT be reported for that hat

#### Scenario: The record declares an objective
- **WHEN** a record declares an `objective`
- **THEN** `record-without-objective` SHALL NOT be reported for it

#### Scenario: No sections supplied
- **WHEN** the caller supplies no sections for a hat
- **THEN** `record-without-objective` SHALL NOT be reported for that hat
- **AND** a caller unaware of sections SHALL see no new loops
