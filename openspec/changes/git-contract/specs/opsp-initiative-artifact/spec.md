## ADDED Requirements

### Requirement: Git is the third input to the state check
The system SHALL accept what git says about an initiative's branch as an optional input to the state check, so that a declared state which agrees with the content can still be caught disagreeing with reality.

#### Scenario: Reading git state
- **WHEN** the system is asked what git says about an initiative
- **THEN** it SHALL report whether `opsp/<id>` exists and whether it has merged into the trunk
- **AND** the trunk SHALL be resolved from explicit candidates rather than inferred

#### Scenario: Git cannot answer
- **WHEN** there is no repository, no trunk, or no git binary
- **THEN** the reader SHALL return undefined
- **AND** undefined SHALL mean unknowable rather than not-merged

#### Scenario: Reading a record never requires git
- **WHEN** an initiative is parsed
- **THEN** no git process SHALL be invoked
- **AND** a caller supplying no git state SHALL see exactly the checks it saw before

#### Scenario: Work landed and the initiative was never closed
- **WHEN** an initiative declares `exploring`, `proposed` or `building`
- **AND** its branch has merged
- **THEN** the system SHALL report a contradiction naming the branch

#### Scenario: Awaiting a pull request is normal
- **WHEN** an initiative declares `attested` or `completed` and its branch has not merged
- **THEN** no contradiction SHALL be reported
- **AND** the reason SHALL be that this is the normal state of an initiative awaiting approval

#### Scenario: A declined initiative
- **WHEN** an initiative declares `declined`
- **THEN** no contradiction SHALL be reported, whatever git says
