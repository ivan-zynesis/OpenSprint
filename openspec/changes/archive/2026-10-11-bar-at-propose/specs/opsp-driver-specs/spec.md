## ADDED Requirements

### Requirement: A driver-spec is created with its hat, its role and its bar
The system SHALL instruct the tools that create a driver-spec to write the accountable hat, the record's role, and a populated measures section carrying the bar — in the template an agent copies, not only in prose beside it.

#### Scenario: The template carries them
- **WHEN** a tool instructs an agent to create a driver-spec
- **THEN** the template SHALL declare the hat and the role in frontmatter
- **AND** it SHALL carry a measures section with a bar block

#### Scenario: The bar takes its hat's form
- **WHEN** the bar block is shown
- **THEN** it SHALL carry the BDD form for each hat that declares one
- **AND** it SHALL carry the labels the bar anatomy declares

#### Scenario: A bar that cannot be stated yet
- **WHEN** the operator cannot state a bar
- **THEN** the instruction SHALL record that it is unstated rather than inventing one
- **AND** it SHALL state that the open loop will keep reporting it

#### Scenario: An empty section is not an answer
- **WHEN** a measures heading is written with nothing beneath it
- **THEN** the instruction SHALL state that this counts as absent
