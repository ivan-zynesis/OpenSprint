## ADDED Requirements

### Requirement: Architecture state document
The system SHALL maintain `opensprint/architecture.md` as a compiled single-file document that captures the complete current architectural state of the solution.

#### Scenario: Architecture.md structure
- **WHEN** architecture.md is generated or rewritten
- **THEN** it SHALL contain these sections:
  - `## System Overview` — what the system is and does, derived from driver-specs
  - `## Driver Specs` — compiled narrative of all active driver-specs (synthesized, not copy-pasted)
  - `## Architectural Decisions` — current decision tree in narrative form, each decision linking to its ADR by ID
  - `## System Structure` — high-level component/service description derived from architectural decisions
  - `## Constraints & Non-Negotiables` — compliance, performance, legal requirements from driver-specs

#### Scenario: Architecture.md as surrogate input
- **WHEN** the `/opsp:apply` skill resolves questions via the operator surrogate
- **THEN** architecture.md SHALL be one of the primary context sources the agent reads
- **AND** the agent SHALL consider architecture.md alongside driver-specs and ADRs

#### Scenario: Architecture.md template on init
- **WHEN** `opensprint init` creates the opensprint directory
- **THEN** it SHALL create an empty `architecture.md` with section headers as placeholders
- **AND** the template SHALL exist at `schemas/sprint-driven/templates/architecture.md`
