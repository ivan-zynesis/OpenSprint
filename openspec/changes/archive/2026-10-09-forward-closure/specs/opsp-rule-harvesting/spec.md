## ADDED Requirements

### Requirement: An exposure with no planned work is reported
The system SHALL report an exposure that names no mitigating work, because an exposure pointing at nothing is a confession rather than a managed risk.

#### Scenario: An exposure with no pointer
- **WHEN** an active record carries a populated `### Exposure`
- **AND** that block names no `mitigated-by`
- **THEN** the system SHALL report an `exposure-unmitigated` loop against that record's hats

#### Scenario: An exposure naming an initiative
- **WHEN** an exposure names `mitigated-by`
- **THEN** `exposure-unmitigated` SHALL NOT be reported
- **AND** this SHALL hold even where the named initiative does not exist, because a broken reference is a different finding from an absent plan

#### Scenario: A record with no exposure
- **WHEN** a record carries no `### Exposure`
- **THEN** `exposure-unmitigated` SHALL NOT be reported for it
- **AND** `measure-unexposed` SHALL remain the loop that covers it

#### Scenario: Reading the pointer
- **WHEN** the system reads `mitigated-by` from an exposure block
- **THEN** it SHALL accept a bare, bulleted or bolded line
- **AND** the label SHALL match case-insensitively
- **AND** trailing punctuation SHALL be stripped from the value
