# opsp-board Specification

## Purpose

Define `opensprint/BOARD.md`: a compiled view of every initiative by state, with the problems that would otherwise make it quietly wrong.

The board answers "where is everything", which is nobody's hat and everybody's question — so it is a cross-cutting artifact beside `DECISION-MAP.md` rather than a squad view. It derives entirely from initiative state, milestone completion and membership, which means **moving a card is changing a record's state**, never editing this file.

Unlike a hat view it needs no renderer. Structured state rendered as a table is deterministic, so the board is regenerated rather than sealed and staleness-gated: the manifest exists to catch a skill disagreeing with its sources, and there is no skill here to disagree.
## Requirements
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
The system SHALL render every open exposure on the board beside the state of the work planned to close it, so that a reader can tell a managed risk from a confession without opening a record.

#### Scenario: An exposure with no mitigation
- **WHEN** an exposure names no `mitigated-by`
- **THEN** the roadmap SHALL render it with no mitigation and an assurance of "a confession"

#### Scenario: Assurance resolves from live state
- **WHEN** an exposure names an initiative that exists
- **THEN** the roadmap SHALL render that initiative's **current** state as the assurance level
- **AND** the level SHALL be read at compile time rather than stored on the record

#### Scenario: The gradient
- **WHEN** the roadmap renders an assurance level
- **THEN** `exploring` SHALL read as knowing and thinking, `proposed` as committed with a bar, `building` as in flight, and `declined` SHALL state that the exposure stands

#### Scenario: A dangling pointer
- **WHEN** an exposure names an initiative that does not exist
- **THEN** the roadmap SHALL render it as pointing nowhere real
- **AND** SHALL NOT render it as mitigated, because false assurance about a known risk is worse than none

#### Scenario: A superseded record
- **WHEN** a record is superseded
- **THEN** its exposure SHALL NOT appear on the roadmap

#### Scenario: No exposures
- **WHEN** no active record carries an exposure
- **THEN** the roadmap SHALL say so rather than being omitted

#### Scenario: The pointer is not shown as exposure text
- **WHEN** the roadmap renders an exposure's text
- **THEN** the `mitigated-by` line SHALL NOT appear in it

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

### Requirement: Board links are built from the filename stem
The system SHALL build every link to an initiative from that initiative's filename stem rather than from its identifier, so that a link resolves whatever prefix the filename carries.

#### Scenario: Linking a mitigating initiative
- **WHEN** the roadmap resolves `mitigated-by` to an initiative
- **THEN** the link SHALL use that initiative's filename stem
- **AND** a dated filename SHALL produce a link that resolves

#### Scenario: The pointer resolves to nothing
- **WHEN** `mitigated-by` names an initiative that does not exist
- **THEN** no link SHALL be rendered
- **AND** the row SHALL say the pointer resolves to nothing

### Requirement: Work waiting on a person has its own column
The system SHALL render initiatives in the handoff state in a section of their own rather than among work in progress, so that a reader can tell work that needs time from work that needs somebody to put a different hat on.

#### Scenario: The handoff section
- **WHEN** the board is rendered
- **THEN** it SHALL contain a section for the handoff state
- **AND** that section SHALL render whether or not anything is in it

#### Scenario: What the section says
- **WHEN** the handoff section is rendered
- **THEN** its description SHALL state that it waits on a person rather than on work
- **AND** it SHALL name the workflow that clears it

#### Scenario: The assurance gradient covers it
- **WHEN** an exposure is mitigated by an initiative in the handoff state
- **THEN** the roadmap SHALL describe that assurance level

