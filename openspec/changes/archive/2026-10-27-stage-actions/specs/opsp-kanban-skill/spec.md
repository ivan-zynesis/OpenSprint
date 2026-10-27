## ADDED Requirements

### Requirement: A card offers only the moves the state machine allows
The system SHALL derive each card's moves from the initiative transition table and write them into the board template. Forward is one continue move per state; backward is one escalation per backward transition.

#### Scenario: Continue
- **WHEN** a card's moves are derived
- **THEN** its continue move SHALL be the transition from its state to a later state, excluding `declined`
- **AND** it SHALL name the workflow that performs the transition, its hat and when it fires

#### Scenario: Backlog's way forward
- **WHEN** a card is `exploring` and nobody holds it
- **THEN** its continue move SHALL be triage, which picks the card up and claims it

#### Scenario: Escalate
- **WHEN** a card's moves are derived
- **THEN** each transition from its state to an earlier state SHALL be an escalation, naming its workflow, hat, target state and when it fires

#### Scenario: Declining is not a button
- **WHEN** a card is `exploring`
- **THEN** no move SHALL lead to `declined`, because declining is one of triage's outcomes

#### Scenario: Nothing to do
- **WHEN** a card is `completed`
- **THEN** it SHALL offer no move

### Requirement: A button copies the command that starts the move's workflow
The system SHALL make each move a button that copies a command to the clipboard, and never moves the card.

#### Scenario: The launch command
- **WHEN** a move's button is clicked on a tool that can start a session with a prompt
- **THEN** the copied command SHALL change to the main checkout, find the worktree holding the card's branch or add one from the local or remote branch, and start a session there with the move's workflow invoked on the card

#### Scenario: A tool with no launcher
- **WHEN** the tool the board was generated for documents no way to start a session with a prompt
- **THEN** the button SHALL copy the prompt alone

#### Scenario: Naming the workflow
- **WHEN** the board is generated for a tool whose adapter names its commands, and commands are delivered
- **THEN** the prompt SHALL invoke the generated command
- **AND** otherwise it SHALL name the skill

#### Scenario: Hover
- **WHEN** a person hovers over a move's button
- **THEN** it SHALL show the invocation, the hat, the move and where the card lands
