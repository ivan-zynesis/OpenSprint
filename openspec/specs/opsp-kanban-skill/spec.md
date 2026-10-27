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

