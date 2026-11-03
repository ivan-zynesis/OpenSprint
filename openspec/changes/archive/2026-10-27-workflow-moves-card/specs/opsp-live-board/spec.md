## ADDED Requirements

### Requirement: Moving an initiative moves its card
The system SHALL move an initiative's card on the live board whenever `opensprint advance` moves the initiative, validating the card's own move against the same transition table.

#### Scenario: A legal move
- **WHEN** an initiative is advanced and its card shows the state it is leaving
- **THEN** the card SHALL move to the new state
- **AND** its history SHALL gain one line naming both states, who moved it, and the workflow

#### Scenario: A card that is missing
- **WHEN** an initiative is advanced and the board has no card for it
- **THEN** the system SHALL create the card from the initiative before moving it

#### Scenario: A card that disagrees
- **WHEN** an initiative is advanced and the card's state cannot make that move
- **THEN** the system SHALL leave the card unchanged and report the drift, naming `opensprint kanban seed --resync`
- **AND** the initiative SHALL still move

#### Scenario: Already there
- **WHEN** the card already shows the target state
- **THEN** the system SHALL push nothing

### Requirement: Claiming is arbitrated by the board
The system SHALL write a claim to the card before the initiative, and SHALL refuse to take a card someone else holds unless asked to take it over.

#### Scenario: Somebody else holds it
- **WHEN** `opensprint claim` names one person and the card names another
- **THEN** the system SHALL refuse, name who holds the card, and write neither the card nor the initiative

#### Scenario: Taking it over
- **WHEN** `opensprint claim --take-over` names a different person
- **THEN** the card and the initiative SHALL both name the new person, and the history SHALL say who it was taken from

#### Scenario: Two claims at once
- **WHEN** two people claim the same unheld card at the same time
- **THEN** one claim SHALL be written and the other SHALL be refused, never overwritten

#### Scenario: Putting it down
- **WHEN** `opensprint claim --release` runs
- **THEN** the card and the initiative SHALL both name nobody

### Requirement: The board never blocks a move
The system SHALL treat the board as a second write that can fail without undoing the first.

#### Scenario: No remote
- **WHEN** the project has no `origin` remote
- **THEN** the system SHALL move the initiative and say nothing about the board

#### Scenario: No board
- **WHEN** `origin` has no board
- **THEN** the system SHALL move the initiative and note that `opensprint kanban init` creates the board

#### Scenario: Unreachable
- **WHEN** the board cannot be read or written
- **THEN** the system SHALL move the initiative and warn that the card was not updated

#### Scenario: Offline on purpose
- **WHEN** `--no-board` is given
- **THEN** the system SHALL not contact the remote

### Requirement: Every workflow moves state through a command
No workflow SHALL change an initiative's state by editing the file, and a workflow that creates an initiative SHALL put its card on the board.

#### Scenario: Declining
- **WHEN** triage declines an item, or revives one
- **THEN** it SHALL run `opensprint advance` to `declined`, or to `exploring`

#### Scenario: A new backlog item
- **WHEN** backlog writes a new initiative
- **THEN** it SHALL run `opensprint kanban seed <initiative>`, which adds that one card and succeeds where there is no board

#### Scenario: One board
- **WHEN** any command or playbook reads or writes the live board
- **THEN** it SHALL use `origin/kanban`
