## MODIFIED Requirements

### Requirement: Per-project hat registry
The system SHALL allow a project to declare its own hat set in `openspec/config.yaml`, and optionally the sections each hat renders.

#### Scenario: Project declares hats as a list of names
- **WHEN** `hats` is a non-empty array of strings
- **THEN** the system SHALL resolve the registry to those names
- **AND** each SHALL resolve to `DEFAULT_SECTIONS`

#### Scenario: Project declares hats as a map
- **WHEN** `hats` is a non-empty map from hat name to configuration
- **THEN** the system SHALL resolve the registry to those names
- **AND** a hat whose configuration declares `sections` SHALL resolve to exactly those sections
- **AND** a hat whose configuration declares no `sections` SHALL resolve to `DEFAULT_SECTIONS`

#### Scenario: Project declares no hat set
- **WHEN** `openspec/config.yaml` has no `hats` key
- **THEN** the system SHALL resolve the registry to `DEFAULT_HATS`, each with `DEFAULT_SECTIONS`

#### Scenario: Project declares a malformed hat set
- **WHEN** the `hats` key is neither a non-empty array of strings nor a non-empty map of valid hat configurations
- **THEN** the system SHALL resolve the registry to `DEFAULT_HATS`
- **AND** SHALL surface a warning naming the `hats` key
- **AND** SHALL NOT fail the command

#### Scenario: A section declares an unknown input kind
- **WHEN** a declared section's `inputs` is not one of the accepted kinds
- **THEN** the hat's sections SHALL degrade to `DEFAULT_SECTIONS`
- **AND** SHALL surface a warning naming the hat and the offending value

#### Scenario: Reading config on Windows
- **WHEN** the hat registry is resolved on Windows
- **THEN** the system SHALL locate `openspec/config.yaml` using `path.join('openspec', 'config.yaml')`
- **AND** SHALL NOT hardcode forward-slash separators
