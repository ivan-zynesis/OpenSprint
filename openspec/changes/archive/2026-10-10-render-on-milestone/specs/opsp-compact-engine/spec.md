## ADDED Requirements

### Requirement: The plan is filterable by hat
The system SHALL allow `compact plan` to be restricted to named hats, so that a caller compiling one hat can ask only about that hat.

#### Scenario: Filtering to one hat
- **WHEN** `compact plan` is given one or more hat names
- **THEN** only sections belonging to those hats SHALL be reported
- **AND** this SHALL apply to both the human-readable and JSON forms

#### Scenario: No filter
- **WHEN** no hat names are given
- **THEN** every hat SHALL be reported, as before

#### Scenario: An unknown hat name
- **WHEN** a named hat is not in the project's registry
- **THEN** a warning SHALL name it and the accepted values
- **AND** the command SHALL NOT fail

#### Scenario: Open loops are not filtered
- **WHEN** the plan is filtered by hat
- **THEN** the open loops it reports SHALL be unaffected
- **AND** the reason SHALL be that a loop belongs to the records rather than to a view section
