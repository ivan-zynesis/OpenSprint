## ADDED Requirements

### Requirement: Attestation reviews the documentation
The workflow SHALL review whether existing documentation is adequate and complete for what shipped, and improve it where it is not.

#### Scenario: What is asked
- **WHEN** the workflow reviews documentation
- **THEN** it SHALL ask whether anything describes what the initiative changed in terms an outsider would follow
- **AND** whether anything already published is now wrong because of it
- **AND** whether an accepted exposure needs saying to someone who does not read driver-specs

#### Scenario: Not a question of authorship
- **WHEN** the workflow judges documentation
- **THEN** it SHALL judge adequacy and completeness
- **AND** it SHALL NOT treat documentation as owned by any hat by virtue of being documentation

#### Scenario: Urging rather than writing silently
- **WHEN** the workflow has produced an account
- **THEN** it SHALL say where it belongs and write only on confirmation
- **AND** the operator SHALL decide what an external reader is told

#### Scenario: Thin documentation the operator declines to improve
- **WHEN** documentation is inadequate and the operator declines to improve it now
- **THEN** the workflow SHALL record that as a finding
- **AND** it SHALL NOT silently accept it

### Requirement: The documentation directory is the one free write target
The workflow SHALL write prose only to the configured documentation directory, and SHALL continue to bound its writes inside the surrogate.

#### Scenario: Where prose may be written
- **WHEN** the workflow writes an external-facing account
- **THEN** it SHALL write to the configured documentation directory
- **AND** it SHALL use the operator's directory where they name a different one serving the same purpose

#### Scenario: The record bound is unchanged
- **WHEN** the workflow verifies it stayed in bounds
- **THEN** every change outside the documentation directory SHALL fall inside `## Measures` or `## Attestation`
- **AND** a change to a Statement, a Decision, a Rationale or frontmatter SHALL be reverted
