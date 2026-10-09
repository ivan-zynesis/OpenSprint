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

### Requirement: A hat may declare the roles its records can take
The system SHALL allow a hat to declare a set of roles, so that a record can be classified within its hat without the engine knowing what those roles mean.

#### Scenario: Declaring roles
- **WHEN** a hat's configuration declares `roles`
- **THEN** the value SHALL be a non-empty array of non-empty strings
- **AND** those SHALL be the only roles records of that hat may take

#### Scenario: Default roles
- **WHEN** no project configuration declares roles
- **THEN** `product` SHALL default to, by explicit list: `objective`, `goal`, `strategy`
- **AND** every other default hat SHALL default to no roles

#### Scenario: measure is not a role
- **WHEN** the default product roles are resolved
- **THEN** `measure` SHALL NOT be among them
- **AND** a measure SHALL be a property of a goal rather than a record of its own

#### Scenario: Malformed roles
- **WHEN** `roles` is present but is not a non-empty array of non-empty strings
- **THEN** the hat SHALL resolve to its default roles
- **AND** a warning SHALL name the hat and the `roles` key
- **AND** the command SHALL NOT fail

### Requirement: Role validation by explicit list lookup
The system SHALL validate a record's role against the roles declared by each hat the record belongs to, by explicit membership lookup.

#### Scenario: A valid role
- **WHEN** a record declares a role its hat also declares
- **THEN** validation SHALL succeed

#### Scenario: A role the hat does not declare
- **WHEN** a record declares a role absent from every hat it belongs to
- **THEN** validation SHALL report the record, the role, and the accepted roles

#### Scenario: A role on a hat that declares none
- **WHEN** a record belongs only to hats declaring no roles
- **AND** the record declares a role
- **THEN** validation SHALL report it as unexpected rather than silently accepting it

#### Scenario: Role comparison is case-sensitive
- **WHEN** a record declares `Objective` and the hat declares `objective`
- **THEN** the declared value SHALL be reported as unaccepted

### Requirement: The maintainer hat ships seven inherited objectives
The system SHALL ship a default section list for the `maintainer` hat consisting of seven objectives, so that a project gains a maintainer shape without authoring one.

#### Scenario: The shipped objectives
- **WHEN** a project declares no sections for `maintainer`
- **THEN** its sections SHALL be `security-access`, `isolation-confidentiality`, `privacy-retention-legal`, `integrity-correctness`, `change-quality`, `availability-continuity`, `cost-budget`, followed by `open-loops`
- **AND** each objective section SHALL take `driver-specs` filtered to roles `goal` and `strategy`
- **AND** each objective section SHALL select on its own `objective`

#### Scenario: An objective with no records
- **WHEN** no record declares a given objective
- **THEN** that section SHALL still resolve, with no inputs
- **AND** SHALL NOT be omitted, because an empty objective is a finding

#### Scenario: A project extends the list
- **WHEN** a project declares its own `maintainer` sections in `openspec/config.yaml`
- **THEN** the declared sections SHALL be used in place of the shipped seven
- **AND** a project MAY declare an eighth objective without modifying the tool

#### Scenario: Default roles for maintainer
- **WHEN** a project declares no roles for `maintainer`
- **THEN** the accepted roles SHALL be `goal` and `strategy`

### Requirement: A record declares one or more roles
The system SHALL accept a record's `role` as either a string or a list, normalised to a list, so that a record stating both a goal and its strategy can declare both.

#### Scenario: Both spellings normalise
- **WHEN** a record declares `role: strategy` or `role: [goal, strategy]`
- **THEN** both SHALL normalise to a list
- **AND** duplicates SHALL be removed with order preserved

#### Scenario: A malformed role
- **WHEN** `role` is present but is not a non-empty string or a non-empty list of non-empty strings
- **THEN** it SHALL be treated as absent rather than failing the command

#### Scenario: Validation against the union of a record's hats
- **WHEN** a record declares several hats
- **THEN** each of its roles SHALL be checked against the union of those hats' accepted roles
- **AND** a role accepted by any one of them SHALL be legitimate

### Requirement: A record declares the objective it serves
The system SHALL accept an optional `objective` on a record, naming which of its hat's objectives it serves.

#### Scenario: Declaring an objective
- **WHEN** a record declares `objective: security-access`
- **THEN** it SHALL be selected by the section of that name
- **AND** SHALL NOT be selected by any other objective's section

#### Scenario: A record with no objective
- **WHEN** a record declares no `objective`
- **THEN** it SHALL be excluded from every objective-filtered section
- **AND** SHALL be unaffected in sections that do not filter on objective

#### Scenario: Validation against the hat's resolved sections
- **WHEN** a record declares an `objective`
- **THEN** it SHALL be validated against the objectives declared by its hats' resolved sections
- **AND** a project that added an eighth objective SHALL be able to use it immediately

