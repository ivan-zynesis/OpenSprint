## ADDED Requirements

### Requirement: The bar is written at the proposal stage
The system SHALL instruct the proposal workflow to write the bar when it creates a driver-spec, so that the acceptance criterion is stated before work begins rather than during it.

#### Scenario: Propose writes the bar
- **WHEN** the proposal workflow creates a driver-spec
- **THEN** the instruction SHALL state that this is where the bar is written, ex ante

#### Scenario: What fires without it
- **WHEN** the instruction explains why
- **THEN** it SHALL name the open loop reported for a goal with no measures
- **AND** it SHALL name the loop reported for a record with no role

#### Scenario: The operator states the bar
- **WHEN** a bar is needed
- **THEN** the instruction SHALL require asking the operator rather than inventing one
