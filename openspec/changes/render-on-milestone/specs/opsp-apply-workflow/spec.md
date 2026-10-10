## ADDED Requirements

### Requirement: A milestone boundary compiles what the hat in the room owns
The workflow SHALL compile stale `dev` and `devops` view sections at each milestone boundary, after the change branch merges into the initiative branch.

#### Scenario: Compiling at the boundary
- **WHEN** a milestone's opsx cycle completes and its change branch has merged
- **THEN** the workflow SHALL run the plan, render the stale `dev` and `devops` sections, and seal those hats
- **AND** sealing SHALL be scoped to the hats rendered

#### Scenario: Nothing stale
- **WHEN** no `dev` or `devops` section is stale
- **THEN** nothing SHALL be rendered
- **AND** the workflow SHALL continue without comment

#### Scenario: Product and maintainer are never compiled silently
- **WHEN** `product` or `maintainer` sections are stale at a milestone boundary
- **THEN** the workflow SHALL NOT compile them as part of the boundary step

### Requirement: Stale product and maintainer views are offered
The workflow SHALL offer to compile stale `product` and `maintainer` views, naming the hat that compiling them requires.

#### Scenario: The offer
- **WHEN** a `product` or `maintainer` section is stale
- **THEN** the workflow SHALL report it and offer to compile it
- **AND** the offer SHALL state that compiling means putting on that hat

#### Scenario: Accepting is a context switch
- **WHEN** the offer is accepted
- **THEN** the agent SHALL set down the implementation context it is holding
- **AND** load the records for that hat
- **AND** compile, seal scoped to that hat, and return to the dev hat

#### Scenario: Declining
- **WHEN** the offer is declined
- **THEN** the view SHALL be left stale
- **AND** it SHALL remain reported by the plan and be compiled at archive

#### Scenario: The offer never gates
- **WHEN** the offer is declined or unanswered
- **THEN** the milestone SHALL still complete
