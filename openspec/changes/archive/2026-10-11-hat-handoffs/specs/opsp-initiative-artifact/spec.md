## ADDED Requirements

### Requirement: A transition declares the hat it must be made wearing
The system SHALL record, for each transition, the accountability required to perform it and whether performing it means setting down a different hat — and SHALL refuse a handoff until that accountability is stated.

#### Scenario: Every transition names a hat
- **WHEN** the transitions are enumerated
- **THEN** each SHALL name at least one hat from the registry

#### Scenario: A handoff is refused without the hat
- **WHEN** a transition marked as a handoff is requested
- **AND** no accountability is named
- **THEN** the system SHALL refuse the move
- **AND** it SHALL name the accountabilities that would be accepted

#### Scenario: A handoff is refused in the wrong hat
- **WHEN** a transition marked as a handoff is requested with an accountability it does not accept
- **THEN** the system SHALL refuse the move and say which was offered

#### Scenario: A move that is not a handoff
- **WHEN** a transition not marked as a handoff is requested
- **THEN** no accountability need be named
- **AND** the hat SHALL still be reported with the move

#### Scenario: The hat depends on direction, not on state
- **WHEN** two transitions leave and enter the same state in opposite directions
- **THEN** each SHALL declare its own hat
- **AND** they MAY differ

#### Scenario: Leaving the handoff state
- **WHEN** any transition out of the handoff state is performed
- **THEN** it SHALL NOT be marked as a handoff
- **AND** the reason SHALL be that the accountability already changed on the way in
