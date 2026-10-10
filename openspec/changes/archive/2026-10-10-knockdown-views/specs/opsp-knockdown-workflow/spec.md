## ADDED Requirements

### Requirement: Knockdown compiles all five views
The workflow SHALL produce the four hat views and `architecture.md` when it compiles, so that a brownfield surrogate is complete rather than missing the artifacts that describe intent.

#### Scenario: What is produced
- **WHEN** knockdown compiles the surrogate
- **THEN** `dev` and `devops` views SHALL be populated from what was observed in the code
- **AND** `product` and `maintainer` views SHALL be produced even where they are empty
- **AND** `architecture.md` SHALL be produced as before

#### Scenario: Intent is not inferred
- **WHEN** knockdown writes a driver-spec inferred from code
- **THEN** it SHALL NOT assign a `role` or an `objective`
- **AND** the reason SHALL be that those state intent, which reading source does not reveal
- **AND** a guessed role would render as a populated view that is fiction

#### Scenario: Empty views are a finding
- **WHEN** `product` or `maintainer` render empty
- **THEN** that SHALL be reported as a finding rather than as an incomplete result
- **AND** the report SHALL say that nobody has stated what the system must do, or what must stay true of it

#### Scenario: The maintainer objectives are named
- **WHEN** the completion summary is displayed
- **THEN** it SHALL name the maintainer objectives that have nothing recorded against them
- **AND** present them as questions nobody has answered

#### Scenario: Everything is observed
- **WHEN** knockdown reports what it produced
- **THEN** it SHALL state that the surrogate is entirely `observed`
- **AND** that nothing in it is decided or attested
