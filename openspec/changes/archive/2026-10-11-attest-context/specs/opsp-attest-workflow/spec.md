## ADDED Requirements

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
