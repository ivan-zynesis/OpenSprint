## ADDED Requirements

### Requirement: Create initiative from exploration
The `/opsp:propose` skill SHALL analyze the operator's exploration conversation, classify inputs into driver-specs and ADRs, and produce an initiative descriptor with a high-level milestone plan.

#### Scenario: Classifying operator inputs
- **WHEN** the operator invokes `/opsp:propose` after an explore session
- **THEN** the agent SHALL analyze the conversation to identify:
  - External constraints → create driver-spec files in `opensprint/driver-specs/`
  - Architectural decisions made → create ADR files in `opensprint/ADRs/`
  - Scope and milestones → create initiative descriptor
- **AND** SHALL present the classification to the operator for confirmation before writing files

#### Scenario: Creating initiative descriptor
- **WHEN** the operator confirms the classification
- **THEN** the agent SHALL create `opensprint/initiatives/<name>.md` with:
  - Description of the initiative
  - References to created driver-specs (by ID)
  - References to created ADRs (by ID)
  - High-level milestone plan (each milestone becomes an opsx change)
- **AND** SHALL regenerate `opensprint/DECISION-MAP.md` if ADRs were created

#### Scenario: High-level planning only
- **WHEN** defining milestones in the initiative
- **THEN** the agent SHALL describe each milestone at architect level (what it achieves, not how to implement it)
- **AND** SHALL NOT produce opsx-level artifacts (proposals, designs, tasks) — that's `/opsp:apply`'s job

### Requirement: Driver spec and ADR creation during propose
The `/opsp:propose` skill SHALL create driver-spec and ADR files as part of the proposal process.

#### Scenario: Creating driver specs from conversation
- **WHEN** the agent identifies external constraints in the conversation
- **THEN** it SHALL draft driver-spec files with proper frontmatter (id, type, status, created)
- **AND** SHALL present them to the operator for review before writing
- **AND** SHALL use the operator's words faithfully

#### Scenario: Creating ADRs from conversation
- **WHEN** the agent identifies architectural decisions in the conversation
- **THEN** it SHALL draft ADR files with proper frontmatter (id, status, depends-on, created, depth)
- **AND** SHALL include the Question, Operator Decision, Consideration Factors, Rationale, and Invalidation Trigger sections
- **AND** SHALL link each ADR to its parent driver-specs and decisions via `depends-on`
