## ADDED Requirements

### Requirement: Explore loads the backlog on entry
The `/opsp:explore` skill SHALL load open loops as part of its surrogate entry, so that the operator deciding what to work on sees what does not line up without having to ask.

#### Scenario: Entering explore
- **WHEN** `/opsp:explore` loads the surrogate
- **THEN** it SHALL obtain open loops by running `opensprint compact loops --json`
- **AND** SHALL present them grouped by the hat accountable for each

#### Scenario: No open loops
- **WHEN** the harvest reports no open loops
- **THEN** explore SHALL say so and continue
- **AND** SHALL NOT treat the absence as an error

#### Scenario: The command is unavailable
- **WHEN** `opensprint compact loops` cannot run, because the project has no surrogate or the CLI is absent
- **THEN** explore SHALL continue without the backlog
- **AND** SHALL NOT fail the session

### Requirement: Loops are presented, never prioritised
The system SHALL present open loops without recommending which to act on.

#### Scenario: Presenting the backlog
- **WHEN** open loops are presented during explore
- **THEN** they SHALL be grouped by accountable hat
- **AND** the agent SHALL NOT rank them, score them, or recommend one over another
- **AND** choosing what to work on SHALL remain the operator's decision

#### Scenario: A deliberate absence is not a gap
- **WHEN** the backlog includes a hat with no records, or a constraint a recorded decision deliberately leaves open
- **THEN** the agent SHALL state that the absence may be intentional and cite the record saying so
- **AND** SHALL NOT propose work to close something a decision already settled

### Requirement: An initiative records the loops it addresses
The `/opsp:propose` skill SHALL record, in the initiative descriptor, which open loops the initiative sets out to close.

#### Scenario: Proposing from the backlog
- **WHEN** an initiative is created after triaging one or more open loops
- **THEN** the descriptor SHALL contain an `## Addresses` section
- **AND** each entry SHALL name the loop kind and the record it concerns

#### Scenario: Proposing without the backlog
- **WHEN** an initiative does not arise from an open loop
- **THEN** the `## Addresses` section SHALL be omitted
- **AND** its absence SHALL NOT be an error

#### Scenario: Addresses is prose, not frontmatter
- **WHEN** the addressed loops are recorded
- **THEN** they SHALL appear in the descriptor body
- **AND** SHALL NOT be added to the descriptor's YAML frontmatter

### Requirement: No loop state is kept
The system SHALL NOT record whether an open loop has been resolved.

#### Scenario: A gap that was closed
- **WHEN** work closes a gap, for example by adding a rule that cites a previously unguarded decision
- **THEN** the next harvest SHALL simply not report that loop
- **AND** nothing SHALL mark the loop resolved, because the harvest is the source of truth

#### Scenario: A gap that reopens
- **WHEN** a rule that closed a loop is later deleted
- **THEN** the next harvest SHALL report the loop again
- **AND** no stale "resolved" record SHALL contradict it

### Requirement: Triage has one route
The system SHALL direct a reader of the backlog to the existing triage workflows rather than to a dedicated remediation mechanism.

#### Scenario: Reading the backlog directly
- **WHEN** `opensprint compact loops` reports one or more loops
- **THEN** the output SHALL state that triage happens through `/opsp:explore` and `/opsp:propose`

#### Scenario: No remediation workflow
- **WHEN** the system offers a way to act on an open loop
- **THEN** it SHALL be `/opsp:explore` followed by `/opsp:propose`
- **AND** no separate remediation workflow SHALL be introduced
