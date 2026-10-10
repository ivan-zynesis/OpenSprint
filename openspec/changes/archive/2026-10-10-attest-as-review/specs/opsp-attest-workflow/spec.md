## MODIFIED Requirements

### Requirement: Attestation runs on a narrow context
The workflow SHALL load the initiative's objective, goals, bars, **test files** and CI evidence, and SHALL NOT load the implementation source, the design discussion or the decision rationales.

#### Scenario: What is loaded
- **WHEN** the workflow begins
- **THEN** it SHALL load the objective, the goals, the bars, the test files and the evidence artifacts
- **AND** it SHALL NOT load the implementation source, the design discussion or the ADR rationales

#### Scenario: Why tests and not source
- **WHEN** the workflow explains its reading scope
- **THEN** it SHALL state that a test is the implementation's own restatement of a bar
- **AND** that comparing a bar to its tests compares two statements at the same altitude

#### Scenario: A test that does not assert the bar
- **WHEN** the tests covering a bar do not assert it
- **THEN** the workflow SHALL record that as a finding
- **AND** it SHALL NOT read the implementation source to determine whether the bar holds anyway

#### Scenario: Continuing an authoring session
- **WHEN** the workflow is invoked in a session that wrote the implementation **or its tests**
- **THEN** it SHALL say so and stop
- **AND** it SHALL require a fresh session rather than accepting an assertion that the context was set aside

## ADDED Requirements

### Requirement: Attestation answers three review questions
The workflow SHALL answer reversibility, blast radius and accountability for every initiative it attests, and SHALL record them on the initiative.

#### Scenario: Reversibility
- **WHEN** an initiative is attested
- **THEN** the workflow SHALL record whether it is a one-way or two-way door
- **AND** a two-way door SHALL state what makes the rollback safe

#### Scenario: Blast radius
- **WHEN** an initiative is attested
- **THEN** the workflow SHALL record what the change affects
- **AND** it SHALL do so particularly where an exposure is being accepted

#### Scenario: RACI is the residue after automation
- **WHEN** the workflow records accountability
- **THEN** a concern handled automatically SHALL name the system and need no human names
- **AND** a concern not handled automatically SHALL name at least Responsible and Accountable
- **AND** the scope SHALL be follow-up as security and operations matters, after the pull request closes

#### Scenario: The questions never gate
- **WHEN** a question is unanswered
- **THEN** it SHALL be reported as an open loop
- **AND** the workflow SHALL still exit zero
