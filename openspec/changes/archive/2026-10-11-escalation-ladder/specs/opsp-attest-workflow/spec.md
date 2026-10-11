## ADDED Requirements

### Requirement: Attestation can send work back
The system SHALL instruct an attesting agent that finding the change should not go forward is a distinct outcome from recording an unmet bar, and SHALL offer an exit for each.

#### Scenario: A missed bar is still a complete attestation
- **WHEN** a bar is recorded as not met, with an exposure and a mitigation
- **THEN** the instruction SHALL state that this does not by itself stop the close

#### Scenario: The work is missing
- **WHEN** the plan and the strategy hold and the work does not
- **THEN** the instruction SHALL have the agent request a change, returning the initiative to `building`
- **AND** it SHALL state that nothing is superseded

#### Scenario: The strategy was not what was meant
- **WHEN** the goal holds and what was decided about reaching it does not
- **THEN** the instruction SHALL route to the strategy rung

#### Scenario: Closing and reopening is refused
- **WHEN** the agent would advance to `attested` and then send the work back
- **THEN** the instruction SHALL forbid it
- **AND** the reason SHALL be that a judgement which immediately reopens was not finished
