## MODIFIED Requirements

### Requirement: A measure with no evidence is reported
The system SHALL report a measure whose posture claims the bar was **met** but which carries no `### Evidence`, because a claim of success with nothing asserting it is an opinion.

#### Scenario: Met with no evidence
- **WHEN** an active record's `### Posture` states a verdict of `met`
- **AND** the measure carries no populated `### Evidence`
- **THEN** the system SHALL report a `measure-unasserted` loop against that record's hats

#### Scenario: Met with evidence
- **WHEN** the verdict is `met` and evidence is present
- **THEN** no `measure-unasserted` loop SHALL be reported
- **AND** the system SHALL NOT inspect whether the evidence is adequate

#### Scenario: A verdict other than met
- **WHEN** the verdict is `partially met`, `not met` or `cannot assess`
- **THEN** `measure-unasserted` SHALL NOT be reported
- **AND** the reason SHALL be that evidence supports a claim of success, which is not being made

#### Scenario: No posture at all
- **WHEN** a measure carries no `### Posture`
- **THEN** `measure-unasserted` SHALL NOT be reported
- **AND** `measure-unattested` SHALL cover it instead

### Requirement: A measure with no exposure is reported
The system SHALL report a measure whose posture is anything other than **met** but which carries no `### Exposure`, because a bar that was not met with nothing recorded about what remains at risk is an unanswered question.

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

## ADDED Requirements

### Requirement: A measure nobody has judged is reported
The system SHALL report a measure that states something to attest but carries no posture, because "this has never been judged" is a different and more urgent finding than "this lacks evidence".

#### Scenario: Measures with no posture
- **WHEN** an active record carries a populated `## Measures` section
- **AND** that section carries no populated `### Posture`
- **THEN** the system SHALL report a `measure-unattested` loop against that record's hats
- **AND** it SHALL be reported once, not alongside `measure-unasserted` or `measure-unexposed`

#### Scenario: No measures at all
- **WHEN** a record carries no populated `## Measures`
- **THEN** `measure-unattested` SHALL NOT be reported
- **AND** `constraint-unmeasurable` SHALL remain the loop that covers it

#### Scenario: An unrecognised verdict
- **WHEN** a posture states a verdict outside the accepted vocabulary
- **THEN** the system SHALL report it rather than guessing which branch applies
- **AND** the accepted values SHALL be named

### Requirement: The verdict vocabulary is explicit
The system SHALL accept exactly four verdicts, looked up by name.

#### Scenario: The vocabulary
- **WHEN** the system reads a posture verdict
- **THEN** the accepted values SHALL be `met`, `partially met`, `not met` and `cannot assess`
- **AND** comparison SHALL ignore case and surrounding whitespace
- **AND** no other value SHALL be interpreted
