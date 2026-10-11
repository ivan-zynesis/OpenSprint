# OPSP Archive Workflow Specification

## Purpose

Compile all active driver specs, ADRs, and the decision tree into architecture.md and mark the initiative as completed.
## Requirements
### Requirement: Compile initiative into architecture.md
The `/opsp:archive` skill SHALL delegate its compile step to `/opsp:compact`, so that every compiled artifact is produced by one engine under one set of rules.

#### Scenario: Generating architecture.md
- **WHEN** the operator invokes `/opsp:archive <initiative-name>`
- **THEN** the agent SHALL invoke the compact workflow to compile the surrogate
- **AND** SHALL NOT synthesise `architecture.md` with its own section list
- **AND** the compiled output SHALL include `opensprint/architecture.md` and the per-hat views

#### Scenario: Rewriting architecture.md
- **WHEN** `opensprint/architecture.md` already exists
- **THEN** it SHALL be rewritten completely from the current records
- **AND** SHALL NOT be appended to or versioned — the decision records are the version history

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

### Requirement: Archive states the merge sequence
The workflow SHALL state the order in which an initiative closes, and why that order is forced.

#### Scenario: The sequence
- **WHEN** the workflow describes closing an initiative
- **THEN** it SHALL state the order: rebase, attest, archive, merge
- **AND** SHALL state that these happen as one pull request

#### Scenario: Why rebase precedes archive
- **WHEN** the workflow explains the order
- **THEN** it SHALL state that compiling before rebasing produces an artifact that is wrong on arrival

#### Scenario: Attestation precedes archive
- **WHEN** attestation has not run
- **THEN** the workflow SHALL stop and say so
- **AND** SHALL NOT compile claims nobody has checked

#### Scenario: The PR gate
- **WHEN** the workflow describes the gate on merging
- **THEN** it SHALL require the compiled views to agree with their records
- **AND** require the board's Problems section to be empty
- **AND** require the attestation to answer reversibility, blast radius and accountability

#### Scenario: The gate is on consistency, not outcome
- **WHEN** a bar is recorded as not met, with an exposure and a plan
- **THEN** the gate SHALL pass
- **AND** the workflow SHALL state that grading the answer would be certification

