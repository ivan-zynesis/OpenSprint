# Sprint Schema Specification

## Purpose

Define the sprint-driven schema that extends the spec-driven schema with OPSP artifact types for driver specs, decision records, and the decision map.
## Requirements
### Requirement: Sprint-driven schema definition
The system SHALL provide a `sprint-driven` schema that extends the existing `spec-driven` schema, adding OPSP artifact types for driver specs, decision records, and the decision map.

#### Scenario: Schema file location
- **WHEN** the sprint-driven schema is installed
- **THEN** it SHALL exist at `schemas/sprint-driven/schema.yaml`
- **AND** it SHALL declare `extends: spec-driven` to inherit all OPSX artifact definitions

#### Scenario: Schema artifact definitions
- **WHEN** the sprint-driven schema is loaded
- **THEN** it SHALL define these additional artifact types beyond what spec-driven provides:
  - `driver-spec` — generates `driver-specs/*.md`, requires nothing, template `driver-spec.md`
  - `decision-record` — generates `decisions/DEC-*.md`, requires `driver-spec`, template `decision-record.md`
  - `decision-map` — generates `DECISION-MAP.md`, requires `decision-record`, auto-maintained
- **AND** the existing spec-driven artifacts (proposal, specs, design, tasks) SHALL remain available and unchanged

### Requirement: Schema extends mechanism
The system SHALL support a schema `extends` field that composes a child schema's artifacts with a parent schema's artifacts.

#### Scenario: Loading an extended schema
- **WHEN** a schema declares `extends: spec-driven`
- **THEN** the system SHALL first load the parent schema's artifacts
- **AND** merge the child schema's artifacts into the combined set
- **AND** child artifacts MAY declare dependencies on parent artifacts
- **AND** parent artifacts SHALL NOT be modified by the child schema

#### Scenario: Resolving templates for extended schema
- **WHEN** resolving templates for a sprint-driven schema artifact
- **THEN** the system SHALL look for templates in `schemas/sprint-driven/templates/` first
- **AND** fall back to `schemas/spec-driven/templates/` for inherited artifacts
- **AND** follow the existing resolution order: project-local, user override, package built-in

### Requirement: OPSP artifact output directory
The system SHALL write OPSP artifacts (driver specs, decisions, decision map) to the `opensprint/` directory, separate from OPSX artifacts in `openspec/`.

#### Scenario: Directory separation
- **WHEN** the sprint-driven schema is active
- **THEN** driver specs SHALL be written to `opensprint/driver-specs/`
- **AND** decision records SHALL be written to `opensprint/decisions/`
- **AND** the decision map SHALL be written to `opensprint/DECISION-MAP.md`
- **AND** OPSX artifacts (proposals, specs, designs, tasks) SHALL continue to be written to `openspec/changes/`

### Requirement: Sprint-driven schema templates
The system SHALL provide markdown templates for each OPSP artifact type, including the optional `hats` frontmatter field on record types.

#### Scenario: Driver spec template
- **WHEN** a driver spec is created using the schema
- **THEN** the template SHALL provide sections for the spec content with YAML frontmatter placeholders for `id`, `type`, `status`, and `created`
- **AND** the template SHALL include a commented `hats` placeholder listing the default hat values

#### Scenario: Decision record template
- **WHEN** a decision record is created using the schema
- **THEN** the template SHALL provide sections for: Question, Operator Decision, Consideration Factors (table), Rationale, Invalidation Trigger
- **AND** the template SHALL include YAML frontmatter placeholders for `id`, `status`, `depends-on`, `created`, and `depth`
- **AND** the template SHALL include a commented `hats` placeholder listing the default hat values

#### Scenario: Decision map template
- **WHEN** the decision map is regenerated
- **THEN** the template SHALL provide sections for: Decision Tree (ASCII), Impact Summary (table)
- **AND** the content SHALL be fully agent-generated (not operator-authored)

### Requirement: Schema instructions document the hat field
The sprint-driven schema SHALL document the `hats` field in the artifact instructions for driver specs and decision records, so that agents generating records know to populate it.

#### Scenario: Driver spec artifact instruction
- **WHEN** an agent reads the `driver-spec` artifact instruction
- **THEN** the instruction SHALL list `hats` among the YAML frontmatter fields
- **AND** SHALL state that one or more hats may be declared per record

#### Scenario: Decision record artifact instruction
- **WHEN** an agent reads the `decision-record` artifact instruction
- **THEN** the instruction SHALL list `hats` among the YAML frontmatter fields
- **AND** SHALL state that one or more hats may be declared per record

