## ADDED Requirements

### Requirement: An initiative filename carries its creation date
The system SHALL instruct an authoring agent to write an initiative to a path prefixed with its creation date, so that a directory listing reads in the order the thinking happened.

#### Scenario: Writing a new initiative
- **WHEN** an agent creates an initiative
- **THEN** the path SHALL be `opensprint/initiatives/<YYYYMMDD>-<name>.md`
- **AND** the date SHALL carry no separators

#### Scenario: The prefix is not the identifier
- **WHEN** an agent is instructed to write or read an initiative
- **THEN** the instruction SHALL state that the identifier is the frontmatter `id:`
- **AND** a reader SHALL resolve by that identifier rather than by the filename

#### Scenario: Reading an initiative by name
- **WHEN** a workflow is given an initiative name
- **THEN** the instruction SHALL state that `<name>.md` will not exist
- **AND** it SHALL name a way to list every initiative with its path
