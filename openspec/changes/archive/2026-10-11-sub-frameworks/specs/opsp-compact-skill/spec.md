## ADDED Requirements

### Requirement: A strategy cell renders SWOT-like, compiled from its decisions
The system SHALL instruct the renderer to render four parts beneath a cited strategy — strength, weakness, opportunity and threat — each compiled from a named section of the decision record, so that a reader learns what the position cost without opening the ADR.

#### Scenario: The four parts and their sources
- **WHEN** the renderer is instructed on a strategy cell
- **THEN** the instruction SHALL name all four parts
- **AND** each SHALL name the section of the ADR it is read from

#### Scenario: Opportunity is a redefinition
- **WHEN** the instruction defines opportunity
- **THEN** it SHALL state that this is a deliberate redefinition
- **AND** it SHALL say that standard SWOT means external upside

#### Scenario: Compiled, never authored
- **WHEN** a part has no source in the decision record
- **THEN** the instruction SHALL require the renderer to write that it is unrecorded
- **AND** it SHALL forbid opening the implementation to work the part out

### Requirement: A bar is written in the form its hat's bars take
The system SHALL instruct the renderer that a bar's statement takes one of two BDD forms chosen by hat, so that a bar can be assessed from pipeline output.

#### Scenario: The two forms
- **WHEN** the renderer is instructed on a bar
- **THEN** a product bar SHALL be a user story
- **AND** a maintainer bar SHALL be given / when / then

#### Scenario: Why the split is not a preference
- **WHEN** the instruction explains the split
- **THEN** it SHALL state that a maintainer bar as a user story is an awkward fiction
- **AND** it SHALL state that a bar in given/when/then form is already a test specification

#### Scenario: Hats that commit to no bar
- **WHEN** the hat is one that describes a system rather than committing to a bar
- **THEN** the instruction SHALL state that it declares no form

#### Scenario: The rest of the anatomy stays prose
- **WHEN** the instruction covers posture, evidence and exposure
- **THEN** it SHALL state that they stay prose
- **AND** the reason SHALL be that structure there produces filled-in templates rather than thought
