## ADDED Requirements

### Requirement: Rule files are located by configured globs
The system SHALL locate rule files using a configurable glob list, with an explicit default covering the naming conventions projects actually use.

#### Scenario: Default rule globs
- **WHEN** no project configuration declares rule globs
- **THEN** the system SHALL match files whose names contain, by explicit list: `.test.`, `.spec.`, `.i9n.`, `.unit.`, `.e2e.`
- **AND** SHALL also match files named `*_test.*`

#### Scenario: Project declares its own rule globs
- **WHEN** `openspec/config.yaml` contains a non-empty `rules` array of strings
- **THEN** the system SHALL use exactly those globs
- **AND** SHALL NOT merge them with the default list

#### Scenario: Malformed rule globs
- **WHEN** the `rules` key is present but is not a non-empty array of non-empty strings
- **THEN** the system SHALL fall back to the default list
- **AND** SHALL surface a warning naming the `rules` key
- **AND** SHALL NOT fail the command

#### Scenario: A project whose only suffix is uncommon
- **WHEN** a project's rule files all use a single suffix such as `.unit.ts`
- **THEN** the default globs SHALL still match them
- **AND** the system SHALL NOT report every decision as unguarded merely because one common suffix is absent

### Requirement: The surrogate is excluded from the scan
The system SHALL NOT treat the surrogate or its change artifacts as rule files.

#### Scenario: Excluded directories
- **WHEN** the system scans for rule files
- **THEN** it SHALL exclude `opensprint/` and `openspec/`
- **AND** SHALL exclude `node_modules/`, `dist/`, `build/` and `.git/`

#### Scenario: A record does not guard itself
- **WHEN** a decision record names its own id and its `depends-on` ancestors
- **THEN** none of those occurrences SHALL be counted as a citation
- **AND** the decision SHALL NOT be reported as guarded on that basis

### Requirement: Citation extraction
The system SHALL treat any occurrence of a record id within a rule file as a citation of that record, without requiring a structured annotation.

#### Scenario: Extracting citations
- **WHEN** a rule file contains a record id
- **THEN** the system SHALL record a link from that record to that file
- **AND** SHALL match ids in comments, test names and string literals alike

#### Scenario: Ids that resolve to no record
- **WHEN** a rule file cites an identifier matching the record id shape but no such record exists
- **THEN** the system SHALL NOT create a link
- **AND** SHALL report the unresolved citation separately

#### Scenario: A rule citing several records
- **WHEN** a rule file cites more than one record
- **THEN** the system SHALL record a link for each

### Requirement: Record to rule index
The system SHALL build an index from each record to the rule files citing it.

#### Scenario: Index contents
- **WHEN** the index is built
- **THEN** each active record SHALL map to the list of rule files citing it, which MAY be empty
- **AND** rule file paths SHALL be recorded relative to the project root

### Requirement: Open loop derivation
The system SHALL derive open loops from the index and the decision graph, and SHALL NOT infer them from record content.

#### Scenario: A constraint no decision answers
- **WHEN** an active driver-spec has no active decision whose `depends-on` includes it
- **THEN** the system SHALL report a `constraint-unanswered` loop against that driver-spec's hats

#### Scenario: A constraint whose decisions are unguarded
- **WHEN** an active driver-spec is answered by at least one active decision
- **AND** no rule cites any of those decisions
- **THEN** the system SHALL report a `constraint-unasserted` loop against that driver-spec's hats

#### Scenario: Constraint coverage is transitive
- **WHEN** a driver-spec is not cited by any rule directly
- **AND** a decision depending on it is cited by a rule
- **THEN** the driver-spec SHALL NOT be reported as unasserted

#### Scenario: A decision no rule cites
- **WHEN** an active decision is cited by no rule file
- **THEN** the system SHALL report a `decision-unguarded` loop against that decision's hats

#### Scenario: A rule guarding a dead record
- **WHEN** a rule file cites a record whose status is `superseded` or `deprecated`
- **THEN** the system SHALL report a `rule-guards-dead-record` loop naming both the rule file and the record

#### Scenario: A decision resting on a superseded ancestor
- **WHEN** an active decision's `depends-on` includes a record whose status is `superseded` or `deprecated`
- **THEN** the system SHALL report a `decision-on-superseded` loop
- **AND** the report SHALL direct the reader to `/opsp:rebuild-assess`

#### Scenario: Loops are routed to the accountable hat
- **WHEN** any open loop is reported
- **THEN** it SHALL be attributed to every hat the subject record declares
- **AND** a loop against an unassigned record SHALL be reported without a hat

### Requirement: Open loops are reported, never gated
The system SHALL report open loops without failing any verification command on their account.

#### Scenario: Check ignores open loops
- **WHEN** `opensprint compact check` runs and open loops exist
- **AND** every view section is fresh
- **THEN** `check` SHALL exit zero

#### Scenario: Plan reports open loops
- **WHEN** `opensprint compact plan` runs
- **THEN** it SHALL report the open loops per hat
- **AND** `--json` SHALL carry them for the renderer

#### Scenario: A dedicated reading surface
- **WHEN** `opensprint compact loops` runs
- **THEN** it SHALL report the open loops grouped by hat
- **AND** SHALL support `--json`
- **AND** SHALL exit zero whether or not loops exist

### Requirement: A citation is evidence of intent, not proof of coverage
The system SHALL NOT claim that a cited record is correctly asserted.

#### Scenario: Reporting a guarded decision
- **WHEN** a decision is cited by at least one rule
- **THEN** the system SHALL report it as cited rather than as verified
- **AND** SHALL NOT assert that the citing rule tests the decision's substance
