## ADDED Requirements

### Requirement: Work waiting on a person has its own column
The system SHALL render initiatives in the handoff state in a section of their own rather than among work in progress, so that a reader can tell work that needs time from work that needs somebody to put a different hat on.

#### Scenario: The handoff section
- **WHEN** the board is rendered
- **THEN** it SHALL contain a section for the handoff state
- **AND** that section SHALL render whether or not anything is in it

#### Scenario: What the section says
- **WHEN** the handoff section is rendered
- **THEN** its description SHALL state that it waits on a person rather than on work
- **AND** it SHALL name the workflow that clears it

#### Scenario: The assurance gradient covers it
- **WHEN** an exposure is mitigated by an initiative in the handoff state
- **THEN** the roadmap SHALL describe that assurance level
