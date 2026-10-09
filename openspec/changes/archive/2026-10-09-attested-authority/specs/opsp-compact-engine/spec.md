## ADDED Requirements

### Requirement: A record carries a citation authority
The system SHALL compute, for each record, which authority a compiled claim about it may carry, so that the renderer knows whether a present-tense statement is licensed.

#### Scenario: The authorities
- **WHEN** the system computes a record's authority
- **THEN** it SHALL be `attested` or `decided`
- **AND** `observed` SHALL remain a property of a claim citing a path rather than of a record

#### Scenario: Attested requires both a date and evidence
- **WHEN** a record's `### Posture` carries `attested-on`
- **AND** its measure carries a populated `### Evidence`
- **THEN** its authority SHALL be `attested`

#### Scenario: A verdict without evidence
- **WHEN** a posture states a verdict and an attestation date but the measure carries no evidence
- **THEN** the authority SHALL be `decided`
- **AND** the reason SHALL be that a verdict nothing asserts is an opinion

#### Scenario: Evidence without attestation
- **WHEN** a measure carries evidence but no attestation date
- **THEN** the authority SHALL be `decided`

#### Scenario: A record with no measure
- **WHEN** a record carries no `## Measures` section
- **THEN** its authority SHALL be `decided`

#### Scenario: Authority is computed, never declared
- **WHEN** a record declares an authority in frontmatter
- **THEN** it SHALL be ignored
- **AND** the authority SHALL be derived from what the measure carries, so it cannot drift from the evidence

#### Scenario: Attestation ages without expiring
- **WHEN** an attestation date is far in the past
- **THEN** the authority SHALL still be `attested`
- **AND** the date SHALL be carried so a reader can judge it
- **AND** no threshold SHALL be applied, because none has been decided

### Requirement: The plan reports each record's authority
The system SHALL carry each staged record's authority in `compact plan --json`, alongside its id and path.

#### Scenario: Authority in the plan
- **WHEN** `compact plan --json` stages a record
- **THEN** the entry SHALL carry `authority`
- **AND** SHALL carry the verdict, attester and date where the record states them
