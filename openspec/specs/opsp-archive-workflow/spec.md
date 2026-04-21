# OPSP Archive Workflow Specification

## Purpose

Compile all active driver specs, ADRs, and the decision tree into architecture.md and mark the initiative as completed.

## Requirements

### Requirement: Compile initiative into architecture.md
The `/opsp:archive` skill SHALL synthesize all active driver-specs, ADRs, and the current decision tree into a single `opensprint/architecture.md` file that captures the complete architectural state.

#### Scenario: Generating architecture.md
- **WHEN** the operator invokes `/opsp:archive <initiative-name>`
- **THEN** the agent SHALL read all active driver-specs from `opensprint/driver-specs/`
- **AND** read all active/accepted ADRs from `opensprint/ADRs/`
- **AND** read the current `opensprint/DECISION-MAP.md`
- **AND** compile them into `opensprint/architecture.md` with sections:
  - System Overview (derived from driver-specs)
  - Driver Specs (compiled narrative of active specs)
  - Architectural Decisions (current decision tree in narrative form, each linking to its ADR)
  - System Structure (high-level component description derived from decisions)
  - Constraints & Non-Negotiables (extracted from driver-specs)

#### Scenario: Rewriting architecture.md
- **WHEN** `opensprint/architecture.md` already exists
- **THEN** the agent SHALL rewrite it completely with current state
- **AND** SHALL NOT append or version — ADRs are the version history

### Requirement: Archive initiative descriptor
The `/opsp:archive` skill SHALL mark the initiative as completed after compiling architecture.md.

#### Scenario: Completing an initiative
- **WHEN** architecture.md has been compiled
- **THEN** the agent SHALL update the initiative descriptor's status to `completed`
- **AND** add a `completed` date field
- **AND** list all opsx changes that were part of this initiative

#### Scenario: Summary output
- **WHEN** archiving completes
- **THEN** the agent SHALL display:
  - Initiative name and description
  - Count of driver-specs (active)
  - Count of ADRs (active/accepted)
  - Count of opsx changes completed
  - Confirmation that architecture.md was updated
