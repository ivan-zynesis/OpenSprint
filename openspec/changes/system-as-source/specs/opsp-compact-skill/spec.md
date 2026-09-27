## ADDED Requirements

### Requirement: The record and the system are distinguishable in a view
The skill SHALL make visible which claims come from a decision and which come from observing the system, because the two carry different authority: a decision is binding, an observation is a fact that may be an accident.

#### Scenario: Citing a claim from a record
- **WHEN** a claim is compiled from a driver-spec or decision record
- **THEN** it SHALL cite the record ids inline, as already required

#### Scenario: Citing a claim from an observation
- **WHEN** a claim is compiled from an observed file
- **THEN** it SHALL cite the project-relative path it was observed at
- **AND** SHALL NOT present it as though a record established it

#### Scenario: An observation no record explains
- **WHEN** a section observes something that no record accounts for
- **THEN** the claim SHALL stand, citing its path
- **AND** the absence of a record SHALL NOT be treated as an error
- **AND** the view SHALL NOT invent a rationale for it

#### Scenario: A record and the system disagree
- **WHEN** an observation appears to contradict a record
- **THEN** the skill SHALL surface the disagreement rather than choosing between them
- **AND** SHALL NOT silently prefer either
- **AND** resolving it is a rule's job, not compaction's
