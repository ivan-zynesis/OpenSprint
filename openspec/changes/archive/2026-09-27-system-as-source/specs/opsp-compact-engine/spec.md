## ADDED Requirements

### Requirement: A section may observe the system
The system SHALL allow a section to declare files it is compiled from, alongside the records it takes, so that a view can describe the system rather than only the record.

#### Scenario: Declaring observations
- **WHEN** a section declares `observes`
- **THEN** the value SHALL be either the literal `rules` or an array of globs
- **AND** `observes` SHALL be independent of `inputs`, so a section MAY take records and observe files at once

#### Scenario: The named rules set
- **WHEN** a section declares `observes: rules`
- **THEN** the observed files SHALL be those matched by the project's resolved rule globs
- **AND** SHALL follow `ruleGlobs` when the project declares it, so the two cannot drift

#### Scenario: Explicit globs
- **WHEN** a section declares `observes` as an array of globs
- **THEN** the observed files SHALL be those matched, relative to the project root
- **AND** the same directory exclusions SHALL apply as for rule discovery

#### Scenario: A section observing nothing
- **WHEN** a section declares no `observes`
- **THEN** it SHALL have no observed files
- **AND** its behaviour SHALL be unchanged from before observations existed

#### Scenario: Malformed observes
- **WHEN** `observes` is neither `rules` nor a non-empty array of non-empty strings
- **THEN** the hat's sections SHALL degrade to the defaults
- **AND** a warning SHALL name the hat and the offending value

### Requirement: Observations carry provenance
The system SHALL record observed files in the manifest and include them in the section's input hash, so that code moving beneath a view restages it.

#### Scenario: Manifest records observations separately
- **WHEN** a section with observations is sealed
- **THEN** the entry SHALL record observed paths with their content hashes, keyed by project-relative path
- **AND** SHALL keep them distinct from the record inputs, which are keyed by record id

#### Scenario: Observations affect the input hash
- **WHEN** an observed file's content changes
- **AND** no record feeding the section has changed
- **THEN** the section SHALL be classified `stale`

#### Scenario: Reporting which observations moved
- **WHEN** a section is stale because of its observations
- **THEN** the report SHALL name the observed paths that were added, removed or modified
- **AND** SHALL keep them distinct from the record ids reported alongside

#### Scenario: Observation hashing is order and platform independent
- **WHEN** observed files contribute to a hash
- **THEN** paths SHALL be recorded project-relative with separators normalised to `/`
- **AND** SHALL be sorted before hashing
- **AND** a manifest written on one platform SHALL match one written on another

### Requirement: Open loops observe the rules
The system SHALL make the default `open-loops` section observe the project's rule files, so that a change to what guards a decision restages the section reporting it.

#### Scenario: Default open-loops
- **WHEN** `DEFAULT_SECTIONS` is resolved
- **THEN** `open-loops` SHALL declare `observes: rules`
- **AND** SHALL continue to take no record inputs

#### Scenario: A deleted guard restages the report
- **WHEN** the only rule citing a decision is deleted
- **THEN** the `open-loops` section SHALL be classified `stale`
- **AND** SHALL NOT continue to report the decision as guarded

#### Scenario: The gate remains a gate
- **WHEN** `opensprint compact check` runs on a project with observations
- **THEN** it SHALL hash the observed files
- **AND** the added cost SHALL be bounded by the configured globs and the standard exclusions
