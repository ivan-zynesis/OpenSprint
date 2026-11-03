## MODIFIED Requirements

### Requirement: Moving an initiative moves its card
The system SHALL move an initiative's card on the live board whenever `opensprint advance` moves the initiative, validating the card's own move against the same transition table, and SHALL carry the initiative's milestones onto the card with the move.

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
- **WHEN** the card already shows the target state and its milestones match the initiative's
- **THEN** the system SHALL push nothing

#### Scenario: Milestones edited by hand
- **WHEN** an initiative whose milestones were added or superseded in the file is advanced
- **THEN** the card SHALL show those milestones after the move, each open one keeping its stage on the card, as `opensprint kanban stage` mirrors them

### Requirement: Every workflow moves state through a command
No workflow SHALL change an initiative's state by editing the file, every move a workflow makes SHALL be one the CLI accepts from the state the workflow starts in, and a workflow that creates an initiative SHALL put its card on the board.

#### Scenario: Declining
- **WHEN** triage declines an item, or revives one
- **THEN** it SHALL run `opensprint advance` to `declined`, or to `exploring`

#### Scenario: A new backlog item
- **WHEN** backlog writes a new initiative
- **THEN** it SHALL run `opensprint kanban seed <initiative>`, which adds that one card and succeeds where there is no board

#### Scenario: One board
- **WHEN** any command or playbook reads or writes the live board
- **THEN** it SHALL use `origin/kanban`

#### Scenario: Every transition has its command
- **WHEN** a transition in the table names the workflow that performs it
- **THEN** that workflow's instructions SHALL run `opensprint advance <initiative-name> --to <state>` for it
- **AND** where the transition is a handoff, the command SHALL pass `--hat` naming only hats the transition accepts
- **AND** the command SHALL move an initiative at the transition's starting state

#### Scenario: Propose from explore
- **WHEN** propose writes a new initiative descriptor
- **THEN** it SHALL write it at `exploring` and reach `proposed` only through `opensprint advance`, which puts the card on the board

#### Scenario: Closing at archive
- **WHEN** archive closes an initiative
- **THEN** it SHALL advance it to `completed` from the initiative's worktree before removing that worktree

#### Scenario: Superseding a milestone
- **WHEN** repropose or reexplore supersedes a milestone
- **THEN** it SHALL mark it `- [~]`, keeping its name, before the move that carries it onto the card
