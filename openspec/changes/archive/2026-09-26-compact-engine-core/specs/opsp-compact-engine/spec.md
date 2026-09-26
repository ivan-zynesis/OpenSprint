## ADDED Requirements

### Requirement: View location
The system SHALL place compiled surrogate views under `opensprint/squad/`, so that views travel with their branch and diverge per universe exactly as records do.

#### Scenario: View paths
- **WHEN** the engine resolves view paths
- **THEN** the index SHALL be `opensprint/squad/index.md`
- **AND** each hat in the resolved registry SHALL map to `opensprint/squad/<hat>.md`
- **AND** the manifest SHALL be `opensprint/squad/.manifest.json`

#### Scenario: Constructing view paths on Windows
- **WHEN** view paths are constructed on Windows
- **THEN** the system SHALL use `path.join()` for every segment
- **AND** SHALL NOT hardcode forward-slash separators

### Requirement: Section definitions
The system SHALL divide each hat view into four sections, each with its own input set, so that a change to one kind of record does not restage the others.

#### Scenario: The four sections and their inputs
- **WHEN** the engine resolves sections for a hat
- **THEN** it SHALL produce exactly, by explicit list: `charter`, `constraints`, `decisions`, `open-loops`
- **AND** `charter` SHALL take every record assigned to that hat as its inputs
- **AND** `constraints` SHALL take the hat's driver-specs as its inputs
- **AND** `decisions` SHALL take the hat's decision records as its inputs
- **AND** `open-loops` SHALL take no record inputs, being computed rather than compiled

#### Scenario: A new decision does not restage constraints
- **WHEN** a decision record assigned to a hat is added or modified
- **AND** no driver-spec assigned to that hat has changed
- **THEN** the hat's `decisions` section SHALL be reported stale
- **AND** its `constraints` section SHALL remain fresh

### Requirement: Records are grouped by declared hats
The system SHALL assign a record to every hat it declares, and SHALL report records declaring none.

#### Scenario: Grouping a multi-hat record
- **WHEN** a record declares more than one hat
- **THEN** the record SHALL appear in the input set of each declared hat's sections

#### Scenario: Unassigned records
- **WHEN** a record declares no hats
- **THEN** the engine SHALL report it as unassigned
- **AND** SHALL NOT assign it to any hat

#### Scenario: Records declaring a hat outside the registry
- **WHEN** a record declares a hat absent from the resolved registry
- **THEN** the engine SHALL report the record and the unknown hat
- **AND** SHALL NOT create a view for the unknown hat

### Requirement: Only active records are compiled
The system SHALL consider only records whose status is `active` or `accepted`, matching the decision tree's existing filter.

#### Scenario: A superseded record changes
- **WHEN** a record whose status is `superseded` or `deprecated` is modified
- **THEN** no section SHALL be reported stale as a result
- **AND** the record SHALL NOT appear in any section's input set

### Requirement: Provenance manifest
The system SHALL maintain a manifest recording, for each section, the record ids and content hashes it was compiled from and a hash of the rendered output.

#### Scenario: Manifest contents
- **WHEN** the manifest is written
- **THEN** each entry SHALL record the hat, the section name, the contributing record ids with their content hashes, the section's combined input hash, and the hash of the rendered view file
- **AND** the manifest SHALL be written to `opensprint/squad/.manifest.json`

#### Scenario: Hashing is order-independent
- **WHEN** a section's input hash is computed
- **THEN** the contributing record ids and hashes SHALL be sorted before hashing
- **AND** the resulting hash SHALL NOT depend on directory iteration order

#### Scenario: Hashing is line-ending independent
- **WHEN** record or view content is hashed
- **THEN** the content SHALL be read as UTF-8 and `\r\n` sequences normalised to `\n` before hashing
- **AND** a checkout that rewrites line endings SHALL NOT change a hash

### Requirement: Staleness classification
The system SHALL classify each section into exactly one of four states.

#### Scenario: Fresh
- **WHEN** a section's recomputed input hash and the rendered view's hash both match the manifest
- **THEN** the section SHALL be classified `fresh`

#### Scenario: Stale
- **WHEN** a section's recomputed input hash differs from the manifest
- **THEN** the section SHALL be classified `stale`
- **AND** the engine SHALL report which record ids were added, removed or modified

#### Scenario: Tampered
- **WHEN** a section's input hash matches but the rendered view's hash differs from the manifest
- **THEN** the section SHALL be classified `tampered`

#### Scenario: Unsealed
- **WHEN** a section has no entry in the manifest
- **THEN** the section SHALL be classified `unsealed`
- **AND** SHALL NOT be classified `stale`, because no prior state exists to have drifted from

#### Scenario: No manifest at all
- **WHEN** `opensprint/squad/.manifest.json` does not exist
- **THEN** every section SHALL be classified `unsealed`
- **AND** the engine SHALL NOT fail

### Requirement: Plan reports what a renderer needs
The system SHALL provide a read-only mode reporting which sections are not fresh and which records feed each of them.

#### Scenario: Planning
- **WHEN** `opensprint compact plan` is run
- **THEN** it SHALL list each section that is not `fresh`, with its state
- **AND** for each, SHALL list the absolute or project-relative paths of the records feeding it
- **AND** SHALL NOT write any file

#### Scenario: Machine-readable plan
- **WHEN** `opensprint compact plan --json` is run
- **THEN** it SHALL emit the same information as JSON on stdout
- **AND** the JSON SHALL be the only content on stdout

### Requirement: Seal writes the manifest
The system SHALL provide a mode that records the current state of the views in the manifest.

#### Scenario: Sealing
- **WHEN** `opensprint compact seal` is run
- **THEN** it SHALL recompute every section's input hash and every view's output hash
- **AND** SHALL write the manifest
- **AND** SHALL report how many sections were recorded

#### Scenario: Sealing with a missing view file
- **WHEN** a hat has records but no view file exists at its path
- **THEN** `seal` SHALL report that hat as unrendered
- **AND** SHALL NOT write a manifest entry claiming an output hash for it

### Requirement: Check is a gate and never writes
The system SHALL provide a verification mode suitable for CI that fails when any section is not fresh.

#### Scenario: All sections fresh
- **WHEN** `opensprint compact check` is run and every section is `fresh`
- **THEN** it SHALL exit zero

#### Scenario: A section is not fresh
- **WHEN** any section is `stale`, `tampered` or `unsealed`
- **THEN** `check` SHALL exit non-zero
- **AND** SHALL name each offending section and its state

#### Scenario: Check never repairs
- **WHEN** `opensprint compact check` is run in any state
- **THEN** it SHALL NOT write the manifest or any view
- **AND** a gate SHALL NOT be able to repair what it checks

#### Scenario: Tampered guidance
- **WHEN** `check` reports a `tampered` section
- **THEN** the message SHALL state that the edit will be lost on recompile
- **AND** SHALL direct the operator to `/opsp:explore` on the grounds that a wrong view means a wrong system
