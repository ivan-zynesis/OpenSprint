## ADDED Requirements

### Requirement: The documentation directory is configurable
The system SHALL accept a `docsDir` in project configuration, naming where external-facing documentation lives, because where a project's documentation lives is a property of the project.

#### Scenario: The default
- **WHEN** no `docsDir` is declared
- **THEN** the documentation directory SHALL be `docs`

#### Scenario: A project override
- **WHEN** `docsDir` names a directory
- **THEN** that directory SHALL be used
- **AND** surrounding whitespace SHALL be trimmed

#### Scenario: A malformed value
- **WHEN** `docsDir` is not a non-empty string, or is only whitespace
- **THEN** the default SHALL be used
- **AND** a warning SHALL name the field
- **AND** the command SHALL NOT fail

#### Scenario: Nothing is checked inside it
- **WHEN** content is written to the documentation directory
- **THEN** the system SHALL NOT validate, compile or gate it
- **AND** the reason SHALL be that it is prose for people rather than a record
