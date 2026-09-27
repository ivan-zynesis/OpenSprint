## MODIFIED Requirements

### Requirement: Sprint-driven schema templates
The system SHALL provide markdown templates for each OPSP artifact type, including the optional `hats`, `role` and `depends-on` frontmatter fields and a `Measures` section on driver specs.

#### Scenario: Driver spec template
- **WHEN** a driver spec is created using the schema
- **THEN** the template SHALL provide sections for the spec content with YAML frontmatter placeholders for `id`, `type`, `status`, and `created`
- **AND** the template SHALL include commented `hats`, `role` and `depends-on` placeholders
- **AND** the template SHALL include a `## Measures` section with placeholders for a primary measure and a guardrail

#### Scenario: Measures on a target
- **WHEN** a driver spec states a target rather than a direction
- **THEN** the `## Measures` section SHALL state how the target is known to be met
- **AND** leaving it empty SHALL be reported as an open loop

#### Scenario: Decision record template
- **WHEN** a decision record is created using the schema
- **THEN** the template SHALL provide sections for: Question, Operator Decision, Consideration Factors (table), Rationale, Invalidation Trigger
- **AND** the template SHALL include YAML frontmatter placeholders for `id`, `status`, `depends-on`, `created`, and `depth`
- **AND** the template SHALL include commented `hats` and `role` placeholders

#### Scenario: Decision map template
- **WHEN** the decision map is regenerated
- **THEN** the template SHALL provide sections for: Decision Tree (ASCII), Impact Summary (table)
- **AND** the content SHALL be fully agent-generated (not operator-authored)
