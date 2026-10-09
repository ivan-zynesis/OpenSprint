## ADDED Requirements

### Requirement: A strategy states a position, never a mechanism
The rendering contract SHALL require a strategy to state where the system sits and to cite the decisions implementing it, without describing how they work, so that the compiled view stays readable by its audience and does not become a second description of the system.

#### Scenario: Rendering a strategy
- **WHEN** the renderer compiles a strategy
- **THEN** it SHALL state the position taken
- **AND** it SHALL cite the `dev` or `devops` decisions that implement it
- **AND** it SHALL NOT describe the mechanism those decisions chose

#### Scenario: The altitude needs no new guard
- **WHEN** the renderer is tempted to state a mechanism in a strategy
- **THEN** the existing citation requirement SHALL prevent it
- **AND** the reason SHALL be that a mechanism detail belongs to a decision the hat does not own, so there is no record it may cite for the claim

#### Scenario: An unimplemented strategy
- **WHEN** a strategy has no decision to cite
- **THEN** the renderer SHALL say so rather than inventing an implementation
- **AND** the gap SHALL also appear as a `strategy-unimplemented` open loop
