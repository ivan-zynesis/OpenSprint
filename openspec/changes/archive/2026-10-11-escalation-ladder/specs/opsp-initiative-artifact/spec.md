## ADDED Requirements

### Requirement: Work falls back to the rung that moved
The system SHALL allow an initiative to return to an earlier state when an artifact above the current work turns out to be wrong, and the state it returns to SHALL be determined by which artifact moved.

#### Scenario: The strategy moved
- **WHEN** a decision the initiative rests on must be superseded
- **THEN** the initiative SHALL return to `proposed`
- **AND** the reason SHALL be that a restated strategy has a bar nothing has been built against

#### Scenario: The plan moved
- **WHEN** only the milestones must change
- **THEN** the initiative SHALL remain at `building`
- **AND** the decision trail SHALL be left alone

#### Scenario: Falling back from the handoff
- **WHEN** an initiative in the handoff state must reopen
- **THEN** moves to both `building` and `proposed` SHALL be legal
- **AND** a refusal from the handoff state SHALL name every legal destination

#### Scenario: Two routes to the same state mean different things
- **WHEN** the transitions from the handoff state to `building` are enumerated
- **THEN** there SHALL be one for a requested change and one for re-planning
- **AND** each SHALL name the workflow that performs it
