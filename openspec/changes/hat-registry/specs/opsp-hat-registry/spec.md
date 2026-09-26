## ADDED Requirements

### Requirement: Default hat set
The system SHALL define the default hat set as an explicit constant, not as an inline literal at each use site.

#### Scenario: Reading the default hat set
- **WHEN** no project configuration declares a hat registry
- **THEN** the system SHALL resolve the registry to the constant `DEFAULT_HATS`
- **AND** `DEFAULT_HATS` SHALL contain exactly, by explicit list: `product`, `maintainer`, `dev`, `devops`, `agreements`

### Requirement: Per-project hat registry
The system SHALL allow a project to declare its own hat set in `openspec/config.yaml`, because the hat set is a property of the product rather than of the tool.

#### Scenario: Project declares a custom hat set
- **WHEN** `openspec/config.yaml` contains a `hats` key whose value is a non-empty array of strings
- **THEN** the system SHALL resolve the registry to that array
- **AND** SHALL NOT merge it with `DEFAULT_HATS`

#### Scenario: Project declares no hat set
- **WHEN** `openspec/config.yaml` has no `hats` key
- **THEN** the system SHALL resolve the registry to `DEFAULT_HATS`

#### Scenario: Project declares a malformed hat set
- **WHEN** the `hats` key is present but is not an array of strings, or is an empty array
- **THEN** the system SHALL resolve the registry to `DEFAULT_HATS`
- **AND** SHALL surface a warning naming the `hats` key
- **AND** SHALL NOT fail the command

#### Scenario: Reading config on Windows
- **WHEN** the hat registry is resolved on Windows
- **THEN** the system SHALL locate `openspec/config.yaml` using `path.join('openspec', 'config.yaml')`
- **AND** SHALL NOT hardcode forward-slash separators

### Requirement: Hat validation by explicit list lookup
The system SHALL validate a record's `hat` value by explicit membership lookup against the resolved registry, not by pattern matching or regular expression.

#### Scenario: Valid hat
- **WHEN** a record declares a `hat` present in the resolved registry
- **THEN** validation SHALL succeed

#### Scenario: Unknown hat
- **WHEN** a record declares a `hat` absent from the resolved registry
- **THEN** validation SHALL fail
- **AND** the failure SHALL name the offending value and list the registry's accepted values

#### Scenario: Hat comparison is case-sensitive
- **WHEN** a record declares `hat: Product` and the registry contains `product`
- **THEN** validation SHALL fail
- **AND** the failure SHALL list `product` among the accepted values

### Requirement: Driver-spec type validation by explicit list lookup
The system SHALL validate a driver spec's `type` value against an explicit constant list, closing the gap that allowed unaccepted values to be written.

#### Scenario: Validating a driver spec type
- **WHEN** a driver spec's `type` is validated
- **THEN** the system SHALL accept exactly, by explicit list lookup: `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
- **AND** SHALL reject any other value, including `driver-spec`

### Requirement: Records are unassigned rather than invalid when no hat is declared
The system SHALL treat a record with no `hat` field as *unassigned*, which is a reportable state and not a validation failure.

#### Scenario: Record omits the hat field
- **WHEN** a driver spec or decision record has no `hat` key in its frontmatter
- **THEN** validation SHALL succeed
- **AND** the record SHALL be reported as unassigned

#### Scenario: Upgrading a project whose records predate the field
- **WHEN** a project's existing records are read after upgrading
- **THEN** every record SHALL parse successfully
- **AND** no existing command's behaviour SHALL change as a result of the field being absent

### Requirement: Default hat inference
The system SHALL provide a pure function suggesting a default hat for a record, for use during backfill. The function SHALL NOT write to any file.

#### Scenario: Inferring a driver spec's hat from its type
- **WHEN** a default hat is inferred for a driver spec
- **THEN** the system SHALL map its `type` by explicit lookup: `product` and `business` to `product`; `legal`, `compliance` and `reliability` to `maintainer`; `architecture` to `dev`

#### Scenario: Inferring a decision record's hat from its ancestry
- **WHEN** a default hat is inferred for a decision record
- **THEN** the system SHALL walk `depends-on` to the nearest driver-spec ancestors
- **AND** SHALL return that hat when all such ancestors resolve to the same hat

#### Scenario: Ancestors disagree or are absent
- **WHEN** a decision record's driver-spec ancestors resolve to more than one hat, or it has none
- **THEN** the system SHALL return no suggestion
- **AND** the record SHALL remain unassigned pending owner confirmation

#### Scenario: No rule infers devops
- **WHEN** a default hat is inferred for any record
- **THEN** the system SHALL NOT infer `devops` from record content, filenames, or keywords
- **AND** records belonging to `devops` SHALL be assigned by owner confirmation
