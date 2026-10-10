## ADDED Requirements

### Requirement: An initiative carries its attestation
The system SHALL read an `## Attestation` section from an initiative, carrying the reversibility of the change, its blast radius, and who holds what after the merge.

#### Scenario: Reading the section
- **WHEN** an initiative carries an `## Attestation` section
- **THEN** the system SHALL read `door`, `blast-radius` and a RACI table from it
- **AND** an initiative without the section SHALL parse with the attestation absent

#### Scenario: The door vocabulary
- **WHEN** an initiative states `door`
- **THEN** the accepted values SHALL be `one-way` and `two-way`, by explicit lookup
- **AND** any other value SHALL be read as absent rather than interpreted

#### Scenario: A RACI row handled by a system
- **WHEN** a RACI row names a system under **Handled by**
- **THEN** the row SHALL be read as automated
- **AND** empty R, A, C and I cells SHALL NOT be treated as missing

#### Scenario: A RACI row not handled by a system
- **WHEN** a RACI row is not handled by a system
- **THEN** its R, A, C and I values SHALL be read
- **AND** a dash, an em-dash or an empty cell SHALL all be read as absent

#### Scenario: A malformed table
- **WHEN** a RACI table has fewer columns than expected, or none
- **THEN** the rows it does carry SHALL be read
- **AND** parsing SHALL NOT fail
