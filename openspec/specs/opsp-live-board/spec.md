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

