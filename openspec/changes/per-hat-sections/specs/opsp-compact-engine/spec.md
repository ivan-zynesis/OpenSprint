## MODIFIED Requirements

### Requirement: Section definitions
The system SHALL define a view's sections per hat, each section declaring which records feed it, so that a hat's shape suits its domain and a change to one kind of record does not restage the others.

#### Scenario: A section is a definition
- **WHEN** the engine resolves a hat's sections
- **THEN** each SHALL carry a name and an input kind
- **AND** the input kind SHALL be one of, by explicit list: `all`, `driver-specs`, `decisions`, `none`

#### Scenario: Default sections
- **WHEN** a hat declares no sections
- **THEN** the engine SHALL resolve `DEFAULT_SECTIONS`
- **AND** `DEFAULT_SECTIONS` SHALL be, by explicit list: `charter` taking `all`, `constraints` taking `driver-specs`, `decisions` taking `decisions`, and `open-loops` taking `none`

#### Scenario: Resolving inputs by kind
- **WHEN** a section's inputs are resolved for a hat
- **THEN** `all` SHALL yield every record assigned to that hat
- **AND** `driver-specs` SHALL yield the hat's driver-specs
- **AND** `decisions` SHALL yield the hat's decision records
- **AND** `none` SHALL yield an empty list

#### Scenario: A new decision does not restage constraints
- **WHEN** a decision record assigned to a hat is added or modified
- **AND** no driver-spec assigned to that hat has changed
- **THEN** a section taking `decisions` SHALL be reported stale
- **AND** a section taking `driver-specs` SHALL remain fresh

#### Scenario: Section heading is derived from its name
- **WHEN** a section name is rendered as a view heading
- **THEN** a kebab-case name SHALL title-case into the heading
- **AND** `open-loops` SHALL render as `Open Loops`

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

### Requirement: Provenance manifest
The system SHALL maintain a manifest recording, for each section of each hat, the record ids and content hashes it was compiled from and a hash of the rendered output.

#### Scenario: Manifest contents
- **WHEN** the manifest is written
- **THEN** each entry SHALL record the hat, the section name, the contributing record ids with their content hashes, the section's combined input hash, and the hash of the rendered view file
- **AND** the manifest SHALL be written to `opensprint/squad/.manifest.json`

#### Scenario: Entries follow each hat's own sections
- **WHEN** hats declare different section sets
- **THEN** the manifest SHALL contain one entry per section per hat, following each hat's own list
- **AND** SHALL NOT assume every hat has the same sections

#### Scenario: An orphaned entry is ignored
- **WHEN** the manifest contains an entry for a section the hat no longer declares
- **THEN** classification SHALL ignore it
- **AND** `check` SHALL NOT report it as drift
- **AND** the next `seal` SHALL NOT rewrite it

#### Scenario: Hashing is order-independent
- **WHEN** a section's input hash is computed
- **THEN** the contributing record ids and hashes SHALL be sorted before hashing
- **AND** the resulting hash SHALL NOT depend on directory iteration order

#### Scenario: Hashing is line-ending independent
- **WHEN** record or view content is hashed
- **THEN** the content SHALL be read as UTF-8 and `\r\n` sequences normalised to `\n` before hashing
- **AND** a checkout that rewrites line endings SHALL NOT change a hash
