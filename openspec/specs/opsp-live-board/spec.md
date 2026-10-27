# opsp-live-board Specification

## Purpose
Define the live board: in-flight initiative state on a dedicated remote branch, one plain-text card per initiative, that every checkout reads the same way whichever branch its work is on (`DS-LIVE-BOARD`, `DEC-BOARD-ON-REMOTE-BRANCH`).

It runs beside the compiled `BOARD.md` rather than replacing it. Cards are written only through `opensprint`, as fast-forward commits that never force (`DEC-CARD-WRITES-THROUGH-CLI`); reading them for people is a git playbook, not a command (`DEC-BOARD-READ-BY-GIT`).
## Requirements
### Requirement: In-flight board state lives on one dedicated remote branch
The system SHALL keep the live board on a branch named `kanban` on a remote, `origin` unless another is named. The branch SHALL hold only the board: a `README.md` and one file per card under `cards/`.

#### Scenario: The layout
- **WHEN** the board is created
- **THEN** the branch SHALL hold `README.md`, saying it is a board rather than code and is changed only through opensprint
- **AND** each initiative's card SHALL live at `cards/<id>.md`

#### Scenario: The branch shares no history with code
- **WHEN** the board is created
- **THEN** its first commit SHALL have no parent

#### Scenario: Read without checking out
- **WHEN** the board is read
- **THEN** the system SHALL fetch the branch and read its cards from the commit, leaving every worktree's checkout and index as they were

### Requirement: A card is plain text with a fixed shape
The system SHALL write each card as frontmatter, then a summary, a `## Milestones` section and a `## History` section.

#### Scenario: The frontmatter
- **WHEN** a card is written
- **THEN** its frontmatter SHALL carry `id`, `title`, `state`, `created`, `updated` and `branch`, and `owner` when somebody holds the card

#### Scenario: Milestones carry their stage
- **WHEN** a card carries an initiative's milestones
- **THEN** each SHALL be one line naming its stage, its name and its description
- **AND** the stage SHALL be one of `todo`, `specifying`, `building`, `review`, `done` or `superseded`

#### Scenario: History grows by one line per write
- **WHEN** a write changes a card
- **THEN** it SHALL append one line to `## History` with the time, what changed and who changed it
- **AND** it SHALL keep every earlier line

#### Scenario: A card written before milestones were on cards
- **WHEN** a card with no `## Milestones` section is read
- **THEN** the system SHALL read it as having no milestones rather than failing

#### Scenario: Round trip
- **WHEN** a card is read and written back unchanged
- **THEN** the text SHALL be identical

### Requirement: Writes fast-forward and never force
The system SHALL build each write as a new commit on top of the board it read, and push it as a fast-forward. Where the push is rejected because the board moved, it SHALL re-read the board and re-apply the change.

#### Scenario: Losing a race
- **WHEN** another writer pushes to the board between this write's read and its push
- **THEN** the system SHALL re-read the board and re-apply its change on top
- **AND** the other writer's change SHALL survive

#### Scenario: Never forced
- **WHEN** the system pushes to the board
- **THEN** it SHALL NOT force the push

#### Scenario: A board that keeps moving
- **WHEN** the change cannot be applied within a bounded number of attempts
- **THEN** the system SHALL stop and say so, writing nothing

### Requirement: The board is created and seeded in one step
The system SHALL provide `opensprint kanban init`, which creates the board and gives a card to every initiative this machine knows, in one commit.

#### Scenario: Creating the board
- **WHEN** `opensprint kanban init` runs and the remote has no board
- **THEN** the system SHALL create the branch with the README and one card per initiative
- **AND** it SHALL read initiatives from the checkout and from every `opsp/<id>` branch, preferring copies the way the cross-branch board does

#### Scenario: A board already exists
- **WHEN** `opensprint kanban init` runs and the remote already has a board
- **THEN** the system SHALL change nothing and point at `opensprint kanban seed`

#### Scenario: A card's starting state
- **WHEN** a card is seeded from an initiative
- **THEN** it SHALL carry the initiative's state, or `completed` where the initiative declares no state and has status `completed`, or `exploring` where it declares neither
- **AND** a done milestone SHALL be `done`, a superseded milestone `superseded`, and an open milestone `todo`
- **AND** its history SHALL start with one line naming the state it was imported at and the file it came from

### Requirement: Seeding reports drift and corrects it only when asked
The system SHALL provide `opensprint kanban seed`, which adds a card for every initiative the board lacks and reports every card that disagrees with its initiative.

#### Scenario: Adding what is missing
- **WHEN** `opensprint kanban seed` runs and an initiative has no card
- **THEN** the system SHALL add one, as `init` would

#### Scenario: A card disagrees with its initiative
- **WHEN** a card's state, owner, summary or milestones differ from its initiative
- **THEN** `seed` SHALL report the card and each field that differs
- **AND** it SHALL leave the card unchanged

#### Scenario: Correcting drift
- **WHEN** `opensprint kanban seed --resync` runs
- **THEN** the system SHALL rewrite each disagreeing card from its initiative
- **AND** it SHALL append one history line naming the fields it changed

#### Scenario: A milestone in progress survives a resync
- **WHEN** a card shows an open milestone at `specifying`, `building` or `review`, and the initiative still has it open
- **THEN** a resync SHALL keep that stage, because the initiative file records only open, done and superseded

#### Scenario: Nothing to do
- **WHEN** every initiative has a card and none disagrees
- **THEN** `seed` SHALL push nothing

#### Scenario: Previewing
- **WHEN** `init` or `seed` runs with `--dry-run`
- **THEN** the system SHALL report what it would write and push nothing

### Requirement: The board's columns are named once, in code
The system SHALL define the live board's columns as data — Backlog, Planning, Dev, Attestation and Done — and SHALL write them into the board template when it is generated, so that the page and the code place a card in the same column.

#### Scenario: Which column a card is in
- **WHEN** a card is placed
- **THEN** `exploring` with no owner SHALL be Backlog, and `exploring` held by someone SHALL be Planning
- **AND** `proposed` and `building` SHALL be Dev; `ready-for-attestation` and `attested` SHALL be Attestation; `completed` and `declined` SHALL be Done

#### Scenario: Every state has a column
- **WHEN** the columns are enumerated against the initiative states
- **THEN** every state SHALL belong to exactly one column for each answer to whether it is held

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

### Requirement: A milestone's stage moves through a table
The system SHALL move a milestone's stage on the card only along declared moves — todo to specifying, specifying to building, building to review, review to done, and review back to specifying — and SHALL refuse any other.

#### Scenario: A legal move
- **WHEN** a stage move the table declares is requested
- **THEN** the card SHALL show the new stage
- **AND** its history SHALL gain one line naming the milestone and both stages

#### Scenario: An illegal move
- **WHEN** a stage move the table does not declare is requested
- **THEN** the system SHALL refuse it and name the moves allowed from the milestone's stage

#### Scenario: In order
- **WHEN** a milestone is moved out of `todo` while an earlier live milestone is not done
- **THEN** the system SHALL refuse, naming the milestone that comes first

#### Scenario: Done is the file's to say
- **WHEN** a milestone is moved to `done` and the initiative file does not check it
- **THEN** the system SHALL refuse, saying to check it off in the initiative first

#### Scenario: The list follows the file
- **WHEN** a stage is written
- **THEN** the card's milestones SHALL first be brought into line with the initiative file, keeping stages only the board knows

#### Scenario: No board
- **WHEN** a stage is written and `origin` has no board
- **THEN** the system SHALL say so and succeed

### Requirement: Apply moves its milestone on the board
Apply SHALL write the milestone's stage at each step of its opsx cycle: specifying when the change is created, building when its worktree is made, review when it is merged and waiting at the checkpoint, done when it is checked off, and specifying again on a change request.

#### Scenario: Every step names its stage
- **WHEN** apply's instructions are read
- **THEN** each of those steps SHALL run `opensprint kanban stage` with its stage

