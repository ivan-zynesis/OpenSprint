## ADDED Requirements

### Requirement: An initiative's state is an explicit vocabulary
The system SHALL define the states an initiative may declare as an explicit, ordered list, because a lifecycle stage is a property of the method rather than of the project and a vocabulary that varied per project could not be checked.

#### Scenario: The vocabulary
- **WHEN** the system enumerates the states an initiative may declare
- **THEN** the list SHALL be exactly: `exploring`, `proposed`, `building`, `attested`, `completed`, `declined`
- **AND** the first five SHALL be in lifecycle order
- **AND** `declined` SHALL be terminal rather than a stage

#### Scenario: A state outside the vocabulary
- **WHEN** an initiative declares a state not in the list
- **THEN** the system SHALL report it, naming the state and the accepted values

### Requirement: A declared state is checked against the content
The system SHALL report an initiative whose declared state is impossible given its content, rather than deriving a state and demanding equality, because an initiative legitimately sits between states.

#### Scenario: Exploring with work already done
- **WHEN** an initiative declares `exploring`
- **AND** any of its milestones is marked done
- **THEN** the system SHALL report the contradiction

#### Scenario: Completed with work outstanding
- **WHEN** an initiative declares `completed` or `attested`
- **AND** it has milestones and any of them is not done
- **THEN** the system SHALL report the contradiction

#### Scenario: Proposed with nothing proposed
- **WHEN** an initiative declares `proposed` or later
- **AND** it claims no driver-specs, no decisions and no milestones
- **THEN** the system SHALL report the contradiction

#### Scenario: Building with nothing to build
- **WHEN** an initiative declares `building`
- **AND** it has no milestones
- **THEN** the system SHALL report the contradiction

#### Scenario: A state between stages is allowed
- **WHEN** an initiative declares `building` with some milestones done and some not
- **THEN** no contradiction SHALL be reported

#### Scenario: Attested and completed are not distinguished from content
- **WHEN** an initiative declares `attested` or `completed` with every milestone done
- **THEN** no contradiction SHALL be reported for either
- **AND** the reason SHALL be that attestation does not yet exist to distinguish them

### Requirement: An active initiative declares a state
The system SHALL report an active initiative that declares no state, because it cannot be placed on a board — while staying silent about a resolved one, so that an initiative written by an older release is not reported forever.

#### Scenario: An active initiative with no state
- **WHEN** an initiative's status is active and it declares no state
- **THEN** the system SHALL report it

#### Scenario: A completed initiative with no state
- **WHEN** an initiative's status is `completed` and it declares no state
- **THEN** the system SHALL NOT report it
- **AND** the reason SHALL be that reporting a resolved initiative forever trains the check to be ignored

#### Scenario: A declined initiative is resolved
- **WHEN** an initiative declares `declined`
- **THEN** no contradiction SHALL be reported for it, whatever its milestones say
- **AND** the reason SHALL be that a candidate dropped before any work is exactly the case where content and state look contradictory and are not
