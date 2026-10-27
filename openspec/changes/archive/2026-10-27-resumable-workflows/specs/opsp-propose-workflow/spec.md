## ADDED Requirements

### Requirement: Propose resumes from what the initiative holds
Propose SHALL read its input from the initiative on disk when started in a fresh session, and SHALL write only what the initiative does not already hold.

#### Scenario: Triage's strategy
- **WHEN** propose starts on an initiative with a `## Triage` section
- **THEN** it SHALL take the strategy triage worked out from that section rather than from a conversation

#### Scenario: Records already written
- **WHEN** the initiative already lists driver-specs or ADRs that exist on disk
- **THEN** propose SHALL treat them as confirmed and SHALL NOT recreate or rewrite them
- **AND** it SHALL present for confirmation, and write, only what is still missing

#### Scenario: Already proposed
- **WHEN** propose starts on an initiative already at `proposed` or later
- **THEN** it SHALL say that propose is done, name the next workflow, and stop
