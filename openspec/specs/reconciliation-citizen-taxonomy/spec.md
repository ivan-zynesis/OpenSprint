# Reconciliation Citizen Taxonomy Specification

## Purpose

Define the classification vocabulary used by `/opsp:rebase` and `/opsp:abandon` when evaluating surrogate artifacts (citizens) from a source universe for migration into a target universe.
## Requirements
### Requirement: Citizen definition
The system SHALL treat as a *citizen* any surrogate artifact eligible for reconciliation evaluation, enumerated by explicit list rather than by pattern.

#### Scenario: Enumerating citizens in a universe
- **WHEN** `/opsp:rebase` or `/opsp:abandon` scans a universe for citizens
- **THEN** it SHALL include exactly these artifact classes:
  - driver-specs at `opensprint/driver-specs/*.md`
  - ADRs at `opensprint/ADRs/*.md`
  - initiative descriptors at `opensprint/initiatives/*.md`
  - active opsx changes at `openspec/changes/*/`, excluding `archive/`
- **AND** it SHALL NOT treat archived changes as citizens

#### Scenario: Constructing citizen paths on Windows
- **WHEN** citizen paths are constructed on Windows
- **THEN** the system SHALL use `path.join()` for each path segment
- **AND** SHALL NOT hardcode forward-slash separators

### Requirement: Exactly one classification per citizen per run
The system SHALL assign each citizen exactly one classification during a reconciliation run: MIGRATE, CONFLICT, REDUNDANT or SUPERSEDED.

#### Scenario: Classifying a citizen
- **WHEN** a citizen is evaluated
- **THEN** it SHALL receive exactly one of the four classifications
- **AND** SHALL NOT carry a second classification within the same run

### Requirement: MIGRATE classification and confidence
The system SHALL classify a citizen as MIGRATE when it is present in the source universe, absent from the target universe, and no semantic conflict is detectable against existing target citizens. A MIGRATE citizen SHALL additionally carry a confidence level that determines whether it may be auto-accepted.

#### Scenario: High-confidence MIGRATE
- **WHEN** a MIGRATE citizen is purely additive, introducing content that overlaps no existing target citizen
- **THEN** it SHALL be assigned HIGH confidence
- **AND** the agent MAY auto-accept it without operator confirmation

#### Scenario: Low-confidence MIGRATE
- **WHEN** a MIGRATE citizen's content overlaps existing target content but no direct contradiction is detected
- **THEN** it SHALL be assigned LOW confidence
- **AND** the agent SHALL escalate it to the operator

#### Scenario: Confidence is unclear
- **WHEN** the agent cannot determine confidence with certainty
- **THEN** it SHALL assign LOW confidence

### Requirement: CONFLICT classification
The system SHALL classify a citizen as CONFLICT when it is present in both universes and the content is semantically incompatible or directly contradictory.

#### Scenario: Presenting a conflict
- **WHEN** a citizen is classified CONFLICT
- **THEN** the agent SHALL escalate to the operator in every case, with no auto-resolution path
- **AND** SHALL present both the source and target versions
- **AND** SHALL explain the contradiction
- **AND** the operator SHALL decide which version stands, or supply a merged resolution

### Requirement: REDUNDANT classification
The system SHALL classify a citizen as REDUNDANT when it is present in both universes and the content is semantically equivalent, allowing for differences in wording that do not change meaning or implication.

#### Scenario: Handling a redundant citizen
- **WHEN** a citizen is classified REDUNDANT
- **THEN** the system SHALL skip it and perform no write
- **AND** SHALL preserve the existing target citizen unchanged

### Requirement: SUPERSEDED classification
The system SHALL classify a citizen as SUPERSEDED when it is present in the source universe and the target universe has already resolved the same concern differently, through a different citizen or decision.

#### Scenario: Handling a superseded citizen
- **WHEN** a citizen is classified SUPERSEDED
- **THEN** the system SHALL drop it from migration
- **AND** SHALL record it in the manifest with a reference to what superseded it in the target

### Requirement: DFS traversal order with the initiative as the unit of commitment
The system SHALL evaluate citizens depth-first, taking the initiative as the unit of commitment.

#### Scenario: Traversal order
- **WHEN** citizens are evaluated during reconciliation
- **THEN** for each initiative in the source universe, the system SHALL first classify every ADR referenced by or created during that initiative
- **AND** SHALL then classify every active opsx change belonging to that initiative
- **AND** SHALL commit or skip the initiative as a whole before proceeding to the next

#### Scenario: Pausing on an unresolved inner conflict
- **WHEN** any citizen inside an initiative produces a CONFLICT or a LOW-confidence MIGRATE that the operator has not yet decided
- **THEN** the entire initiative SHALL pause
- **AND** the traversal SHALL NOT advance to the next initiative until the current one is resolved or explicitly skipped by the operator

### Requirement: Agent confidence guardrail
The system SHALL bias toward escalation, because the cost of a false escalation is one operator confirmation while the cost of a false auto-accept is a corrupted surrogate with unbounded downstream blast radius.

#### Scenario: Conditions for HIGH confidence
- **WHEN** the agent considers assigning HIGH confidence to a MIGRATE citizen
- **THEN** it SHALL require all of the following to hold:
  - the citizen ID does not exist in the target universe
  - the citizen content references no concepts, IDs or decisions that exist in the target universe
  - the citizen does not contradict any existing target ADR or driver-spec, including implicitly
- **AND** if any condition does not hold, it SHALL assign LOW confidence

#### Scenario: Expressing uncertainty
- **WHEN** the agent is uncertain about any aspect of a classification
- **THEN** it SHALL express that uncertainty to the operator rather than resolving it silently

