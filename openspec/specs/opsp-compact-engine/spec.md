# opsp-compact-engine Specification

## Purpose

Define the deterministic layer beneath `/opsp:compact`: where compiled hat views live, how each view divides into sections with their own input sets, how a section's provenance is recorded, and how a view that no longer agrees with its records is detected.

Writing the condensed prose of a view is synthesis and belongs to the renderer. What belongs here is the part that can be verified without a model in the loop — which is what makes it usable as a build gate rather than as advice.

A view cannot silently disagree with the records it derives from, whether the records moved beneath it or someone edited the view. Both are reported, and neither is repaired by the mode that reports them.
## Requirements
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
The system SHALL define a view's sections per hat, each section declaring which records feed it, which roles it accepts, and what it observes of the system.

#### Scenario: A section is a definition
- **WHEN** the engine resolves a hat's sections
- **THEN** each SHALL carry a name and an input kind
- **AND** the input kind SHALL be one of, by explicit list: `all`, `driver-specs`, `decisions`, `none`
- **AND** each MAY additionally declare the roles it accepts and the files it observes

#### Scenario: Role-filtered inputs
- **WHEN** a section declares `roles`
- **THEN** its inputs SHALL be limited to records whose role is among them
- **AND** a record with no role SHALL NOT be included

#### Scenario: A section without role filtering
- **WHEN** a section declares no `roles`
- **THEN** its inputs SHALL be every record matching its input kind, regardless of role

#### Scenario: Adding a strategy does not restage the objective
- **WHEN** a driver-spec with role `strategy` is added to a hat
- **AND** no record with role `objective` has changed
- **THEN** a section accepting role `strategy` SHALL be reported stale
- **AND** a section accepting role `objective` SHALL remain fresh

#### Scenario: Resolving inputs by kind
- **WHEN** a section's inputs are resolved for a hat
- **THEN** `all` SHALL yield every record assigned to that hat
- **AND** `driver-specs` SHALL yield the hat's driver-specs
- **AND** `decisions` SHALL yield the hat's decision records
- **AND** `none` SHALL yield an empty list

#### Scenario: Section heading is derived from its name
- **WHEN** a section name is rendered as a view heading
- **THEN** a kebab-case name SHALL title-case into the heading
- **AND** `open-loops` SHALL render as `Open Loops`

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

### Requirement: Default sections
The system SHALL default a hat's sections according to the hat, because the four accountabilities produce different kinds of knowledge rather than the same kind about different subjects.

#### Scenario: Product defaults
- **WHEN** `product` declares no sections
- **THEN** it SHALL resolve to, by explicit list: `objective`, `goals`, `strategies`, `measures`, `open-loops`
- **AND** `objective`, `goals` and `strategies` SHALL each accept only their corresponding role

#### Scenario: Maintainer defaults
- **WHEN** `maintainer` declares no sections
- **THEN** it SHALL resolve to, by explicit list: `bars`, `posture`, `evidence`, `exposure`, `open-loops`

#### Scenario: Dev defaults
- **WHEN** `dev` declares no sections
- **THEN** it SHALL resolve to, by explicit list: `tech-stack`, `runtime-topology`, `entity-schema`, `open-loops`
- **AND** `tech-stack` and `entity-schema` SHALL observe the system by default

#### Scenario: Devops defaults
- **WHEN** `devops` declares no sections
- **THEN** it SHALL resolve to, by explicit list: `infra-architecture`, `gitops`, `open-loops`
- **AND** both SHALL observe the system by default

#### Scenario: A hat the tool does not know
- **WHEN** a project declares a hat with no default shape and no sections of its own
- **THEN** it SHALL resolve to the generic sections: `charter`, `constraints`, `decisions`, `open-loops`
- **AND** SHALL NOT resolve to an empty list

#### Scenario: Declared sections always win
- **WHEN** a hat declares its own sections
- **THEN** those SHALL be used regardless of any default for that hat

### Requirement: Diagram convention detection
The system SHALL report the repository's existing diagram habit, so that a rendered diagram matches what the project already does rather than what the renderer prefers.

#### Scenario: No mermaid present
- **WHEN** no markdown file in the project contains a mermaid block
- **THEN** the convention SHALL be reported as `ascii`

#### Scenario: Mermaid is habitual
- **WHEN** three or more markdown files contain a mermaid block
- **THEN** the convention SHALL be reported as `mermaid`

#### Scenario: Mermaid appears once or twice
- **WHEN** one or two markdown files contain a mermaid block
- **THEN** the convention SHALL be reported as `mixed`
- **AND** the renderer SHALL ask the operator rather than guessing

#### Scenario: Detection excludes the usual directories
- **WHEN** the convention is detected
- **THEN** the same exclusions SHALL apply as for rule discovery
- **AND** a mermaid block inside `node_modules` SHALL NOT count

#### Scenario: Reported by plan
- **WHEN** `opensprint compact plan --json` runs
- **THEN** the output SHALL carry the detected convention and the files it was detected from

