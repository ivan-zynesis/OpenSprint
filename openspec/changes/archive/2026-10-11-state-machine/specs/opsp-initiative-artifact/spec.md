## ADDED Requirements

### Requirement: The handoff from building to judgement is a state
The system SHALL provide a state meaning every milestone is done and nothing has been judged, so that the moment accountability moves from the building hats to the judging hats is recorded rather than assumed.

#### Scenario: The state exists between building and attested
- **WHEN** the state vocabulary is enumerated
- **THEN** it SHALL contain a handoff state between `building` and `attested`

#### Scenario: Work finished but never handed over
- **WHEN** an initiative declares `building`
- **AND** every live milestone is done
- **THEN** the system SHALL report a contradiction naming the handoff state

#### Scenario: Handed over with work outstanding
- **WHEN** an initiative declares the handoff state and milestones remain
- **THEN** the system SHALL report how many are outstanding

#### Scenario: Handed over having built nothing
- **WHEN** an initiative declares the handoff state and has no milestones
- **THEN** the system SHALL report that nothing was built

### Requirement: State transitions are performed by a command
The system SHALL move an initiative between states through a command that validates the move, writes the record and regenerates the board — and workflows SHALL use it rather than editing the field.

#### Scenario: Every legal move is declared
- **WHEN** the transitions are enumerated
- **THEN** each SHALL name the state it comes from, the state it goes to, the workflow that performs it, and when it fires

#### Scenario: An illegal move is refused
- **WHEN** a move is requested that the table does not declare
- **THEN** the system SHALL refuse it
- **AND** it SHALL name the moves that are legal from the current state

#### Scenario: Skipping the handoff
- **WHEN** a move is requested from `building` directly to `attested`
- **THEN** the system SHALL refuse it

#### Scenario: A state outside the vocabulary
- **WHEN** a move is requested to a name that is not a state
- **THEN** the system SHALL refuse it and list the accepted states

#### Scenario: An initiative with no state
- **WHEN** an initiative declares no state
- **THEN** any state SHALL be reachable
- **AND** the reason SHALL be that setting one is a repair rather than a move

#### Scenario: A legal move into a contradicted state
- **WHEN** a legal move is made and the content contradicts the new state
- **THEN** the move SHALL be written
- **AND** the contradiction SHALL be reported beside it rather than blocking it

#### Scenario: Re-planning reopens a handed-over initiative
- **WHEN** re-planning adds work to an initiative in the handoff state
- **THEN** a move back to `building` SHALL be legal

#### Scenario: Closing requires having been judged
- **WHEN** an initiative is moved to `completed`
- **THEN** the only legal origin SHALL be `attested`

#### Scenario: Writing the state leaves the rest of the record alone
- **WHEN** a transition is written to an initiative
- **THEN** only the frontmatter state field SHALL change
- **AND** a record whose prose contains the same text SHALL be unaffected
