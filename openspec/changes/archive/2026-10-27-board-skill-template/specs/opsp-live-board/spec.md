## ADDED Requirements

### Requirement: The board's columns are named once, in code
The system SHALL define the live board's columns as data — Backlog, Planning, Dev, Attestation and Done — and SHALL write them into the board template when it is generated, so that the page and the code place a card in the same column.

#### Scenario: Which column a card is in
- **WHEN** a card is placed
- **THEN** `exploring` with no owner SHALL be Backlog, and `exploring` held by someone SHALL be Planning
- **AND** `proposed` and `building` SHALL be Dev; `ready-for-attestation` and `attested` SHALL be Attestation; `completed` and `declined` SHALL be Done

#### Scenario: Every state has a column
- **WHEN** the columns are enumerated against the initiative states
- **THEN** every state SHALL belong to exactly one column for each answer to whether it is held
