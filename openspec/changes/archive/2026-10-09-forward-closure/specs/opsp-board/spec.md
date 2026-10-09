## MODIFIED Requirements

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
