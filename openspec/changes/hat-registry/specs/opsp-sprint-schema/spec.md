## MODIFIED Requirements

### Requirement: Sprint-driven schema templates
The system SHALL provide markdown templates for each OPSP artifact type, including the optional `hat` frontmatter field on record types.

#### Scenario: Driver spec template
- **WHEN** a driver spec is created using the schema
- **THEN** the template SHALL provide sections for the spec content with YAML frontmatter placeholders for `id`, `type`, `status`, and `created`
- **AND** the template SHALL include a commented `hat` placeholder listing the default hat values

#### Scenario: Decision record template
- **WHEN** a decision record is created using the schema
- **THEN** the template SHALL provide sections for: Question, Operator Decision, Consideration Factors (table), Rationale, Invalidation Trigger
- **AND** the template SHALL include YAML frontmatter placeholders for `id`, `status`, `depends-on`, `created`, and `depth`
- **AND** the template SHALL include a commented `hat` placeholder listing the default hat values

#### Scenario: Decision map template
- **WHEN** the decision map is regenerated
- **THEN** the template SHALL provide sections for: Decision Tree (ASCII), Impact Summary (table)
- **AND** the content SHALL be fully agent-generated (not operator-authored)

## ADDED Requirements

### Requirement: Schema instructions document the hat field
The sprint-driven schema SHALL document the `hat` field in the artifact instructions for driver specs and decision records, so that agents generating records know to populate it.

#### Scenario: Driver spec artifact instruction
- **WHEN** an agent reads the `driver-spec` artifact instruction
- **THEN** the instruction SHALL list `hat` among the YAML frontmatter fields
- **AND** SHALL state that exactly one hat is declared per record

#### Scenario: Decision record artifact instruction
- **WHEN** an agent reads the `decision-record` artifact instruction
- **THEN** the instruction SHALL list `hat` among the YAML frontmatter fields
- **AND** SHALL state that exactly one hat is declared per record
