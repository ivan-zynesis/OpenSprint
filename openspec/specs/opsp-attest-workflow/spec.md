# opsp-attest-workflow Specification

## Purpose

Define `/opsp:attest`: the stage that asks whether a bar was met, what asserts it, and what remains exposed.

Everything upstream sets bars. `/opsp:propose` writes the acceptance criterion and hands it to the engineer; the harvest reports that a constraint has no measure. Nothing asked whether a measure was *met* — every open-loop kind was a property of the record graph rather than of an outcome.

Two bounds make this stage mean something. It reads narrowly: the objective, the goals, the bars and the CI evidence, never the implementation — because attestation is usually self-assessment, and an agent holding the diff has every argument for why the code works. It writes narrowly: only the record's `## Measures` section, so a claim never changes under a reader who cited it.

It records what is true and never decides whether that is good enough. The moment it gains a pass/fail exit it has become certification, which `DS-SURROGATE-SCOPE` places out of scope precisely because change management and release management follow it in.
## Requirements
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

### Requirement: Attestation reviews the documentation
The workflow SHALL review whether existing documentation is adequate and complete for what shipped, and improve it where it is not.

#### Scenario: What is asked
- **WHEN** the workflow reviews documentation
- **THEN** it SHALL ask whether anything describes what the initiative changed in terms an outsider would follow
- **AND** whether anything already published is now wrong because of it
- **AND** whether an accepted exposure needs saying to someone who does not read driver-specs

#### Scenario: Not a question of authorship
- **WHEN** the workflow judges documentation
- **THEN** it SHALL judge adequacy and completeness
- **AND** it SHALL NOT treat documentation as owned by any hat by virtue of being documentation

#### Scenario: Urging rather than writing silently
- **WHEN** the workflow has produced an account
- **THEN** it SHALL say where it belongs and write only on confirmation
- **AND** the operator SHALL decide what an external reader is told

#### Scenario: Thin documentation the operator declines to improve
- **WHEN** documentation is inadequate and the operator declines to improve it now
- **THEN** the workflow SHALL record that as a finding
- **AND** it SHALL NOT silently accept it

### Requirement: The documentation directory is the one free write target
The workflow SHALL write prose only to the configured documentation directory, and SHALL continue to bound its writes inside the surrogate.

#### Scenario: Where prose may be written
- **WHEN** the workflow writes an external-facing account
- **THEN** it SHALL write to the configured documentation directory
- **AND** it SHALL use the operator's directory where they name a different one serving the same purpose

#### Scenario: The record bound is unchanged
- **WHEN** the workflow verifies it stayed in bounds
- **THEN** every change outside the documentation directory SHALL fall inside `## Measures` or `## Attestation`
- **AND** a change to a Statement, a Decision, a Rationale or frontmatter SHALL be reverted

### Requirement: Evidence is written in a form the harvest can read
The system SHALL instruct an attesting agent to write each evidence reference as a markdown link or a backticked repository-relative path, so that the claim an artifact exists can be checked rather than taken on trust.

#### Scenario: Naming the accepted forms
- **WHEN** an agent is instructed to record evidence
- **THEN** the instruction SHALL name a markdown link and a backticked repository-relative path
- **AND** it SHALL state that prose describing a belief is not evidence

#### Scenario: Naming what happens when neither is written
- **WHEN** the instruction is read
- **THEN** it SHALL name `evidence-unresolvable` as the loop that fires
- **AND** it SHALL state that the loop repeats on every compile until a reference is written

#### Scenario: What the compiler will not do
- **WHEN** an agent cites a remote artifact
- **THEN** the instruction SHALL state that the compiler does not go to the network
- **AND** it SHALL state that a remote artifact is only as good as the person who cited it

