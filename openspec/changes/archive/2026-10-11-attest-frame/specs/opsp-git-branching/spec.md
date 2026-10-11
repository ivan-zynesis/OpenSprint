## ADDED Requirements

### Requirement: The base branch of a change is resolved in a stated order
The system SHALL resolve the branch a change merges into from an explicit override, then the remote's default branch, then an explicit candidate list — and SHALL report which of these produced the answer.

#### Scenario: An operator names the base
- **WHEN** a base is given explicitly
- **THEN** it SHALL be used if it resolves to a ref
- **AND** the system SHALL report that it was given explicitly

#### Scenario: The remote states its default
- **WHEN** no base is given and the remote declares a default branch
- **THEN** that branch SHALL be used
- **AND** the system SHALL report that it came from the remote's default

#### Scenario: No remote default
- **WHEN** no base is given and no remote default exists
- **THEN** the system SHALL use the first of `main`, `master`, `develop`, `trunk` that resolves
- **AND** the system SHALL report that it came from the candidate list

#### Scenario: No base can be resolved
- **WHEN** none of the tiers produces a ref
- **THEN** the system SHALL report that it cannot resolve a frame
- **AND** it SHALL NOT present a frame built on a guessed base

### Requirement: A change frame reports scope and never content
The system SHALL report what a branch changes as commit subject lines and a file-level stat, and SHALL NOT read a patch or a commit message body.

#### Scenario: What the frame carries
- **WHEN** a change frame is resolved
- **THEN** it SHALL carry the source branch, the base, the fork point, commit subjects and per-file line counts
- **AND** it SHALL carry the initiative ids the range touches and the change names it archived

#### Scenario: A commit message body never reaches the frame
- **WHEN** a commit in the range has a multi-paragraph message
- **THEN** only its subject line SHALL appear in the frame

#### Scenario: File content never reaches the frame
- **WHEN** a file in the range was added or modified
- **THEN** the frame SHALL carry its path and line counts only

#### Scenario: Initiatives are identified by frontmatter
- **WHEN** the range touches an initiative record
- **THEN** its id SHALL be read from the record's frontmatter rather than from its filename
- **AND** a record deleted in the range SHALL be omitted

#### Scenario: Git cannot answer
- **WHEN** there is no repository, no HEAD, or no common ancestor with the base
- **THEN** the system SHALL report that no frame could be resolved
