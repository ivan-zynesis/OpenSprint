# opsp-attest-workflow Specification

## Purpose

Define `/opsp:attest`: the stage that asks whether a bar was met, what asserts it, and what remains exposed.

Everything upstream sets bars. `/opsp:propose` writes the acceptance criterion and hands it to the engineer; the harvest reports that a constraint has no measure. Nothing asked whether a measure was *met* — every open-loop kind was a property of the record graph rather than of an outcome.

Two bounds make this stage mean something. It reads narrowly: the objective, the goals, the bars and the CI evidence, never the implementation — because attestation is usually self-assessment, and an agent holding the diff has every argument for why the code works. It writes narrowly: only the record's `## Measures` section, so a claim never changes under a reader who cited it.

It records what is true and never decides whether that is good enough. The moment it gains a pass/fail exit it has become certification, which `DS-SURROGATE-SCOPE` places out of scope precisely because change management and release management follow it in.

## Requirements
### Requirement: Attestation runs on a narrow context
The workflow SHALL load the initiative's objective, goals, bars and CI evidence, and SHALL NOT load the implementation diff, the design discussion or the decision rationales, because attestation is usually self-assessment and self-assessment at zero distance is not assessment.

#### Scenario: What is loaded
- **WHEN** the workflow begins
- **THEN** it SHALL load the objective, the goals, the bars and the evidence artifacts
- **AND** it SHALL NOT load the diff, the design discussion or the ADR rationales

#### Scenario: Continuing an authoring session
- **WHEN** the workflow is invoked in a session that wrote the implementation
- **THEN** it SHALL say so and stop
- **AND** it SHALL ask for a fresh session

#### Scenario: Evidence that cannot answer the bar
- **WHEN** the evidence does not answer the bar
- **THEN** the workflow SHALL record `cannot assess` with an exposure naming what is missing
- **AND** it SHALL NOT read the implementation to work it out

### Requirement: Attestation writes the three ex-post parts
The workflow SHALL write posture, evidence and exposure into the record's `## Measures` section.

#### Scenario: What is written
- **WHEN** a bar is assessed
- **THEN** `### Posture` SHALL carry a verdict, an attester and a date
- **AND** `### Evidence` SHALL reference a CI artifact
- **AND** `### Exposure` SHALL state what remains at risk

#### Scenario: A verdict with no evidence
- **WHEN** a verdict is recorded with no evidence
- **THEN** the record SHALL NOT be treated as attested
- **AND** `measure-unasserted` SHALL continue to report it

### Requirement: An amendment is bounded to the measure
The system SHALL verify that an amendment changed only the record's `## Measures` section, so that a record's claim never changes under a reader who cited it.

#### Scenario: Adding the ex-post parts
- **WHEN** an amendment adds posture, evidence or exposure inside `## Measures`
- **THEN** it SHALL be bounded

#### Scenario: A record gaining its first measure
- **WHEN** an amendment adds a `## Measures` section to a record that had none
- **THEN** it SHALL be bounded
- **AND** a separating blank line SHALL NOT make it unbounded

#### Scenario: Changing the claim
- **WHEN** an amendment changes a Statement, a Decision, a Rationale or any other section
- **THEN** it SHALL NOT be bounded
- **AND** the reason SHALL direct the author to `/opsp:decide`

#### Scenario: Changing frontmatter
- **WHEN** an amendment changes frontmatter
- **THEN** it SHALL NOT be bounded
- **AND** the reason SHALL name frontmatter specifically

### Requirement: Attestation never gates
The workflow SHALL record what is true and SHALL NOT decide whether it is good enough.

#### Scenario: An unmet bar
- **WHEN** a bar was not met
- **THEN** it SHALL be recorded as an exposure with a forward pointer
- **AND** it SHALL NOT block archive, a merge or a release
- **AND** the workflow SHALL exit zero

#### Scenario: The scope boundary is stated
- **WHEN** the workflow describes what it must never do
- **THEN** it SHALL name certification and `DS-SURROGATE-SCOPE`
- **AND** SHALL state that a pass/fail exit would cross that boundary

