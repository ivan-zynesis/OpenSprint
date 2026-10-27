# opsp-kanban-skill Specification

## Purpose
Define `/opsp:kanban`: the skill that lists the live board and renders it in a browser with git and a POSIX shell only, and the static template it fills (`DEC-BOARD-READ-BY-GIT`, `DS-RUNTIME-LESS-BOARD`). It reads only; cards move through `opensprint kanban` and the workflows that own each move. It reaches every adopter through `opensprint init` and `opensprint update`.
## Requirements
### Requirement: The board is listed and rendered with git, a shell and a browser
The system SHALL ship a skill whose playbooks list the live board and render it, using only git and a POSIX shell, and SHALL ship a static HTML template for the render.

#### Scenario: Listing
- **WHEN** the list playbook runs
- **THEN** it SHALL fetch the board branch and print each card's id, state and owner, reading the cards from the fetched commit without checking it out

#### Scenario: Rendering
- **WHEN** the render playbook runs
- **THEN** it SHALL write one HTML file holding the template, a metadata block naming the ref, the commit, the time it was read and the main checkout, and every card
- **AND** each card and the metadata SHALL be embedded as base64, so that no card text can break the page

#### Scenario: No board yet
- **WHEN** either playbook runs and the remote has no board
- **THEN** it SHALL say so and name `opensprint kanban init`

#### Scenario: The page needs nothing
- **WHEN** the rendered page is opened
- **THEN** it SHALL load nothing from the network, and need no server and no build step

#### Scenario: Read-only
- **WHEN** either playbook runs
- **THEN** it SHALL NOT write to the board, the working tree or the current branch

### Requirement: The page shows the card format the store writes
The template SHALL parse each card's frontmatter, summary, `## Milestones` and `## History`, and place every card in its column.

#### Scenario: A card's column
- **WHEN** the page places a card
- **THEN** it SHALL use the columns written into the template at generation, matching the card's state and, for `exploring`, whether anyone holds it

#### Scenario: Milestones on a card
- **WHEN** a card carries milestones
- **THEN** the page SHALL show how many of the live milestones are done, and the next open one
- **AND** it SHALL NOT show the milestones as part of the summary

#### Scenario: A card in flight with nobody holding it
- **WHEN** a card is `building`, `ready-for-attestation` or `attested` and has no owner
- **THEN** the page SHALL mark that it has no owner

### Requirement: The skill reaches adopters through init and update
The system SHALL write the kanban skill, its command and its template for every configured tool during `opensprint init` and `opensprint update`.

#### Scenario: Generated per tool
- **WHEN** the opsp layer is written for a tool
- **THEN** the template SHALL be written to `<tool dir>/skills/opensprint-kanban/board.html`
- **AND** the render playbook SHALL name that exact path

#### Scenario: Commands-only delivery
- **WHEN** delivery is commands only
- **THEN** the template SHALL still be written, because the command's playbook reads it

#### Scenario: Update writes the opsp layer
- **WHEN** `opensprint update` updates a tool
- **THEN** it SHALL write every opsp skill and command for that tool, as `init` does

#### Scenario: A workflow like the others
- **WHEN** the opsp workflows are enumerated
- **THEN** `kanban` SHALL be among them, invoked as `/opsp:kanban`

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

