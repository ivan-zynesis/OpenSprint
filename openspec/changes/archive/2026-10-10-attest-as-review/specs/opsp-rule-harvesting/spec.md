## MODIFIED Requirements

### Requirement: Open loop derivation
The system SHALL derive open loops from the index and the decision graph, and SHALL NOT infer them from record content — **except for the measure anatomy, which is content by definition** and is read from the record's `## Measures` section.

#### Scenario: The loop kinds
- **WHEN** the system enumerates the kinds of open loop it can report
- **THEN** the list SHALL be exactly: `constraint-unanswered`, `constraint-unasserted`, `decision-unguarded`, `rule-guards-dead-record`, `decision-on-superseded`, `record-unclassified`, `constraint-unmeasurable`, `measure-unasserted`, `measure-unexposed`, `bar-without-neighbour`, `record-without-objective`, `strategy-unimplemented`, `exposure-unmitigated`, `measure-unattested`

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

### Requirement: The posture verdict vocabulary is explicit
The system SHALL accept exactly four verdicts, looked up by name, because which branch a verdict takes decides what else the measure owes.

#### Scenario: The vocabulary
- **WHEN** the system reads a posture verdict
- **THEN** the accepted values SHALL be `met`, `partially met`, `not met` and `cannot assess`
- **AND** comparison SHALL ignore case and surrounding whitespace
- **AND** no other value SHALL be interpreted

#### Scenario: Only a claim of success owes evidence
- **WHEN** the verdict is `met`
- **THEN** the measure SHALL owe evidence
- **AND** every other verdict SHALL owe an exposure instead

### Requirement: A measure nobody has judged is reported
The system SHALL report a measure that states something to attest but carries no posture, because "this has never been judged" is a different and more urgent finding than "this lacks evidence".

#### Scenario: Measures with no posture
- **WHEN** an active record carries a populated `## Measures` section
- **AND** that section carries no populated `### Posture`
- **THEN** the system SHALL report a `measure-unattested` loop against that record's hats
- **AND** it SHALL be reported once, not alongside `measure-unasserted` or `measure-unexposed`

#### Scenario: An unrecognised verdict
- **WHEN** a posture states a verdict outside the accepted vocabulary
- **THEN** the system SHALL report `measure-unattested` rather than guessing which branch applies
- **AND** the accepted values SHALL be named in the report

#### Scenario: No measures at all
- **WHEN** a record carries no populated `## Measures`
- **THEN** `measure-unattested` SHALL NOT be reported
- **AND** `constraint-unmeasurable` SHALL remain the loop that covers it

### Requirement: A measure claiming success with no evidence is reported
The system SHALL report a measure whose posture claims the bar was met but which carries no `### Evidence`, because a claim of success with nothing asserting it is an opinion.

#### Scenario: Met with no evidence
- **WHEN** an active record's posture states a verdict of `met`
- **AND** the measure carries no populated `### Evidence`
- **THEN** the system SHALL report a `measure-unasserted` loop against that record's hats

#### Scenario: Met with evidence
- **WHEN** the verdict is `met` and evidence is present
- **THEN** no `measure-unasserted` loop SHALL be reported
- **AND** the system SHALL NOT inspect whether the evidence is adequate, which is a judgement rather than a check

#### Scenario: A verdict other than met
- **WHEN** the verdict is `partially met`, `not met` or `cannot assess`
- **THEN** `measure-unasserted` SHALL NOT be reported
- **AND** the reason SHALL be that evidence supports a claim of success, which is not being made

### Requirement: A measure that fell short with no exposure is reported
The system SHALL report a measure whose posture is anything other than met but which carries no `### Exposure`, because a bar that was not met with nothing recorded about what remains at risk is an unanswered question.

#### Scenario: Not met, with nothing exposed
- **WHEN** the verdict is `partially met`, `not met` or `cannot assess`
- **AND** the measure carries no populated `### Exposure`
- **THEN** the system SHALL report a `measure-unexposed` loop against that record's hats

#### Scenario: Met
- **WHEN** the verdict is `met`
- **THEN** `measure-unexposed` SHALL NOT be reported
- **AND** an exposure MAY still be recorded alongside a passing verdict

#### Scenario: Cannot assess is a complete attestation
- **WHEN** the verdict is `cannot assess` and an exposure names what the evidence could not answer
- **THEN** no loop SHALL be reported for that measure

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
- **THEN** `bar-without-neighbour` SHALL NOT be reported
