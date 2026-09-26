# opsp-hat-registry Specification

## Purpose

Define the hat taxonomy that compiled surrogate views are grouped by, the per-project registry that makes the hat set a property of the product, and the validation and inference rules applied when a record is assigned to a hat.

A hat is a context boundary. It names the accountability for a record, and therefore the single human who reviews it, receives its escalations, and triages its backlog. A record declares one or more hats; a constraint that crosses hats appears in each view that needs it.

This capability also carries the first mechanical validation of record frontmatter, covering both the declared hats and the driver-spec `type` values that were previously enforced by instruction alone.

## Requirements
### Requirement: Default hat set
The system SHALL define the default hat set as an explicit constant, not as an inline literal at each use site.

#### Scenario: Reading the default hat set
- **WHEN** no project configuration declares a hat registry
- **THEN** the system SHALL resolve the registry to the constant `DEFAULT_HATS`
- **AND** `DEFAULT_HATS` SHALL contain exactly, by explicit list: `product`, `maintainer`, `dev`, `devops`

#### Scenario: No agreements hat
- **WHEN** the default hat set is read
- **THEN** it SHALL NOT contain `agreements`
- **AND** a constraint crossing hats SHALL declare each hat it crosses rather than being assigned to a shared bucket

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

### Requirement: A record declares one or more hats
The system SHALL allow a record to declare more than one accountable hat, because a constraint that matters to two hats belongs in both compiled views.

#### Scenario: Normalising a bare string
- **WHEN** a record's `hats` value is a non-empty string
- **THEN** the system SHALL normalise it to a single-element list

#### Scenario: Normalising a list
- **WHEN** a record's `hats` value is a non-empty array of non-empty strings
- **THEN** the system SHALL normalise it to that list with duplicates removed and order preserved

#### Scenario: Malformed hats value
- **WHEN** a record's `hats` value is an empty array, an empty string, or contains a non-string entry
- **THEN** the system SHALL treat the record as unassigned
- **AND** SHALL NOT fail the parse

#### Scenario: Inference never proposes more than one hat
- **WHEN** a default hat is inferred for any record
- **THEN** the system SHALL propose at most one hat
- **AND** a record crossing hats SHALL be assigned by its owner rather than inferred

### Requirement: Hat validation by explicit list lookup
The system SHALL validate a record's declared hats by explicit membership lookup against the resolved registry, not by pattern matching or regular expression.

#### Scenario: Valid hats
- **WHEN** every hat a record declares is present in the resolved registry
- **THEN** validation SHALL succeed

#### Scenario: Unknown hat
- **WHEN** a record declares a hat absent from the resolved registry
- **THEN** validation SHALL report exactly the unknown values
- **AND** SHALL NOT report the valid ones alongside them

#### Scenario: Hat comparison is case-sensitive
- **WHEN** a record declares `Product` and the registry contains `product`
- **THEN** the declared value SHALL be reported as unknown

### Requirement: Driver-spec type validation by explicit list lookup
The system SHALL validate a driver spec's `type` value against an explicit constant list, closing the gap that allowed unaccepted values to be written.

#### Scenario: Validating a driver spec type
- **WHEN** a driver spec's `type` is validated
- **THEN** the system SHALL accept exactly, by explicit list lookup: `product`, `legal`, `compliance`, `reliability`, `architecture`, `business`
- **AND** SHALL reject any other value, including `driver-spec`

### Requirement: Records are unassigned rather than invalid when no hat is declared
The system SHALL treat a record with no `hats` field as *unassigned*, which is a reportable state and not a validation failure.

#### Scenario: Record omits the hats field
- **WHEN** a driver spec or decision record has no `hats` key in its frontmatter
- **THEN** validation SHALL succeed
- **AND** the record SHALL be reported as unassigned

#### Scenario: Upgrading a project whose records predate the field
- **WHEN** a project's existing records are read after upgrading
- **THEN** every record SHALL parse successfully
- **AND** no existing command's behaviour SHALL change as a result of the field being absent

### Requirement: Default hat inference
The system SHALL provide a pure function suggesting default hats for a record, for use during backfill. The function SHALL NOT write to any file.

#### Scenario: Inferring a driver spec's hat from its type
- **WHEN** default hats are inferred for a driver spec
- **THEN** the system SHALL map its `type` by explicit lookup: `product` and `business` to `product`; `legal`, `compliance` and `reliability` to `maintainer`; `architecture` to `dev`

#### Scenario: Inferring a decision record's hat from its ancestry
- **WHEN** default hats are inferred for a decision record
- **THEN** the system SHALL walk `depends-on` to the nearest driver-spec ancestors
- **AND** SHALL return that hat when all such ancestors resolve to the same hat

#### Scenario: Ancestors disagree or are absent
- **WHEN** a decision record's driver-spec ancestors resolve to more than one hat, or it has none
- **THEN** the system SHALL return an empty list
- **AND** the record SHALL remain unassigned pending owner confirmation

#### Scenario: No rule infers devops
- **WHEN** default hats are inferred for any record
- **THEN** the system SHALL NOT infer `devops` from record content, filenames, or keywords
- **AND** records belonging to `devops` SHALL be assigned by owner confirmation

