## ADDED Requirements

### Requirement: The board is compiled, never edited
The system SHALL compile `opensprint/BOARD.md` from the initiatives, so that moving a card means changing a record's state rather than editing a file.

#### Scenario: Generating the board
- **WHEN** the board is regenerated
- **THEN** it SHALL be written to `opensprint/BOARD.md`
- **AND** it SHALL state that it is derived and must not be edited
- **AND** it SHALL state that moving a card means changing a record's state

#### Scenario: Deterministic output
- **WHEN** the board is regenerated twice with no record changed
- **THEN** the output SHALL be byte-identical

#### Scenario: No initiatives
- **WHEN** there are no initiatives
- **THEN** the board SHALL still be written, saying so, rather than being absent

#### Scenario: Not staleness-gated
- **WHEN** `compact check` runs
- **THEN** the board SHALL NOT be checked for staleness
- **AND** the reason SHALL be that it is fully deterministic with no skill in the loop, as `DECISION-MAP.md` is

### Requirement: Initiatives are grouped by state
The system SHALL group initiatives on the board by their declared state, so that a reader sees where everything is without opening a record.

#### Scenario: The sections
- **WHEN** the board is compiled
- **THEN** it SHALL carry sections for Backlog, Next, Doing, Done and Declined
- **AND** `exploring` SHALL appear under Backlog, `proposed` under Next, `building` and `attested` under Doing, `completed` under Done, and `declined` under Declined

#### Scenario: An initiative with no state
- **WHEN** an initiative declares no state
- **THEN** it SHALL be placed by its `status` — completed under Done, otherwise Backlog
- **AND** the state check SHALL report it separately if it is active

#### Scenario: Milestone progress
- **WHEN** an initiative appears on the board
- **THEN** its milestone progress SHALL be shown as done over total
- **AND** the next incomplete milestone SHALL be named where one exists

#### Scenario: An empty section
- **WHEN** no initiative occupies a section
- **THEN** the section SHALL still render, saying it is empty
- **AND** SHALL NOT be omitted

### Requirement: The board carries its own problems
The system SHALL render the state check and any orphaned milestones on the board, because both describe ways the board itself would otherwise be quietly wrong.

#### Scenario: A state problem
- **WHEN** an initiative has a state problem
- **THEN** it SHALL appear in the board's Problems section, naming the initiative and the problem

#### Scenario: An orphaned milestone
- **WHEN** an initiative carries a checkbox outside `## Milestones`
- **THEN** it SHALL be reported in Problems, naming the section holding it
- **AND** the reason SHALL be that it is not counted in the initiative's progress

#### Scenario: No problems
- **WHEN** nothing is wrong
- **THEN** the Problems section SHALL say so rather than being omitted

### Requirement: The roadmap is the board's forward half
The system SHALL carry a Roadmap section on the board, where exposures and the work planned to close them appear.

#### Scenario: Before mitigated-by exists
- **WHEN** the roadmap has no exposures to render
- **THEN** the section SHALL still appear
- **AND** SHALL state what will land there, so the reader learns the shape once

### Requirement: A superseded milestone is excluded from progress, not dropped
The system SHALL recognise `- [~]` as a milestone decided against after the initiative was planned, listing it while excluding it from progress.

#### Scenario: Parsing a superseded milestone
- **WHEN** a milestone line is marked `- [~]`
- **THEN** it SHALL parse as a milestone that is neither done nor outstanding
- **AND** it SHALL NOT be silently dropped

#### Scenario: Progress excludes it
- **WHEN** an initiative carries superseded milestones
- **THEN** its progress SHALL count only the live ones
- **AND** the superseded count SHALL be shown beside the progress
- **AND** the reason SHALL be that work nobody intends to do must not hold an initiative open

#### Scenario: Not offered as next
- **WHEN** the next incomplete milestone is chosen
- **THEN** a superseded milestone SHALL NOT be offered
