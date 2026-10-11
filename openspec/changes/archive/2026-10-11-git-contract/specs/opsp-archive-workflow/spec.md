## ADDED Requirements

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
