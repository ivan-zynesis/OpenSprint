## ADDED Requirements

### Requirement: Authored and compiled documents are distinguished by what they claim
The system SHALL distinguish documents compiled from the record, which claim what is true now, from documents authored by a person, which claim either what was thought at a time or where to find what is true.

#### Scenario: A compiled document
- **WHEN** a document states what the system currently is
- **THEN** it SHALL be compiled from the records
- **AND** SHALL be covered by `compact check`

#### Scenario: An authored document stating history
- **WHEN** a document records what was thought at a point in time
- **THEN** it SHALL carry the date it speaks for
- **AND** SHALL NOT be rewritten to agree with the present
- **AND** SHALL NOT be treated as stale merely because the present differs

#### Scenario: An authored document as an entry point
- **WHEN** a document orients a reader who has not seen the project
- **THEN** it SHALL point at the compiled views for what the system is
- **AND** SHALL NOT restate their content

#### Scenario: The drift case
- **WHEN** a document states current truth and is not compiled
- **THEN** it SHALL be either compiled or converted to one of the two authored forms
- **AND** SHALL NOT be left claiming current truth without a check

### Requirement: The origin story is preserved rather than corrected
The system SHALL keep the project's founding reasoning intact, because how the thinking moved is not recoverable from the records it produced.

#### Scenario: Superseded reasoning
- **WHEN** a founding claim is no longer how the project sees things
- **THEN** it SHALL be left standing as what was believed then
- **AND** what followed SHALL be noted alongside rather than replacing it

#### Scenario: Pointing forward
- **WHEN** the origin story refers to something now recorded
- **THEN** it SHALL name the record that holds it
