## ADDED Requirements

### Requirement: The product view is an OGSM chain
The skill SHALL render the product view as a causal chain rather than a list of constraints, because the value of the framework is separating four things that otherwise sit mixed in prose.

#### Scenario: Rendering the chain
- **WHEN** the product view is rendered
- **THEN** `objective` SHALL state the long-term direction
- **AND** `goals` SHALL state what must be true to reach it, each with how it is known to be met
- **AND** `strategies` SHALL state how the goals are pursued
- **AND** the causal relation SHALL be visible: a goal serves an objective, a strategy serves a goal

#### Scenario: Measures aggregate the bridge
- **WHEN** the `measures` section is rendered
- **THEN** it SHALL state, for each goal, what measures it and what asserts that measure
- **AND** a goal with no measure SHALL be named rather than omitted

#### Scenario: No charter, no constraints
- **WHEN** the product view is rendered
- **THEN** it SHALL NOT carry a `Charter` or `Constraints` section
- **AND** what a charter would have said SHALL be carried by the objective, or by a strategy describing how a constraint is worked around

### Requirement: The maintainer view states positions and their trades
The skill SHALL render a bar as a point chosen on a spectrum, not as a number, because what this hat controls is always a trade along a continuum.

#### Scenario: Rendering a bar
- **WHEN** a bar is rendered
- **THEN** it SHALL name the dimension it sits on
- **AND** the chosen point, with the scope that point applies to
- **AND** what was traded to sit there
- **AND** what the neighbouring point would cost

#### Scenario: A bar stated without its trade
- **WHEN** the records do not say what a bar cost
- **THEN** the view SHALL say the trade is unrecorded rather than omitting the question
- **AND** SHALL NOT invent the trade

#### Scenario: Posture is where we actually sit
- **WHEN** the `posture` section is rendered
- **THEN** it SHALL state where the project actually stands against its bars, including deliberate gaps
- **AND** a deliberate gap SHALL cite the record that makes it deliberate and, where recorded, its expiry

#### Scenario: Cost is an axis, not a section
- **WHEN** the maintainer view is rendered
- **THEN** cost SHALL appear as a dimension of the bars it buys
- **AND** SHALL NOT be rendered as a section of its own

### Requirement: The dev and devops views describe the system
The skill SHALL render these views as descriptions of the system, citing decisions where they explain a choice, and SHALL NOT enumerate records.

#### Scenario: Tech stack
- **WHEN** `tech-stack` is rendered
- **THEN** it SHALL state what the system is built with, observed from the project's manifests
- **AND** SHALL cite the decision behind a choice where one exists, and the path where it does not

#### Scenario: Runtime topology
- **WHEN** `runtime-topology` is rendered
- **THEN** it SHALL describe how the parts run and communicate
- **AND** SHALL use a diagram where the shape is clearer drawn than described

#### Scenario: Entity schema
- **WHEN** `entity-schema` is rendered
- **THEN** it SHALL describe the durable data model and the relationships within it
- **AND** SHALL be omitted with a note where the project has no persistent data

#### Scenario: Infrastructure and gitops
- **WHEN** the devops view is rendered
- **THEN** `infra-architecture` SHALL describe what is provisioned and how it fits together
- **AND** `gitops` SHALL describe the pipelines, what triggers each, and which environments they reach

#### Scenario: Not an index
- **WHEN** any of these sections is rendered
- **THEN** it SHALL NOT list the hat's records
- **AND** a record that does not shape the picture SHALL simply not appear

### Requirement: Diagrams follow the repository's habit
The skill SHALL choose a diagram format from what the project already does, and SHALL ask when that is unclear.

#### Scenario: A settled habit
- **WHEN** the detected convention is `ascii` or `mermaid`
- **THEN** the skill SHALL use that format

#### Scenario: An unclear habit
- **WHEN** the detected convention is `mixed`
- **THEN** the skill SHALL ask the operator which to use
- **AND** SHALL NOT pick one silently

#### Scenario: Judged per diagram
- **WHEN** a diagram would be unreadable in the repository's usual format
- **THEN** the skill MAY use the other format for that diagram
- **AND** SHALL say why

#### Scenario: ASCII is the default
- **WHEN** no habit can be detected at all
- **THEN** the skill SHALL use ASCII
- **AND** the reason SHALL be that ASCII survives a terminal, a diff, and an agent's context with no renderer
