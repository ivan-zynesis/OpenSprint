## ADDED Requirements

### Requirement: Sealing is scopeable to named hats
The system SHALL allow sealing to be restricted to named hats, so that a tool compiling one hat cannot record provenance for another.

#### Scenario: Sealing one hat
- **WHEN** `compact seal` is given one or more hat names
- **THEN** only those hats' sections SHALL be resealed
- **AND** every other manifest entry SHALL be carried forward unchanged, including its recorded input hash

#### Scenario: Sealing everything
- **WHEN** `compact seal` is given no hat names
- **THEN** every hat SHALL be in scope
- **AND** the reason SHALL be that archive legitimately closes an initiative with all hats in scope

#### Scenario: An unknown hat name
- **WHEN** a named hat is not in the project's registry
- **THEN** a warning SHALL name it and the accepted values
- **AND** the command SHALL NOT fail

#### Scenario: A skipped hat keeps its staleness
- **WHEN** a hat is out of scope and its inputs have changed
- **THEN** its entries SHALL retain the input hash recorded previously
- **AND** `check` SHALL continue to report those sections as stale

### Requirement: Sealing never blesses a section it did not render
The system SHALL refuse to reseal a hat whose rendered view is unchanged, because recording current inputs against stale prose makes the gate pass when it should fail.

#### Scenario: A view that was not re-rendered
- **WHEN** a hat's view file hashes to the value already recorded in the manifest
- **THEN** its entries SHALL be carried forward unchanged
- **AND** SHALL NOT be resealed against current inputs
- **AND** this SHALL hold whether or not the hat was named in scope

#### Scenario: A view that was re-rendered
- **WHEN** a hat's view file hashes to a different value than the manifest records
- **THEN** its entries SHALL be resealed with current inputs and observations

#### Scenario: A hat sealed for the first time
- **WHEN** a hat has no existing manifest entries
- **THEN** it SHALL be sealed
- **AND** the absence of a prior hash SHALL NOT be treated as an unchanged view

#### Scenario: A hat with no view on disk
- **WHEN** a hat has records but no rendered view
- **THEN** it SHALL be reported as unrendered, as before
- **AND** its entries SHALL record a null output hash
