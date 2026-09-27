## MODIFIED Requirements

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
