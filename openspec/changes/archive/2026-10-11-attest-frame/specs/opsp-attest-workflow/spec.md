## ADDED Requirements

### Requirement: Attestation establishes and confirms its range before judging anything
The system SHALL instruct an attesting agent to resolve the change under review — the source branch against the base it merges into — present it to the operator, and wait for explicit confirmation before reading any bar.

#### Scenario: The agent does not ask what the change is
- **WHEN** an attestation begins
- **THEN** the instruction SHALL require resolving the frame from git
- **AND** it SHALL forbid asking the operator what the change is

#### Scenario: The frame is presented and confirmed
- **WHEN** the frame has been resolved
- **THEN** the instruction SHALL require summarising it back to the operator
- **AND** it SHALL require an explicit confirmation rather than an acknowledgement
- **AND** the reason SHALL be that the frame becomes the premise of the review

#### Scenario: Correcting a wrong base
- **WHEN** the operator names a different base
- **THEN** the instruction SHALL name the option that overrides the guess

#### Scenario: Nothing to attest
- **WHEN** the range is empty, or git cannot resolve a frame
- **THEN** the instruction SHALL require saying so and stopping

#### Scenario: The frame scopes the review
- **WHEN** the frame names the initiatives the range touches
- **THEN** those initiatives SHALL be the scope of the attestation
- **AND** an initiative the operator expected and the frame does not show SHALL be a finding

#### Scenario: The frame carries scope, never rationale
- **WHEN** the instruction states what may be loaded
- **THEN** the patch and commit message bodies SHALL be excluded
- **AND** the instruction SHALL state why commit subjects and a file stat are not a widening of the narrow context
