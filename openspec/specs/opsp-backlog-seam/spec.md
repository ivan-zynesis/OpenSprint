# opsp-backlog-seam Specification

## Purpose

Define how open loops reach the person who decides what to do about them, and how an initiative records what it set out to close.

Facilitation divides in two. Noticing that a constraint has no decision, or that a decision has no guard, is mechanical and already encoded. Deciding which of those gaps is worth work now is judgement, and it stays with a human.

So this is a seam rather than a machine: the existing explore and propose workflows carry the triage, and nothing new sits between the harvest and the decision. No loop state is kept, because a gap exists exactly while the harvest reports it.
## Requirements
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

### Requirement: The backlog seam has two tools
The system SHALL provide `/opsp:backlog` to persist a brainstorm and `/opsp:triage` to pick it up, so that the step from idea to proposal has a resting point.

#### Scenario: Lifecycle order
- **WHEN** the OPSP workflows are enumerated
- **THEN** `opsp-backlog` and `opsp-triage` SHALL appear between `opsp-explore` and `opsp-propose`

#### Scenario: Backlog writes one artifact
- **WHEN** `/opsp:backlog` persists a brainstorm
- **THEN** it SHALL write an initiative at `state: exploring` carrying an objective and a goal
- **AND** it SHALL NOT write driver-specs, ADRs or milestones

#### Scenario: Backlog stops
- **WHEN** the initiative is written
- **THEN** the workflow SHALL stop
- **AND** SHALL NOT offer to proceed to propose

#### Scenario: Both tools own the worktree
- **WHEN** either tool runs outside the initiative's branch
- **THEN** it SHALL create or switch to that worktree before writing
- **AND** SHALL NOT write on the default branch

#### Scenario: Triage has three outcomes
- **WHEN** `/opsp:triage` picks up a backlog item
- **THEN** it SHALL advance, decline, or return it
- **AND** declining SHALL record why

#### Scenario: Triage does not formalize
- **WHEN** triage advances an item
- **THEN** it SHALL hand to `/opsp:propose`
- **AND** SHALL NOT write driver-specs, ADRs or milestones itself

#### Scenario: Triage is not a remediation workflow
- **WHEN** the system is asked whether a remediation workflow exists
- **THEN** there SHALL be none
- **AND** triage SHALL be the thinking half of the propose stage rather than a mechanism for closing open loops

### Requirement: Propose does not duplicate an initiative
The system SHALL have `/opsp:propose` fill in an existing initiative rather than creating a second.

#### Scenario: An initiative already exists
- **WHEN** propose is given an initiative at `state: exploring`
- **THEN** it SHALL add Strategy and Measure to that initiative and advance it
- **AND** SHALL NOT create a second initiative
- **AND** SHALL NOT rewrite its Objective or Goal

#### Scenario: Arriving straight from explore
- **WHEN** no initiative exists yet
- **THEN** propose SHALL create one, as before

